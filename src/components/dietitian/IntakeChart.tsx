"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

interface Props {
  data: { 
    date: string; 
    kcal: number;
    carbs: number;
    protein: number;
    fat: number;
  }[];
  kcalTarget: number;
}

type Metric = "kcal" | "carbs" | "protein" | "fat";

export function IntakeChart({ data, kcalTarget }: Props) {
  const [activeMetric, setActiveMetric] = useState<Metric>("kcal");

  const metricConfig = {
    kcal: { label: "Calories", unit: "kcal", color: "#1D9E75", target: kcalTarget },
    carbs: { label: "Carbs", unit: "g", color: "#3B82F6", target: (kcalTarget * 0.55) / 4 },
    protein: { label: "Protein", unit: "g", color: "#F59E0B", target: (kcalTarget * 0.20) / 4 },
    fat: { label: "Fat", unit: "g", color: "#EF4444", target: (kcalTarget * 0.25) / 9 },
  };

  const current = metricConfig[activeMetric];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-900">
          7-Day Intake Trend
        </h3>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(Object.keys(metricConfig) as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                activeMetric === m
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {metricConfig[m].label}
            </button>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6B7280" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#F3F4F6" }}
            formatter={(value) => [`${value} ${current.unit}`, current.label]}
            contentStyle={{
              borderRadius: "8px",
              border: "none",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              fontSize: "12px",
            }}
          />
          <ReferenceLine
            y={current.target}
            stroke="#9CA3AF"
            strokeDasharray="4 2"
            label={{
              value: `Target`,
              position: "insideTopRight",
              fontSize: 10,
              fill: "#9CA3AF",
            }}
          />
          <Bar dataKey={activeMetric} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry[activeMetric] >= current.target ? current.color : `${current.color}CC`} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      <div className="mt-4 flex items-center justify-center gap-6 text-[11px] text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: current.color }} />
          <span>Actual Intake ({current.unit})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-0.5 bg-gray-400 border-t border-dashed border-gray-400" />
          <span>Nutritional Target</span>
        </div>
      </div>
    </div>
  );
}
