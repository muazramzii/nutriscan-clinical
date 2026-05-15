interface Props {
  patientCount: number;
  loggedMeals: number;
  totalMeals: number;
  activeAlerts: number;
  highPriorityCount: number;
}

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  iconBg: string;
  icon: React.ReactNode;
  tone?: "neutral" | "danger";
}

function StatCard({ label, value, hint, iconBg, icon, tone = "neutral" }: StatCardProps) {
  const danger = tone === "danger";
  return (
    <div
      className={`relative overflow-hidden bg-white rounded-2xl border p-5 shadow-card hover:shadow-card-hover transition-all ${
        danger ? "border-danger-100 ring-1 ring-danger-100" : "border-gray-100"
      }`}
    >
      <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-gray-50 blur-2xl opacity-50" />
      <div className="relative flex items-start justify-between mb-3">
        <p
          className={`text-2xs font-bold uppercase tracking-widest ${
            danger ? "text-danger-600" : "text-gray-500"
          }`}
        >
          {label}
        </p>
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ring-1 ring-inset ${iconBg}`}
        >
          {icon}
        </div>
      </div>
      <div className={`relative text-3xl font-black tracking-tight tabular-nums ${danger ? "text-danger-600" : "text-gray-900"}`}>
        {value}
      </div>
      {hint && (
        <p className="relative text-xs text-gray-500 mt-1 font-medium">{hint}</p>
      )}
    </div>
  );
}

export function StatsCards({
  patientCount,
  loggedMeals,
  totalMeals,
  activeAlerts,
  highPriorityCount,
}: Props) {
  const pct = totalMeals === 0 ? 0 : Math.round((loggedMeals / totalMeals) * 100);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Patients"
        value={patientCount}
        hint="Active in your wards"
        iconBg="bg-primary-50 ring-primary-100"
        icon={
          <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        }
      />

      <StatCard
        label="High Priority"
        value={
          <span className="inline-flex items-center gap-2">
            {highPriorityCount}
            {highPriorityCount > 0 && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-danger" />
              </span>
            )}
          </span>
        }
        hint={highPriorityCount > 0 ? "Needs review" : "No urgent cases"}
        tone={highPriorityCount > 0 ? "danger" : "neutral"}
        iconBg={
          highPriorityCount > 0
            ? "bg-danger-50 ring-danger-100"
            : "bg-gray-50 ring-gray-200"
        }
        icon={
          <svg
            className={`w-4 h-4 ${highPriorityCount > 0 ? "text-danger-600" : "text-gray-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />

      <StatCard
        label="Meals Today"
        value={
          <>
            {loggedMeals}
            <span className="text-base font-bold text-gray-400 ml-1">/ {totalMeals}</span>
          </>
        }
        hint={`${pct}% of scheduled meals`}
        iconBg="bg-blue-50 ring-blue-100"
        icon={
          <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        }
      />

      <StatCard
        label="Active Alerts"
        value={activeAlerts}
        hint={activeAlerts > 0 ? "Requires attention" : "All clear"}
        tone={activeAlerts > 0 ? "danger" : "neutral"}
        iconBg={
          activeAlerts > 0
            ? "bg-danger-50 ring-danger-100"
            : "bg-gray-50 ring-gray-200"
        }
        icon={
          <svg
            className={`w-4 h-4 ${activeAlerts > 0 ? "text-danger-600" : "text-gray-400"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        }
      />
    </div>
  );
}
