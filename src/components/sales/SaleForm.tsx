"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { saleSchema, SaleInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CustomerFormDialog } from "@/components/customers/CustomerFormDialog";
import { Search, Plus, Car, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface VehicleOption { id: string; brand: string; model: string; year: number; salePrice: number; plateNumber: string | null }
interface CustomerOption { id: string; firstName: string; lastName: string; phone: string }

export function SaleForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [vehicleSearch, setVehicleSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleOption | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerOption | null>(null);
  const [showNewCustomer, setShowNewCustomer] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm<SaleInput>({
    resolver: zodResolver(saleSchema),
    defaultValues: { commissionRate: 0.02, downPayment: 0, saleDate: new Date().toISOString().split("T")[0] },
  });

  const salePrice = watch("salePrice") || 0;
  const downPayment = watch("downPayment") || 0;
  const commissionRate = watch("commissionRate") || 0.02;
  const paymentMethod = watch("paymentMethod");
  const installments = watch("installments");
  const remaining = salePrice - downPayment;

  useEffect(() => {
    fetch("/api/vehicles?status=AVAILABLE&limit=100")
      .then((r) => r.json())
      .then((d) => setVehicles(d.data || []));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      fetch(`/api/customers?search=${customerSearch}&limit=20`)
        .then((r) => r.json())
        .then((d) => setCustomers(d.data || []));
    }, 300);
    return () => clearTimeout(t);
  }, [customerSearch]);

  const filteredVehicles = vehicles.filter((v) =>
    `${v.brand} ${v.model} ${v.year} ${v.plateNumber}`.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const onSubmit = async (data: SaleInput) => {
    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const sale = await res.json();
      toast.success("Sale created successfully");
      router.push(`/dashboard/sales/${sale.id}`);
      router.refresh();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to create sale");
    }
  };

  return (
    <div className="space-y-6">
      {/* Step Indicator */}
      <div className="flex items-center gap-3">
        {[1, 2].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-7 w-7 rounded-full flex items-center justify-center text-sm font-medium ${step >= s ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"}`}>{s}</div>
            <span className={`text-sm ${step === s ? "font-medium text-slate-900" : "text-slate-500"}`}>
              {s === 1 ? "Vehicle & Customer" : "Payment Details"}
            </span>
            {s < 2 && <div className="h-px w-8 bg-slate-200" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Step 1 */}
        {step === 1 && (
          <div className="space-y-6">
            {/* Vehicle Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Car className="h-4 w-4" /> Select Vehicle <span className="text-red-500">*</span></Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search available vehicles..." value={vehicleSearch} onChange={(e) => setVehicleSearch(e.target.value)} className="pl-8" />
              </div>
              <div className="border rounded-md max-h-52 overflow-y-auto divide-y">
                {filteredVehicles.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No available vehicles</p>
                ) : filteredVehicles.map((v) => (
                  <div key={v.id} onClick={() => { setSelectedVehicle(v); setValue("vehicleId", v.id); setValue("salePrice", v.salePrice); }}
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-slate-50 text-sm ${selectedVehicle?.id === v.id ? "bg-blue-50 border-l-2 border-l-blue-600" : ""}`}>
                    <span className="font-medium">{v.year} {v.brand} {v.model} {v.plateNumber && `· ${v.plateNumber}`}</span>
                    <span className="text-slate-600">${v.salePrice.toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {selectedVehicle && <Badge className="bg-blue-100 text-blue-700">Selected: {selectedVehicle.year} {selectedVehicle.brand} {selectedVehicle.model}</Badge>}
              {errors.vehicleId && <p className="text-xs text-red-500">{errors.vehicleId.message}</p>}
            </div>

            {/* Customer Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="flex items-center gap-1"><User className="h-4 w-4" /> Select Customer <span className="text-red-500">*</span></Label>
                <Button type="button" variant="outline" size="sm" className="gap-1 h-7 text-xs" onClick={() => setShowNewCustomer(true)}>
                  <Plus className="h-3 w-3" /> New Customer
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search customers..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="pl-8" />
              </div>
              <div className="border rounded-md max-h-44 overflow-y-auto divide-y">
                {customers.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">No customers found</p>
                ) : customers.map((c) => (
                  <div key={c.id} onClick={() => { setSelectedCustomer(c); setValue("customerId", c.id); }}
                    className={`flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-slate-50 text-sm ${selectedCustomer?.id === c.id ? "bg-blue-50 border-l-2 border-l-blue-600" : ""}`}>
                    <span className="font-medium">{c.firstName} {c.lastName}</span>
                    <span className="text-slate-500">{c.phone}</span>
                  </div>
                ))}
              </div>
              {selectedCustomer && <Badge className="bg-blue-100 text-blue-700">Selected: {selectedCustomer.firstName} {selectedCustomer.lastName}</Badge>}
              {errors.customerId && <p className="text-xs text-red-500">{errors.customerId.message}</p>}
            </div>

            <Button type="button" onClick={() => { if (!selectedVehicle) { toast.error("Select a vehicle"); return; } if (!selectedCustomer) { toast.error("Select a customer"); return; } setStep(2); }} className="w-full">
              Continue to Payment →
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-5">
            <div className="bg-slate-50 rounded-lg p-4 text-sm space-y-1">
              <p><span className="text-slate-500">Vehicle:</span> <span className="font-medium">{selectedVehicle?.year} {selectedVehicle?.brand} {selectedVehicle?.model}</span></p>
              <p><span className="text-slate-500">Customer:</span> <span className="font-medium">{selectedCustomer?.firstName} {selectedCustomer?.lastName}</span></p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Sale Price ($) <span className="text-red-500">*</span></Label>
                <Input type="number" {...register("salePrice", { valueAsNumber: true })} />
                {errors.salePrice && <p className="text-xs text-red-500">{errors.salePrice.message}</p>}
              </div>
              <div className="space-y-1">
                <Label>Down Payment ($)</Label>
                <Input type="number" {...register("downPayment", { valueAsNumber: true })} placeholder="0" />
              </div>
              <div className="space-y-1">
                <Label>Payment Method <span className="text-red-500">*</span></Label>
                <Select onValueChange={(v) => setValue("paymentMethod", v as SaleInput["paymentMethod"])}>
                  <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                    <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                    <SelectItem value="LOAN">Loan</SelectItem>
                    <SelectItem value="INSTALLMENT">Installment</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && <p className="text-xs text-red-500">{errors.paymentMethod.message}</p>}
              </div>
              {paymentMethod === "INSTALLMENT" && (
                <div className="space-y-1">
                  <Label>Number of Installments</Label>
                  <Input type="number" min={2} max={60} {...register("installments", { valueAsNumber: true })} placeholder="12" />
                </div>
              )}
              <div className="space-y-1">
                <Label>Commission Rate</Label>
                <Input type="number" step="0.001" {...register("commissionRate", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1">
                <Label>Sale Date <span className="text-red-500">*</span></Label>
                <Input type="date" {...register("saleDate")} />
              </div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Sale Price</span><span className="font-medium">${(salePrice || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Down Payment</span><span>${(downPayment || 0).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Remaining</span><span className="font-medium">${remaining.toLocaleString()}</span></div>
              {paymentMethod === "INSTALLMENT" && installments && installments > 1 && (
                <div className="flex justify-between"><span className="text-slate-500">Per Installment</span><span>${(remaining / installments).toFixed(0)}</span></div>
              )}
              <div className="flex justify-between border-t pt-2"><span className="text-slate-500">Commission ({((commissionRate ?? 0.02) * 100).toFixed(1)}%)</span><span className="text-green-600 font-medium">${(salePrice * (commissionRate ?? 0.02)).toLocaleString()}</span></div>
            </div>

            <div className="space-y-1">
              <Label>Notes</Label>
              <Textarea {...register("notes")} placeholder="Additional notes..." rows={2} />
            </div>

            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Creating Sale..." : "Confirm Sale"}
              </Button>
            </div>
          </div>
        )}
      </form>

      <CustomerFormDialog
        open={showNewCustomer}
        onClose={() => setShowNewCustomer(false)}
        onCreated={(c) => { setSelectedCustomer({ ...c, phone: "" }); setValue("customerId", c.id); setCustomers((prev) => [{ ...c, phone: "" }, ...prev]); }}
      />
    </div>
  );
}
