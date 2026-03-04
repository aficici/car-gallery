import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; noteId: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { noteId } = await params;
  const note = await prisma.contactNote.findUnique({ where: { id: noteId } });
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  // Only the author or admin can delete
  if (note.userId !== session.user.id && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.contactNote.delete({ where: { id: noteId } });
  return NextResponse.json({ success: true });
}
