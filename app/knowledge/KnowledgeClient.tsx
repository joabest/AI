"use client";

import { FormEvent, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type Note = {
  id: string;
  title: string;
  content: string;
  tags: { id: string; name: string }[];
  createdAt: string;
};

export default function KnowledgeClient(): JSX.Element {
  const [notes, setNotes] = useState<Note[]>([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function load(): Promise<void> {
    const response = await fetch("/api/knowledge", { cache: "no-store" });
    if (!response.ok) {
      setError("Não foi possível carregar as notas.");
      return;
    }
    const data = (await response.json()) as { notes: Note[] };
    setNotes(data.notes);
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSaving(true);
    setError("");

    const form = event.currentTarget;
    const data = new FormData(form);
    const tags = String(data.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    const response = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(data.get("title") ?? ""),
        content: String(data.get("content") ?? ""),
        tags
      })
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "Não foi possível salvar a nota.");
      setSaving(false);
      return;
    }

    form.reset();
    await load();
    setSaving(false);
  }

  async function remove(id: string): Promise<void> {
    const response = await fetch(`/api/knowledge/${id}`, { method: "DELETE" });
    if (!response.ok) {
      setError("Não foi possível excluir a nota.");
      return;
    }
    setNotes((current) => current.filter((note) => note.id !== id));
  }

  return (
    <div className="knowledge-grid">
      <form className="note-form" onSubmit={submit}>
        <h2><Plus size={18} /> Nova nota</h2>
        <label>
          Título
          <input name="title" required maxLength={100} />
        </label>
        <label>
          Conteúdo
          <textarea name="content" rows={10} required />
        </label>
        <label>
          Tags separadas por vírgula
          <input name="tags" placeholder="xss, recon, alvo-exemplo" />
        </label>
        {error ? <div className="error-banner">{error}</div> : null}
        <button className="primary-button" disabled={saving} type="submit">
          {saving ? "Salvando..." : "Salvar nota"}
        </button>
      </form>

      <section className="notes-list">
        {notes.map((note) => (
          <article className="note-card" key={note.id}>
            <div className="note-card-head">
              <h2>{note.title}</h2>
              <button className="icon-button" onClick={() => void remove(note.id)} aria-label="Excluir nota">
                <Trash2 size={16} />
              </button>
            </div>
            <p>{note.content}</p>
            <div className="tag-row">
              {note.tags.map((tag) => <span key={tag.id}>#{tag.name}</span>)}
            </div>
          </article>
        ))}
        {notes.length === 0 ? <div className="empty-note">Nenhuma nota salva ainda.</div> : null}
      </section>
    </div>
  );
}
