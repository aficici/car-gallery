import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { vehicleSchema } from "@/lib/validations";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  return NextResponse.json(vehicle);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const result = vehicleSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues }, { status: 400 });
  }

  const existing = await prisma.vehicle.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  const { plateNumber, vin, ...rest } = result.data;

  if (plateNumber && plateNumber !== existing.plateNumber) {
    const taken = await prisma.vehicle.findUnique({ where: { plateNumber } });
    if (taken) {
      return NextResponse.json({ error: "Plate number already in use" }, { status: 409 });
    }
  }

  if (vin && vin !== existing.vin) {
    const taken = await prisma.vehicle.findUnique({ where: { vin } });
    if (taken) {
      return NextResponse.json({ error: "VIN already in use" }, { status: 409 });
    }
  }

  const vehicle = await prisma.vehicle.update({
    where: { id },
    data: {
      ...rest,
      plateNumber: plateNumber || null,
      vin: vin || null,
      images: rest.images || existing.images,
      status: rest.status || existing.status,
    },
  });

  return NextResponse.json(vehicle);
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
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) {
    return NextResponse.json({ error: "Vehicle not found" }, { status: 404 });
  }

  if (vehicle.status === "SOLD") {
    return NextResponse.json({ error: "Cannot delete a sold vehicle" }, { status: 400 });
  }

  await prisma.vehicle.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
