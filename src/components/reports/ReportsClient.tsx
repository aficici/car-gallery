"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "./KpiCard";
import { RevenueChart } from "./RevenueChart";
import { BrandChart } from "./BrandChart";
import { FuelTypeChart } from "./FuelTypeChart";
import { PaymentMethodChart } from "./PaymentMethodChart";
import { RepPerformanceTable } from "./RepPerformanceTable";
import { InventoryStatusChart } from "./InventoryStatusChart";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Download,
  BarChart3,
} from "lucide-react";

interface ReportData {
  year: number;
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalCommission: number;
    totalSales: number;
    newCustomers: number;
    avgSalePrice: number;
  };
  monthlyData: { month: string; revenue: number; profit: number; sales: number; commission: number }[];
  salesByBrand: { brand: string; revenue: number; count: number }[];
  salesByFuelType: { type: string; count: number }[];
  salesByPaymentMethod: { method: string; count: number }[];
  repPerformance: { name: string; sales: number; revenue: number; commission: number }[];
  inventoryStats: { total: number; available: number; reserved: number; sold: number; totalValue: number };
  customersByCity: { city: string; count: number }[];
}

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export function ReportsClient() {
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/reports?year=${year}`)
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); });
  }, [year]);

  const handleExport = async (type: "sales" | "vehicles" | "customers" | "all") => {
    setExporting(true);
    const res = await fetch(`/api/reports/export?year=${year}&type=${type}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `car-gallery-${type}-${year}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-muted-foreground">Business performance overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExport("sales")} disabled={exporting}>
              <Download className="h-4 w-4 mr-1" /> Sales
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("vehicles")} disabled={exporting}>
              <Download className="h-4 w-4 mr-1" /> Inventory
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport("customers")} disabled={exporting}>
              <Download className="h-4 w-4 mr-1" /> Customers
            </Button>
            <Button size="sm" onClick={() => handleExport("all")} disabled={exporting}>
              <Download className="h-4 w-4 mr-1" /> Export All
            </Button>
          </div>
        </div>
      </div>

      {loading || !data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-28 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard
              title="Total Revenue"
              value={`$${(data.summary.totalRevenue / 1000).toFixed(0)}k`}
              icon={<DollarSign className="h-4 w-4" />}
              color="blue"
            />
            <KpiCard
              title="Total Profit"
              value={`$${(data.summary.totalProfit / 1000).toFixed(0)}k`}
              icon={<TrendingUp className="h-4 w-4" />}
              color="green"
            />
            <KpiCard
              title="Total Sales"
              value={String(data.summary.totalSales)}
              icon={<ShoppingCart className="h-4 w-4" />}
              color="purple"
            />
            <KpiCard
              title="Avg Sale Price"
              value={`$${(data.summary.avgSalePrice / 1000).toFixed(0)}k`}
              icon={<BarChart3 className="h-4 w-4" />}
              color="orange"
            />
            <KpiCard
              title="Commissions"
              value={`$${(data.summary.totalCommission / 1000).toFixed(1)}k`}
              icon={<DollarSign className="h-4 w-4" />}
              color="yellow"
            />
            <KpiCard
              title="New Customers"
              value={String(data.summary.newCustomers)}
              icon={<Users className="h-4 w-4" />}
              color="pink"
            />
          </div>

          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RevenueChart data={data.monthlyData} />
            <BrandChart data={data.salesByBrand} />
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FuelTypeChart data={data.salesByFuelType} />
            <PaymentMethodChart data={data.salesByPaymentMethod} />
            <InventoryStatusChart data={data.inventoryStats} />
          </div>

          {/* Rep performance + customers by city */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RepPerformanceTable data={data.repPerformance} />
            <Card>
              <CardHeader>
                <CardTitle className="text-base">New Customers by City ({year})</CardTitle>
              </CardHeader>
              <CardContent>
                {data.customersByCity.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No data for {year}.</p>
                ) : (
                  <div className="space-y-2">
                    {data.customersByCity.map((c) => {
                      const max = data.customersByCity[0].count;
                      return (
                        <div key={c.city} className="flex items-center gap-3">
                          <span className="text-sm w-28 shrink-0">{c.city}</span>
                          <div className="flex-1 bg-muted rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(c.count / max) * 100}%` }}
                            />
                          </div>
                          <Badge variant="secondary" className="text-xs w-8 text-center">{c.count}</Badge>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
