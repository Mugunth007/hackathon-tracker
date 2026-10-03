"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Bot, Sparkles, User, Loader2, ArrowRight } from "lucide-react";
import { Hackathon, ChatMessage } from "@/types/hackathon";
import confetti from "canvas-confetti";

interface ChatWidgetProps {
  currentHackathons: Hackathon[];
  onAddHackathon: (hackathon: Omit<Hackathon, "id">) => Promise<Hackathon>;
  onDeleteHackathon: (id: string) => Promise<boolean>;
  onOpenSettings: () => void;
}

export function ChatWidget({
  currentHackathons,
  onAddHackathon,
  onDeleteHackathon,
  onOpenSettings,
}: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: "👋 Hey there! Tell me what hackathons you're participating in (e.g., 'I am participating in HackIndia starting Oct 20 to Oct 22') and I'll automatically parse and add it to your radar!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const geminiApiKey =
        typeof window !== "undefined"
          ? localStorage.getItem("ht_gemini_api_key") || ""
          : "";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (geminiApiKey) {
        headers["x-gemini-key"] = geminiApiKey;
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          message: messageContent,
          currentHackathons,
        }),
      });

      const data = await res.json();

      let actionDetail: ChatMessage["actionTaken"] = undefined;

      // Handle structured actions
      if (data.action === "add_hackathon" && data.hackathon?.title) {
        const h = data.hackathon;
        await onAddHackathon({
          title: h.title,
          startDate: h.startDate,
          endDate: h.endDate,
          websiteUrl: h.websiteUrl || undefined,
          platform: h.platform || "Other",
          description: h.description || undefined,
          tags: h.tags || [],
          teamName: h.teamName || undefined,
          prizePool: h.prizePool || undefined,
          status: "upcoming",
        });

        confetti({
          particleCount: 70,
          spread: 60,
          origin: { x: 0.85, y: 0.7 },
        });

        actionDetail = {
          type: "add",
          hackathonTitle: h.title,
        };
      } else if (data.action === "delete_hackathon" && data.targetHackathonId) {
        await onDeleteHackathon(data.targetHackathonId);
        actionDetail = {
          type: "delete",
          hackathonTitle: "Hackathon removed",
        };
      }

      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "assistant",
        text: data.reply || "Done!",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        actionTaken: actionDetail,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: "assistant",
          text: `⚠️ Error: ${err.message || "Failed to connect to AI assistant."}`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "I'm joining HackNITR starting this Friday Nov 10 to Nov 12",
    "What is my next upcoming hackathon deadline?",
    "Add Solana Summer Camp from Nov 1 to Nov 5, Devpost",
  ];

  return (
    <>
      {/* Floating Toggle Button */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 text-white shadow-[0_0_30px_rgba(124,58,237,0.5)] hover:shadow-[0_0_40px_rgba(124,58,237,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 border border-white/20"
          >
            <div className="relative">
              <Bot className="w-5 h-5 text-white animate-pulse" />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-neutral-950" />
            </div>
            <span className="text-xs font-semibold tracking-wide">Aether AI Assistant</span>
          </button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm sm:max-w-md h-[550px] max-h-[85vh] rounded-2xl border border-white/10 bg-[#0f0f14]/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Top Ambient Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-violet-600/25 blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-4 border-b border-white/[0.08] bg-neutral-950/40">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  Aether AI
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Gemini 2.5
                  </span>
                </h3>
                <p className="text-[11px] text-neutral-400">Natural language hackathon parser</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "assistant" && (
                  <div className="w-6 h-6 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-violet-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed shadow-sm ${
                    msg.sender === "user"
                      ? "bg-violet-600 text-white rounded-tr-xs"
                      : "bg-neutral-900/90 text-neutral-200 border border-white/[0.06] rounded-tl-xs"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Action badge if hackathon added/deleted */}
                  {msg.actionTaken && (
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-emerald-400">
                      <Sparkles className="w-3 h-3" />
                      <span>
                        {msg.actionTaken.type === "add" ? "Added to your radar:" : "Removed:"}{" "}
                        <strong>{msg.actionTaken.hackathonTitle}</strong>
                      </span>
                    </div>
                  )}

                  <span
                    className={`block text-[10px] mt-1 ${
                      msg.sender === "user" ? "text-violet-200/70 text-right" : "text-neutral-500"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-neutral-400">
                <div className="w-6 h-6 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div className="bg-neutral-900/90 border border-white/[0.06] px-3.5 py-2 rounded-2xl rounded-tl-xs flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />
                  <span className="text-[11px] text-neutral-400">Parsing hackathon details...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Chips */}
          <div className="px-3 py-2 bg-neutral-950/30 border-t border-white/[0.04] overflow-x-auto no-scrollbar flex items-center gap-1.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="whitespace-nowrap shrink-0 text-[10px] px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-neutral-300 hover:text-white hover:border-violet-500/50 hover:bg-violet-500/10 transition-colors disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-white/[0.08] bg-neutral-950/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Mention a hackathon or ask a question..."
                disabled={isLoading}
                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 transition-colors"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="p-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white shadow-md shadow-violet-600/30 disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
