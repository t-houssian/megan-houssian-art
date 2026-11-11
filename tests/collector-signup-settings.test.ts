import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fetch: vi.fn() }));
vi.mock('../lib/sanity', () => ({ sanityClient: { withConfig: () => ({ fetch: mocks.fetch }) } }));

import { DEFAULT_COLLECTOR_SIGNUP_SETTINGS, fetchCollectorSignupSettings } from '../lib/collector-signup-settings';

beforeEach(() => vi.resetAllMocks());

describe('collector signup settings', () => {
  it('reads every editable section, form, and message field from Sanity', async () => {
    const custom = Object.fromEntries(Object.keys(DEFAULT_COLLECTOR_SIGNUP_SETTINGS).map((key) => [key, `Custom ${key}`]));
    mocks.fetch.mockResolvedValue(custom);
    expect(await fetchCollectorSignupSettings()).toEqual(custom);
  });

  it('keeps valid edits while supplying defaults for missing or blank fields', async () => {
    mocks.fetch.mockResolvedValue({ heading: 'Collection Announcements', description: '  ', buttonLabel: 'Email me' });
    const settings = await fetchCollectorSignupSettings();
    expect(settings.heading).toBe('Collection Announcements');
    expect(settings.buttonLabel).toBe('Email me');
    expect(settings.description).toBe(DEFAULT_COLLECTOR_SIGNUP_SETTINGS.description);
    expect(settings.successMessage).toBe(DEFAULT_COLLECTOR_SIGNUP_SETTINGS.successMessage);
  });

  it.each([null, undefined])('uses notification-only defaults when settings are absent: %s', async (value) => {
    mocks.fetch.mockResolvedValue(value);
    const settings = await fetchCollectorSignupSettings();
    expect(settings).toEqual(DEFAULT_COLLECTOR_SIGNUP_SETTINGS);
    expect(Object.values(settings).join(' ')).not.toMatch(/early.?access|first access|24 hours|private.*link/i);
  });

  it('keeps the signup usable during a CMS outage', async () => {
    mocks.fetch.mockRejectedValue(new Error('CMS unavailable'));
    expect(await fetchCollectorSignupSettings()).toEqual(DEFAULT_COLLECTOR_SIGNUP_SETTINGS);
  });
});
