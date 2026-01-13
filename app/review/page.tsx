"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SalesData, ExtractionResult } from "@/types";
import ReviewForm from "@/components/ReviewForm";

export default function ReviewPage() {
  const router = useRouter();
  const [data, setData] = useState<SalesData | null>(null);
  const [confidence, setConfidence] = useState<
    ExtractionResult["confidence"] | null
  >(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load data from sessionStorage
    const extractedData = sessionStorage.getItem("extractedData");
    const confidenceData = sessionStorage.getItem("confidence");

    if (!extractedData || !confidenceData) {
      router.push("/");
      return;
    }

    setData(JSON.parse(extractedData));
    setConfidence(JSON.parse(confidenceData));
  }, [router]);

  const handleSubmit = async (formData: SalesData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/append", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit");
      }

      const result = await response.json();

      // Store result for success page
      sessionStorage.setItem("submitResult", JSON.stringify(result));
      sessionStorage.removeItem("extractedData");
      sessionStorage.removeItem("confidence");

      router.push("/success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  if (!data || !confidence) {
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
    <div className="min-h-screen bg-gray-50 py-8">
      <ReviewForm
        initialData={data}
        confidence={confidence}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />

      {error && (
        <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="max-w-2xl mx-auto mt-4 px-4">
        <button
          onClick={() => router.push("/")}
          className="w-full btn btn-secondary"
        >
          Back to Scanner
        </button>
      </div>
    </div>
  );
}
