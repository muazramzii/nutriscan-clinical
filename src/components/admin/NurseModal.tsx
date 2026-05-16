"use client";

import { useState, useEffect } from "react";

interface NurseData {
  id?: string;
  name: string;
  email?: string;
  ward?: string | null;
}

interface Props {
  nurse?: NurseData | null;
  onClose: () => void;
  onSaved: () => void;
}

export function NurseModal({ nurse, onClose, onSaved }: Props) {
  const [form, setForm] = useState({ name: "", email: "", password: "", ward: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (nurse) {
      setForm({ name: nurse.name, email: nurse.email ?? "", password: "", ward: nurse.ward ?? "" });
    }
  }, [nurse]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const url = nurse?.id ? `/api/admin/nurses/${nurse.id}` : "/api/admin/nurses";
    const method = nurse?.id ? "PATCH" : "POST";
    const body = nurse?.id
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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-scale-in">
        <div
          className="relative px-6 py-5 text-white"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}
        >
          <div className="absolute -top-4 -right-4 w-32 h-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center justify-between">
            <div>
              <p className="text-2xs font-bold uppercase tracking-widest text-white/70">
                {nurse ? "Edit" : "New"}
              </p>
              <h2 className="font-bold text-lg tracking-tight mt-0.5">
                {nurse ? "Edit Nurse" : "Add Nurse"}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {!nurse && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Ward <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={form.ward}
              onChange={(e) => setForm((f) => ({ ...f, ward: e.target.value }))}
              placeholder="e.g. 3A"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
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
              className="flex-1 py-2.5 text-white text-sm font-bold rounded-xl shadow-sm tap-scale disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
