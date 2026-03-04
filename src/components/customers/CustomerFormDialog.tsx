"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { customerSchema, CustomerInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (customer: { id: string; firstName: string; lastName: string }) => void;
  defaultValues?: Partial<CustomerInput>;
  editId?: string;
}

export function CustomerFormDialog({ open, onClose, onCreated, defaultValues, editId }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CustomerInput>({
    resolver: zodResolver(customerSchema),
    defaultValues: defaultValues || {},
  });

  const onSubmit = async (data: CustomerInput) => {
    const url = editId ? `/api/customers/${editId}` : "/api/customers";
    const method = editId ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const customer = await res.json();
      toast.success(editId ? "Customer updated" : "Customer added");
      onCreated(customer);
      reset();
      onClose();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to save customer");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editId ? "Edit Customer" : "Add New Customer"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>First Name <span className="text-red-500">*</span></Label>
              <Input {...register("firstName")} placeholder="John" />
              {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Last Name <span className="text-red-500">*</span></Label>
              <Input {...register("lastName")} placeholder="Smith" />
              {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>
          <div className="space-y-1">
            <Label>Phone <span className="text-red-500">*</span></Label>
            <Input {...register("phone")} placeholder="+1 555 000 0000" />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Email</Label>
            <Input {...register("email")} type="email" placeholder="john@example.com" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>City</Label>
              <Input {...register("city")} placeholder="Los Angeles" />
            </div>
            <div className="space-y-1">
              <Label>Occupation</Label>
              <Input {...register("occupation")} placeholder="Engineer" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>ID Number</Label>
              <Input {...register("idNumber")} placeholder="123456789" />
            </div>
            <div className="space-y-1">
              <Label>Birth Date</Label>
              <Input {...register("birthDate")} type="date" />
            </div>
          </div>
          <div className="space-y-1">
            <Label>Address</Label>
            <Input {...register("address")} placeholder="123 Main St" />
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <Textarea {...register("notes")} placeholder="Optional notes..." rows={2} />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? "Saving..." : editId ? "Save Changes" : "Add Customer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
