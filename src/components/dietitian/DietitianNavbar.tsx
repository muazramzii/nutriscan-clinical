"use client";

import { signOut } from "next-auth/react";

interface Props {
  nurseName?: string;
  unreadAlertCount: number;
  onBellClick: () => void;
}

export function DietitianNavbar({ nurseName, unreadAlertCount, onBellClick }: Props) {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div>
          <span className="font-bold text-gray-900">NutriScan Clinical</span>
          <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            Dietitian
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          onClick={onBellClick}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {unreadAlertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unreadAlertCount > 9 ? "9+" : unreadAlertCount}
            </span>
          )}
        </button>

        {nurseName && (
          <span className="text-sm text-gray-600 hidden md:block">{nurseName}</span>
        )}

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
        >
          Sign Out
        </button>
      </div>
    </nav>
  );
}
