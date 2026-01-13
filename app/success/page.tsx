"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface SubmitResult {
  success: boolean;
  appendedRow?: number;
  timestamp?: string;
}

export default function SuccessPage() {
  const router = useRouter();
  const [result, setResult] = useState<SubmitResult | null>(null);

  useEffect(() => {
    const resultData = sessionStorage.getItem("submitResult");
    if (!resultData) {
      router.push("/");
      return;
    }

    setResult(JSON.parse(resultData));
    sessionStorage.removeItem("submitResult");
  }, [router]);

  const handleNewScan = () => {
    router.push("/");
  };

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg
            className="w-20 h-20 text-green-500 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Success!
        </h1>

        <p className="text-gray-600 mb-6">
          Your sales data has been successfully submitted to Google Sheets.
        </p>

        {result.appendedRow && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Row Number:</strong> {result.appendedRow}
            </p>
            {result.timestamp && (
              <p className="text-sm text-blue-800 mt-1">
                <strong>Timestamp:</strong>{" "}
                {new Date(result.timestamp).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <button
          onClick={handleNewScan}
          className="w-full btn btn-primary mb-3"
        >
          Scan Another Report
        </button>

        <p className="text-xs text-gray-500">
          You can now close this window or scan another report.
        </p>
      </div>
    </div>
  );
}
