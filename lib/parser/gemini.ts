// Gemini parser implementation

import { SalesData, ExtractionResult } from "@/types";
import { LLMParser, EXTRACTION_PROMPT } from "./index";
import { GoogleGenerativeAI } from "@google/generative-ai";

export class GeminiParser implements LLMParser {
  private client: GoogleGenerativeAI;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is required");
    }
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async parseOCRText(ocrText: string): Promise<ExtractionResult> {
    try {
      const model = this.client.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(EXTRACTION_PROMPT + ocrText);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("No response from Gemini");
      }

      // Parse the JSON response
      const data = JSON.parse(text) as SalesData;

      // Generate basic confidence scores
      const confidence = this.generateConfidenceScores(data);

      return {
        data,
        confidence,
      };
    } catch (error) {
      console.error("Gemini parsing error:", error);
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
