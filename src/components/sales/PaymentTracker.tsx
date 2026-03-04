"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Circle } from "lucide-react";
import { toast } from "sonner";
import { format, isPast } from "date-fns";

interface Payment {
  id: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  isPaid: boolean;
  note: string | null;
}

interface PaymentTrackerProps {
  saleId: string;
  payments: Payment[];
  salePrice: number;
}

export function PaymentTracker({ saleId, payments: initial, salePrice }: PaymentTrackerProps) {
  const [payments, setPayments] = useState(initial);

  const paidAmount = payments.filter((p) => p.isPaid).reduce((sum, p) => sum + p.amount, 0);
  const paidPercent = Math.round((paidAmount / salePrice) * 100);

  const toggle = async (payment: Payment) => {
    const res = await fetch(`/api/sales/${saleId}/payments`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId: payment.id, isPaid: !payment.isPaid }),
    });

    if (res.ok) {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === payment.id
            ? { ...p, isPaid: !p.isPaid, paidDate: !p.isPaid ? new Date().toISOString() : null }
            : p
        )
      );
      toast.success(!payment.isPaid ? "Payment marked as paid" : "Payment unmarked");
    } else {
      toast.error("Failed to update payment");
    }
  };

  if (payments.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-600">Payment Progress</span>
        <span className="font-medium">{paidPercent}% paid</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${paidPercent}%` }}
        />
      </div>
      <div className="text-xs text-slate-500">
        ${paidAmount.toLocaleString()} paid of ${salePrice.toLocaleString()}
      </div>

      <div className="rounded-md border overflow-hidden mt-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8">#</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((p, i) => {
              const overdue = !p.isPaid && isPast(new Date(p.dueDate));
              return (
                <TableRow key={p.id} className={overdue ? "bg-red-50" : ""}>
                  <TableCell className="text-slate-500">{i + 1}</TableCell>
                  <TableCell className="font-medium">${p.amount.toLocaleString()}</TableCell>
                  <TableCell className={`text-sm ${overdue ? "text-red-600 font-medium" : "text-slate-600"}`}>
                    {format(new Date(p.dueDate), "MMM d, yyyy")}
                    {overdue && <span className="ml-1 text-xs">(Overdue)</span>}
                  </TableCell>
                  <TableCell>
                    {p.isPaid ? (
                      <Badge className="bg-green-100 text-green-700">Paid</Badge>
                    ) : overdue ? (
                      <Badge className="bg-red-100 text-red-700">Overdue</Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => toggle(p)}>
                      {p.isPaid ? <CheckCircle className="h-3.5 w-3.5 text-green-600" /> : <Circle className="h-3.5 w-3.5" />}
                      {p.isPaid ? "Paid" : "Mark Paid"}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
