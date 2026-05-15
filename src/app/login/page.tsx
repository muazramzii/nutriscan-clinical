"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const DEMO_ACCOUNTS = [
  {
    role: "Nurse",
    email: "nurse@nutriscan.my",
    password: "nurse123",
    chipClass: "bg-primary-50 text-primary-700 ring-primary-100",
  },
  {
    role: "Dietitian",
    email: "dietitian@nutriscan.my",
    password: "dietitian123",
    chipClass: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  {
    role: "Admin",
    email: "admin@nutriscan.my",
    password: "admin123",
    chipClass: "bg-purple-50 text-purple-700 ring-purple-100",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    const res = await fetch("/api/auth/session");
    const session = await res.json();
    const role = session?.user?.role;

    if (role === "NURSE") router.push("/nurse");
    else if (role === "DIETITIAN") router.push("/dietitian");
    else if (role === "ADMIN") router.push("/admin");
    else router.push("/login");
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        background:
          "linear-gradient(135deg, #f0faf6 0%, #e8f7f2 50%, #f8fafb 100%)",
      }}
    >
      <div className="w-full max-w-sm animate-fade-in">
        {/* ───── Decorative Header Card ───── */}
        <div className="relative bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden mb-5">
          {/* Soft gradient band */}
          <div
            className="absolute top-0 inset-x-0 h-32"
            style={{
              background:
                "linear-gradient(180deg, rgba(29,158,117,0.08) 0%, transparent 100%)",
            }}
          />
          {/* Decorative blobs */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-primary-50 opacity-50 blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-primary-100/40 blur-2xl" />

          <div className="relative px-6 pt-7 pb-6 text-center">
            {/* Logo */}
            <div
              className="relative mx-auto w-32 h-32 rounded-3xl overflow-hidden shadow-xl ring-2 ring-white"
              style={{
                background: "linear-gradient(135deg, #1D9E75, #0E5A42)",
              }}
            >
              <Image
                src="/logo.png"
                alt="NutriScan Clinical"
                fill
                priority
                sizes="128px"
                className="object-cover"
                style={{
                  objectPosition: "50% 38%",
                  transform: "scale(1.55)",
                }}
              />
            </div>

            {/* Tagline pill */}
            <div className="mt-5 inline-flex items-center px-3.5 py-1.5 rounded-full bg-primary-50 ring-1 ring-inset ring-primary-100">
              <p className="text-xs font-semibold text-primary-700 tracking-tight">
                Hospital Diet Monitoring System
              </p>
            </div>
          </div>
        </div>

        {/* ───── Login Card ───── */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-card overflow-hidden">
          {/* Gradient accent */}
          <div
            className="h-1 w-full"
            style={{
              background: "linear-gradient(90deg, #1D9E75, #116048)",
            }}
          />

          <div className="p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-5">
              Sign in to your account
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="you@nutriscan.my"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </span>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 bg-gray-50/60 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-danger bg-danger-50 border border-danger-100 px-3.5 py-2.5 rounded-xl animate-fade-in">
                  <svg
                    className="w-4 h-4 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-white text-sm font-bold rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-glow"
                style={{
                  background: loading
                    ? "#1D9E75"
                    : "linear-gradient(135deg, #1D9E75, #178060)",
                }}
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ───── Demo Accounts Card (separate, distinct) ───── */}
        <div className="mt-5 bg-gray-50/70 backdrop-blur-sm rounded-3xl border border-gray-200/70 overflow-hidden">
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white ring-1 ring-gray-200 flex items-center justify-center">
                <svg
                  className="w-3.5 h-3.5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-2xs font-bold text-gray-700 uppercase tracking-widest">
                Demo Accounts
              </p>
            </div>
          </div>

          {/* Column header */}
          <div className="grid grid-cols-[80px,minmax(0,1fr),110px] gap-2 px-5 py-2 bg-white/60 border-y border-gray-200/60">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Role
            </p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Email
            </p>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              Password
            </p>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-200/60">
            {DEMO_ACCOUNTS.map((acc) => (
              <div
                key={acc.role}
                className="grid grid-cols-[80px,minmax(0,1fr),110px] gap-2 px-5 py-2.5 items-center"
              >
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight ring-1 ring-inset ${acc.chipClass}`}
                >
                  {acc.role}
                </span>
                <span className="text-xs text-gray-700 font-medium truncate">
                  {acc.email}
                </span>
                <span className="text-xs text-gray-500 font-mono tabular-nums">
                  {acc.password}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-center text-2xs text-gray-400 mt-6 tracking-wider">
          © 2026 NutriScan Clinical · v1.0
        </p>
      </div>
    </div>
  );
}
