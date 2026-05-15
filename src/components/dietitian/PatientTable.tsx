"use client";

import Link from "next/link";
import { DashboardPatient } from "@/types";
import { DietTypeBadge, StatusLabel, PriorityBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface Props {
  patients: DashboardPatient[];
  wardFilter: string;
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function PatientTable({ patients, wardFilter }: Props) {
  const sortedPatients = [...patients].sort((a, b) => {
    const priorityMap = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
    if (priorityMap[a.priority] !== priorityMap[b.priority]) {
      return priorityMap[b.priority] - priorityMap[a.priority];
    }
    if (a.alertCount !== b.alertCount) return b.alertCount - a.alertCount;
    return a.name.localeCompare(b.name);
  });

  const filtered =
    wardFilter === "all"
      ? sortedPatients
      : sortedPatients.filter((p) => p.ward === wardFilter);

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
          <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-600">No patients found</p>
        <p className="text-xs text-gray-400 mt-1">Try changing the ward filter</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-gray-900 text-sm tracking-tight">Patient List</h3>
          <p className="text-2xs text-gray-500 mt-0.5">{filtered.length} patient{filtered.length !== 1 ? "s" : ""} shown</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/50 border-b border-gray-100">
            <tr>
              <th className="text-left px-5 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                Patient
              </th>
              <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                Diet
              </th>
              <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                Target
              </th>
              <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest w-44">
                Intake
              </th>
              <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                Kcal Today
              </th>
              <th className="text-left px-4 py-3 text-2xs font-bold text-gray-500 uppercase tracking-widest">
                Status
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0"
                      style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
                    >
                      {getInitials(p.name)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-2xs text-gray-500">
                        Bed {p.bedNumber} · Ward {p.ward}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <DietTypeBadge type={p.dietType} />
                </td>
                <td className="px-4 py-3 text-gray-600 font-medium tabular-nums">
                  {p.kcalTarget.toLocaleString()} <span className="text-2xs text-gray-400">kcal</span>
                </td>
                <td className="px-4 py-3">
                  <ProgressBar value={p.percentageEaten} showLabel size="sm" />
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900 tabular-nums">
                  {p.todayKcal.toLocaleString()}{" "}
                  <span className="text-2xs text-gray-400 font-normal">
                    / {p.kcalTarget.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col items-start gap-1">
                    <PriorityBadge priority={p.priority} />
                    <StatusLabel status={p.statusLabel} />
                    {p.alertCount > 0 && (
                      <span className="inline-flex items-center gap-0.5 text-2xs font-bold text-danger-600 bg-danger-50 ring-1 ring-inset ring-danger-100 px-1.5 py-0.5 rounded-full">
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {p.alertCount} alerts
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/dietitian/patient/${p.id}`}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 px-3 py-1.5 rounded-lg hover:bg-primary-100/60 tap-scale whitespace-nowrap"
                  >
                    View
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
