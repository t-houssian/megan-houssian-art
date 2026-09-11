import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ send: vi.fn(), fetch: vi.fn(), head: vi.fn(), list: vi.fn(), del: vi.fn() }));
vi.mock('mailgun.js', () => ({ default: class { client() { return { messages: { create: mocks.send } }; } } }));
vi.mock('../lib/sanity', () => ({ sanityClient: { withConfig: () => ({ fetch: mocks.fetch }) } }));
vi.mock('@vercel/blob', () => ({ head: mocks.head, list: mocks.list, del: mocks.del }));

import { POST } from '../app/api/send-email/route';
import { GET as cleanup } from '../app/api/cron/cleanup-commission-references/route';
import { createUploadSession, readReferenceToken, getReferenceLinks, REFERENCE_PREFIX, REFERENCE_RETENTION_MS, type UploadSession } from '../lib/commission-uploads';
import { fetchEmailSettings } from '../lib/email-settings';

const contact = { firstName: 'Test', lastName: 'Customer', email: 'customer@example.com', subject: 'A painting', message: 'Please tell me more.' };
const commission = { name: 'Test Customer', email: 'customer@example.com', description: 'A landscape', canvasItems: [{ option: '16x20', quantity: 1 }], effectiveTotal: 500, upfrontCost: 250 };
const jsonRequest = (data: unknown) => new Request('https://example.com/api/send-email', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });

beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv('MAILGUN_API_KEY', 'test-key');
  vi.stubEnv('MAILGUN_DOMAIN', 'example.com');
  vi.stubEnv('MAILGUN_TO_EMAIL', '');
  vi.stubEnv('BLOB_READ_WRITE_TOKEN', 'test-storage-key');
  vi.stubEnv('CRON_SECRET', 'test-cron-secret');
  mocks.fetch.mockResolvedValue(null);
  mocks.send.mockResolvedValue({ id: 'test-message' });
  vi.spyOn(console, 'info').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('inquiry delivery', () => {
  it.each([['contact', contact], ['commission', commission]])('sends %s to Megan with the customer as Reply-To', async (_type, data) => {
    const response = await POST(jsonRequest(data));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({ success: true });
    expect(mocks.send).toHaveBeenCalledWith('example.com', expect.objectContaining({ to: ['meganhoussianart@gmail.com'], 'h:Reply-To': 'customer@example.com' }));
  });

  it('waits for provider acceptance before returning success', async () => {
    let accept!: (value: unknown) => void;
    mocks.send.mockReturnValue(new Promise(resolve => { accept = resolve; }));
    let completed = false;
    const response = POST(jsonRequest(contact)).then(value => { completed = true; return value; });
    await vi.waitFor(() => expect(mocks.send).toHaveBeenCalled());
    expect(completed).toBe(false);
    accept({ id: 'accepted' });
    expect((await response).status).toBe(200);
  });

  it('uses safe defaults when the CMS times out', async () => {
    mocks.fetch.mockRejectedValue(new DOMException('timed out', 'TimeoutError'));
    const response = await POST(jsonRequest(commission));
    expect(response.status).toBe(200);
    expect(mocks.send.mock.calls[0][1].to).toEqual(['meganhoussianart@gmail.com']);
  });

  it('returns failure without exposing credentials or the customer message', async () => {
    mocks.send.mockRejectedValue({ status: 504, message: 'SECRET-CREDENTIAL', details: contact.message });
    const response = await POST(jsonRequest(contact));
    expect(response.status).toBe(502);
    expect(await response.text()).not.toContain('SECRET-CREDENTIAL');
    expect(JSON.stringify(vi.mocked(console.error).mock.calls)).not.toContain(contact.message);
  });

  it.each([null, [], {}, { ...contact, email: 'bad\r\nBcc:spam@example.com' }, { ...contact, message: '' }, { ...commission, canvasItems: [] }])('rejects invalid data before contacting providers', async (data) => {
    expect((await POST(jsonRequest(data))).status).toBe(400);
    expect(mocks.fetch).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it('rejects oversized legacy multipart photos before delivery', async () => {
    const form = new FormData();
    Object.entries(commission).forEach(([key, value]) => form.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value)));
    form.set('referenceImages', new File([new Uint8Array(3_600_000)], 'large.jpg', { type: 'image/jpeg' }));
    expect((await POST(new Request('https://example.com/api/send-email', { method: 'POST', body: form }))).status).toBe(413);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it('escapes HTML and strips line breaks from the email subject', async () => {
    await POST(jsonRequest({ ...contact, subject: 'Hello\r\nBcc: other@example.com', message: '<script>alert(1)</script>' }));
    const payload = mocks.send.mock.calls[0][1];
    expect(payload.subject).not.toMatch(/[\r\n]/);
    expect(payload.html).not.toContain('<script>');
  });

  it('queries published settings once with a cache and an abort signal', async () => {
    await fetchEmailSettings();
    expect(mocks.fetch).toHaveBeenCalledTimes(1);
    expect(mocks.fetch.mock.calls[0][2]).toMatchObject({ next: { revalidate: 60 }, signal: expect.any(AbortSignal) });
  });
});

describe('private reference uploads', () => {
  const photo = { name: 'large-original.jpg', size: 20 * 1024 * 1024, contentType: 'image/jpeg' };
  it('accepts large originals without putting their bytes in the form request', async () => {
    const batch = createUploadSession([photo]);
    const file = batch.files[0];
    mocks.head.mockResolvedValue({ ...file, uploadedAt: new Date() });
    const response = await POST(jsonRequest({ ...commission, uploadSession: batch.token }));
    expect(response.status).toBe(200);
    const message = mocks.send.mock.calls[0][1];
    expect(message.attachment).toBeUndefined();
    expect(message.text).toContain('/api/commission-reference?token=');
    expect(message.html).toContain('35 days');
    expect(message['o:tracking']).toBe('no');
  });

  it('rejects token tampering, expired tokens, and using upload tokens as download tokens', () => {
    const batch = createUploadSession([photo]);
    expect(() => readReferenceToken(batch.token + 'tampered', 'upload')).toThrow();
    expect(() => readReferenceToken(batch.token, 'download')).toThrow();
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now + 2 * 60 * 60 * 1000);
    expect(() => readReferenceToken(batch.token, 'upload')).toThrow();
    vi.mocked(Date.now).mockRestore();
  });

  it('validates file count, file type, and upload sizes', () => {
    expect(() => createUploadSession(Array(11).fill(photo))).toThrow();
    expect(() => createUploadSession([{ ...photo, size: 26 * 1024 * 1024 }])).toThrow();
    expect(() => createUploadSession(Array(6).fill(photo))).toThrow();
    expect(() => createUploadSession([{ ...photo, contentType: 'text/html' }])).toThrow();
  });

  it('checks completed uploads against signed metadata', async () => {
    const batch = createUploadSession([photo]);
    const session = readReferenceToken<UploadSession>(batch.token, 'upload');
    mocks.head.mockResolvedValue({ ...session.files[0], size: 10, uploadedAt: new Date() });
    await expect(getReferenceLinks(batch.token)).rejects.toThrow('incomplete');
    expect(mocks.head).toHaveBeenCalledWith(session.files[0].pathname, expect.any(Object));
  });

  it('requires cron authentication and deletes only expired reference photos across pages', async () => {
    expect((await cleanup(new Request('https://example.com'))).status).toBe(401);
    expect(mocks.list).not.toHaveBeenCalled();
    const old = { url: 'old', uploadedAt: new Date(Date.now() - REFERENCE_RETENTION_MS - 1000) };
    const recent = { url: 'recent', uploadedAt: new Date() };
    mocks.list.mockResolvedValueOnce({ blobs: [old, recent], hasMore: true, cursor: 'page2' }).mockResolvedValueOnce({ blobs: [], hasMore: false });
    const response = await cleanup(new Request('https://example.com', { headers: { authorization: 'Bearer test-cron-secret' } }));
    expect(await response.json()).toEqual({ deleted: 1 });
    expect(mocks.del).toHaveBeenCalledWith(['old']);
    expect(mocks.list).toHaveBeenLastCalledWith({ prefix: REFERENCE_PREFIX, cursor: 'page2', limit: 1000 });
  });
});
