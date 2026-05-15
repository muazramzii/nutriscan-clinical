"use client";

import { useState, useEffect, useRef } from "react";
import { FoodItemData, FoodCategory } from "@/types";

const CATEGORIES: { value: FoodCategory; label: string; color: string }[] = [
  { value: "STAPLE", label: "Staple", color: "bg-amber-50 text-amber-700 ring-amber-200" },
  { value: "PROTEIN", label: "Protein", color: "bg-rose-50 text-rose-700 ring-rose-200" },
  { value: "VEGETABLE", label: "Vegetables", color: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  { value: "FRUIT", label: "Fruits", color: "bg-pink-50 text-pink-700 ring-pink-200" },
  { value: "BEVERAGE", label: "Beverages", color: "bg-sky-50 text-sky-700 ring-sky-200" },
  { value: "OTHER", label: "Other", color: "bg-gray-50 text-gray-700 ring-gray-200" },
];

interface Props {
  item?: FoodItemData | null;
  onClose: () => void;
  onSaved: () => void;
}

export function FoodModal({ item, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: "",
    nameBM: "",
    category: "STAPLE" as FoodCategory,
    kcalPer100g: "",
    carbsPer100g: "",
    proteinPer100g: "",
    fatPer100g: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [catOpen, setCatOpen] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (item) {
      setForm({
        name: item.name,
        nameBM: item.nameBM,
        category: item.category,
        kcalPer100g: String(item.kcalPer100g),
        carbsPer100g: String(item.carbsPer100g),
        proteinPer100g: String(item.proteinPer100g),
        fatPer100g: String(item.fatPer100g),
      });
    }
  }, [item]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const body = {
      name: form.name,
      nameBM: form.nameBM,
      category: form.category,
      kcalPer100g: parseFloat(form.kcalPer100g),
      carbsPer100g: parseFloat(form.carbsPer100g),
      proteinPer100g: parseFloat(form.proteinPer100g),
      fatPer100g: parseFloat(form.fatPer100g),
    };

    const url = item ? `/api/food-items/${item.id}` : "/api/food-items";
    const method = item ? "PATCH" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (!res.ok) {
      setError("Failed to save.");
      return;
    }
    onSaved();
    onClose();
  }

  function field(label: string, key: keyof typeof form, type = "text") {
    return (
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          required
          className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
        />
      </div>
    );
  }

  const selected = CATEGORIES.find((c) => c.value === form.category)!;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {/* Header */}
        <div
          className="relative px-6 py-5 text-white"
          style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
        >
          <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold uppercase tracking-widest text-white/70">
                {item ? "Edit" : "New"}
              </p>
              <h2 className="font-bold text-lg tracking-tight mt-0.5">
                {item ? "Edit Food" : "Add Food"}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white bg-white/15 backdrop-blur-sm ring-1 ring-white/20 hover:bg-white/25 tap-scale"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {field("Name (English)", "name")}
          {field("Nama (Bahasa Malaysia)", "nameBM")}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
            <div ref={catRef} className="relative">
              <button
                type="button"
                onClick={() => setCatOpen((o) => !o)}
                className="w-full flex items-center justify-between border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all hover:bg-white"
              >
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-semibold ring-1 ring-inset ${selected.color}`}
                >
                  {selected.label}
                </span>
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${catOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {catOpen && (
                <div className="absolute z-10 mt-2 w-full bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden animate-scale-in">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, category: c.value }));
                        setCatOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        form.category === c.value ? "bg-gray-50" : ""
                      }`}
                    >
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-2xs font-semibold ring-1 ring-inset ${c.color}`}
                      >
                        {c.label}
                      </span>
                      {form.category === c.value && (
                        <svg className="w-4 h-4 text-primary ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field("Kcal / 100g", "kcalPer100g", "number")}
            {field("Carbs / 100g (g)", "carbsPer100g", "number")}
            {field("Protein / 100g (g)", "proteinPer100g", "number")}
            {field("Fat / 100g (g)", "fatPer100g", "number")}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm font-medium text-danger-600 bg-danger-50 ring-1 ring-inset ring-danger-100 px-3 py-2.5 rounded-xl">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-gray-50 tap-scale"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl shadow-glow-sm tap-scale disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
