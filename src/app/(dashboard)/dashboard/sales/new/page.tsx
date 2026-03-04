import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SaleForm } from "@/components/sales/SaleForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewSalePage() {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">New Sale</h1>
        <p className="text-slate-500 text-sm mt-0.5">Create a new vehicle sale record</p>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Sale Details</CardTitle></CardHeader>
        <CardContent><SaleForm /></CardContent>
      </Card>
    </div>
  );
}
