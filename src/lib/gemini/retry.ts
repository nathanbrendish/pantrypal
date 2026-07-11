import { GoogleGenerativeAIFetchError } from "@google/generative-ai";

export function getGeminiErrorStatus(error: unknown): number | undefined {
  if (error instanceof GoogleGenerativeAIFetchError) {
    return error.status;
  }

  return undefined;
}

export function isRetryableGeminiError(error: unknown): boolean {
  const status = getGeminiErrorStatus(error);
  return status === 502 || status === 503 || status === 504;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const RETRY_DELAYS_MS = [1000, 2000, 4000] as const;
const MAX_RETRIES = 3;

export async function withGeminiRetry<T>(operation: () => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const canRetry = isRetryableGeminiError(error) && attempt < MAX_RETRIES;

      if (!canRetry) {
        throw error;
      }

      console.error(
        `Gemini temporary error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying…`,
        error
      );

      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
}
