"use client";

import { Vehicle } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Pencil, Trash2, Car } from "lucide-react";
import Link from "next/link";

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

interface VehicleTableProps {
  vehicles: Vehicle[];
  isAdmin: boolean;
  onDelete: (vehicle: Vehicle) => void;
}

export function VehicleTable({ vehicles, isAdmin, onDelete }: VehicleTableProps) {
  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <Car className="h-12 w-12 mb-3 opacity-30" />
        <p className="text-sm font-medium">No vehicles found</p>
        <p className="text-xs mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Vehicle</TableHead>
            <TableHead>Year</TableHead>
            <TableHead>Fuel</TableHead>
            <TableHead>Mileage</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((v) => {
            const status = statusConfig[v.status];
            return (
              <TableRow key={v.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-slate-900">
                      {v.brand} {v.model}
                    </p>
                    {v.plateNumber && (
                      <p className="text-xs text-slate-500">{v.plateNumber}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell>{v.year}</TableCell>
                <TableCell>{fuelLabels[v.fuelType]}</TableCell>
                <TableCell>{v.mileage.toLocaleString()} mi</TableCell>
                <TableCell className="font-medium">${v.salePrice.toLocaleString()}</TableCell>
                <TableCell>
                  <Badge className={status.className}>{status.label}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                      <Link href={`/dashboard/vehicles/${v.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    {isAdmin && (
                      <>
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8">
                          <Link href={`/dashboard/vehicles/${v.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => onDelete(v)}
                          disabled={v.status === "SOLD"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
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
