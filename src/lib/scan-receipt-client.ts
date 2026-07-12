import type {
  ScanReceiptErrorResponse,
  ScanReceiptResponse,
} from "@/lib/gemini/receipt-prompt";
import {
  isNonRetryableStatus,
  isRetryableStatus,
  mapNonJsonBodyToError,
  mapStatusToScanError,
  SCAN_ERROR_CODES,
  SCAN_USER_MESSAGES,
  ScanReceiptClientError,
  sanitizeUserFacingMessage,
} from "@/lib/scan-receipt-errors";
import {
  createScanRequestId,
  logClientScanEvent,
  type ClientScanDiagnostics,
} from "@/lib/scan-receipt-logger";
import type { ScannedIngredient } from "@/types/v2";

const SCAN_TIMEOUT_MS = 90_000;
const MAX_CLIENT_RETRIES = 2;
const RETRY_DELAYS_MS = [800, 1600] as const;

function isJsonContentType(contentType: string | null): boolean {
  return Boolean(contentType?.toLowerCase().includes("application/json"));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function parseScanResponse(
  response: Response,
  requestId: string
): Promise<ScanReceiptResponse> {
  const contentType = response.headers.get("content-type");
  const responseRequestId =
    response.headers.get("x-scan-request-id") ?? requestId;

  logClientScanEvent("response_headers", {
    requestId: responseRequestId,
    status: response.status,
    contentType,
    ok: response.ok,
  });

  if (response.ok && isJsonContentType(contentType)) {
    try {
      const data = (await response.json()) as
        | ScanReceiptResponse
        | ScanReceiptErrorResponse;

      if (!("ingredients" in data) || !Array.isArray(data.ingredients)) {
        throw new ScanReceiptClientError({
          userMessage: SCAN_USER_MESSAGES.PARSE_FAILED,
          code: SCAN_ERROR_CODES.PARSE_FAILED,
          requestId: responseRequestId,
          status: response.status,
        });
      }

      return data;
    } catch (error) {
      if (error instanceof ScanReceiptClientError) {
        throw error;
      }

      throw new ScanReceiptClientError({
        userMessage: SCAN_USER_MESSAGES.UPLOAD_FAILED,
        code: SCAN_ERROR_CODES.UPLOAD_FAILED,
        requestId: responseRequestId,
        status: response.status,
        cause: error,
      });
    }
  }

  const bodyText = await response.text();

  logClientScanEvent("non_json_or_error_body", {
    requestId: responseRequestId,
    status: response.status,
    contentType,
    bodyPreview: bodyText.slice(0, 180),
  });

  if (!response.ok) {
    let serverError: string | undefined;
    let serverCode: string | undefined;

    if (isJsonContentType(contentType) || bodyText.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(bodyText) as ScanReceiptErrorResponse;
        serverError = parsed.error;
        serverCode = parsed.code;
      } catch {
        // Fall through to non-JSON mapping.
      }
    }

    if (serverError || serverCode) {
      const mapped = mapStatusToScanError(
        response.status,
        serverError,
        serverCode
      );

      throw new ScanReceiptClientError({
        userMessage: mapped.error,
        code: mapped.code,
        retryable: mapped.retryable,
        requestId: responseRequestId ?? mapped.requestId,
        status: response.status,
      });
    }

    const mapped = mapNonJsonBodyToError(
      response.status,
      bodyText,
      responseRequestId
    );

    throw new ScanReceiptClientError({
      userMessage: mapped.error,
      code: mapped.code,
      retryable: mapped.retryable,
      requestId: mapped.requestId,
      status: response.status,
    });
  }

  // 200 but not JSON — treat as upload/platform failure.
  const mapped = mapNonJsonBodyToError(
    response.status,
    bodyText,
    responseRequestId
  );

  throw new ScanReceiptClientError({
    userMessage: mapped.error,
    code: mapped.code,
    retryable: mapped.retryable,
    requestId: mapped.requestId,
    status: response.status,
  });
}

async function postScanReceipt(
  file: File,
  requestId: string,
  signal: AbortSignal
): Promise<Response> {
  const formData = new FormData();
  formData.append("image", file);

  return fetch("/api/scan-receipt", {
    method: "POST",
    body: formData,
    headers: {
      "X-Scan-Request-Id": requestId,
    },
    signal,
    credentials: "same-origin",
    cache: "no-store",
  });
}

function shouldRetryClientError(error: unknown): boolean {
  if (error instanceof ScanReceiptClientError) {
    if (
      error.status !== undefined &&
      isNonRetryableStatus(error.status)
    ) {
      return false;
    }

    return (
      error.retryable ||
      (error.status !== undefined && isRetryableStatus(error.status))
    );
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return false;
  }

  if (error instanceof TypeError) {
    // fetch() network failure
    return true;
  }

  return false;
}

export type ScanReceiptOptions = {
  diagnostics?: Partial<ClientScanDiagnostics>;
};

export async function scanReceiptImage(
  file: File,
  options: ScanReceiptOptions = {}
): Promise<ScannedIngredient[]> {
  const requestId = options.diagnostics?.requestId ?? createScanRequestId();

  logClientScanEvent("scan_start", {
    requestId,
    filename: file.name,
    fileSize: file.size,
    mimeType: file.type || "(empty)",
    width: options.diagnostics?.width,
    height: options.diagnostics?.height,
    compressed: options.diagnostics?.compressed ?? false,
    originalSize: options.diagnostics?.originalSize,
    userAgent:
      options.diagnostics?.userAgent ??
      (typeof navigator !== "undefined" ? navigator.userAgent : "unknown"),
  });

  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_CLIENT_RETRIES; attempt++) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), SCAN_TIMEOUT_MS);

    try {
      logClientScanEvent("attempt", {
        requestId,
        attempt: attempt + 1,
        maxAttempts: MAX_CLIENT_RETRIES + 1,
      });

      const response = await postScanReceipt(file, requestId, controller.signal);
      const data = await parseScanResponse(response, requestId);

      logClientScanEvent("scan_success", {
        requestId,
        ingredientCount: data.ingredients.length,
        attempt: attempt + 1,
      });

      return data.ingredients;
    } catch (error) {
      lastError = error;

      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ScanReceiptClientError({
          userMessage: SCAN_USER_MESSAGES.TIMEOUT,
          code: SCAN_ERROR_CODES.TIMEOUT,
          retryable: true,
          requestId,
          cause: error,
        });
      }

      if (error instanceof TypeError) {
        lastError = new ScanReceiptClientError({
          userMessage: SCAN_USER_MESSAGES.NETWORK,
          code: SCAN_ERROR_CODES.NETWORK,
          retryable: true,
          requestId,
          cause: error,
        });
      }

      const canRetry =
        attempt < MAX_CLIENT_RETRIES && shouldRetryClientError(lastError);

      logClientScanEvent("attempt_failed", {
        requestId,
        attempt: attempt + 1,
        canRetry,
        code:
          lastError instanceof ScanReceiptClientError
            ? lastError.code
            : undefined,
        message:
          lastError instanceof Error
            ? sanitizeUserFacingMessage(lastError.message) ??
              "(raw/unsafe message redacted)"
            : "unknown",
      });

      if (!canRetry) {
        break;
      }

      await sleep(RETRY_DELAYS_MS[attempt] ?? 1600);
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  if (lastError instanceof ScanReceiptClientError) {
    throw lastError;
  }

  throw new ScanReceiptClientError({
    userMessage: SCAN_USER_MESSAGES.INTERNAL,
    code: SCAN_ERROR_CODES.INTERNAL,
    requestId,
    cause: lastError,
  });
}
