import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Car, Pencil, Trash2, ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { VehicleDeleteButton } from "@/components/vehicles/VehicleDeleteButton";

const statusConfig = {
  AVAILABLE: { label: "Available", className: "bg-green-100 text-green-700" },
  RESERVED: { label: "Reserved", className: "bg-yellow-100 text-yellow-700" },
  SOLD: { label: "Sold", className: "bg-gray-100 text-gray-600" },
};

const fuelLabels: Record<string, string> = {
  GASOLINE: "Gasoline", DIESEL: "Diesel", ELECTRIC: "Electric", HYBRID: "Hybrid", LPG: "LPG",
};

const transmissionLabels: Record<string, string> = {
  MANUAL: "Manual", AUTOMATIC: "Automatic", SEMI_AUTO: "Semi-Automatic",
};

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) notFound();

  const status = statusConfig[vehicle.status];
  const profit = vehicle.salePrice - vehicle.purchasePrice;
  const margin = ((profit / vehicle.purchasePrice) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="gap-1 -ml-2 text-slate-600">
          <Link href="/dashboard/vehicles">
            <ArrowLeft className="h-4 w-4" />
            Back to Vehicles
          </Link>
        </Button>
        {isAdmin && (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/vehicles/${id}/edit`}>
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Link>
            </Button>
            <VehicleDeleteButton vehicle={vehicle} />
          </div>
        )}
      </div>

      {/* Title */}
      <div className="flex items-start gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {vehicle.year} {vehicle.brand} {vehicle.model}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={status.className}>{status.label}</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Images */}
        <div className="lg:col-span-2 space-y-3">
          <Card>
            <CardContent className="p-0 overflow-hidden rounded-lg">
              {vehicle.images && vehicle.images.length > 0 ? (
                <div className="space-y-2">
                  <div className="relative h-72 w-full">
                    <Image
                      src={vehicle.images[0]}
                      alt={`${vehicle.brand} ${vehicle.model}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {vehicle.images.length > 1 && (
                    <div className="flex gap-2 p-2 overflow-x-auto">
                      {vehicle.images.slice(1).map((img, i) => (
                        <div key={i} className="relative h-16 w-16 flex-shrink-0 rounded overflow-hidden">
                          <Image src={img} alt="" fill className="object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center bg-slate-100">
                  <Car className="h-20 w-20 text-slate-300" />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          {vehicle.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-700">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 leading-relaxed">{vehicle.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Details */}
        <div className="space-y-4">
          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Sale Price</span>
                <span className="font-bold text-xl text-slate-900">
                  ${vehicle.salePrice.toLocaleString()}
                </span>
              </div>
              {isAdmin && (
                <>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Purchase Price</span>
                    <span className="text-slate-700">${vehicle.purchasePrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Profit</span>
                    <span className={profit >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                      ${profit.toLocaleString()} ({margin}%)
                    </span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Specs */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-700">Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2.5 text-sm">
                {[
                  { label: "Brand", value: vehicle.brand },
                  { label: "Model", value: vehicle.model },
                  { label: "Year", value: vehicle.year },
                  { label: "Color", value: vehicle.color },
                  { label: "Fuel Type", value: fuelLabels[vehicle.fuelType] },
                  { label: "Transmission", value: transmissionLabels[vehicle.transmission] },
                  { label: "Mileage", value: `${vehicle.mileage.toLocaleString()} mi` },
                  vehicle.vin ? { label: "VIN", value: vehicle.vin } : null,
                ]
                  .filter(Boolean)
                  .map((item) => (
                    <div key={item!.label} className="flex justify-between">
                      <dt className="text-slate-500">{item!.label}</dt>
                      <dd className="font-medium text-slate-900 text-right">{item!.value}</dd>
                    </div>
                  ))}
              </dl>
            </CardContent>
          </Card>

          {/* Meta */}
          <Card>
            <CardContent className="pt-4 pb-3">
              <p className="text-xs text-slate-400">
                Added {new Date(vehicle.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "long", day: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
