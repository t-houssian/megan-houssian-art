export async function submitInquiry(body: FormData | string) {
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      ...(typeof body === 'string' ? { headers: { 'Content-Type': 'application/json' } } : {}),
      body,
      signal: AbortSignal.timeout(45_000),
    });
    const result = await response.json().catch(() => null);
    if (response.status === 413) {
      throw new Error('The upload is too large. Please remove an image or choose smaller photos and try again.');
    }
    if (!response.ok || result?.success !== true) {
      throw new Error(result?.error || 'We could not confirm your message was sent. Please try again, or email meganhoussianart@gmail.com directly.');
    }
  } catch (error) {
    if (error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError' || error instanceof TypeError)) {
      throw new Error('We could not confirm your message was sent. Your details are still here. Please check your connection and try again, or email meganhoussianart@gmail.com directly.');
    }
    throw error;
  }
}
