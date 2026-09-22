"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { BookOpen, LogOut, Menu, MessageSquarePlus, Send, Sparkles } from "lucide-react";

type Conversation = {
  id: string;
  title: string;
  updatedAt: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const MODEL = "cognitivecomputations/dolphin-mistral-24b-venice-edition:free";

export default function ChatApp({ userEmail }: { userEmail: string }): JSX.Element {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [forceFresh, setForceFresh] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const endRef = useRef<HTMLDivElement>(null);

  async function refreshConversations(): Promise<void> {
    const response = await fetch("/api/conversations", { cache: "no-store" });
    if (!response.ok) return;
    const data = (await response.json()) as { conversations: Conversation[] };
    setConversations(data.conversations);
  }

  useEffect(() => {
    void refreshConversations();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function openConversation(id: string): Promise<void> {
    setError("");
    const response = await fetch(`/api/conversations/${id}`, { cache: "no-store" });
    if (!response.ok) {
      setError("Não foi possível carregar a conversa.");
      return;
    }
    const data = (await response.json()) as { messages: ChatMessage[] };
    setActiveId(id);
    setMessages(data.messages);
    if (window.innerWidth < 820) setSidebarOpen(false);
  }

  async function createConversation(firstMessage: string): Promise<string> {
    const title = firstMessage.trim().slice(0, 48) || "Nova conversa";
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title })
    });

    if (!response.ok) throw new Error("Falha ao criar conversa.");

    const data = (await response.json()) as { conversation: Conversation };
    setActiveId(data.conversation.id);
    await refreshConversations();
    return data.conversation.id;
  }

  async function sendMessage(): Promise<void> {
    const text = input.trim();
    if (!text || loading) return;

    setError("");
    setInput("");
    setLoading(true);

    const userMessage: ChatMessage = {
      id: `local-user-${Date.now()}`,
      role: "user",
      content: text
    };
    setMessages((current) => [...current, userMessage]);

    try {
      const conversationId = activeId ?? (await createConversation(text));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          message: text,
          forceFresh
        })
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Erro ao consultar o modelo.");
      }

      if (!response.body) throw new Error("A resposta não contém stream.");

      const assistantId = `local-assistant-${Date.now()}`;
      setMessages((current) => [
        ...current,
        { id: assistantId, role: "assistant", content: "" }
      ]);

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const result = await reader.read();
        done = result.done;
        const chunk = decoder.decode(result.value, { stream: !done });
        if (!chunk) continue;

        setMessages((current) =>
          current.map((message) =>
            message.id === assistantId
              ? { ...message, content: message.content + chunk }
              : message
          )
        );
      }

      await refreshConversations();
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Erro inesperado.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={`app-frame ${expanded ? "expanded" : "compact"}`}>
      <div className="window-bar">
        <div className="traffic-lights" aria-label="Controles visuais da janela">
          <button className="light red" aria-label="Voltar para landing" onClick={() => { window.location.href = "/"; }} />
          <button className="light yellow" aria-label="Recolher sidebar" onClick={() => setSidebarOpen((value) => !value)} />
          <button className="light green" aria-label="Alternar tamanho do chat" onClick={() => setExpanded((value) => !value)} />
        </div>
        <div className="window-title">NullShell // secure workspace</div>
      </div>

      <div className="app-body">
        <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
          <div className="sidebar-top">
            <div>
              <strong>NullShell</strong>
              <span>{userEmail}</span>
            </div>
            <button
              className="icon-button mobile-only"
              onClick={() => setSidebarOpen(false)}
              aria-label="Fechar menu"
            >
              <Menu size={18} />
            </button>
          </div>

          <button
            className="new-chat"
            onClick={() => {
              setActiveId(null);
              setMessages([]);
              setError("");
              if (window.innerWidth < 820) setSidebarOpen(false);
            }}
          >
            <MessageSquarePlus size={17} />
            Nova conversa
          </button>

          <div className="conversation-list">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                className={activeId === conversation.id ? "conversation active" : "conversation"}
                onClick={() => void openConversation(conversation.id)}
              >
                <span>{conversation.title}</span>
                <small>{new Date(conversation.updatedAt).toLocaleDateString("pt-BR")}</small>
              </button>
            ))}
          </div>

          <div className="sidebar-footer">
            <div className="model-chip"><Sparkles size={14} /> {MODEL}</div>
            <Link href="/knowledge"><BookOpen size={16} /> Base de conhecimento</Link>
            <button onClick={() => void signOut({ callbackUrl: "/login" })}>
              <LogOut size={16} /> Sair
            </button>
          </div>
        </aside>

        <section className="chat-panel">
          <div className="chat-toolbar">
            <button className="icon-button" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
              <Menu size={20} />
            </button>
            <div>
              <strong>{activeId ? "Conversa ativa" : "Nova conversa"}</strong>
              <span>{MODEL}</span>
            </div>
          </div>

          {error ? <div className="error-banner chat-error">{error}</div> : null}

          <div className="messages">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="orb">&gt;_</div>
                <h1>Good to see you.</h1>
                <p>Como posso ajudar no seu trabalho técnico hoje?</p>
              </div>
            ) : (
              messages.map((message) => (
                <article key={message.id} className={`message ${message.role}`}>
                  <div className="message-role">{message.role === "user" ? "VOCÊ" : "NULLSHELL"}</div>
                  <div className="message-content">{message.content}</div>
                </article>
              ))
            )}
            {loading ? <div className="typing">NullShell está digitando<span>...</span></div> : null}
            <div ref={endRef} />
          </div>

          <div className="composer-wrap">
            <label className="force-row">
              <input
                type="checkbox"
                checked={forceFresh}
                onChange={(event) => setForceFresh(event.target.checked)}
                disabled={loading}
              />
              Forçar nova resposta (ignorar cache)
            </label>
            <div className="composer">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Pergunte qualquer coisa..."
                disabled={loading}
                rows={1}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
              />
              <button
                className="send-button"
                onClick={() => void sendMessage()}
                disabled={loading || !input.trim()}
                aria-label="Enviar mensagem"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
