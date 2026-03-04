import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year + 1}-01-01`);

  const [sales, vehicles, customers] = await Promise.all([
    prisma.sale.findMany({
      where: { saleDate: { gte: startDate, lt: endDate } },
      include: {
        vehicle: { select: { brand: true, fuelType: true, purchasePrice: true } },
        salesRep: { select: { id: true, name: true } },
      },
      orderBy: { saleDate: "asc" },
    }),
    prisma.vehicle.findMany({
      select: { brand: true, status: true, purchasePrice: true, salePrice: true, fuelType: true },
    }),
    prisma.customer.findMany({
      select: { id: true, city: true, createdAt: true },
      where: { createdAt: { gte: startDate, lt: endDate } },
    }),
  ]);

  // Monthly revenue & profit
  const monthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: new Date(year, i).toLocaleString("en", { month: "short" }),
    revenue: 0,
    profit: 0,
    sales: 0,
    commission: 0,
  }));
  for (const sale of sales) {
    const m = new Date(sale.saleDate).getMonth();
    monthlyData[m].revenue += sale.salePrice;
    monthlyData[m].profit += sale.salePrice - sale.vehicle.purchasePrice;
    monthlyData[m].sales += 1;
    monthlyData[m].commission += sale.commissionAmount;
  }

  // Sales by brand
  const brandMap: Record<string, { revenue: number; count: number }> = {};
  for (const sale of sales) {
    const b = sale.vehicle.brand;
    if (!brandMap[b]) brandMap[b] = { revenue: 0, count: 0 };
    brandMap[b].revenue += sale.salePrice;
    brandMap[b].count += 1;
  }
  const salesByBrand = Object.entries(brandMap)
    .map(([brand, v]) => ({ brand, ...v }))
    .sort((a, b) => b.revenue - a.revenue);

  // Sales by fuel type
  const fuelMap: Record<string, number> = {};
  for (const v of vehicles) {
    fuelMap[v.fuelType] = (fuelMap[v.fuelType] || 0) + 1;
  }
  const salesByFuelType = Object.entries(fuelMap).map(([type, count]) => ({ type, count }));

  // Sales by payment method
  const pmMap: Record<string, number> = {};
  for (const sale of sales) {
    pmMap[sale.paymentMethod] = (pmMap[sale.paymentMethod] || 0) + 1;
  }
  const salesByPaymentMethod = Object.entries(pmMap).map(([method, count]) => ({ method, count }));

  // Sales rep performance
  const repMap: Record<string, { name: string; sales: number; revenue: number; commission: number }> = {};
  for (const sale of sales) {
    const rid = sale.salesRep.id;
    if (!repMap[rid]) repMap[rid] = { name: sale.salesRep.name, sales: 0, revenue: 0, commission: 0 };
    repMap[rid].sales += 1;
    repMap[rid].revenue += sale.salePrice;
    repMap[rid].commission += sale.commissionAmount;
  }
  const repPerformance = Object.values(repMap).sort((a, b) => b.revenue - a.revenue);

  // Inventory stats
  const inventoryStats = {
    total: vehicles.length,
    available: vehicles.filter((v) => v.status === "AVAILABLE").length,
    reserved: vehicles.filter((v) => v.status === "RESERVED").length,
    sold: vehicles.filter((v) => v.status === "SOLD").length,
    totalValue: vehicles.filter((v) => v.status !== "SOLD").reduce((s, v) => s + v.salePrice, 0),
  };

  // Customers by city
  const cityMap: Record<string, number> = {};
  for (const c of customers) {
    const city = c.city || "Unknown";
    cityMap[city] = (cityMap[city] || 0) + 1;
  }
  const customersByCity = Object.entries(cityMap)
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  // Summary KPIs
  const totalRevenue = sales.reduce((s, sale) => s + sale.salePrice, 0);
  const totalProfit = sales.reduce((s, sale) => s + (sale.salePrice - sale.vehicle.purchasePrice), 0);
  const totalCommission = sales.reduce((s, sale) => s + sale.commissionAmount, 0);

  return NextResponse.json({
    year,
    summary: {
      totalRevenue,
      totalProfit,
      totalCommission,
      totalSales: sales.length,
      newCustomers: customers.length,
      avgSalePrice: sales.length ? totalRevenue / sales.length : 0,
    },
    monthlyData,
    salesByBrand,
    salesByFuelType,
    salesByPaymentMethod,
    repPerformance,
    inventoryStats,
    customersByCity,
  });
}
