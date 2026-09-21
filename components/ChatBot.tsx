"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { fallback, greeting, matchTopic, starters, topic, type ChatLink } from "@/lib/chat-topics";
import styles from "./ChatBot.module.css";

// Site-wide question-and-answer panel. It is scripted, not generative: answers come from lib/chat-topics.ts, which
// only restates what the site says, and anything it cannot answer is passed to the phone number and enquiry form.
type Message = { id: number; from: "bot" | "visitor"; text: string[]; links?: ChatLink[] };

const REPLY_DELAY = 550;

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ id: 0, from: "bot", text: greeting }]);
  const [suggestions, setSuggestions] = useState<string[]>(starters);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");
  const nextId = useRef(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);

  // The launcher gives way to the panel (which has its own close button) and takes focus back when it returns.
  const wasOpen = useRef(false);
  useEffect(() => {
    if (wasOpen.current && !open) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    // Typing focus only where it will not throw up an on-screen keyboard over the questions.
    if (matchMedia("(pointer: fine)").matches) inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    const log = logRef.current;
    // The opening view starts at the greeting; after that, follow the conversation.
    if (!log || messages.length === 1) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    log.scrollTo({ top: log.scrollHeight, behavior: reduced ? "auto" : "smooth" });
  }, [messages, typing, open]);

  const push = (m: Omit<Message, "id">) => setMessages((prev) => [...prev, { ...m, id: nextId.current++ }]);

  const ask = (text: string, topicId?: string) => {
    if (typing) return;
    const found = topicId ? topic(topicId) : matchTopic(text);
    push({ from: "visitor", text: [text] });
    setSuggestions([]);
    setTyping(true);
    timer.current = setTimeout(() => {
      const reply = found ?? fallback;
      push({ from: "bot", text: reply.answer, links: reply.links });
      setSuggestions(reply.next);
      setTyping(false);
    }, REPLY_DELAY);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setDraft("");
    ask(text);
  };

  return (
    <div className={styles.root}>
      {open && (
        <section id="chat-panel" className={styles.panel} role="dialog" aria-label="Questions about Mira Living">
          <header className={styles.head}>
            <div>
              <span className={styles.kicker}>
                <span className="live-dot" />
                Furtado Property
              </span>
              <h2 className={styles.title}>Ask about Mira Living</h2>
            </div>
            <button type="button" className={styles.close} aria-label="Close chat" onClick={() => setOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div ref={logRef} className={styles.log} role="log" aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={m.from === "bot" ? styles.bot : styles.visitor}>
                {m.text.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                {m.links && (
                  <div className={styles.links}>
                    {m.links.map((l) =>
                      l.href.startsWith("/") ? (
                        // Closes the panel so the page the link leads to is not covered.
                        <Link key={l.label} href={l.href} className={styles.link} onClick={() => setOpen(false)}>
                          {l.label} <span aria-hidden="true">→</span>
                        </Link>
                      ) : (
                        <a key={l.label} href={l.href} className={styles.link}>
                          {l.label}
                        </a>
                      ),
                    )}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className={`${styles.bot} ${styles.typing}`} aria-label="Replying">
                <span />
                <span />
                <span />
              </div>
            )}
            {suggestions.length > 0 && (
              <div className={styles.chips}>
                <span className={styles.chipsLabel}>
                  {messages.length > 1 ? "Related questions" : "Popular questions"}
                </span>
                {suggestions.map((id) => (
                  <button key={id} type="button" className={styles.chip} onClick={() => ask(topic(id).question, id)}>
                    {topic(id).question}
                  </button>
                ))}
              </div>
            )}
          </div>

          <form className={styles.form} onSubmit={onSubmit}>
            <label htmlFor="chat-input" className={styles.srOnly}>
              Type your question
            </label>
            <input
              id="chat-input"
              ref={inputRef}
              className={styles.input}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your question"
              autoComplete="off"
              maxLength={200}
              enterKeyHint="send"
            />
            <button type="submit" className={styles.send} aria-label="Send question" disabled={!draft.trim() || typing}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M2 8h11M9 3.5L13.5 8 9 12.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
        </section>
      )}

      {!open && (
        <button
          ref={launcherRef}
          type="button"
          className={styles.launcher}
          aria-expanded={false}
          aria-controls="chat-panel"
          onClick={() => setOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
            <path
              d="M3 3.5h12a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H8.5L5 15.5v-3H3a1 1 0 0 1-1-1v-7a1 1 0 0 1 1-1z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinejoin="round"
            />
          </svg>
          <span>Ask a question</span>
        </button>
      )}
    </div>
  );
}
