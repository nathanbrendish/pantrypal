import { GoogleGenerativeAIFetchError } from "@google/generative-ai";

export type GeminiErrorContext = "receipt" | "planner" | "meals";

export type MappedGeminiError = {
  message: string;
  status: number;
};

function isDevelopment(): boolean {
  return process.env.NODE_ENV === "development";
}

function getErrorText(error: unknown): string {
  if (error instanceof GoogleGenerativeAIFetchError) {
    return `${error.message} ${error.statusText ?? ""}`.toLowerCase();
  }

  if (error instanceof Error) {
    return error.message.toLowerCase();
  }

  return "";
}

function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof GoogleGenerativeAIFetchError) {
    return error.status;
  }

  return undefined;
}

const CONTEXT_LABELS: Record<
  GeminiErrorContext,
  { service: string; action: string; failed: string }
> = {
  receipt: {
    service: "Receipt scanning",
    action: "scan your receipt",
    failed: "Failed to scan receipt. Please try again.",
  },
  planner: {
    service: "Meal planning",
    action: "generate your meal plan",
    failed: "Unable to generate your meal plan. Please try again.",
  },
  meals: {
    service: "Meal suggestions",
    action: "generate meal suggestions",
    failed: "Unable to generate meal suggestions. Please try again.",
  },
};

export function mapGeminiError(
  error: unknown,
  context: GeminiErrorContext = "receipt"
): MappedGeminiError {
  console.error(`Gemini API error [${context}]:`, error);

  const status = getErrorStatus(error);
  const text = getErrorText(error);
  const labels = CONTEXT_LABELS[context];

  if (
    status === 404 ||
    text.includes("not found") ||
    text.includes("no longer available") ||
    text.includes("is not supported")
  ) {
    return {
      message: isDevelopment()
        ? "The configured Gemini model is unavailable or deprecated. Update GEMINI_MODEL in .env.local."
        : `${labels.service} is temporarily unavailable. Please try again later.`,
      status: 502,
    };
  }

  if (status === 400 && text.includes("model")) {
    return {
      message: isDevelopment()
        ? "Invalid Gemini model configured. Check GEMINI_MODEL in .env.local."
        : `${labels.service} is temporarily unavailable. Please try again later.`,
      status: 502,
    };
  }

  if (
    status === 401 ||
    status === 403 ||
    text.includes("api key") ||
    text.includes("api_key") ||
    text.includes("permission denied")
  ) {
    return {
      message: isDevelopment()
        ? "Invalid Gemini API key. Check GEMINI_API_KEY in .env.local."
        : `${labels.service} is not available right now. Please try again later.`,
      status: 502,
    };
  }

  if (
    status === 429 ||
    text.includes("quota") ||
    text.includes("rate limit") ||
    text.includes("resource exhausted")
  ) {
    return {
      message: isDevelopment()
        ? "Gemini API quota exceeded. Check usage in Google AI Studio."
        : context === "receipt"
          ? "The AI service is currently busy."
          : `${labels.service} is busy right now. Please try again in a few minutes.`,
      status: 429,
    };
  }

  if (
    status === 402 ||
    text.includes("billing") ||
    text.includes("payment") ||
    text.includes("insufficient")
  ) {
    return {
      message: isDevelopment()
        ? "Gemini billing is not enabled or has an issue. Check your Google Cloud billing setup."
        : `${labels.service} is not available right now. Please try again later.`,
      status: 502,
    };
  }

  if (status === 502 || status === 503 || status === 504) {
    return {
      message:
        context === "receipt"
          ? "The AI service is currently busy."
          : "The AI service is currently busy. Please try again in a moment.",
      status: 503,
    };
  }

  return {
    message: isDevelopment()
      ? `Could not ${labels.action}. Check the server logs for details.`
      : labels.failed,
    status: 500,
  };
}
