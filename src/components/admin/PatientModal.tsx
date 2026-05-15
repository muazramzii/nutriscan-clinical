"use client";

import { useState, useEffect, useRef } from "react";
import { DietType } from "@/types";

const DIET_TYPES: { value: DietType; label: string; color: string }[] = [
  { value: "DIABETIC",     label: "Diabetic",     color: "bg-blue-100 text-blue-700" },
  { value: "LOW_SODIUM",   label: "Low Sodium",   color: "bg-purple-100 text-purple-700" },
  { value: "POST_SURGERY", label: "Post Surgery", color: "bg-orange-100 text-orange-700" },
  { value: "RENAL",        label: "Renal",        color: "bg-yellow-100 text-yellow-700" },
  { value: "REGULAR",      label: "Regular",      color: "bg-green-100 text-green-700" },
];

interface PatientData {
  id?: string;
  name: string;
  bedNumber: string;
  ward: string;
  dietType: DietType;
  kcalTarget: number;
  isActive?: boolean;
}

interface Props {
  patient?: PatientData | null;
  onClose: () => void;
  onSaved: () => void;
}

export function PatientModal({ patient, onClose, onSaved }: Props) {
  const [form, setForm] = useState({
    name: "",
    bedNumber: "",
    ward: "",
    dietType: "REGULAR" as DietType,
    kcalTarget: "1800",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [dietOpen, setDietOpen] = useState(false);
  const dietRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (patient) {
      setForm({
        name: patient.name,
        bedNumber: patient.bedNumber,
        ward: patient.ward,
        dietType: patient.dietType,
        kcalTarget: String(patient.kcalTarget),
      });
    }
  }, [patient]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dietRef.current && !dietRef.current.contains(e.target as Node)) {
        setDietOpen(false);
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
      bedNumber: form.bedNumber,
      ward: form.ward,
      dietType: form.dietType,
      kcalTarget: parseInt(form.kcalTarget),
    };

    const url = patient?.id ? `/api/admin/patients/${patient.id}` : "/api/admin/patients";
    const method = patient?.id ? "PATCH" : "POST";

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

  function input(label: string, key: keyof typeof form, type = "text") {
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

  const selected = DIET_TYPES.find((d) => d.value === form.dietType)!;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">
            {patient ? "Edit Patient" : "Add Patient"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {input("Name", "name")}
          <div className="grid grid-cols-2 gap-3">
            {input("Bed No.", "bedNumber")}
            {input("Ward", "ward")}
          </div>

          {/* Diet Type custom dropdown */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Diet Type</label>
            <div ref={dietRef} className="relative">
              <button
                type="button"
                onClick={() => setDietOpen((o) => !o)}
                className="w-full flex items-center justify-between border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${selected.color}`}>
                  {selected.label}
                </span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${dietOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {dietOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {DIET_TYPES.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, dietType: d.value }));
                        setDietOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        form.dietType === d.value ? "bg-gray-50" : ""
                      }`}
                    >
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${d.color}`}>
                        {d.label}
                      </span>
                      {form.dietType === d.value && (
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

          {input("Kcal Target", "kcalTarget", "number")}

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
