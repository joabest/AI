import Link from "next/link";
import { Database, History, ShieldCheck, TerminalSquare, Zap } from "lucide-react";

const features = [
  { icon: History, title: "Histórico persistente", text: "Continue conversas anteriores sem perder contexto." },
  { icon: Database, title: "Base pesquisável", text: "Notas reutilizáveis entram automaticamente quando forem relevantes." },
  { icon: Zap, title: "Cache inteligente", text: "Perguntas idênticas podem responder sem gastar uma nova chamada." },
  { icon: ShieldCheck, title: "Fluxo técnico", text: "Interface focada em pesquisa, laboratório, CTF e engenharia." }
];

export default function LandingPage(): JSX.Element {
  return (
    <main className="landing">
      <div className="floating-icon one">&lt;/&gt;</div>
      <div className="floating-icon two">01</div>
      <div className="floating-icon three">#</div>
      <header className="landing-header">
        <Link href="/" className="brand"><TerminalSquare size={20} /> NullShell</Link>
        <Link href="/login" className="ghost-button">Entrar</Link>
      </header>

      <section className="hero">
        <div className="hero-badge">AI // SECURITY WORKSPACE</div>
        <h1>Seu copiloto técnico com memória de verdade.</h1>
        <p>
          Converse com um modelo via OpenRouter, salve notas reutilizáveis e retome
          qualquer sessão sem reexplicar o contexto.
        </p>
        <div className="hero-actions">
          <Link href="/login" className="primary-button">Começar agora</Link>
          <Link href="/knowledge" className="secondary-button">Base de conhecimento</Link>
        </div>
      </section>

      <section className="feature-grid">
        {features.map(({ icon: Icon, title, text }) => (
          <article className="feature-card" key={title}>
            <Icon size={22} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <footer className="landing-footer">NullShell · {new Date().getFullYear()}</footer>
    </main>
  );
}
