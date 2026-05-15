"use client";

import { AlertWithPatient } from "@/types";
import { AlertTypeBadge } from "@/components/ui/Badge";

interface Props {
  alerts: AlertWithPatient[];
  onMarkRead: (id: string) => void;
}

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function AlertsPanel({ alerts, onMarkRead }: Props) {
  const unread = alerts.filter((a) => !a.isRead);
  const read = alerts.filter((a) => a.isRead);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-danger-50 ring-1 ring-inset ring-danger-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-danger-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm tracking-tight">Alerts</h3>
            <p className="text-2xs text-gray-500">
              {unread.length} unread · {alerts.length} total
            </p>
          </div>
        </div>
        {unread.length > 0 && (
          <span className="inline-flex items-center bg-danger text-white text-xs font-bold px-2.5 py-1 rounded-full">
            {unread.length}
          </span>
        )}
      </div>

      <div className="max-h-[520px] overflow-y-auto divide-y divide-gray-50">
        {alerts.length === 0 ? (
          <div className="py-12 px-5 text-center">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-primary-50 ring-1 ring-inset ring-primary-100 flex items-center justify-center mb-3">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-700">All clear</p>
            <p className="text-xs text-gray-500 mt-0.5">No alerts at this time</p>
          </div>
        ) : (
          [...unread, ...read].map((alert) => (
            <div
              key={alert.id}
              className={`px-5 py-4 transition-colors ${
                alert.isRead ? "opacity-60" : "hover:bg-gray-50/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <AlertTypeBadge type={alert.type} />
                    {!alert.isRead && (
                      <span className="relative flex h-2 w-2 flex-shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-danger" />
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {alert.patient.name}
                  </p>
                  <p className="text-2xs text-gray-500 mt-0.5">
                    Bed {alert.patient.bedNumber} · Ward {alert.patient.ward}
                  </p>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed line-clamp-2">
                    {alert.message}
                  </p>
                  <p className="text-2xs text-gray-400 mt-1.5 font-medium">
                    {timeAgo(alert.createdAt)}
                  </p>
                </div>
                {!alert.isRead && (
                  <button
                    onClick={() => onMarkRead(alert.id)}
                    className="inline-flex items-center text-2xs font-semibold text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 px-2 py-1 rounded-lg hover:bg-primary-100/60 tap-scale flex-shrink-0"
                  >
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
