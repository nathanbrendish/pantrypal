/**
 * Production-safe diagnostics for receipt scanning.
 * Never logs image bytes, base64 payloads, or secrets.
 */

export function createScanRequestId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `scan_${crypto.randomUUID()}`;
  }

  return `scan_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export type ClientScanDiagnostics = {
  requestId: string;
  filename: string;
  fileSize: number;
  mimeType: string;
  width?: number;
  height?: number;
  compressed: boolean;
  originalSize?: number;
  userAgent: string;
};

function redactEmail(email: string | undefined | null): string | undefined {
  if (!email) {
    return undefined;
  }

  const [local, domain] = email.split("@");
  if (!domain) {
    return "[redacted]";
  }

  const safeLocal =
    local.length <= 2 ? `${local[0] ?? "*"}*` : `${local.slice(0, 2)}***`;
  return `${safeLocal}@${domain}`;
}

export function logClientScanEvent(
  event: string,
  payload: Record<string, unknown>
): void {
  console.info(`[scan-receipt:client] ${event}`, payload);
}

export function logServerScanEvent(
  event: string,
  payload: Record<string, unknown>
): void {
  console.info(`[scan-receipt:server] ${event}`, payload);
}

export function logServerScanError(
  event: string,
  payload: Record<string, unknown>,
  error?: unknown
): void {
  const stack =
    error instanceof Error
      ? error.stack ?? error.message
      : typeof error === "string"
        ? error
        : undefined;

  console.error(`[scan-receipt:server] ${event}`, {
    ...payload,
    errorMessage: error instanceof Error ? error.message : undefined,
    errorStack: stack,
  });
}

export function buildAuthLogFields(user: {
  id: string;
  email?: string | null;
  email_confirmed_at?: string | null;
}): Record<string, unknown> {
  return {
    userId: user.id,
    email: redactEmail(user.email),
    emailVerified: Boolean(user.email_confirmed_at),
  };
}

export function summarizeHeaders(headers: Headers): Record<string, string> {
  const keys = [
    "content-type",
    "content-length",
    "user-agent",
    "origin",
    "referer",
    "x-forwarded-for",
    "x-vercel-id",
    "x-real-ip",
  ];

  const summary: Record<string, string> = {};

  for (const key of keys) {
    const value = headers.get(key);
    if (value) {
      summary[key] = value;
    }
  }

  return summary;
}
