"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { vehicleSchema, VehicleInput } from "@/lib/validations";
import { Vehicle } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VehicleImageUpload } from "./VehicleImageUpload";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface VehicleFormProps {
  vehicle?: Vehicle;
}

export function VehicleForm({ vehicle }: VehicleFormProps) {
  const router = useRouter();
  const [images, setImages] = useState<string[]>(vehicle?.images || []);
  const isEdit = !!vehicle;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VehicleInput>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: vehicle
      ? {
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          color: vehicle.color,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          mileage: vehicle.mileage,
          purchasePrice: vehicle.purchasePrice,
          salePrice: vehicle.salePrice,
          status: vehicle.status,
          description: vehicle.description || "",
          plateNumber: vehicle.plateNumber || "",
          vin: vehicle.vin || "",
        }
      : {
          year: new Date().getFullYear(),
          mileage: 0,
          status: "AVAILABLE",
        },
  });

  const onSubmit = async (data: VehicleInput) => {
    const payload = { ...data, images };

    const url = isEdit ? `/api/vehicles/${vehicle.id}` : "/api/vehicles";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error || "Failed to save vehicle");
      return;
    }

    toast.success(isEdit ? "Vehicle updated" : "Vehicle added");
    router.push("/dashboard/vehicles");
    router.refresh();
  };

  const Field = ({
    label,
    name,
    required,
    children,
  }: {
    label: string;
    name: keyof VehicleInput;
    required?: boolean;
    children: React.ReactNode;
  }) => (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      {children}
      {errors[name] && (
        <p className="text-xs text-red-500">{errors[name]?.message as string}</p>
      )}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Brand" name="brand" required>
          <Input {...register("brand")} placeholder="Toyota" />
        </Field>
        <Field label="Model" name="model" required>
          <Input {...register("model")} placeholder="Corolla" />
        </Field>
        <Field label="Year" name="year" required>
          <Input
            type="number"
            {...register("year", { valueAsNumber: true })}
            placeholder={String(new Date().getFullYear())}
          />
        </Field>
        <Field label="Color" name="color" required>
          <Input {...register("color")} placeholder="White" />
        </Field>
        <Field label="Fuel Type" name="fuelType" required>
          <Select
            defaultValue={vehicle?.fuelType}
            onValueChange={(v) => setValue("fuelType", v as VehicleInput["fuelType"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select fuel type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GASOLINE">Gasoline</SelectItem>
              <SelectItem value="DIESEL">Diesel</SelectItem>
              <SelectItem value="ELECTRIC">Electric</SelectItem>
              <SelectItem value="HYBRID">Hybrid</SelectItem>
              <SelectItem value="LPG">LPG</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Transmission" name="transmission" required>
          <Select
            defaultValue={vehicle?.transmission}
            onValueChange={(v) => setValue("transmission", v as VehicleInput["transmission"])}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select transmission" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MANUAL">Manual</SelectItem>
              <SelectItem value="AUTOMATIC">Automatic</SelectItem>
              <SelectItem value="SEMI_AUTO">Semi-Auto</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Pricing & Mileage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Mileage (mi)" name="mileage" required>
          <Input
            type="number"
            {...register("mileage", { valueAsNumber: true })}
            placeholder="0"
          />
        </Field>
        <Field label="Purchase Price ($)" name="purchasePrice" required>
          <Input
            type="number"
            {...register("purchasePrice", { valueAsNumber: true })}
            placeholder="0"
          />
        </Field>
        <Field label="Sale Price ($)" name="salePrice" required>
          <Input
            type="number"
            {...register("salePrice", { valueAsNumber: true })}
            placeholder="0"
          />
        </Field>
        <Field label="Status" name="status">
          <Select
            defaultValue={vehicle?.status || "AVAILABLE"}
            onValueChange={(v) => setValue("status", v as VehicleInput["status"])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AVAILABLE">Available</SelectItem>
              <SelectItem value="RESERVED">Reserved</SelectItem>
              <SelectItem value="SOLD">Sold</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Optional IDs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Plate Number" name="plateNumber">
          <Input {...register("plateNumber")} placeholder="34 ABC 001" />
        </Field>
        <Field label="VIN" name="vin">
          <Input {...register("vin")} placeholder="1HGBH41JXMN109186" />
        </Field>
      </div>

      {/* Description */}
      <Field label="Description" name="description">
        <Textarea
          {...register("description")}
          placeholder="Additional details about the vehicle..."
          rows={3}
        />
      </Field>

      {/* Photos */}
      <div className="space-y-1.5">
        <Label>Photos</Label>
        <VehicleImageUpload images={images} onChange={setImages} />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Add Vehicle"}
        </Button>
      </div>
    </form>
  );
}
