export const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";

export function getGeminiModelName(): string {
  const configured = process.env.GEMINI_MODEL?.trim();
  return configured || DEFAULT_GEMINI_MODEL;
}
