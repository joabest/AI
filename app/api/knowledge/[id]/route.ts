import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  context: { params: { id: string } }
): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const note = await prisma.note.findFirst({
    where: { id: context.params.id, userId: session.user.id },
    select: { id: true }
  });

  if (!note) return NextResponse.json({ error: "Nota não encontrada." }, { status: 404 });

  await prisma.note.delete({ where: { id: note.id } });
  return NextResponse.json({ ok: true });
}
