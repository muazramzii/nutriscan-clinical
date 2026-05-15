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
    protein: { label: "Protein", unit: "g", color: "#F59E0B", target: (kcalTarget * 0.2) / 4 },
    fat: { label: "Fat", unit: "g", color: "#EF4444", target: (kcalTarget * 0.25) / 9 },
  };

  const current = metricConfig[activeMetric];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-5">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center ring-1 ring-inset"
            style={{ background: `${current.color}15`, borderColor: `${current.color}30` }}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke={current.color}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm tracking-tight">7-Day Intake Trend</h3>
            <p className="text-2xs text-gray-500">Weekly {current.label.toLowerCase()} ({current.unit})</p>
          </div>
        </div>
        <div className="inline-flex bg-gray-100 p-1 rounded-xl">
          {(Object.keys(metricConfig) as Metric[]).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMetric(m)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
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
            tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: "#F3F4F6", opacity: 0.5 }}
            formatter={(value) => [`${value} ${current.unit}`, current.label]}
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #E5E7EB",
              boxShadow: "0 4px 16px -2px rgb(0 0 0 / 0.08)",
              fontSize: "12px",
              fontWeight: 500,
            }}
          />
          <ReferenceLine
            y={current.target}
            stroke="#9CA3AF"
            strokeDasharray="4 4"
            label={{
              value: "Target",
              position: "insideTopRight",
              fontSize: 10,
              fill: "#6B7280",
              fontWeight: 600,
            }}
          />
          <Bar dataKey={activeMetric} radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={
                  entry[activeMetric] >= current.target
                    ? current.color
                    : `${current.color}80`
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 flex items-center justify-center gap-6 text-2xs font-medium text-gray-500 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: current.color }} />
          <span>Actual ({current.unit})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 bg-gray-400" style={{ borderTop: "1px dashed #9CA3AF" }} />
          <span>Target</span>
        </div>
      </div>
    </div>
  );
}
