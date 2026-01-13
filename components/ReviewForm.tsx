"use client";

import { useState } from "react";
import { SalesData, ExtractionResult } from "@/types";
import { shouldHighlight } from "@/lib/validation/schema";

interface ReviewFormProps {
  initialData: SalesData;
  confidence: ExtractionResult["confidence"];
  onSubmit: (data: SalesData) => void;
  isSubmitting: boolean;
}

export default function ReviewForm({
  initialData,
  confidence,
  onSubmit,
  isSubmitting,
}: ReviewFormProps) {
  const [formData, setFormData] = useState<SalesData>(initialData);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const updateField = (path: string, value: string | number | null) => {
    const keys = path.split(".");
    setFormData((prev) => {
      const newData = { ...prev };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const getFieldValue = (path: string): string | number | null | Record<string, number | null> => {
    const keys = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = formData;
    for (const key of keys) {
      current = current?.[key];
    }
    return current;
  };

  const getConfidence = (path: string): number => {
    const keys = path.split(".");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = confidence;
    for (const key of keys) {
      current = current?.[key];
    }
    return typeof current === "number" ? current : 0.9;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    const newErrors: { [key: string]: string } = {};

    if (!formData.date) {
      newErrors.date = "Date is required";
    }

    if (
      formData.meter_start !== null &&
      formData.meter_end !== null &&
      formData.meter_end < formData.meter_start
    ) {
      newErrors.meter_end = "Meter end must be >= meter start";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const renderInput = (
    path: string,
    label: string,
    type: "text" | "number" | "date" = "text"
  ) => {
    const value = getFieldValue(path);
    const conf = getConfidence(path);
    const highlight = shouldHighlight(
      typeof value === "object" ? null : value,
      conf
    );
    const hasError = errors[path];

    let className = "input-field";
    if (hasError) {
      className += " input-error";
    } else if (highlight === "warning") {
      className += " input-warning";
    }

    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {highlight === "warning" && (
            <span className="ml-2 text-xs text-yellow-600">
              (Low confidence - please verify)
            </span>
          )}
        </label>
        <input
          type={type}
          value={typeof value === "object" || value === null ? "" : value}
          onChange={(e) => {
            const newValue =
              type === "number" && e.target.value
                ? parseFloat(e.target.value)
                : e.target.value;
            updateField(path, newValue || null);
          }}
          className={className}
        />
        {hasError && <p className="mt-1 text-sm text-red-600">{hasError}</p>}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Review Extracted Data</h2>

      {/* Date and Meter Readings */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold text-lg mb-3">General Information</h3>
        {renderInput("date", "Date", "date")}
        {renderInput("meter_start", "Meter Start", "number")}
        {renderInput("meter_end", "Meter End", "number")}
        {renderInput("cubic_consumption", "Cubic Consumption", "number")}
      </div>

      {/* Quantities */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold text-lg mb-3">Quantities</h3>
        {renderInput("qty.gallons", "Gallons", "number")}
        {renderInput("qty.500ml", "500ml", "number")}
        {renderInput("qty.wilkins", "Wilkins", "number")}
        {renderInput("qty.small_slim", "Small Slim", "number")}
      </div>

      {/* Prices */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold text-lg mb-3">Prices</h3>
        {renderInput("price.gallons", "Gallons Price", "number")}
        {renderInput("price.500ml", "500ml Price", "number")}
        {renderInput("price.wilkins", "Wilkins Price", "number")}
        {renderInput("price.small_slim", "Small Slim Price", "number")}
      </div>

      {/* Expenses */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold text-lg mb-3">Expenses</h3>
        {renderInput("expenses.transportation", "Transportation", "number")}
        {renderInput("expenses.labor", "Labor", "number")}
        {renderInput("expenses.supplies", "Supplies", "number")}
        {renderInput("expenses.utang_paid", "Utang Paid", "number")}
        {renderInput("expenses.other", "Other", "number")}
      </div>

      {/* Cash Advance */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h3 className="font-semibold text-lg mb-3">Cash Advance</h3>
        {renderInput("cash_advance.ryan", "Ryan", "number")}
        {renderInput("cash_advance.rjhay", "Rjhay", "number")}
        {renderInput("cash_advance.third", "Third", "number")}
      </div>

      {/* Remarks */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold text-lg mb-3">Remarks</h3>
        <textarea
          value={formData.remarks ?? ""}
          onChange={(e) => updateField("remarks", e.target.value || null)}
          className="input-field min-h-[100px]"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full btn btn-primary"
      >
        {isSubmitting ? "Submitting..." : "Submit to Google Sheets"}
      </button>
    </form>
  );
}
