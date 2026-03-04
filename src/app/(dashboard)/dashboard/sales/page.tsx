"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { SaleTable } from "@/components/sales/SaleTable";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function SalesPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "ADMIN";

  const [sales, setSales] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; vehicle: { brand: string; model: string; year: number } } | null>(null);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (status !== "all") params.set("status", status);
    try {
      const res = await fetch(`/api/sales?${params}`);
      const data = await res.json();
      setSales(data.data);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch { toast.error("Failed to load sales"); }
    finally { setLoading(false); }
  }, [page, status]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`/api/sales/${deleteTarget.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("Sale deleted"); fetchSales(); }
    else { const e = await res.json(); toast.error(e.error || "Failed to delete"); }
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales</h1>
          <p className="text-slate-500 text-sm mt-0.5">{total} total sale{total !== 1 ? "s" : ""}</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="PARTIAL">Partial</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button asChild size="sm">
            <Link href="/dashboard/sales/new"><Plus className="h-4 w-4 mr-1" />New Sale</Link>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16 text-slate-400 text-sm">Loading...</div>
      ) : (
        <SaleTable sales={sales} isAdmin={isAdmin} onDelete={setDeleteTarget} />
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
          </div>
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sale</AlertDialogTitle>
            <AlertDialogDescription>
              Delete the sale for <strong>{deleteTarget?.vehicle.year} {deleteTarget?.vehicle.brand} {deleteTarget?.vehicle.model}</strong>? The vehicle will be set back to Available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
