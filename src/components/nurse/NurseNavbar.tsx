"use client";

import { useSession, signOut } from "next-auth/react";

export function NurseNavbar() {
  const { data: session } = useSession();

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
          <span className="ml-2 text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Nurse</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {session?.user?.ward && (
          <span className="text-xs bg-primary-50 text-primary border border-primary-100 px-3 py-1.5 rounded-lg font-medium">
            Ward {session.user.ward}
          </span>
        )}
        {session?.user?.name && (
          <span className="text-sm text-gray-600 hidden md:block">{session.user.name}</span>
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
