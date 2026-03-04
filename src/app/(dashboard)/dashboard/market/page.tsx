"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ExternalLink,
  Search,
  Car,
  MapPin,
  Gauge,
  DollarSign,
  Hash,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react";

interface Vehicle {
  vin: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  mileage: number | null;
  price: number | null;
  location: string | null;
  distance_miles: number | null;
  dealer: string | null;
  url: string;
  source_id: string | null;
}

interface ApiResponse {
  vehicles: Vehicle[];
  total: number;
  page: number;
  totalPages: number;
  makes: string[];
  stats: {
    total: number;
    withVin: number;
    avgPrice: number;
    scraped_at: string;
    search_params: {
      city: string;
      radius_miles: number;
      title: string;
    };
  };
}

function formatPrice(price: number | null) {
  if (!price) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(price);
}

function formatMileage(miles: number | null) {
  if (!miles) return "—";
  return new Intl.NumberFormat("en-US").format(miles) + " mi";
}

export default function MarketPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedMake, setSelectedMake] = useState("all");
  const [sort, setSort] = useState("price_asc");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "25",
        sort,
        ...(search && { search }),
        ...(selectedMake !== "all" && { make: selectedMake }),
      });
      const res = await fetch(`/api/market-vehicles?${params}`);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
    } catch {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [page, sort, search, selectedMake]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  }

  function handleMakeChange(val: string) {
    setSelectedMake(val);
    setPage(1);
  }

  function handleSortChange(val: string) {
    setSort(val);
    setPage(1);
  }

  const stats = data?.stats;

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Market Listings</h1>
          <p className="text-slate-500 mt-1 text-sm">
            AutoTempest — Los Angeles, CA · 50 miles · Clean Title
          </p>
        </div>
        {stats && (
          <div className="text-right text-xs text-slate-400">
            <p>Last updated: {new Date(stats.scraped_at).toLocaleString("en-US")}</p>
            <button
              onClick={fetchVehicles}
              className="flex items-center gap-1 mt-1 ml-auto text-blue-500 hover:text-blue-700"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Car className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-xs text-slate-500">Total Listings</p>
                <p className="text-xl font-bold text-slate-900">{stats?.total.toLocaleString() ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-xs text-slate-500">With VIN</p>
                <p className="text-xl font-bold text-slate-900">{stats?.withVin ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-xs text-slate-500">Avg Price</p>
                <p className="text-xl font-bold text-slate-900">{stats ? formatPrice(stats.avgPrice) : "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-xs text-slate-500">Location</p>
                <p className="text-sm font-bold text-slate-900">{stats?.search_params.city ?? "Los Angeles"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex gap-2 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by make, model, VIN..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button type="submit" variant="outline" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>

            <Select value={selectedMake} onValueChange={handleMakeChange}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="All Makes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Makes</SelectItem>
                {data?.makes.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="year_desc">Year: Newest First</SelectItem>
                <SelectItem value="year_asc">Year: Oldest First</SelectItem>
                <SelectItem value="mileage_asc">Mileage: Low to High</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between">
            <span>
              {loading ? "Loading..." : `${data?.total ?? 0} vehicles`}
              {selectedMake !== "all" && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {selectedMake}
                </Badge>
              )}
            </span>
            {data && (
              <span className="text-xs text-slate-500 font-normal">
                Sayfa {data.page} / {data.totalPages}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <Car className="h-10 w-10 animate-pulse" />
                <p className="text-sm">Loading vehicles...</p>
              </div>
            </div>
          ) : !data?.vehicles.length ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Car className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="w-36">VIN</TableHead>
                    <TableHead className="w-12">Year</TableHead>
                    <TableHead>Make</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <Gauge className="h-3 w-3" /> Mileage
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" /> Price
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> Location
                      </div>
                    </TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.vehicles.map((v, i) => (
                    <TableRow
                      key={v.source_id || v.url || i}
                      className="hover:bg-blue-50/30 text-sm"
                    >
                      <TableCell className="font-mono text-xs">
                        {v.vin ? (
                          <span className="text-green-700 bg-green-50 px-1.5 py-0.5 rounded text-xs font-mono">
                            {v.vin}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{v.year ?? "—"}</TableCell>
                      <TableCell className="font-medium">{v.make ?? "—"}</TableCell>
                      <TableCell className="text-slate-600">{v.model ?? "—"}</TableCell>
                      <TableCell className="text-slate-600">
                        {formatMileage(v.mileage)}
                      </TableCell>
                      <TableCell>
                        {v.price ? (
                          <span className="font-semibold text-slate-900">
                            {formatPrice(v.price)}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-slate-500 text-xs">
                        <div>{v.location ?? "—"}</div>
                        {v.distance_miles && (
                          <div className="text-slate-400">
                            {v.distance_miles} mi away
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <a
                          href={v.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 inline-flex"
                          title="Open listing"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-500">
            {((data.page - 1) * 25 + 1).toLocaleString()}–
            {Math.min(data.page * 25, data.total).toLocaleString()}{" "}
            / {data.total.toLocaleString()} vehicles
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm font-medium px-2">
              {data.page} / {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page === data.totalPages}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
