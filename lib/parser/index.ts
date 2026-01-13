// Pluggable LLM parser interface

import { ExtractionResult } from "@/types";

export interface LLMParser {
  parseOCRText(ocrText: string): Promise<ExtractionResult>;
}

export const EXTRACTION_PROMPT = `You are a data extraction assistant. Extract sales data from the following OCR text of a 2-page daily sales report.

Return ONLY valid JSON matching this exact schema. Use null when data is missing or unreadable. DO NOT invent values.

Schema:
{
  "date": "YYYY-MM-DD",
  "meter_start": number|null,
  "meter_end": number|null,
  "cubic_consumption": number|null,
  "qty": { 
    "gallons": number|null, 
    "500ml": number|null, 
    "wilkins": number|null, 
    "small_slim": number|null 
  },
  "price": { 
    "gallons": number|null, 
    "500ml": number|null, 
    "wilkins": number|null, 
    "small_slim": number|null 
  },
  "expenses": { 
    "transportation": number|null, 
    "labor": number|null, 
    "supplies": number|null, 
    "utang_paid": number|null, 
    "other": number|null 
  },
  "cash_advance": { 
    "ryan": number|null, 
    "rjhay": number|null, 
    "third": number|null 
  },
  "remarks": string|null
}

Rules:
- Extract only the values you can confidently read
- Use null for missing, unreadable, or uncertain values
- Ensure all numbers are non-negative
- Date must be in YYYY-MM-DD format
- Return ONLY the JSON object, no markdown, no explanations

OCR Text:
`;

export function getParser(): LLMParser {
  const provider = process.env.LLM_PROVIDER || "openai";

  if (provider === "gemini") {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return new (require("./gemini").GeminiParser)();
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return new (require("./openai").OpenAIParser)();
  }
}
