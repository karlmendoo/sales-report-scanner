import { SalesData, SheetRow } from "@/types";

export function validateSalesData(data: SalesData): {
  isValid: boolean;
  errors: { field: string; message: string }[];
} {
  const errors: { field: string; message: string }[] = [];

  // Date validation
  if (!data.date || !isValidDate(data.date)) {
    errors.push({ field: "date", message: "Date is required and must be valid" });
  }

  // Meter validation
  if (
    data.meter_start !== null &&
    data.meter_end !== null &&
    data.meter_end < data.meter_start
  ) {
    errors.push({
      field: "meter_end",
      message: "Meter end must be greater than or equal to meter start",
    });
  }

  // Numeric validations
  const numericFields = [
    "meter_start",
    "meter_end",
    "cubic_consumption",
  ] as const;

  numericFields.forEach((field) => {
    if (data[field] !== null && data[field]! < 0) {
      errors.push({ field, message: `${field} cannot be negative` });
    }
  });

  // Validate nested objects
  ["qty", "price", "expenses", "cash_advance"].forEach((category) => {
    const obj = data[category as keyof SalesData] as Record<string, number | null>;
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value < 0) {
        errors.push({
          field: `${category}.${key}`,
          message: `${category}.${key} cannot be negative`,
        });
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
}

function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  const date = new Date(dateString);
  const timestamp = date.getTime();

  if (typeof timestamp !== "number" || Number.isNaN(timestamp)) {
    return false;
  }

  return date.toISOString().startsWith(dateString);
}

export function computeDerivedFields(data: SalesData): SalesData {
  const result = { ...data };

  // Compute cubic consumption if missing
  if (
    result.cubic_consumption === null &&
    result.meter_start !== null &&
    result.meter_end !== null
  ) {
    result.cubic_consumption = Math.max(0, result.meter_end - result.meter_start);
  }

  return result;
}

export function convertToSheetRow(data: SalesData): SheetRow {
  const date = new Date(data.date);
  const isCashAdvanceDay = date.getDate() === 15;
  
  const totalCashAdvance = isCashAdvanceDay
    ? (data.cash_advance.ryan || 0) +
      (data.cash_advance.rjhay || 0) +
      (data.cash_advance.third || 0)
    : 0;

  return {
    Date: data.date,
    MeterStart: data.meter_start,
    MeterEnd: data.meter_end,
    CubicConsumption: data.cubic_consumption,
    GallonsQty: data.qty.gallons,
    "500mlQty": data.qty["500ml"],
    WilkinsQty: data.qty.wilkins,
    SmallSlimQty: data.qty.small_slim,
    GallonsPrice: data.price.gallons,
    "500mlPrice": data.price["500ml"],
    WilkinsPrice: data.price.wilkins,
    SmallSlimPrice: data.price.small_slim,
    Transportation: data.expenses.transportation,
    Labor: data.expenses.labor,
    Supplies: data.expenses.supplies,
    UtangPaid: data.expenses.utang_paid,
    OtherExpenses: data.expenses.other,
    IsCashAdvanceDay: isCashAdvanceDay,
    CA_Ryan: data.cash_advance.ryan,
    CA_Rjhay: data.cash_advance.rjhay,
    CA_Third: data.cash_advance.third,
    TotalCashAdvance: totalCashAdvance,
    Remarks: data.remarks,
  };
}

export function shouldHighlight(
  value: any,
  confidence?: number
): "none" | "warning" | "error" {
  if (value === null || value === undefined || value === "") {
    return "warning";
  }
  if (confidence !== undefined && confidence < 0.7) {
    return "warning";
  }
  return "none";
}
