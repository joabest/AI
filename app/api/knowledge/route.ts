import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { tags: true }
  });

  return NextResponse.json({ notes });
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });

  const body = (await request.json()) as {
    title?: unknown;
    content?: unknown;
    tags?: unknown;
  };

  const title = typeof body.title === "string" ? body.title.trim() : "";
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const tags = Array.isArray(body.tags)
    ? body.tags.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean).slice(0, 20)
    : [];

  if (!title || !content) {
    return NextResponse.json({ error: "Título e conteúdo são obrigatórios." }, { status: 400 });
  }

  const note = await prisma.note.create({
    data: {
      userId: session.user.id,
      title: title.slice(0, 100),
      content,
      tags: {
        create: Array.from(new Set(tags)).map((name) => ({ name: name.slice(0, 40) }))
      }
    },
    include: { tags: true }
  });

  return NextResponse.json({ note }, { status: 201 });
}
