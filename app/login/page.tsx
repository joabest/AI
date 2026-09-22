import { redirect } from "next/navigation";
import { auth } from "@/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage(): Promise<JSX.Element> {
  const session = await auth();
  if (session?.user) redirect("/chat");

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="terminal-mark">&gt;_</div>
        <h1>NullShell</h1>
        <p>Entre para acessar suas conversas e notas.</p>
        <LoginForm />
      </section>
    </main>
  );
}
