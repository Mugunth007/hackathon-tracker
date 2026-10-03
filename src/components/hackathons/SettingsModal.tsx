"use client";

import React, { useState, useEffect } from "react";
import { X, Settings, Database, Key, CheckCircle, AlertCircle, Copy, Check } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [supabaseUrl, setSupabaseUrl] = useState("");
  const [supabaseAnonKey, setSupabaseAnonKey] = useState("");
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setSupabaseUrl(localStorage.getItem("ht_supabase_url") || "");
      setSupabaseAnonKey(localStorage.getItem("ht_supabase_anon_key") || "");
      setGeminiApiKey(localStorage.getItem("ht_gemini_api_key") || "");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (typeof window !== "undefined") {
      if (supabaseUrl.trim()) {
        localStorage.setItem("ht_supabase_url", supabaseUrl.trim());
      } else {
        localStorage.removeItem("ht_supabase_url");
      }

      if (supabaseAnonKey.trim()) {
        localStorage.setItem("ht_supabase_anon_key", supabaseAnonKey.trim());
      } else {
        localStorage.removeItem("ht_supabase_anon_key");
      }

      if (geminiApiKey.trim()) {
        localStorage.setItem("ht_gemini_api_key", geminiApiKey.trim());
      } else {
        localStorage.removeItem("ht_gemini_api_key");
      }
    }

    onSave();
    onClose();
  };

  const testSupabaseConnection = async () => {
    setTestStatus("testing");
    setErrorMessage("");

    // Temporarily save to test
    localStorage.setItem("ht_supabase_url", supabaseUrl.trim());
    localStorage.setItem("ht_supabase_anon_key", supabaseAnonKey.trim());

    try {
      const client = getSupabaseClient();
      if (!client) {
        setTestStatus("error");
        setErrorMessage("Please enter both Supabase URL and Anon Key.");
        return;
      }

      const { data, error } = await client.from("hackathons").select("id").limit(1);
      if (error) {
        setTestStatus("error");
        setErrorMessage(`Connected to Supabase, but query failed: ${error.message}. Make sure you ran the SQL schema!`);
      } else {
        setTestStatus("success");
      }
    } catch (e: any) {
      setTestStatus("error");
      setErrorMessage(e.message || "Failed to reach Supabase project.");
    }
  };

  const copySqlSchema = () => {
    const sql = `-- Run in Supabase SQL Editor:
create table if not exists public.hackathons (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  start_date text not null,
  end_date text not null,
  website_url text,
  platform text default 'Other',
  status text default 'upcoming',
  description text,
  tags text[] default '{}',
  team_name text,
  prize_pool text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.hackathons enable row level security;
create policy "Allow all" on public.hackathons for all using (true) with check (true);
alter publication supabase_realtime add table public.hackathons;`;

    navigator.clipboard.writeText(sql);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#101014] p-6 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">Database & API Settings</h2>
              <p className="text-xs text-neutral-400">Configure Supabase Realtime & Gemini API Key</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-xs">
          {/* Supabase Section */}
          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white font-medium">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Supabase Realtime Database</span>
              </div>
              <button
                onClick={copySqlSchema}
                className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-violet-400 transition-colors"
                title="Copy SQL Schema for Supabase"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {isCopied ? "SQL Copied!" : "Copy SQL Schema"}
              </button>
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Project URL</label>
              <input
                type="text"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xyzcompany.supabase.co"
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-neutral-400 mb-1">Anon Public Key</label>
              <input
                type="password"
                value={supabaseAnonKey}
                onChange={(e) => setSupabaseAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={testSupabaseConnection}
                disabled={testStatus === "testing" || !supabaseUrl}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium disabled:opacity-40"
              >
                {testStatus === "testing" ? "Testing connection..." : "⚡ Test Supabase Connection"}
              </button>

              {testStatus === "success" && (
                <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                  <CheckCircle className="w-3.5 h-3.5" /> Connected & Ready!
                </span>
              )}
            </div>

            {testStatus === "error" && (
              <p className="text-[11px] text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Gemini API Key Section */}
          <div className="p-3.5 rounded-xl bg-neutral-900/60 border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 text-white font-medium">
              <Key className="w-4 h-4 text-violet-400" />
              <span>Gemini API Key</span>
            </div>
            <p className="text-[11px] text-neutral-400">
              Used by the AI Assistant to understand natural language and parse hackathons. (Or set in{" "}
              <code className="text-violet-300">.env.local</code> as <code className="text-violet-300">GEMINI_API_KEY</code>).
            </p>
            <input
              type="password"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-white placeholder-neutral-600 focus:outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-md shadow-violet-600/30 transition-all"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
