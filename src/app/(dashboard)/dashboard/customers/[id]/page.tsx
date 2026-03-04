import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerDetailClient } from "@/components/customers/CustomerDetailClient";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

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

  if (!customer) notFound();

  const serialized = {
    ...customer,
    birthDate: customer.birthDate?.toISOString() || null,
    createdAt: customer.createdAt.toISOString(),
    updatedAt: customer.updatedAt.toISOString(),
    sales: customer.sales.map((s) => ({
      ...s,
      saleDate: s.saleDate.toISOString(),
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString(),
    })),
    contactNotes: customer.contactNotes.map((n) => ({
      ...n,
      createdAt: n.createdAt.toISOString(),
      updatedAt: n.updatedAt.toISOString(),
    })),
  };

  return (
    <CustomerDetailClient
      customer={serialized}
      currentUserId={session.user.id}
      currentUserRole={session.user.role}
      isAdmin={session.user.role === "ADMIN"}
    />
  );
}
