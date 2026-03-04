import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      sales: {
        include: {
          vehicle: { select: { brand: true, model: true, year: true, color: true } },
          salesRep: { select: { name: true } },
        },
        orderBy: { saleDate: "desc" },
      },
      contactNotes: {
        include: { user: { select: { name: true, role: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  return NextResponse.json(customer);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const result = customerSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues }, { status: 400 });

  const { email, idNumber, birthDate, ...rest } = result.data;

  const customer = await prisma.customer.update({
    where: { id },
    data: {
      ...rest,
      email: email || null,
      idNumber: idNumber || null,
      birthDate: birthDate ? new Date(birthDate) : null,
    },
  });

  return NextResponse.json(customer);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  await prisma.customer.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
