"use client";

import Link from "next/link";
import { DashboardPatient } from "@/types";
import { DietTypeBadge, StatusLabel, PriorityBadge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface Props {
  patients: DashboardPatient[];
  wardFilter: string;
}

export function PatientTable({ patients, wardFilter }: Props) {
  const sortedPatients = [...patients].sort((a, b) => {
    // 1. Priority first
    const priorityMap = { HIGH: 3, MEDIUM: 2, LOW: 1, NONE: 0 };
    if (priorityMap[a.priority] !== priorityMap[b.priority]) {
      return priorityMap[b.priority] - priorityMap[a.priority];
    }
    
    // 2. Then unread alert count
    if (a.alertCount !== b.alertCount) return b.alertCount - a.alertCount;
    
    // 3. Then alphabetical by name
    return a.name.localeCompare(b.name);
  });

  const filtered =
    wardFilter === "all"
      ? sortedPatients
      : sortedPatients.filter((p) => p.ward === wardFilter);

  if (filtered.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-400">
        No patients found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Priority
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Patient
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Diet
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Target
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-40">
              Intake
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Kcal Today
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Status
            </th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {filtered.map((p) => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <PriorityBadge priority={p.priority} />
              </td>
              <td className="px-4 py-3">
                <p className="font-medium text-gray-900">{p.name}</p>
                <p className="text-xs text-gray-400">
                  {p.bedNumber} · Ward {p.ward}
                </p>
              </td>
              <td className="px-4 py-3">
                <DietTypeBadge type={p.dietType} />
              </td>
              <td className="px-4 py-3 text-gray-600">
                {p.kcalTarget.toLocaleString()} kcal
              </td>
              <td className="px-4 py-3">
                <ProgressBar value={p.percentageEaten} showLabel />
              </td>
              <td className="px-4 py-3 font-medium text-gray-900">
                {p.todayKcal.toLocaleString()}{" "}
                <span className="text-xs text-gray-400 font-normal">
                  / {p.kcalTarget.toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusLabel status={p.statusLabel} />
                {p.alertCount > 0 && (
                  <span className="ml-1 text-xs text-danger">
                    ⚠ {p.alertCount}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/dietitian/patient/${p.id}`}
                  className="text-xs text-primary border border-primary-100 px-3 py-1.5 rounded-lg hover:bg-primary-50 whitespace-nowrap"
                >
                  View →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
