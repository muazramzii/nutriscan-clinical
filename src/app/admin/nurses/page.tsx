"use client";

import { useEffect, useState } from "react";
import { NurseModal } from "@/components/admin/NurseModal";

interface Nurse {
  id: string;
  name: string;
  email: string;
  ward: string | null;
  createdAt: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function AdminNursesPage() {
  const [nurses, setNurses] = useState<Nurse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; item?: Nurse | null }>({ open: false });
  const [deleteTarget, setDeleteTarget] = useState<Nurse | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function fetchNurses() {
    const res = await fetch("/api/admin/nurses");
    const data = await res.json();
    setNurses(data.nurses ?? []);
    setLoading(false);
  }

  useEffect(() => { fetchNurses(); }, []);

  async function handleDelete(nurse: Nurse) {
    setDeleting(true);
    await fetch(`/api/admin/nurses/${nurse.id}`, { method: "DELETE" });
    setDeleteTarget(null);
    setDeleting(false);
    fetchNurses();
  }

  return (
    <div className="p-6 animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nurses</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage nurse accounts</p>
        </div>
        <button
          onClick={() => setModal({ open: true, item: null })}
          className="inline-flex items-center gap-1.5 text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm tap-scale transition-all"
          style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          Add Nurse
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center text-sm text-gray-400">
          Loading…
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-sm tracking-tight">All Nurses</h3>
            <p className="text-2xs text-gray-500 mt-0.5">
              {nurses.length} account{nurses.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead className="bg-gray-50/50 border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">Name</th>
                  <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">Email</th>
                  <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">Ward</th>
                  <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">Registered</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {nurses.map((n) => (
                  <tr key={n.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
                          style={{ background: "linear-gradient(135deg, #3B82F6, #1D4ED8)" }}
                        >
                          {getInitials(n.name)}
                        </div>
                        <span className="font-semibold text-gray-900">{n.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{n.email}</td>
                    <td className="px-4 py-3">
                      {n.ward ? (
                        <span className="inline-flex items-center gap-1 text-2xs font-semibold text-blue-700 bg-blue-50 ring-1 ring-inset ring-blue-100 px-2 py-0.5 rounded-full">
                          Ward {n.ward}
                        </span>
                      ) : (
                        <span className="text-2xs font-medium text-gray-400 italic">Not assigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-2xs font-medium text-gray-500 tabular-nums">
                      {new Date(n.createdAt).toLocaleDateString("en-MY")}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setModal({ open: true, item: n })}
                          className="text-2xs font-semibold text-blue-700 bg-blue-50 ring-1 ring-inset ring-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100/60 tap-scale"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(n)}
                          className="text-2xs font-semibold text-danger-600 bg-danger-50 ring-1 ring-inset ring-danger-100 px-3 py-1.5 rounded-lg hover:bg-danger-100/60 tap-scale"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {nurses.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <p className="text-sm font-medium text-gray-600">No nurses found</p>
                      <p className="text-xs text-gray-400 mt-1">Add one to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {modal.open && (
        <NurseModal
          nurse={modal.item}
          onClose={() => setModal({ open: false })}
          onSaved={fetchNurses}
        />
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <p className="text-sm font-bold text-gray-900 text-center">Delete Nurse Account?</p>
            <p className="text-xs text-gray-500 text-center mt-1">
              <span className="font-semibold text-gray-700">{deleteTarget.name}</span> will be permanently removed.
            </p>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteTarget)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl hover:bg-red-600 disabled:opacity-50"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
