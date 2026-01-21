"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "./Button";
import { Card, CardContent } from "./Card";
import { SourceList, type Citation } from "./SourceList";
import { Badge } from "./Badge";
import { Download, Trash2 } from "lucide-react";
import { formatNow, safeId } from "@/lib/utils";
import { generateLocalReply } from "@/lib/localChat";

type Msg = { id: string; role: "user" | "assistant"; content: string; createdAt: string };

type StoredChat = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  mode: "study" | "summary" | "quick";
  messages: Msg[];
};

const LS_KEY = "islam-ai.chats.v1";

function guessTitle(firstUser: string) {
  const t = firstUser.trim().slice(0, 60);
  return t.length ? t : "New chat";
}

function loadChats(): StoredChat[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

function saveChats(chats: StoredChat[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(chats.slice(0, 30)));
}

function toMarkdown(chat: StoredChat) {
  const lines: string[] = [];
  lines.push(`# Islam AI Chat Export`);
  lines.push(`- Title: ${chat.title}`);
  lines.push(`- Mode: ${chat.mode}`);
  lines.push(`- Created: ${chat.createdAt}`);
  lines.push(`- Updated: ${chat.updatedAt}`);
  lines.push(``);
  for (const m of chat.messages) {
    lines.push(`## ${m.role === "user" ? "You" : "Islam AI"} — ${m.createdAt}`);
    lines.push(m.content);
    lines.push(``);
  }
  return lines.join("\n");
}

export function Chat() {
  const [mode, setMode] = useState<"study"|"summary"|"quick">("study");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: safeId("a"),
      role: "assistant",
      createdAt: formatNow(),
      content:
        "Assalamu alaikum. I’m Islam AI — a study assistant.\n\nAsk me about a topic (aqeedah, seerah, fiqh basics, character, etc.). I’ll cite the local sources I have, and if your question needs a ruling, I’ll suggest what to verify with a qualified scholar."
    }
  ]);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [busy, setBusy] = useState(false);

  const [chats, setChats] = useState<StoredChat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = loadChats();
    setChats(c);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy]);

  const activeChat = useMemo(() => chats.find(c => c.id === activeChatId) ?? null, [chats, activeChatId]);

  function newChat() {
    setActiveChatId(null);
    setMessages([
      {
        id: safeId("a"),
        role: "assistant",
        createdAt: formatNow(),
        content:
          "Assalamu alaikum. Start a new question whenever you’re ready."
      }
    ]);
    setCitations([]);
  }

  function persistChat(nextMessages: Msg[], nextMode = mode) {
    const now = formatNow();
    setChats(prev => {
      let next = [...prev];
      if (!activeChatId) {
        const firstUser = nextMessages.find(m => m.role === "user")?.content ?? "";
        const id = safeId("chat");
        const createdAt = now;
        const chat: StoredChat = {
          id,
          title: guessTitle(firstUser),
          createdAt,
          updatedAt: now,
          mode: nextMode,
          messages: nextMessages
        };
        next = [chat, ...next];
        saveChats(next);
        setActiveChatId(id);
        return next;
      }
      const idx = next.findIndex(c => c.id === activeChatId);
      if (idx >= 0) {
        next[idx] = { ...next[idx], updatedAt: now, messages: nextMessages, mode: nextMode };
      }
      saveChats(next);
      return next;
    });
  }

  function loadChat(id: string) {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;
    setActiveChatId(id);
    setMode(chat.mode);
    setMessages(chat.messages);
    setCitations([]);
  }

  function deleteChat(id: string) {
    setChats(prev => {
      const next = prev.filter(c => c.id !== id);
      saveChats(next);
      if (activeChatId === id) {
        newChat();
      }
      return next;
    });
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    const userMsg: Msg = { id: safeId("u"), role: "user", content: text, createdAt: formatNow() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);

    try {
      const data = generateLocalReply({
        mode,
        messages: nextMessages.map(m => ({ role: m.role, content: m.content }))
      });

      const assistantMsg: Msg = { id: safeId("a"), role: "assistant", content: data.answer, createdAt: formatNow() };
      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);
      setCitations(data.citations || []);
      persistChat(finalMessages, mode);
    } catch (e: any) {
      const assistantMsg: Msg = {
        id: safeId("a"),
        role: "assistant",
        createdAt: formatNow(),
        content: `Sorry — I ran into an error.\n\n**${e?.message || "Unknown error"}**`
      };
      const finalMessages = [...nextMessages, assistantMsg];
      setMessages(finalMessages);
      persistChat(finalMessages, mode);
    } finally {
      setBusy(false);
    }
  }

  function exportActive() {
    const chat: StoredChat = activeChatId
      ? (chats.find(c => c.id === activeChatId) ?? { id: "temp", title: "Unsaved chat", createdAt: "-", updatedAt: "-", mode, messages })
      : { id: "temp", title: "Unsaved chat", createdAt: "-", updatedAt: "-", mode, messages };

    const md = toMarkdown(chat);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(chat.title || "islam-ai-chat").replace(/[^a-z0-9_-]+/gi, "_").slice(0, 40)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_360px] gap-4">
      {/* Sidebar */}
      <Card className="lg:sticky lg:top-6 h-fit">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="font-bold">Chats</div>
            <Button variant="outline" onClick={newChat}>New</Button>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => setMode("study")}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold border transition ${
                mode === "study"
                  ? "border-[rgba(var(--gold),0.65)] bg-[rgba(var(--card2),1)]"
                  : "border-[rgba(var(--border),1)] bg-[rgba(var(--card),1)] hover:bg-[rgba(var(--card2),1)]"
              }`}
            >Study</button>
            <button
              onClick={() => setMode("summary")}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold border transition ${
                mode === "summary"
                  ? "border-[rgba(var(--emerald),0.65)] bg-[rgba(var(--card2),1)]"
                  : "border-[rgba(var(--border),1)] bg-[rgba(var(--card),1)] hover:bg-[rgba(var(--card2),1)]"
              }`}
            >Summary</button>
            <button
              onClick={() => setMode("quick")}
              className={`flex-1 rounded-xl px-3 py-2 text-xs font-semibold border transition ${
                mode === "quick"
                  ? "border-[rgba(var(--sky),0.65)] bg-[rgba(var(--card2),1)]"
                  : "border-[rgba(var(--border),1)] bg-[rgba(var(--card),1)] hover:bg-[rgba(var(--card2),1)]"
              }`}
            >Quick</button>
          </div>

          <div className="mt-4 space-y-2 max-h-[55vh] overflow-auto pr-1">
            {chats.length === 0 ? (
              <div className="text-sm text-[rgb(var(--muted))]">No saved chats yet.</div>
            ) : chats.map(c => (
              <div
                key={c.id}
                className={`group rounded-xl border p-3 cursor-pointer transition ${
                  activeChatId === c.id
                    ? "border-[rgba(var(--gold),0.6)] bg-[rgba(var(--card2),1)]"
                    : "border-[rgba(var(--border),1)] hover:bg-[rgba(var(--card2),1)]"
                }`}
                onClick={() => loadChat(c.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold line-clamp-2">{c.title}</div>
                    <div className="mt-1 text-xs text-[rgb(var(--muted))]">{c.updatedAt}</div>
                    <div className="mt-2"><Badge>{c.mode}</Badge></div>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition p-2 rounded-lg hover:bg-[rgba(var(--card2),1)]"
                    onClick={(e) => { e.stopPropagation(); deleteChat(c.id); }}
                    aria-label="Delete chat"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-xs text-[rgb(var(--muted))] leading-relaxed">
            <div className="font-semibold text-[rgb(var(--fg))]">Disclaimer</div>
            Islam AI is for learning & organization, not a substitute for qualified scholars (fatwa depends on context).
          </div>
        </CardContent>
      </Card>

      {/* Chat */}
      <Card>
        <div ref={listRef} className="h-[65vh] overflow-auto p-5 space-y-4">
          {messages.map(m => (
            <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  m.role === "user"
                    ? "max-w-[80%] rounded-2xl px-4 py-3 text-[rgb(var(--bg))] bg-[linear-gradient(135deg,rgba(var(--emerald),0.95),rgba(var(--gold),1),rgba(var(--gold2),0.95))]"
                    : "max-w-[80%] rounded-2xl px-4 py-3 bg-[rgba(var(--card2),0.8)] border border-[rgba(var(--border),1)]"
                }
              >
                <div className="text-xs opacity-70">{m.createdAt}</div>
                <div className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
              </div>
            </div>
          ))}
          {busy ? (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-2xl bg-[rgba(var(--card2),0.8)] border border-[rgba(var(--border),1)] px-4 py-3">
                <div className="text-xs opacity-70">Thinking…</div>
                <div className="mt-2 h-2 w-40 rounded bg-[rgba(var(--border),1)] animate-pulse" />
              </div>
            </div>
          ) : null}
        </div>

        <div className="border-t border-[rgba(var(--border),1)] p-4">
          <div className="flex gap-2">
            <textarea
              className="flex-1 min-h-[44px] max-h-[140px] resize-y rounded-xl border border-[rgba(var(--border),1)] bg-[rgba(var(--card),1)] p-3 text-sm outline-none focus:ring-2 focus:ring-[rgba(var(--gold),0.35)]"
              placeholder="Ask a question… (e.g., ‘Explain intentions in Islam’)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button onClick={send} disabled={busy || !input.trim()}>Send</Button>
              <Button variant="outline" onClick={exportActive}><Download size={16} className="mr-2" />Export</Button>
            </div>
          </div>
          <div className="mt-2 text-xs text-[rgb(var(--muted))]">
            Tip: press Enter to send, Shift+Enter for new line. Answers include citation markers like [1].
          </div>
        </div>
      </Card>

      {/* Sources */}
      <Card className="lg:sticky lg:top-6 h-fit">
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="font-bold">Sources</div>
            <Badge>local RAG</Badge>
          </div>
          <div className="mt-3">
            <SourceList citations={citations} />
          </div>
          <div className="mt-4 text-xs text-black/50">
            Want stronger citations? Add passages into <code className="px-1 py-0.5 rounded bg-[rgba(var(--card2),1)]">data/knowledge.json</code>.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
