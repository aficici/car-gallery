"use client";

import { Vehicle } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Car, Fuel, Gauge, Settings2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const statusConfig = {
  AVAILABLE: { label: "Available", className: "bg-green-100 text-green-700" },
  RESERVED: { label: "Reserved", className: "bg-yellow-100 text-yellow-700" },
  SOLD: { label: "Sold", className: "bg-gray-100 text-gray-600" },
};

const fuelLabels: Record<string, string> = {
  GASOLINE: "Gasoline",
  DIESEL: "Diesel",
  ELECTRIC: "Electric",
  HYBRID: "Hybrid",
  LPG: "LPG",
};

const transmissionLabels: Record<string, string> = {
  MANUAL: "Manual",
  AUTOMATIC: "Automatic",
  SEMI_AUTO: "Semi-Auto",
};

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  const status = statusConfig[vehicle.status];
  const mainImage = vehicle.images?.[0];

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-44 bg-slate-100">
        {mainImage ? (
          <Image src={mainImage} alt={`${vehicle.brand} ${vehicle.model}`} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Car className="h-16 w-16 text-slate-300" />
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge className={status.className}>{status.label}</Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-2">
          <h3 className="font-semibold text-slate-900 text-base leading-tight">
            {vehicle.year} {vehicle.brand} {vehicle.model}
          </h3>
          <p className="text-slate-500 text-sm">{vehicle.color}</p>
        </div>

        <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-600 mb-3">
          <div className="flex items-center gap-1">
            <Gauge className="h-3 w-3" />
            <span>{vehicle.mileage.toLocaleString()} mi</span>
          </div>
          <div className="flex items-center gap-1">
            <Fuel className="h-3 w-3" />
            <span>{fuelLabels[vehicle.fuelType]}</span>
          </div>
          <div className="flex items-center gap-1">
            <Settings2 className="h-3 w-3" />
            <span>{transmissionLabels[vehicle.transmission]}</span>
          </div>
          {vehicle.plateNumber && (
            <div className="flex items-center gap-1">
              <Car className="h-3 w-3" />
              <span>{vehicle.plateNumber}</span>
            </div>
          )}
        </div>

        <p className="text-lg font-bold text-slate-900">
          ${vehicle.salePrice.toLocaleString()}
        </p>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        <Button asChild size="sm" className="w-full">
          <Link href={`/dashboard/vehicles/${vehicle.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
