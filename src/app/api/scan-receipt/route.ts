import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { getGeminiModelName } from "@/lib/gemini/config";
import { mapGeminiError } from "@/lib/gemini/map-gemini-error";
import { parseIngredientsResponse } from "@/lib/gemini/parse-ingredients";
import { RECEIPT_EXTRACTION_PROMPT } from "@/lib/gemini/receipt-prompt";
import { withGeminiRetry } from "@/lib/gemini/retry";
import {
  fileToBase64,
  getReceiptMimeType,
  validateReceiptUpload,
} from "@/lib/receipt-upload";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Receipt scanning is not configured." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        { error: "A receipt image is required." },
        { status: 400 }
      );
    }

    const validationError = validateReceiptUpload(image);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const mimeType = getReceiptMimeType(image);
    const base64Image = await fileToBase64(image);
    const modelName = getGeminiModelName();

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: RECEIPT_EXTRACTION_PROMPT,
      generationConfig: {
        responseMimeType: "application/json",
      },
    });

    const result = await withGeminiRetry(() =>
      model.generateContent([
        {
          inlineData: {
            mimeType,
            data: base64Image,
          },
        },
        "Extract all food ingredients from this shopping receipt image.",
      ])
    );

    const responseText = result.response.text();

    if (!responseText) {
      return NextResponse.json(
        { error: "No ingredients were returned from the receipt scan." },
        { status: 502 }
      );
    }

    const ingredients = parseIngredientsResponse(responseText);

    return NextResponse.json({ ingredients });
  } catch (error) {
    if (error instanceof Error && error.message.includes("ingredient")) {
      console.error("Receipt scan parsing failed:", error);
      return NextResponse.json(
        { error: "Could not read ingredients from the scan result." },
        { status: 502 }
      );
    }

    const { message, status } = mapGeminiError(error, "receipt");
    return NextResponse.json({ error: message }, { status });
  }
}
