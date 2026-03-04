import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { VehicleForm } from "@/components/vehicles/VehicleForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function NewVehiclePage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard/vehicles");
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Add New Vehicle</h1>
        <p className="text-slate-500 text-sm mt-0.5">Fill in the details to add a vehicle to inventory</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehicle Information</CardTitle>
        </CardHeader>
        <CardContent>
          <VehicleForm />
        </CardContent>
      </Card>
    </div>
  );
}
