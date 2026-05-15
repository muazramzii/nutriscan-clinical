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
    <div className="w-full animate-fade-in">
      {preview ? (
        <div className="relative w-full rounded-3xl overflow-hidden bg-gray-100 shadow-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Meal preview"
            className="w-full max-h-80 object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-white/15 backdrop-blur-md ring-1 ring-white/20 px-3 py-1.5 rounded-full hover:bg-white/25 tap-scale"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Retake
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full relative rounded-3xl p-8 text-center min-h-[220px] flex flex-col items-center justify-center gap-4 bg-white border-2 border-dashed border-primary-200 hover:border-primary hover:bg-primary-50/40 active:bg-primary-50 tap-scale transition-all shadow-card"
        >
          {/* Decorative blob */}
          <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-primary-50 opacity-50 blur-xl" />
          <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-primary-100 opacity-40 blur-lg" />

          <div className="relative z-10">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-glow-sm"
              style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
            >
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.8}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-base font-bold text-gray-900 tracking-tight">{label}</p>
            {sublabel && (
              <p className="text-xs text-gray-500 mt-1">{sublabel}</p>
            )}
          </div>

          <div className="relative z-10 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 px-3 py-1.5 rounded-full">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tap to capture
          </div>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}
