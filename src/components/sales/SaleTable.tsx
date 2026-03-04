"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, Trash2, ShoppingCart } from "lucide-react";
import Link from "next/link";

const statusConfig = {
  PENDING: { label: "Pending", className: "bg-yellow-100 text-yellow-700" },
  PARTIAL: { label: "Partial", className: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
};

const methodLabels: Record<string, string> = {
  CASH: "Cash", CREDIT_CARD: "Credit Card", BANK_TRANSFER: "Bank Transfer",
  LOAN: "Loan", INSTALLMENT: "Installment",
};

interface SaleRow {
  id: string;
  salePrice: number;
  paymentStatus: string;
  paymentMethod: string;
  saleDate: string;
  vehicle: { brand: string; model: string; year: number; plateNumber: string | null };
  customer: { firstName: string; lastName: string };
  salesRep: { name: string };
}

interface SaleTableProps {
  sales: SaleRow[];
  isAdmin: boolean;
  onDelete: (sale: SaleRow) => void;
}

export function SaleTable({ sales, isAdmin, onDelete }: SaleTableProps) {
  if (sales.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <ShoppingCart className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">No sales found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Customer</TableHead>
            {isAdmin && <TableHead>Sales Rep</TableHead>}
            <TableHead>Price</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sales.map((s) => {
            const status = statusConfig[s.paymentStatus as keyof typeof statusConfig];
            return (
              <TableRow key={s.id}>
                <TableCell>
                  <p className="font-medium text-slate-900">{s.vehicle.year} {s.vehicle.brand} {s.vehicle.model}</p>
                  {s.vehicle.plateNumber && <p className="text-xs text-slate-500">{s.vehicle.plateNumber}</p>}
                </TableCell>
                <TableCell>{s.customer.firstName} {s.customer.lastName}</TableCell>
                {isAdmin && <TableCell className="text-slate-600">{s.salesRep.name}</TableCell>}
                <TableCell className="font-medium">${s.salePrice.toLocaleString()}</TableCell>
                <TableCell className="text-slate-600 text-sm">{methodLabels[s.paymentMethod]}</TableCell>
                <TableCell><Badge className={status.className}>{status.label}</Badge></TableCell>
                <TableCell className="text-slate-500 text-sm">{new Date(s.saleDate).toLocaleDateString("en-US")}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/dashboard/sales/${s.id}`}><Eye className="h-4 w-4" /></Link>
                    </Button>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDelete(s)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
