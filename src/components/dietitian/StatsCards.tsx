interface Props {
  patientCount: number;
  loggedMeals: number;
  totalMeals: number;
  activeAlerts: number;
}

export function StatsCards({ patientCount, loggedMeals, totalMeals, activeAlerts }: Props) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 font-medium">Patients Monitored</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{patientCount}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 font-medium">Meals Logged Today</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {loggedMeals}
          <span className="text-sm text-gray-400 font-normal"> / {totalMeals}</span>
        </p>
      </div>

      <div className={`bg-white rounded-xl border p-4 ${activeAlerts > 0 ? "border-danger-100 bg-danger-50" : "border-gray-200"}`}>
        <p className={`text-xs font-medium ${activeAlerts > 0 ? "text-danger" : "text-gray-500"}`}>
          Active Alerts
        </p>
        <p className={`text-2xl font-bold mt-1 ${activeAlerts > 0 ? "text-danger" : "text-gray-900"}`}>
          {activeAlerts}
        </p>
      </div>
    </div>
  );
}
