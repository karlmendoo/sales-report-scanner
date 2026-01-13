// API Route: Append data to Google Sheets

import { NextRequest, NextResponse } from "next/server";
import { SalesData } from "@/types";
import { validateSalesData, convertToSheetRow } from "@/lib/validation/schema";
import { appendToSheet } from "@/lib/sheets/append";

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as SalesData;

    // Validate the data
    const validation = validateSalesData(data);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Convert to sheet row format
    const sheetRow = convertToSheetRow(data);

    // Append to Google Sheets
    const result = await appendToSheet(sheetRow);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error || "Failed to append to sheet",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      appendedRow: result.appendedRow,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Append error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Append failed",
      },
      { status: 500 }
    );
  }
}
