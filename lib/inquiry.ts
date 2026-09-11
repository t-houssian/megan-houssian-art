// Stay below Vercel's 4.5 MB request limit, including multipart overhead and text.
export const MAX_REFERENCE_BYTES = 3_500_000;
export const MAX_REFERENCE_IMAGES = 10;
export const MAX_REFERENCE_FILE_BYTES = 25 * 1024 * 1024;
export const MAX_ORIGINAL_REFERENCE_BYTES = 100 * 1024 * 1024;
export const REFERENCE_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];
export const INQUIRY_SUPPORT_EMAIL = 'meganhoussianart@gmail.com';

export class InquiryValidationError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export type CanvasItem = {
  option: string;
  customWidth: string;
  customHeight: string;
  quantity: number;
};

export type Inquiry = {
  type: 'contact' | 'commission';
  name: string;
  email: string;
  subject: string;
  message: string;
  canvasItems: CanvasItem[];
  effectiveTotal: number;
  upfrontCost: number;
  attachments: File[];
  uploadSession: string;
};

function text(value: unknown, label: string, limit: number, required = true) {
  if (typeof value !== 'string' || (required && !value.trim()) || value.length > limit) {
    if (!required && value == null) return '';
    throw new InquiryValidationError(`Please enter a valid ${label} (up to ${limit} characters).`);
  }
  return value.trim();
}

export async function parseInquiry(request: Request): Promise<Inquiry> {
  if (Number(request.headers.get('content-length')) > 4_000_000) {
    throw new InquiryValidationError('The upload is too large. Please use fewer or smaller images.', 413);
  }
  const contentType = request.headers.get('content-type') || '';
  let data: Record<string, unknown>;
  let attachments: File[] = [];
  try {
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      data = Object.fromEntries(form.entries());
      attachments = form.getAll('referenceImages').filter((value): value is File => value instanceof File && value.size > 0);
      if (typeof data.canvasItems === 'string') data.canvasItems = JSON.parse(data.canvasItems);
    } else if (contentType.includes('application/json')) {
      data = await request.json();
    } else {
      throw new InquiryValidationError('Unsupported form format.', 415);
    }
  } catch (error) {
    if (error instanceof InquiryValidationError) throw error;
    throw new InquiryValidationError('The form could not be read. Please check your details and try again.');
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new InquiryValidationError('Invalid form data.');
  }
  const type = data.formType === 'commission' || 'canvasItems' in data ? 'commission' : 'contact';
  const email = text(data.email, 'email address', 254);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)) {
    throw new InquiryValidationError('Please enter a valid email address.');
  }
  if (attachments.length > MAX_REFERENCE_IMAGES || attachments.reduce((sum, file) => sum + file.size, 0) > MAX_REFERENCE_BYTES) {
    throw new InquiryValidationError('The upload is too large. Please use fewer or smaller images.', 413);
  }
  if (attachments.some((file) => !REFERENCE_CONTENT_TYPES.includes(file.type))) {
    throw new InquiryValidationError('Please upload JPG, PNG, WEBP, GIF, or HEIC images.');
  }
  const inquiry: Inquiry = {
    type, email, attachments,
    uploadSession: type === 'commission' ? text(data.uploadSession, 'upload session', 20000, false) : '',
    name: type === 'commission'
      ? text(data.name, 'name', 200)
      : `${text(data.firstName, 'first name', 100)} ${text(data.lastName, 'last name', 100)}`,
    subject: type === 'contact' ? text(data.subject, 'subject', 200) : '',
    message: type === 'contact' ? text(data.message, 'message', 10_000) : text(data.description, 'description', 10_000, false),
    canvasItems: [], effectiveTotal: 0, upfrontCost: 0,
  };
  if (type === 'commission') {
    if (!Array.isArray(data.canvasItems) || !data.canvasItems.length || data.canvasItems.length > 25) {
      throw new InquiryValidationError('Please select at least one canvas (up to 25).');
    }
    inquiry.canvasItems = data.canvasItems.map((item: unknown) => {
      if (!item || typeof item !== 'object') throw new InquiryValidationError('Invalid canvas selection.');
      const canvas = item as Record<string, unknown>;
      const option = text(canvas.option, 'canvas size', 100);
      const quantity = Number(canvas.quantity);
      const customWidth = text(canvas.customWidth, 'canvas width', 20, false);
      const customHeight = text(canvas.customHeight, 'canvas height', 20, false);
      if (!Number.isInteger(quantity) || quantity < 1 || quantity > 100 ||
          (option === 'custom' && (![customWidth, customHeight].every((size) => Number.isFinite(Number(size)) && Number(size) > 0)))) {
        throw new InquiryValidationError('Please enter valid canvas dimensions and quantities.');
      }
      return { option, quantity, customWidth, customHeight };
    });
    inquiry.effectiveTotal = Number(data.effectiveTotal);
    inquiry.upfrontCost = Number(data.upfrontCost);
    if (![inquiry.effectiveTotal, inquiry.upfrontCost].every((value) => Number.isFinite(value) && value >= 0)) {
      throw new InquiryValidationError('Invalid commission estimate. Please review your canvas selections.');
    }
  }
  return inquiry;
}
