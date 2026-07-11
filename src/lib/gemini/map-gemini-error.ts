import { GoogleGenerativeAIFetchError } from "@google/generative-ai";

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

export function mapGeminiError(error: unknown): MappedGeminiError {
  console.error("Gemini API error:", error);

  const status = getErrorStatus(error);
  const text = getErrorText(error);
  const dev = isDevelopment();

  if (
    status === 404 ||
    text.includes("not found") ||
    text.includes("no longer available") ||
    text.includes("is not supported")
  ) {
    return {
      message: dev
        ? "The configured Gemini model is unavailable or deprecated. Update GEMINI_MODEL in .env.local."
        : "Receipt scanning is temporarily unavailable. Please try again later.",
      status: 502,
    };
  }

  if (status === 400 && text.includes("model")) {
    return {
      message: dev
        ? "Invalid Gemini model configured. Check GEMINI_MODEL in .env.local."
        : "Receipt scanning is temporarily unavailable. Please try again later.",
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
      message: dev
        ? "Invalid Gemini API key. Check GEMINI_API_KEY in .env.local."
        : "Receipt scanning is not available right now. Please try again later.",
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
      message: dev
        ? "Gemini API quota exceeded. Check usage in Google AI Studio."
        : "Receipt scanning is busy right now. Please try again in a few minutes.",
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
      message: dev
        ? "Gemini billing is not enabled or has an issue. Check your Google Cloud billing setup."
        : "Receipt scanning is not available right now. Please try again later.",
      status: 502,
    };
  }

  if (status === 502 || status === 503 || status === 504) {
    return {
      message:
        "The AI service is currently busy. Please try again in a moment.",
      status: 503,
    };
  }

  return {
    message: dev
      ? "Receipt scan failed. Check the server logs for details."
      : "Failed to scan receipt. Please try again.",
    status: 500,
  };
}
