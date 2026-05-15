"use client";

import Image from "next/image";
import { signOut } from "next-auth/react";

interface Props {
  nurseName?: string;
  unreadAlertCount: number;
  onBellClick: () => void;
}

export function DietitianNavbar({ nurseName, unreadAlertCount, onBellClick }: Props) {
  return (
    <nav className="sticky top-0 z-30 glass border-b border-gray-100">
      <div className="px-6 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="relative w-10 h-10 rounded-2xl overflow-hidden shadow-sm ring-1 ring-black/5"
            style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
          >
            <Image
              src="/logo.png"
              alt="NutriScan Clinical"
              fill
              priority
              sizes="40px"
              className="object-cover"
              style={{ objectPosition: "50% 38%", transform: "scale(1.55)" }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 tracking-tight">NutriScan Clinical</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold text-primary-700 bg-primary-50 ring-1 ring-inset ring-primary-100 tracking-tight">
                Dietitian
              </span>
            </div>
            <p className="text-2xs text-gray-500 -mt-0.5">Clinical Diet System</p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Notification bell */}
          <button
            onClick={onBellClick}
            className="relative w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50 tap-scale shadow-sm transition-all"
            aria-label="Alerts"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-danger text-white text-2xs rounded-full flex items-center justify-center font-bold ring-2 ring-white animate-fade-in">
                {unreadAlertCount > 9 ? "9+" : unreadAlertCount}
              </span>
            )}
          </button>

          {nurseName && (
            <div className="hidden md:flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-xl bg-white border border-gray-200">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
              >
                {nurseName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-semibold text-gray-700">{nurseName}</span>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl hover:border-gray-300 hover:text-gray-900 hover:bg-gray-50 tap-scale shadow-sm transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </div>
    </nav>
  );
}
