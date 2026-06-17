"use client";

import { LineChart, Line, XAxis, Tooltip } from "recharts";

const data = [
  { month: "Jan", revenue: 120000 },
  { month: "Feb", revenue: 180000 },
  { month: "Mar", revenue: 220000 },
  { month: "Apr", revenue: 260000 },
  { month: "May", revenue: 310000 },
  { month: "Jun", revenue: 420000 },
];

export default function RevenueChart() {
  return (
    <div className="w-full overflow-x-auto">
      <LineChart width={900} height={300} data={data}>
        <XAxis dataKey="month" />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#2563eb"
          strokeWidth={3}
        />
      </LineChart>
    </div>
  );
}
