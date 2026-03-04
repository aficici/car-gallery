"use client";

import { useEffect, useState, useCallback } from "react";
import { Vehicle } from "@prisma/client";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { VehicleTable } from "@/components/vehicles/VehicleTable";
import { VehicleFilters, FilterState } from "@/components/vehicles/VehicleFilters";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LayoutGrid, List, Plus, Car } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const DEFAULT_FILTERS: FilterState = {
  search: "",
  status: "all",
  brand: "all",
  fuelType: "all",
  transmission: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export default function VehiclesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "table">("grid");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [deleteTarget, setDeleteTarget] = useState<Vehicle | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", "12");
    if (filters.search) params.set("search", filters.search);
    if (filters.status && filters.status !== "all") params.set("status", filters.status);
    if (filters.brand && filters.brand !== "all") params.set("brand", filters.brand);
    if (filters.fuelType && filters.fuelType !== "all") params.set("fuelType", filters.fuelType);
    if (filters.transmission && filters.transmission !== "all") params.set("transmission", filters.transmission);
    params.set("sortBy", filters.sortBy);
    params.set("sortOrder", filters.sortOrder);

    try {
      const res = await fetch(`/api/vehicles?${params}`);
      const data = await res.json();
      setVehicles(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
      setBrands(data.brands || []);
    } catch {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  // Reset to page 1 when filters change
  const handleFilterChange = (f: FilterState) => {
    setFilters(f);
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/vehicles/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Vehicle deleted");
      fetchVehicles();
    } else {
      const err = await res.json();
      toast.error(err.error || "Failed to delete vehicle");
    }
    setDeleteTarget(null);
  };

  const statusCounts = {
    available: vehicles.filter((v) => v.status === "AVAILABLE").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Vehicles</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {total} total vehicle{total !== 1 ? "s" : ""} in inventory
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={view === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setView("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={view === "table" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setView("table")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
          {isAdmin && (
            <Button asChild size="sm">
              <Link href="/dashboard/vehicles/new">
                <Plus className="h-4 w-4 mr-1" />
                Add Vehicle
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <VehicleFilters filters={filters} brands={brands} onChange={handleFilterChange} />

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-slate-400">
          <Car className="h-8 w-8 animate-pulse" />
        </div>
      ) : view === "grid" ? (
        <>
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Car className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No vehicles found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {vehicles.map((v) => (
                <VehicleCard key={v.id} vehicle={v} />
              ))}
            </div>
          )}
        </>
      ) : (
        <VehicleTable vehicles={vehicles} isAdmin={isAdmin} onDelete={setDeleteTarget} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>
                {deleteTarget?.year} {deleteTarget?.brand} {deleteTarget?.model}
              </strong>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
