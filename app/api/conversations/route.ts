import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
    select: { id: true, title: true, updatedAt: true }
  });

  return NextResponse.json({ conversations });
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = (await request.json()) as { title?: unknown };
  const title = typeof body.title === "string" && body.title.trim()
    ? body.title.trim().slice(0, 80)
    : "Nova conversa";

  const conversation = await prisma.conversation.create({
    data: { userId: session.user.id, title },
    select: { id: true, title: true, updatedAt: true }
  });

  return NextResponse.json({ conversation }, { status: 201 });
}
