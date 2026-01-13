"use client";

import { PageImage } from "@/types";

interface ImagePreviewProps {
  image: PageImage;
  label: string;
  onRotate: () => void;
  onRemove: () => void;
}

export default function ImagePreview({
  image,
  label,
  onRotate,
  onRemove,
}: ImagePreviewProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-medium text-gray-700 mb-2">{label}</h3>
      <div className="relative bg-gray-100 rounded overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.dataUrl}
          alt={label}
          className="w-full h-auto"
          style={{
            transform: `rotate(${image.rotation}deg)`,
          }}
        />
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onRotate}
          className="flex-1 btn btn-secondary text-sm flex items-center justify-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Rotate
        </button>
        <button
          onClick={onRemove}
          className="flex-1 btn btn-danger text-sm flex items-center justify-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Remove
        </button>
      </div>
    </div>
  );
}
