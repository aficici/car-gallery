"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#0ea5e9", "#f59e0b", "#8b5cf6", "#22c55e", "#ef4444"];

const labels: Record<string, string> = {
  CASH: "Cash",
  CREDIT_CARD: "Credit Card",
  BANK_TRANSFER: "Bank Transfer",
  LOAN: "Loan",
  INSTALLMENT: "Installment",
};

interface PaymentMethodChartProps {
  data: { method: string; count: number }[];
}

export function PaymentMethodChart({ data }: PaymentMethodChartProps) {
  const formatted = data.map((d) => ({ ...d, method: labels[d.method] || d.method }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Sales by Payment Method</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-16">No sales data.</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={formatted}
                dataKey="count"
                nameKey="method"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={75}
                labelLine={false}
              >
                {formatted.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
