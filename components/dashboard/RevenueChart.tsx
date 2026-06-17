"use client";

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";

interface RevenueChartProps {
  invoices: any[];
}

export default function RevenueChart({
  invoices,
}: RevenueChartProps) {
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(2026, i).toLocaleString("en-US", {
      month: "short",
    }),
    revenue: 0,
  }));

  invoices.forEach((invoice) => {
    const date = new Date(invoice.invoiceDate || invoice.createdAt);

    const monthIndex = date.getMonth();

    monthlyRevenue[monthIndex].revenue +=
      Number(invoice.grandTotal || 0);
  });

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={monthlyRevenue}>
          <XAxis dataKey="month" />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#2563eb"
            strokeWidth={3}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}