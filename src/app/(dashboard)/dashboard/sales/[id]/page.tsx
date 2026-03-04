import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Car, User, CreditCard } from "lucide-react";
import Link from "next/link";
import { PaymentTracker } from "@/components/sales/PaymentTracker";
import { format } from "date-fns";

const statusConfig = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  PARTIAL: { label: "Partial", className: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
};

const methodLabels: Record<string, string> = {
  CASH: "Cash", CREDIT_CARD: "Credit Card", BANK_TRANSFER: "Bank Transfer",
  LOAN: "Loan", INSTALLMENT: "Installment",
};

export default async function SaleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) notFound();

  const { id } = await params;
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: {
      vehicle: true,
      customer: true,
      salesRep: { select: { id: true, name: true, email: true } },
      payments: { orderBy: { dueDate: "asc" } },
    },
  });

  if (!sale) notFound();

  const isAdmin = session.user.role === "ADMIN";
  if (!isAdmin && sale.salesRepId !== session.user.id) notFound();

  const status = statusConfig[sale.paymentStatus];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1 -ml-2 text-slate-600">
          <Link href="/dashboard/sales"><ArrowLeft className="h-4 w-4" />Back to Sales</Link>
        </Button>
        <Badge className={status.className}>{status.label}</Badge>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-slate-900">Sale Details</h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {format(new Date(sale.saleDate), "MMMM d, yyyy")} · {methodLabels[sale.paymentMethod]}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Vehicle */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5 text-slate-600">
              <Car className="h-4 w-4" />Vehicle
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="font-semibold text-slate-900">{sale.vehicle.year} {sale.vehicle.brand} {sale.vehicle.model}</p>
            <p className="text-slate-500">{sale.vehicle.color} · {sale.vehicle.fuelType}</p>
            {sale.vehicle.plateNumber && <p className="text-slate-500">{sale.vehicle.plateNumber}</p>}
            {sale.vehicle.vin && <p className="text-slate-400 text-xs font-mono">{sale.vehicle.vin}</p>}
          </CardContent>
        </Card>

        {/* Customer */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5 text-slate-600">
              <User className="h-4 w-4" />Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p className="font-semibold text-slate-900">{sale.customer.firstName} {sale.customer.lastName}</p>
            <p className="text-slate-500">{sale.customer.phone}</p>
            {sale.customer.email && <p className="text-slate-500">{sale.customer.email}</p>}
            {sale.customer.city && <p className="text-slate-400">{sale.customer.city}</p>}
          </CardContent>
        </Card>

        {/* Financial */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5 text-slate-600">
              <CreditCard className="h-4 w-4" />Financial
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Sale Price</span>
              <span className="font-bold text-slate-900">${sale.salePrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Down Payment</span>
              <span>${sale.downPayment.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Remaining</span>
              <span>${sale.remainingAmount.toLocaleString()}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-slate-500">Commission</span>
              <span className="text-green-600 font-medium">${sale.commissionAmount.toLocaleString()}</span>
            </div>
            {isAdmin && (
              <div className="flex justify-between">
                <span className="text-slate-500">Sales Rep</span>
                <span>{sale.salesRep.name}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payments */}
      {sale.payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentTracker
              saleId={sale.id}
              payments={sale.payments.map((p) => ({ ...p, dueDate: p.dueDate.toISOString(), paidDate: p.paidDate?.toISOString() || null }))}
              salePrice={sale.salePrice}
            />
          </CardContent>
        </Card>
      )}

      {sale.notes && (
        <Card>
          <CardHeader><CardTitle className="text-sm text-slate-600">Notes</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-slate-600">{sale.notes}</p></CardContent>
        </Card>
      )}
    </div>
  );
}
