"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ContactTimeline } from "./ContactTimeline";
import { CustomerFormDialog } from "./CustomerFormDialog";
import { format } from "date-fns";
import {
  Phone,
  Mail,
  MapPin,
  User,
  Briefcase,
  Calendar,
  CreditCard,
  Car,
  TrendingUp,
  Edit,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const paymentStatusConfig = {
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  PARTIAL: { label: "Partial", color: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "Completed", color: "bg-green-100 text-green-700" },
};

type PaymentStatus = keyof typeof paymentStatusConfig;

interface Sale {
  id: string;
  salePrice: number;
  saleDate: string;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  vehicle: { brand: string; model: string; year: number; color: string };
  salesRep: { name: string };
}

interface ContactNote {
  id: string;
  type: "NOTE" | "CALL" | "EMAIL" | "MEETING" | "FOLLOW_UP";
  content: string;
  createdAt: string;
  user: { name: string; role: string };
}

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  address: string | null;
  city: string | null;
  occupation: string | null;
  idNumber: string | null;
  birthDate: string | null;
  notes: string | null;
  createdAt: string;
  sales: Sale[];
  contactNotes: ContactNote[];
}

interface Props {
  customer: Customer;
  currentUserId: string;
  currentUserRole: string;
  isAdmin: boolean;
}

export function CustomerDetailClient({ customer, currentUserId, currentUserRole, isAdmin }: Props) {
  const [showEdit, setShowEdit] = useState(false);
  const router = useRouter();

  const totalSpent = customer.sales.reduce((sum, s) => sum + s.salePrice, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/customers">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{customer.firstName} {customer.lastName}</h1>
          <p className="text-muted-foreground text-sm">
            Customer since {format(new Date(customer.createdAt), "MMMM yyyy")}
          </p>
        </div>
        <Button variant="outline" onClick={() => setShowEdit(true)}>
          <Edit className="h-4 w-4 mr-2" /> Edit
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100">
                <Car className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customer.sales.length}</p>
                <p className="text-xs text-muted-foreground">Total Purchases</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-green-100">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${totalSpent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Phone className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{customer.contactNotes.length}</p>
                <p className="text-xs text-muted-foreground">Interactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Profile */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Contact Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                <span>{customer.phone}</span>
              </div>
              {customer.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="break-all">{customer.email}</span>
                </div>
              )}
              {customer.city && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{customer.city}{customer.address ? ` — ${customer.address}` : ""}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Personal Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {customer.occupation && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{customer.occupation}</span>
                </div>
              )}
              {customer.birthDate && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span>{format(new Date(customer.birthDate), "MMMM d, yyyy")}</span>
                </div>
              )}
              {customer.idNumber && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-mono">{customer.idNumber}</span>
                </div>
              )}
              {!customer.occupation && !customer.birthDate && !customer.idNumber && (
                <p className="text-muted-foreground text-xs">No personal info added.</p>
              )}
            </CardContent>
          </Card>

          {customer.notes && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Sales + Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Purchase History ({customer.sales.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customer.sales.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No purchases yet.</p>
              ) : (
                <div className="space-y-3">
                  {customer.sales.map((sale) => {
                    const statusCfg = paymentStatusConfig[sale.paymentStatus];
                    return (
                      <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium text-sm">
                            {sale.vehicle.year} {sale.vehicle.brand} {sale.vehicle.model}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {sale.vehicle.color} · {format(new Date(sale.saleDate), "MMM d, yyyy")} · by {sale.salesRep.name}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">${sale.salePrice.toLocaleString()}</p>
                          <Badge variant="outline" className={`text-xs ${statusCfg.color} border-0 mt-0.5`}>
                            {statusCfg.label}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <ContactTimeline
                customerId={customer.id}
                initialNotes={customer.contactNotes}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      <CustomerFormDialog
        open={showEdit}
        onClose={() => setShowEdit(false)}
        editId={customer.id}
        defaultValues={{
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email || undefined,
          phone: customer.phone,
          city: customer.city || undefined,
          address: customer.address || undefined,
          occupation: customer.occupation || undefined,
          idNumber: customer.idNumber || undefined,
          birthDate: customer.birthDate ? customer.birthDate.split("T")[0] : undefined,
          notes: customer.notes || undefined,
        }}
        onCreated={() => { setShowEdit(false); router.refresh(); }}
      />
    </div>
  );
}
