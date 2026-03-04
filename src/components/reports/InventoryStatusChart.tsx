"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip } from "recharts";

interface InventoryStatusChartProps {
  data: { total: number; available: number; reserved: number; sold: number; totalValue: number };
}

export function InventoryStatusChart({ data }: InventoryStatusChartProps) {
  const chartData = [
    { name: "Available", value: data.available, fill: "#22c55e" },
    { name: "Reserved", value: data.reserved, fill: "#f59e0b" },
    { name: "Sold", value: data.sold, fill: "#3b82f6" },
  ].filter((d) => d.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Inventory Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center mb-2">
          <p className="text-2xl font-bold">{data.total}</p>
          <p className="text-xs text-muted-foreground">Total Vehicles</p>
          <p className="text-sm font-medium mt-1">${(data.totalValue / 1000).toFixed(0)}k stock value</p>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius={20}
            outerRadius={60}
            data={chartData}
          >
            <RadialBar dataKey="value" cornerRadius={4} label={false} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
