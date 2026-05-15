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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">
          Alerts
          {unread.length > 0 && (
            <span className="ml-2 bg-danger text-white text-xs px-2 py-0.5 rounded-full">
              {unread.length}
            </span>
          )}
        </h3>
      </div>

      <div className="max-h-[480px] overflow-y-auto divide-y divide-gray-50">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">
            No alerts.
          </div>
        ) : (
          [...unread, ...read].map((alert) => (
            <div
              key={alert.id}
              className={`px-4 py-3 ${alert.isRead ? "opacity-60" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTypeBadge type={alert.type} />
                    {!alert.isRead && (
                      <span className="w-2 h-2 rounded-full bg-danger flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {alert.patient.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    Bed {alert.patient.bedNumber} · Ward {alert.patient.ward}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {alert.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {timeAgo(alert.createdAt)}
                  </p>
                </div>
                {!alert.isRead && (
                  <button
                    onClick={() => onMarkRead(alert.id)}
                    className="text-xs text-primary border border-primary-100 px-2 py-1 rounded-lg hover:bg-primary-50 flex-shrink-0"
                  >
                    Mark Read
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
