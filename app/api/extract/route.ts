// API Route: Extract data from scanned pages using OCR + AI

import { NextRequest, NextResponse } from "next/server";
import { preprocessImageServer } from "@/lib/image/server";
import { extractTextFromPages } from "@/lib/ocr/vision";
import { getParser } from "@/lib/parser";
import { computeDerivedFields } from "@/lib/validation/schema";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const page1File = formData.get("page1") as File;
    const page2File = formData.get("page2") as File;

    if (!page1File || !page2File) {
      return NextResponse.json(
        { error: "Both page1 and page2 images are required" },
        { status: 400 }
      );
    }

    // Check for demo mode
    if (process.env.DEMO_MODE === "true") {
      return NextResponse.json(getMockExtractionResult());
    }

    // Convert files to buffers
    const page1Buffer = Buffer.from(await page1File.arrayBuffer());
    const page2Buffer = Buffer.from(await page2File.arrayBuffer());

    // Preprocess images
    const processedPage1 = await preprocessImageServer(page1Buffer);
    const processedPage2 = await preprocessImageServer(page2Buffer);

    // Extract text using OCR
    const ocrText = await extractTextFromPages(processedPage1, processedPage2);

    // Parse using AI
    const parser = getParser();
    const result = await parser.parseOCRText(ocrText);

    // Apply computation rules
    result.data = computeDerivedFields(result.data);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Extraction error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Extraction failed",
      },
      { status: 500 }
    );
  }
}

function getMockExtractionResult() {
  return {
    data: {
      date: "2024-01-15",
      meter_start: 1234,
      meter_end: 1256,
      cubic_consumption: 22,
      qty: {
        gallons: 120,
        "500ml": 85,
        wilkins: 42,
        small_slim: 30,
      },
      price: {
        gallons: 25,
        "500ml": 15,
        wilkins: 20,
        small_slim: 10,
      },
      expenses: {
        transportation: 500,
        labor: 800,
        supplies: 250,
        utang_paid: 1000,
        other: 150,
      },
      cash_advance: {
        ryan: 2000,
        rjhay: 1500,
        third: 1000,
      },
      remarks: "Demo mode - mock data",
    },
    confidence: {
      date: 0.95,
      meter_start: 0.9,
      meter_end: 0.9,
      cubic_consumption: 0.95,
      qty: {
        gallons: 0.85,
        "500ml": 0.85,
        wilkins: 0.8,
        small_slim: 0.8,
      },
      price: {
        gallons: 0.9,
        "500ml": 0.9,
        wilkins: 0.9,
        small_slim: 0.9,
      },
      expenses: {
        transportation: 0.85,
        labor: 0.85,
        supplies: 0.8,
        utang_paid: 0.9,
        other: 0.75,
      },
      cash_advance: {
        ryan: 0.9,
        rjhay: 0.9,
        third: 0.85,
      },
      remarks: 1.0,
    },
  };
}
