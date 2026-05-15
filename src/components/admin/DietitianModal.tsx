"use client";

import { useState, useEffect } from "react";

interface DietitianData {
  id?: string;
  name: string;
  email?: string;
  ward?: string | null;
}

interface Props {
  dietitian?: DietitianData | null;
  onClose: () => void;
  onSaved: () => void;
}

export function DietitianModal({ dietitian, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ name: "", email: "", password: "", ward: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (dietitian) {
      setForm({ name: dietitian.name, email: dietitian.email ?? "", password: "", ward: dietitian.ward ?? "" });
    }
  }, [dietitian]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = dietitian?.id ? `/api/admin/dietitians/${dietitian.id}` : "/api/admin/dietitians";
    const method = dietitian?.id ? "PATCH" : "POST";
    const body = dietitian?.id
      ? { name: form.name, ward: form.ward || null }
      : { name: form.name, email: form.email, password: form.password, ward: form.ward || null };

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

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-gray-900">
            {dietitian ? "Edit Dietitian" : "Add Dietitian"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          {!dietitian && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ward (optional)</label>
            <input type="text" value={form.ward} onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
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
