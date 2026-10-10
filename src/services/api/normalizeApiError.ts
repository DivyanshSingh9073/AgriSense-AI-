export interface NormalizedApiErrorPayload {
  message: string;
  details?: Record<string, string[]>;
}

/** Read public FastAPI error fields without reflecting arbitrary response data. */
export function normalizeApiErrorPayload(payload: unknown, fallback: string): NormalizedApiErrorPayload {
  if (typeof payload !== 'object' || payload === null) return { message: fallback };

  const data = payload as Record<string, unknown>;
  const message =
    (typeof data.message === 'string' && data.message.trim()) ||
    (typeof data.detail === 'string' && data.detail.trim()) ||
    fallback;

  const details = data.errors;
  if (typeof details !== 'object' || details === null || Array.isArray(details)) {
    return { message, details: undefined };
  }

  const safeDetails = Object.fromEntries(
    Object.entries(details).flatMap(([field, errors]) =>
      Array.isArray(errors) && errors.every((error) => typeof error === 'string')
        ? [[field, errors]]
        : [],
    ),
  );

  return { message, details: Object.keys(safeDetails).length > 0 ? safeDetails : undefined };
}