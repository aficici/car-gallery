import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = req.nextUrl;
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const type = searchParams.get("type") || "sales";

  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year + 1}-01-01`);

  const wb = XLSX.utils.book_new();

  if (type === "sales" || type === "all") {
    const sales = await prisma.sale.findMany({
      where: { saleDate: { gte: startDate, lt: endDate } },
      include: {
        vehicle: { select: { brand: true, model: true, year: true, color: true, purchasePrice: true, plateNumber: true } },
        customer: { select: { firstName: true, lastName: true, phone: true, email: true } },
        salesRep: { select: { name: true } },
      },
      orderBy: { saleDate: "asc" },
    });

    const rows = sales.map((s) => ({
      "Sale Date": s.saleDate.toISOString().split("T")[0],
      "Vehicle": `${s.vehicle.year} ${s.vehicle.brand} ${s.vehicle.model}`,
      "Color": s.vehicle.color,
      "Plate": s.vehicle.plateNumber || "",
      "Customer": `${s.customer.firstName} ${s.customer.lastName}`,
      "Customer Phone": s.customer.phone,
      "Customer Email": s.customer.email || "",
      "Sales Rep": s.salesRep.name,
      "Sale Price": s.salePrice,
      "Purchase Price": s.vehicle.purchasePrice,
      "Profit": s.salePrice - s.vehicle.purchasePrice,
      "Down Payment": s.downPayment,
      "Remaining": s.remainingAmount,
      "Payment Method": s.paymentMethod,
      "Payment Status": s.paymentStatus,
      "Commission": s.commissionAmount,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = Object.keys(rows[0] || {}).map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(wb, ws, "Sales");
  }

  if (type === "vehicles" || type === "all") {
    const vehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: "desc" },
    });

    const rows = vehicles.map((v) => ({
      "Brand": v.brand,
      "Model": v.model,
      "Year": v.year,
      "Color": v.color,
      "Fuel Type": v.fuelType,
      "Transmission": v.transmission,
      "Mileage (km)": v.mileage,
      "Purchase Price": v.purchasePrice,
      "Sale Price": v.salePrice,
      "Margin": v.salePrice - v.purchasePrice,
      "Status": v.status,
      "Plate": v.plateNumber || "",
      "VIN": v.vin || "",
      "Added On": v.createdAt.toISOString().split("T")[0],
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = Object.keys(rows[0] || {}).map(() => ({ wch: 16 }));
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
  }

  if (type === "customers" || type === "all") {
    const customers = await prisma.customer.findMany({
      include: { _count: { select: { sales: true } } },
      orderBy: { createdAt: "desc" },
    });

    const rows = customers.map((c) => ({
      "First Name": c.firstName,
      "Last Name": c.lastName,
      "Phone": c.phone,
      "Email": c.email || "",
      "City": c.city || "",
      "Occupation": c.occupation || "",
      "ID Number": c.idNumber || "",
      "Total Purchases": c._count.sales,
      "Added On": c.createdAt.toISOString().split("T")[0],
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = Object.keys(rows[0] || {}).map(() => ({ wch: 18 }));
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
  }

  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="car-gallery-${type}-${year}.xlsx"`,
    },
  });
}
