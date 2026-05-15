"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  data: { date: string; kcal: number }[];
  kcalTarget: number;
}

export function IntakeChart({ data, kcalTarget }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">
        Pengambilan 7 Hari / 7-Day Intake
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
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
            formatter={(value) => [`${value} kcal`, "Pengambilan"]}
            contentStyle={{
              borderRadius: "8px",
              border: "1px solid #E5E7EB",
              fontSize: "12px",
            }}
          />
          <Legend
            formatter={() => "Kcal Actual"}
            wrapperStyle={{ fontSize: "12px" }}
          />
          <ReferenceLine
            y={kcalTarget}
            stroke="#9CA3AF"
            strokeDasharray="4 2"
            label={{
              value: `Target ${kcalTarget}`,
              position: "insideTopRight",
              fontSize: 10,
              fill: "#9CA3AF",
            }}
          />
          <Bar dataKey="kcal" fill="#1D9E75" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
