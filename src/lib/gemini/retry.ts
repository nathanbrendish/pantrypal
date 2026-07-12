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

export function isTransientPlannerError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes("empty") ||
    message.includes("meal plan") ||
    message.includes("meals list") ||
    message.includes("no meals") ||
    message.includes("replacement meal")
  );
}

export function isPlannerRetryableError(error: unknown): boolean {
  return isRetryableGeminiError(error) || isTransientPlannerError(error);
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

export async function withPlannerGeminiRetry<T>(
  operation: () => Promise<T>
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      const canRetry =
        isPlannerRetryableError(error) && attempt < MAX_RETRIES;

      if (!canRetry) {
        throw error;
      }

      console.error(
        `Planner Gemini retry (attempt ${attempt + 1}/${MAX_RETRIES + 1})…`,
        error
      );

      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  throw lastError;
}
