"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CameraCapture from "@/components/CameraCapture";
import FileUpload from "@/components/FileUpload";
import ImagePreview from "@/components/ImagePreview";
import { PageImage } from "@/types";
import { preprocessImage } from "@/lib/image/client";

export default function HomePage() {
  const router = useRouter();
  const [page1, setPage1] = useState<PageImage | null>(null);
  const [page2, setPage2] = useState<PageImage | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCapture = (pageNum: 1 | 2) => async (dataUrl: string) => {
    const pageImage: PageImage = {
      dataUrl,
      rotation: 0,
    };

    if (pageNum === 1) {
      setPage1(pageImage);
    } else {
      setPage2(pageImage);
    }
  };

  const handleRotate = (pageNum: 1 | 2) => async () => {
    const page = pageNum === 1 ? page1 : page2;
    if (!page) return;

    const newRotation = (page.rotation + 90) % 360;
    const rotated = await preprocessImage(page.dataUrl, newRotation);

    const updatedPage: PageImage = {
      dataUrl: rotated,
      rotation: newRotation,
    };

    if (pageNum === 1) {
      setPage1(updatedPage);
    } else {
      setPage2(updatedPage);
    }
  };

  const handleRemove = (pageNum: 1 | 2) => () => {
    if (pageNum === 1) {
      setPage1(null);
    } else {
      setPage2(null);
    }
  };

  const handleExtract = async () => {
    if (!page1 || !page2) {
      setError("Both pages are required");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Convert data URLs to files
      const page1Blob = await fetch(page1.dataUrl).then((r) => r.blob());
      const page2Blob = await fetch(page2.dataUrl).then((r) => r.blob());

      const formData = new FormData();
      formData.append("page1", page1Blob, "page1.jpg");
      formData.append("page2", page2Blob, "page2.jpg");

      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Extraction failed");
      }

      const result = await response.json();

      // Store the results in sessionStorage
      sessionStorage.setItem("extractedData", JSON.stringify(result.data));
      sessionStorage.setItem("confidence", JSON.stringify(result.confidence));

      // Navigate to review page
      router.push("/review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    // Handle first two images
    const file1 = files[0];
    const file2 = files[1] || files[0];

    const readFile = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      const dataUrl1 = await readFile(file1);
      setPage1({ dataUrl: dataUrl1, rotation: 0 });

      if (files.length > 1) {
        const dataUrl2 = await readFile(file2);
        setPage2({ dataUrl: dataUrl2, rotation: 0 });
      }
    } catch (err) {
      setError("Failed to read uploaded files");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Daily Sales Scanner
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Capture Pages</h2>

          {!page1 && (
            <div className="mb-4">
              <CameraCapture
                label="Scan Page 1"
                onCapture={handleCapture(1)}
              />
            </div>
          )}

          {page1 && (
            <div className="mb-4">
              <ImagePreview
                image={page1}
                label="Page 1"
                onRotate={handleRotate(1)}
                onRemove={handleRemove(1)}
              />
            </div>
          )}

          {!page2 && page1 && (
            <div className="mb-4">
              <CameraCapture
                label="Scan Page 2"
                onCapture={handleCapture(2)}
              />
            </div>
          )}

          {page2 && (
            <div className="mb-4">
              <ImagePreview
                image={page2}
                label="Page 2"
                onRotate={handleRotate(2)}
                onRemove={handleRemove(2)}
              />
            </div>
          )}

          {!page1 && !page2 && (
            <div className="mt-4">
              <div className="text-center text-gray-500 mb-2">or</div>
              <FileUpload onUpload={handleFileUpload} />
            </div>
          )}
        </div>

        {page1 && page2 && (
          <button
            onClick={handleExtract}
            disabled={isProcessing}
            className="w-full btn btn-primary"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Processing...
              </span>
            ) : (
              "Extract Data"
            )}
          </button>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
          <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
            <li>Capture or upload both pages of the daily sales report</li>
            <li>Rotate images if needed for better OCR accuracy</li>
            <li>Click "Extract Data" to process with OCR + AI</li>
            <li>Review and correct the extracted data</li>
            <li>Submit to append to Google Sheets</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
