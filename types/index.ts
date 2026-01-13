// Type definitions for Daily Sales Scanner

export interface SalesData {
  date: string; // YYYY-MM-DD
  meter_start: number | null;
  meter_end: number | null;
  cubic_consumption: number | null;
  qty: {
    gallons: number | null;
    "500ml": number | null;
    wilkins: number | null;
    small_slim: number | null;
  };
  price: {
    gallons: number | null;
    "500ml": number | null;
    wilkins: number | null;
    small_slim: number | null;
  };
  expenses: {
    transportation: number | null;
    labor: number | null;
    supplies: number | null;
    utang_paid: number | null;
    other: number | null;
  };
  cash_advance: {
    ryan: number | null;
    rjhay: number | null;
    third: number | null;
  };
  remarks: string | null;
}

export interface ExtractionResult {
  data: SalesData;
  confidence: {
    [key: string]: number | { [subkey: string]: number };
  };
}

export interface PageImage {
  dataUrl: string;
  rotation: number;
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ScanState {
  page1: PageImage | null;
  page2: PageImage | null;
  extractedData: SalesData | null;
  confidence: ExtractionResult["confidence"] | null;
  isProcessing: boolean;
}

export interface SheetRow {
  Date: string;
  MeterStart: number | null;
  MeterEnd: number | null;
  CubicConsumption: number | null;
  GallonsQty: number | null;
  "500mlQty": number | null;
  WilkinsQty: number | null;
  SmallSlimQty: number | null;
  GallonsPrice: number | null;
  "500mlPrice": number | null;
  WilkinsPrice: number | null;
  SmallSlimPrice: number | null;
  Transportation: number | null;
  Labor: number | null;
  Supplies: number | null;
  UtangPaid: number | null;
  OtherExpenses: number | null;
  IsCashAdvanceDay: boolean;
  CA_Ryan: number | null;
  CA_Rjhay: number | null;
  CA_Third: number | null;
  TotalCashAdvance: number;
  Remarks: string | null;
}
