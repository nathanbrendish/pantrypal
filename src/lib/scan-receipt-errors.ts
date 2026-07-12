/**
 * Structured error codes and user-facing messages for the receipt scan pipeline.
 * Raw parser / platform errors must never reach the UI.
 */

export const SCAN_ERROR_CODES = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  VALIDATION: "VALIDATION",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  UNSUPPORTED_FORMAT: "UNSUPPORTED_FORMAT",
  UPLOAD_FAILED: "UPLOAD_FAILED",
  NETWORK: "NETWORK",
  TIMEOUT: "TIMEOUT",
  AI_BUSY: "AI_BUSY",
  AI_UNAVAILABLE: "AI_UNAVAILABLE",
  PARSE_FAILED: "PARSE_FAILED",
  EMPTY_RESULT: "EMPTY_RESULT",
  NOT_CONFIGURED: "NOT_CONFIGURED",
  INTERNAL: "INTERNAL",
} as const;

export type ScanErrorCode =
  (typeof SCAN_ERROR_CODES)[keyof typeof SCAN_ERROR_CODES];

export const SCAN_USER_MESSAGES: Record<ScanErrorCode, string> = {
  UNAUTHORIZED: "Your session has expired. Please sign in again.",
  FORBIDDEN: "You do not have permission to scan receipts.",
  NOT_FOUND: "The receipt scan service could not be found.",
  VALIDATION: "We couldn't upload the image. Please check the file and try again.",
  FILE_TOO_LARGE: "The receipt image is too large.",
  UNSUPPORTED_FORMAT: "This image format isn't supported.",
  UPLOAD_FAILED: "We couldn't upload the image.",
  NETWORK: "Your internet connection appears to have been interrupted.",
  TIMEOUT: "The scan took too long. Please try again.",
  AI_BUSY: "The AI service is currently busy.",
  AI_UNAVAILABLE: "Receipt scanning is temporarily unavailable. Please try again later.",
  PARSE_FAILED: "We couldn't understand this receipt.",
  EMPTY_RESULT: "We couldn't find any ingredients on this receipt.",
  NOT_CONFIGURED: "Receipt scanning is not configured.",
  INTERNAL: "Failed to scan receipt. Please try again.",
};

export type StructuredScanError = {
  error: string;
  code: ScanErrorCode;
  details?: string;
  retryable: boolean;
  requestId?: string;
};

export function isRetryableStatus(status: number): boolean {
  return status === 502 || status === 503 || status === 504;
}

export function isNonRetryableStatus(status: number): boolean {
  return status === 401 || status === 403 || status === 404 || status === 400;
}

export function mapStatusToScanError(
  status: number,
  serverMessage?: string,
  serverCode?: string
): StructuredScanError {
  if (status === 401) {
    return {
      error: SCAN_USER_MESSAGES.UNAUTHORIZED,
      code: SCAN_ERROR_CODES.UNAUTHORIZED,
      details: serverMessage,
      retryable: false,
    };
  }

  if (status === 403) {
    return {
      error: SCAN_USER_MESSAGES.FORBIDDEN,
      code: SCAN_ERROR_CODES.FORBIDDEN,
      details: serverMessage,
      retryable: false,
    };
  }

  if (status === 404) {
    return {
      error: SCAN_USER_MESSAGES.NOT_FOUND,
      code: SCAN_ERROR_CODES.NOT_FOUND,
      details: serverMessage,
      retryable: false,
    };
  }

  if (status === 413) {
    return {
      error: SCAN_USER_MESSAGES.FILE_TOO_LARGE,
      code: SCAN_ERROR_CODES.FILE_TOO_LARGE,
      details: serverMessage,
      retryable: false,
    };
  }

  if (status === 429) {
    return {
      error: SCAN_USER_MESSAGES.AI_BUSY,
      code: SCAN_ERROR_CODES.AI_BUSY,
      details: serverMessage,
      retryable: true,
    };
  }

  if (status === 400) {
    const code =
      serverCode === SCAN_ERROR_CODES.UNSUPPORTED_FORMAT
        ? SCAN_ERROR_CODES.UNSUPPORTED_FORMAT
        : serverCode === SCAN_ERROR_CODES.FILE_TOO_LARGE
          ? SCAN_ERROR_CODES.FILE_TOO_LARGE
          : SCAN_ERROR_CODES.VALIDATION;

    return {
      error:
        sanitizeUserFacingMessage(serverMessage) ?? SCAN_USER_MESSAGES[code],
      code,
      details: serverMessage,
      retryable: false,
    };
  }

  if (serverCode && serverCode in SCAN_USER_MESSAGES) {
    const code = serverCode as ScanErrorCode;
    const retryable =
      code === SCAN_ERROR_CODES.AI_BUSY ||
      code === SCAN_ERROR_CODES.NETWORK ||
      code === SCAN_ERROR_CODES.TIMEOUT ||
      code === SCAN_ERROR_CODES.PARSE_FAILED ||
      code === SCAN_ERROR_CODES.EMPTY_RESULT ||
      isRetryableStatus(status);

    return {
      error:
        sanitizeUserFacingMessage(serverMessage) ?? SCAN_USER_MESSAGES[code],
      code,
      details: serverMessage,
      retryable,
    };
  }

  if (isRetryableStatus(status)) {
    return {
      error: SCAN_USER_MESSAGES.AI_BUSY,
      code: SCAN_ERROR_CODES.AI_BUSY,
      details: serverMessage,
      retryable: true,
    };
  }

  return {
    error:
      sanitizeUserFacingMessage(serverMessage) ?? SCAN_USER_MESSAGES.INTERNAL,
    code: SCAN_ERROR_CODES.INTERNAL,
    details: serverMessage,
    retryable: false,
  };
}

const RAW_PARSER_PATTERN =
  /unexpected token|is not valid json|json\.parse|unexpected end of json|syntaxerror|request entity too large|payload too large|<html|<!doctype/i;

/**
 * Returns a safe user-facing message, or null if the input looks like a raw
 * platform / parser error that must not be shown.
 */
export function sanitizeUserFacingMessage(
  message: string | undefined | null
): string | null {
  if (!message?.trim()) {
    return null;
  }

  const trimmed = message.trim();

  if (RAW_PARSER_PATTERN.test(trimmed)) {
    return null;
  }

  // Prefer known friendly messages when the server already sent one.
  return trimmed;
}

export function toUserFacingScanError(error: unknown): string {
  if (error instanceof ScanReceiptClientError) {
    return error.userMessage;
  }

  if (error instanceof Error) {
    const sanitized = sanitizeUserFacingMessage(error.message);
    if (sanitized) {
      return sanitized;
    }
  }

  return SCAN_USER_MESSAGES.UPLOAD_FAILED;
}

export class ScanReceiptClientError extends Error {
  readonly userMessage: string;
  readonly code: ScanErrorCode;
  readonly retryable: boolean;
  readonly requestId?: string;
  readonly status?: number;

  constructor(options: {
    userMessage: string;
    code: ScanErrorCode;
    retryable?: boolean;
    requestId?: string;
    status?: number;
    cause?: unknown;
  }) {
    super(options.userMessage);
    this.name = "ScanReceiptClientError";
    this.userMessage = options.userMessage;
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.requestId = options.requestId;
    this.status = options.status;
    if (options.cause !== undefined) {
      (this as Error & { cause?: unknown }).cause = options.cause;
    }
  }
}

export function mapNonJsonBodyToError(
  status: number,
  bodyText: string,
  requestId?: string
): StructuredScanError {
  const lower = bodyText.toLowerCase();

  if (
    status === 413 ||
    lower.includes("request entity too large") ||
    lower.includes("payload too large") ||
    lower.includes("body exceeded") ||
    lower.includes("functional_payload_too_large")
  ) {
    return {
      error: SCAN_USER_MESSAGES.FILE_TOO_LARGE,
      code: SCAN_ERROR_CODES.FILE_TOO_LARGE,
      details: `Non-JSON ${status} body (likely platform size limit)`,
      retryable: false,
      requestId,
    };
  }

  if (status === 401 || lower.includes("unauthorized")) {
    return {
      error: SCAN_USER_MESSAGES.UNAUTHORIZED,
      code: SCAN_ERROR_CODES.UNAUTHORIZED,
      details: `Non-JSON ${status} auth response`,
      retryable: false,
      requestId,
    };
  }

  if (isRetryableStatus(status)) {
    return {
      error: SCAN_USER_MESSAGES.AI_BUSY,
      code: SCAN_ERROR_CODES.AI_BUSY,
      details: `Non-JSON ${status} upstream response`,
      retryable: true,
      requestId,
    };
  }

  return {
    error: SCAN_USER_MESSAGES.UPLOAD_FAILED,
    code: SCAN_ERROR_CODES.UPLOAD_FAILED,
    details: `Non-JSON response (status ${status}, length ${bodyText.length})`,
    retryable: isRetryableStatus(status),
    requestId,
  };
}
