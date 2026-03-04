"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";

export interface FilterState {
  search: string;
  status: string;
  brand: string;
  fuelType: string;
  transmission: string;
  sortBy: string;
  sortOrder: string;
}

interface VehicleFiltersProps {
  filters: FilterState;
  brands: string[];
  onChange: (filters: FilterState) => void;
}

export function VehicleFilters({ filters, brands, onChange }: VehicleFiltersProps) {
  const set = (key: keyof FilterState, value: string) =>
    onChange({ ...filters, [key]: value });

  const reset = () =>
    onChange({
      search: "",
      status: "all",
      brand: "all",
      fuelType: "all",
      transmission: "all",
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  const hasActiveFilters =
    filters.search ||
    (filters.status && filters.status !== "all") ||
    (filters.brand && filters.brand !== "all") ||
    (filters.fuelType && filters.fuelType !== "all") ||
    (filters.transmission && filters.transmission !== "all");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search brand, model, plate, VIN..."
            value={filters.search}
            onChange={(e) => set("search", e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={filters.status || "all"} onValueChange={(v) => set("status", v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="AVAILABLE">Available</SelectItem>
            <SelectItem value="RESERVED">Reserved</SelectItem>
            <SelectItem value="SOLD">Sold</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.brand || "all"} onValueChange={(v) => set("brand", v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.fuelType || "all"} onValueChange={(v) => set("fuelType", v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Fuel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Fuel Types</SelectItem>
            <SelectItem value="GASOLINE">Gasoline</SelectItem>
            <SelectItem value="DIESEL">Diesel</SelectItem>
            <SelectItem value="ELECTRIC">Electric</SelectItem>
            <SelectItem value="HYBRID">Hybrid</SelectItem>
            <SelectItem value="LPG">LPG</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.transmission || "all"} onValueChange={(v) => set("transmission", v)}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Transmission" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Transmissions</SelectItem>
            <SelectItem value="MANUAL">Manual</SelectItem>
            <SelectItem value="AUTOMATIC">Automatic</SelectItem>
            <SelectItem value="SEMI_AUTO">Semi-Auto</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={`${filters.sortBy}-${filters.sortOrder}`}
          onValueChange={(v) => {
            const [sortBy, sortOrder] = v.split("-");
            onChange({ ...filters, sortBy, sortOrder });
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt-desc">Newest First</SelectItem>
            <SelectItem value="createdAt-asc">Oldest First</SelectItem>
            <SelectItem value="salePrice-asc">Price: Low to High</SelectItem>
            <SelectItem value="salePrice-desc">Price: High to Low</SelectItem>
            <SelectItem value="year-desc">Year: Newest</SelectItem>
            <SelectItem value="year-asc">Year: Oldest</SelectItem>
            <SelectItem value="mileage-asc">Mileage: Lowest</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-slate-500">
            <X className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
