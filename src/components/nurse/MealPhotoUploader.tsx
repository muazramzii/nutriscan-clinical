"use client";

import { useRef, useState } from "react";

interface Props {
  label: string;
  sublabel?: string;
  onImageSelected: (file: File, previewUrl: string) => void;
}

export function MealPhotoUploader({ label, sublabel, onImageSelected }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onImageSelected(file, url);
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 text-center min-h-48 flex flex-col items-center justify-center gap-3 hover:border-primary active:bg-primary-50 transition-colors"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="w-full max-h-48 object-cover rounded-lg"
          />
        ) : (
          <>
            <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-primary"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">{label}</p>
              {sublabel && (
                <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>
              )}
            </div>
          </>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
      {preview && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            if (inputRef.current) inputRef.current.value = "";
          }}
          className="mt-2 text-xs text-gray-500 underline w-full text-center"
        >
          Retake
        </button>
      )}
    </div>
  );
}
