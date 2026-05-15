interface Props {
  patientCount: number;
  loggedMeals: number;
  totalMeals: number;
  activeAlerts: number;
  highPriorityCount: number;
}

export function StatsCards({ 
  patientCount, 
  loggedMeals, 
  totalMeals, 
  activeAlerts,
  highPriorityCount
}: Props) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Patients</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{patientCount}</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">High Priority</p>
        <div className="flex items-center gap-2 mt-1">
          <p className={`text-2xl font-bold ${highPriorityCount > 0 ? "text-danger" : "text-gray-900"}`}>
            {highPriorityCount}
          </p>
          {highPriorityCount > 0 && (
            <span className="flex h-2 w-2 rounded-full bg-danger animate-ping" />
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Meal Progress</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">
          {Math.round((loggedMeals / totalMeals) * 100)}%
          <span className="text-sm text-gray-400 font-normal ml-2">({loggedMeals}/{totalMeals})</span>
        </p>
      </div>

      <div className={`bg-white rounded-xl border p-4 ${activeAlerts > 0 ? "border-danger-100 bg-danger-50" : "border-gray-200"}`}>
        <p className={`text-xs font-medium uppercase tracking-wider ${activeAlerts > 0 ? "text-danger" : "text-gray-500"}`}>
          Active Alerts
        </p>
        <p className={`text-2xl font-bold mt-1 ${activeAlerts > 0 ? "text-danger" : "text-gray-900"}`}>
          {activeAlerts}
        </p>
      </div>
    </div>
  );
}
