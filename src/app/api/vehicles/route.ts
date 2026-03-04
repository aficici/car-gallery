import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vehicleSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") || undefined;
  const brand = searchParams.get("brand") || undefined;
  const fuelType = searchParams.get("fuelType") || undefined;
  const transmission = searchParams.get("transmission") || undefined;
  const yearMin = searchParams.get("yearMin") ? parseInt(searchParams.get("yearMin")!) : undefined;
  const yearMax = searchParams.get("yearMax") ? parseInt(searchParams.get("yearMax")!) : undefined;
  const priceMin = searchParams.get("priceMin") ? parseFloat(searchParams.get("priceMin")!) : undefined;
  const priceMax = searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : undefined;
  const search = searchParams.get("search") || undefined;
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");

  const where: Prisma.VehicleWhereInput = {
    ...(status && { status: status as never }),
    ...(brand && { brand: { equals: brand, mode: "insensitive" } }),
    ...(fuelType && { fuelType: fuelType as never }),
    ...(transmission && { transmission: transmission as never }),
    ...(yearMin || yearMax ? { year: { gte: yearMin, lte: yearMax } } : {}),
    ...(priceMin || priceMax ? { salePrice: { gte: priceMin, lte: priceMax } } : {}),
    ...(search && {
      OR: [
        { brand: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { plateNumber: { contains: search, mode: "insensitive" } },
        { vin: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  const validSortFields = ["salePrice", "year", "mileage", "createdAt"];
  const orderByField = validSortFields.includes(sortBy) ? sortBy : "createdAt";

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: { [orderByField]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.vehicle.count({ where }),
  ]);

  const brands = await prisma.vehicle.findMany({
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });

  return NextResponse.json({
    data: vehicles,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    brands: brands.map((b) => b.brand),
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await req.json();
  const result = vehicleSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues }, { status: 400 });
  }

  const { plateNumber, vin, ...rest } = result.data;

  if (plateNumber) {
    const existing = await prisma.vehicle.findUnique({ where: { plateNumber } });
    if (existing) {
      return NextResponse.json({ error: "Plate number already in use" }, { status: 409 });
    }
  }

  if (vin) {
    const existing = await prisma.vehicle.findUnique({ where: { vin } });
    if (existing) {
      return NextResponse.json({ error: "VIN already in use" }, { status: 409 });
    }
  }

  const vehicle = await prisma.vehicle.create({
    data: {
      ...rest,
      plateNumber: plateNumber || null,
      vin: vin || null,
      images: rest.images || [],
      status: rest.status || "AVAILABLE",
    },
  });

  return NextResponse.json(vehicle, { status: 201 });
}
