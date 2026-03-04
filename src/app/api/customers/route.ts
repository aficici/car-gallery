import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { customerSchema } from "@/lib/validations";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") || undefined;
  const city = searchParams.get("city") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  const where = {
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" as const } },
        { lastName: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { phone: { contains: search } },
      ],
    }),
    ...(city && { city: { contains: city, mode: "insensitive" as const } }),
  };

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { _count: { select: { sales: true, contactNotes: true } } },
    }),
    prisma.customer.count({ where }),
  ]);

  return NextResponse.json({ data: customers, total, page, limit });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const result = customerSchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.issues }, { status: 400 });

  const { email, idNumber, birthDate, ...rest } = result.data;

  if (email) {
    const existing = await prisma.customer.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }
  if (idNumber) {
    const existing = await prisma.customer.findUnique({ where: { idNumber } });
    if (existing) return NextResponse.json({ error: "ID number already in use" }, { status: 409 });
  }

  const customer = await prisma.customer.create({
    data: {
      ...rest,
      email: email || null,
      idNumber: idNumber || null,
      birthDate: birthDate ? new Date(birthDate) : null,
    },
  });

  return NextResponse.json(customer, { status: 201 });
}
