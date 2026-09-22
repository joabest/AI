import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import KnowledgeClient from "./KnowledgeClient";

export default async function KnowledgePage(): Promise<JSX.Element> {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <main className="knowledge-page">
      <header className="knowledge-header">
        <div>
          <span className="eyebrow">NULLSHELL // MEMORY</span>
          <h1>Base de conhecimento</h1>
          <p>Salve contexto técnico reutilizável. Notas relevantes entram automaticamente no prompt.</p>
        </div>
        <Link href="/chat" className="secondary-button">Voltar ao chat</Link>
      </header>
      <KnowledgeClient />
    </main>
  );
}
