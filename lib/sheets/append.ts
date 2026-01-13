// Google Sheets append utility

import { SheetRow } from "@/types";

export interface AppendResponse {
  ok: boolean;
  appendedRow?: number;
  error?: string;
}

export async function appendToSheet(row: SheetRow): Promise<AppendResponse> {
  const webAppUrl = process.env.APPS_SCRIPT_WEBAPP_URL;
  const secretToken = process.env.SHARED_SECRET_TOKEN;

  if (!webAppUrl) {
    throw new Error("APPS_SCRIPT_WEBAPP_URL is not configured");
  }

  if (!secretToken) {
    throw new Error("SHARED_SECRET_TOKEN is not configured");
  }

  try {
    const response = await fetch(webAppUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretToken}`,
      },
      body: JSON.stringify({
        sheetName: process.env.DEFAULT_SHEET_NAME || "DailySales",
        row: [
          row.Date,
          row.MeterStart,
          row.MeterEnd,
          row.CubicConsumption,
          row.GallonsQty,
          row["500mlQty"],
          row.WilkinsQty,
          row.SmallSlimQty,
          row.GallonsPrice,
          row["500mlPrice"],
          row.WilkinsPrice,
          row.SmallSlimPrice,
          row.Transportation,
          row.Labor,
          row.Supplies,
          row.UtangPaid,
          row.OtherExpenses,
          row.IsCashAdvanceDay,
          row.CA_Ryan,
          row.CA_Rjhay,
          row.CA_Third,
          row.TotalCashAdvance,
          row.Remarks,
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        ok: false,
        error: `Failed to append to sheet: ${response.status} - ${errorText}`,
      };
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Sheet append error:", error);
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
