import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: saleId } = await params;
  const { paymentId, isPaid } = await req.json();

  await prisma.payment.update({
    where: { id: paymentId },
    data: { isPaid, paidDate: isPaid ? new Date() : null },
  });

  const payments = await prisma.payment.findMany({ where: { saleId } });
  const paidCount = payments.filter((p) => p.isPaid).length;
  const paymentStatus =
    paidCount === 0 ? "PENDING" : paidCount === payments.length ? "COMPLETED" : "PARTIAL";

  await prisma.sale.update({ where: { id: saleId }, data: { paymentStatus } });

  return NextResponse.json({ success: true, paymentStatus });
}
