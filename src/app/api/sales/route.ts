import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saleSchema } from "@/lib/validations";
import { addMonths } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAdmin = session.user.role === "ADMIN";
  const { searchParams } = req.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status") || undefined;

  const where = {
    ...(!isAdmin && { salesRepId: session.user.id }),
    ...(status && { paymentStatus: status as never }),
  };

  const [sales, total] = await Promise.all([
    prisma.sale.findMany({
      where,
      include: {
        vehicle: { select: { brand: true, model: true, year: true, plateNumber: true } },
        customer: { select: { firstName: true, lastName: true } },
        salesRep: { select: { name: true } },
        payments: true,
      },
      orderBy: { saleDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sale.count({ where }),
  ]);

  return NextResponse.json({ data: sales, total, page, totalPages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = saleSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues }, { status: 400 });

  const { vehicleId, customerId, salePrice, downPayment, paymentMethod, commissionRate, notes, saleDate, installments } = result.data;

  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  if (vehicle.status !== "AVAILABLE") return NextResponse.json({ error: "Vehicle is not available" }, { status: 400 });

  const effectiveDownPayment = downPayment || 0;
  const effectiveCommissionRate = commissionRate ?? 0.02;
  const remainingAmount = salePrice - effectiveDownPayment;
  const commissionAmount = salePrice * effectiveCommissionRate;

  const sale = await prisma.$transaction(async (tx) => {
    const newSale = await tx.sale.create({
      data: {
        vehicleId,
        customerId,
        salesRepId: session.user.id,
        salePrice,
        downPayment: effectiveDownPayment,
        remainingAmount,
        paymentMethod,
        paymentStatus: remainingAmount <= 0 ? "COMPLETED" : "PENDING",
        commissionRate: effectiveCommissionRate,
        commissionAmount,
        notes: notes || null,
        saleDate: new Date(saleDate),
      },
    });

    await tx.vehicle.update({
      where: { id: vehicleId },
      data: { status: "SOLD" },
    });

    if (paymentMethod === "INSTALLMENT" && installments && installments > 1) {
      const installmentAmount = remainingAmount / installments;
      const paymentsData = Array.from({ length: installments }, (_, i) => ({
        saleId: newSale.id,
        amount: parseFloat(installmentAmount.toFixed(2)),
        dueDate: addMonths(new Date(saleDate), i + 1),
        isPaid: false,
      }));
      await tx.payment.createMany({ data: paymentsData });
    } else if (remainingAmount > 0) {
      await tx.payment.create({
        data: {
          saleId: newSale.id,
          amount: remainingAmount,
          dueDate: new Date(saleDate),
          isPaid: effectiveDownPayment >= salePrice,
        },
      });
    }

    return newSale;
  });

  return NextResponse.json(sale, { status: 201 });
}
