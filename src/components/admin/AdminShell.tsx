"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AdminSidebar } from "./AdminSidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar (always visible on lg+) */}
      <aside className="hidden lg:flex flex-shrink-0">
        <AdminSidebar />
      </aside>

      {/* Mobile drawer + backdrop */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-200 ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
        <div
          className={`absolute left-0 top-0 bottom-0 transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <AdminSidebar />
        </div>
      </div>

      {/* Main column */}
      <main className="flex-1 min-w-0 bg-background flex flex-col overflow-x-hidden">
        {/* Mobile top bar (visible on < lg) */}
        <header className="lg:hidden sticky top-0 z-30 glass border-b border-gray-100">
          <div className="px-4 py-2.5 flex items-center justify-between">
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 tap-scale shadow-sm"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div className="flex items-center gap-2">
              <div
                className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm ring-1 ring-black/5"
                style={{ background: "linear-gradient(135deg, #1D9E75, #0E5A42)" }}
              >
                <Image
                  src="/logo.png"
                  alt="NutriScan Clinical"
                  fill
                  priority
                  sizes="32px"
                  className="object-cover"
                  style={{ objectPosition: "50% 38%", transform: "scale(1.55)" }}
                />
              </div>
              <span className="font-bold text-gray-900 text-[13px] tracking-tight">NutriScan</span>
            </div>

            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-bold text-purple-700 bg-purple-50 ring-1 ring-inset ring-purple-100">
              Admin
            </span>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
