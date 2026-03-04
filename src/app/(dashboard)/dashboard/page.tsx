import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Car, ShoppingCart, Users, TrendingUp, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalVehicles, availableVehicles, reservedVehicles, soldVehicles, monthlySales, totalCustomers] =
    await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
      prisma.vehicle.count({ where: { status: "RESERVED" } }),
      prisma.vehicle.count({ where: { status: "SOLD" } }),
      prisma.sale.count({ where: { saleDate: { gte: monthStart } } }),
      prisma.customer.count(),
    ]);

  const mySalesCount = isAdmin
    ? null
    : await prisma.sale.count({ where: { salesRepId: session!.user.id, saleDate: { gte: monthStart } } });

  const recentSales = await prisma.sale.findMany({
    orderBy: { saleDate: "desc" },
    take: 5,
    include: {
      vehicle: { select: { brand: true, model: true, year: true } },
      customer: { select: { firstName: true, lastName: true } },
    },
  });

  const paymentStatusConfig = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PARTIAL: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-green-100 text-green-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {session?.user?.name} 👋</h1>
        <p className="text-slate-500 mt-1">
          {now.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isAdmin ? (
          <>
            <StatsCard title="Total Vehicles" value={String(totalVehicles)} description="in inventory" icon={Car} trend="neutral" />
            <StatsCard title="Available" value={String(availableVehicles)} description="ready for sale" icon={CheckCircle} trend="up" />
            <StatsCard title="Sales This Month" value={String(monthlySales)} description="completed" icon={ShoppingCart} trend="up" />
            <StatsCard title="Customers" value={String(totalCustomers)} description="total" icon={Users} trend="neutral" />
          </>
        ) : (
          <>
            <StatsCard title="My Sales" value={String(mySalesCount ?? 0)} description="this month" icon={ShoppingCart} trend="neutral" />
            <StatsCard title="Reserved" value={String(reservedVehicles)} description="pending" icon={Clock} trend="neutral" />
            <StatsCard title="Sold" value={String(soldVehicles)} description="total" icon={TrendingUp} trend="up" />
            <StatsCard title="Available" value={String(availableVehicles)} description="ready for sale" icon={Car} trend="neutral" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Sales</CardTitle>
            <CardDescription>Latest sale transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {recentSales.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <ShoppingCart className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm">No sales yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSales.map((s) => {
                  const statusKey = s.paymentStatus as keyof typeof paymentStatusConfig;
                  return (
                    <Link key={s.id} href={`/dashboard/sales/${s.id}`} className="flex items-center justify-between text-sm hover:bg-slate-50 rounded p-1 -mx-1">
                      <div>
                        <p className="font-medium text-slate-900">{s.vehicle.year} {s.vehicle.brand} {s.vehicle.model}</p>
                        <p className="text-xs text-slate-500">{s.customer.firstName} {s.customer.lastName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${s.salePrice.toLocaleString()}</p>
                        <Badge className={`text-xs ${paymentStatusConfig[statusKey]}`}>
                          {s.paymentStatus.charAt(0) + s.paymentStatus.slice(1).toLowerCase()}
                        </Badge>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">System Status</CardTitle>
            <CardDescription>Feature availability by phase</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Authentication</span>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">✓ Ready</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Vehicle Inventory</span>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">✓ Ready</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Sales System</span>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">✓ Ready</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Customer CRM</span>
              <Badge variant="secondary">Phase 4</Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Reports</span>
              <Badge variant="secondary">Phase 5</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
