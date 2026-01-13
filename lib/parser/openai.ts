// OpenAI parser implementation

import { SalesData, ExtractionResult } from "@/types";
import { LLMParser, EXTRACTION_PROMPT } from "./index";
import OpenAI from "openai";

export class OpenAIParser implements LLMParser {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is required");
    }
    this.client = new OpenAI({ apiKey });
  }

  async parseOCRText(ocrText: string): Promise<ExtractionResult> {
    try {
      const completion = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a data extraction assistant. Return only valid JSON, no markdown formatting.",
          },
          {
            role: "user",
            content: EXTRACTION_PROMPT + ocrText,
          },
        ],
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const content = completion.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response from OpenAI");
      }

      // Parse the JSON response
      const data = JSON.parse(content) as SalesData;

      // Generate basic confidence scores (OpenAI doesn't provide them directly)
      const confidence = this.generateConfidenceScores(data);

      return {
        data,
        confidence,
      };
    } catch (error) {
      console.error("OpenAI parsing error:", error);
      throw error;
    }
  }

  private generateConfidenceScores(
    data: SalesData
  ): ExtractionResult["confidence"] {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const confidence: any = {};

    // Simple heuristic: null values get low confidence, non-null get high confidence
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "object" && value !== null) {
        confidence[key] = {};
        Object.entries(value).forEach(([subKey, subValue]) => {
          confidence[key][subKey] = subValue === null ? 0.3 : 0.9;
        });
      } else {
        confidence[key] = value === null ? 0.3 : 0.9;
      }
    });

    return confidence;
  }
}
