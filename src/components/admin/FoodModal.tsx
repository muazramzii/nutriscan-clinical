"use client";

import { useState, useEffect, useRef } from "react";
import { FoodItemData, FoodCategory } from "@/types";

const CATEGORIES: { value: FoodCategory; label: string; color: string }[] = [
  { value: "STAPLE",    label: "Staple Food", color: "bg-amber-100 text-amber-700" },
  { value: "PROTEIN",   label: "Protein",     color: "bg-red-100 text-red-700" },
  { value: "VEGETABLE", label: "Vegetables",  color: "bg-green-100 text-green-700" },
  { value: "FRUIT",     label: "Fruits",      color: "bg-pink-100 text-pink-700" },
  { value: "BEVERAGE",  label: "Beverages",   color: "bg-blue-100 text-blue-700" },
  { value: "OTHER",     label: "Others",      color: "bg-gray-100 text-gray-600" },
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
    if (!res.ok) { setError("Failed to save."); return; }
    onSaved();
    onClose();
  }

  function field(label: string, key: keyof typeof form, type = "text") {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
        <input
          type={type}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
    );
  }

  const selected = CATEGORIES.find((c) => c.value === form.category)!;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">
            {item ? "Edit Food" : "Add Food"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {field("Name (English)", "name")}
          {field("Name BM (Bahasa Malaysia)", "nameBM")}

          {/* Category custom dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <div ref={catRef} className="relative">
              <button
                type="button"
                onClick={() => setCatOpen((o) => !o)}
                className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${selected.color}`}>
                  {selected.label}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${catOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {catOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
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
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${c.color}`}>
                        {c.label}
                      </span>
                      {form.category === c.value && (
                        <svg className="w-4 h-4 text-primary ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-gray-700 text-sm rounded-lg">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-primary text-white text-sm font-semibold rounded-lg disabled:opacity-50">
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
