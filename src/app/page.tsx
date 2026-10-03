"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Hackathon, HackathonStatus } from "@/types/hackathon";
import {
  getHackathons,
  addHackathon as apiAddHackathon,
  deleteHackathon as apiDeleteHackathon,
  updateHackathon as apiUpdateHackathon,
} from "@/lib/storage";
import { getSupabaseClient, mapRowToHackathon } from "@/lib/supabase";
import { BackgroundGrid } from "@/components/ui/BackgroundGrid";
import { HackathonCard } from "@/components/hackathons/HackathonCard";
import { AddHackathonModal } from "@/components/hackathons/AddHackathonModal";
import { SettingsModal } from "@/components/hackathons/SettingsModal";
import { ChatWidget } from "@/components/chat/ChatWidget";
import {
  Plus,
  Search,
  Sparkles,
  Settings,
  Database,
  Radio,
  Flame,
  CalendarDays,
  CheckCircle2,
  Filter,
} from "lucide-react";

export default function HomePage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | HackathonStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isRealtimeActive, setIsRealtimeActive] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load initial hackathons
  const loadData = async () => {
    try {
      const data = await getHackathons();
      setHackathons(data);
    } catch (e) {
      console.error("Failed to load hackathons:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Setup Supabase Realtime Subscription if client is available
    const supabase = getSupabaseClient();
    if (supabase) {
      setIsRealtimeActive(true);
      const channel = supabase
        .channel("hackathons-radar-realtime")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "hackathons" },
          (payload) => {
            console.log("Realtime event received:", payload);
            if (payload.eventType === "INSERT") {
              const newHack = mapRowToHackathon(payload.new);
              setHackathons((prev) => {
                if (prev.some((h) => h.id === newHack.id)) return prev;
                return [newHack, ...prev];
              });
            } else if (payload.eventType === "DELETE") {
              const deletedId = String(payload.old.id);
              setHackathons((prev) => prev.filter((h) => h.id !== deletedId));
            } else if (payload.eventType === "UPDATE") {
              const updated = mapRowToHackathon(payload.new);
              setHackathons((prev) =>
                prev.map((h) => (h.id === updated.id ? updated : h))
              );
            }
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            setIsRealtimeActive(true);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setIsRealtimeActive(false);
    }
  }, []);

  // Handlers
  const handleAddHackathon = async (newH: Omit<Hackathon, "id">): Promise<Hackathon> => {
    const created = await apiAddHackathon(newH);
    setHackathons((prev) => {
      if (prev.some((h) => h.id === created.id)) return prev;
      return [created, ...prev];
    });
    return created;
  };

  const handleDeleteHackathon = async (id: string): Promise<boolean> => {
    const success = await apiDeleteHackathon(id);
    if (success) {
      setHackathons((prev) => prev.filter((h) => h.id !== id));
    }
    return success;
  };

  const handleStatusChange = async (id: string, status: HackathonStatus) => {
    const updated = await apiUpdateHackathon(id, { status });
    if (updated) {
      setHackathons((prev) =>
        prev.map((h) => (h.id === id ? { ...h, status } : h))
      );
    }
  };

  // Stats
  const stats = useMemo(() => {
    const ongoing = hackathons.filter((h) => h.status === "ongoing").length;
    const upcoming = hackathons.filter((h) => h.status === "upcoming").length;
    const completed = hackathons.filter((h) => h.status === "completed").length;
    return { total: hackathons.length, ongoing, upcoming, completed };
  }, [hackathons]);

  // Filter & Search
  const filteredHackathons = useMemo(() => {
    return hackathons.filter((h) => {
      // Tab filter
      if (activeTab !== "all" && h.status !== activeTab) return false;

      // Platform filter
      if (selectedPlatform !== "all" && h.platform !== selectedPlatform) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = h.title.toLowerCase().includes(query);
        const matchesDesc = h.description?.toLowerCase().includes(query);
        const matchesPlatform = h.platform?.toLowerCase().includes(query);
        const matchesTags = h.tags?.some((t) => t.toLowerCase().includes(query));
        const matchesTeam = h.teamName?.toLowerCase().includes(query);
        return matchesTitle || matchesDesc || matchesPlatform || matchesTags || matchesTeam;
      }

      return true;
    });
  }, [hackathons, activeTab, selectedPlatform, searchQuery]);

  return (
    <main className="relative min-h-screen pb-24 text-neutral-100">
      <BackgroundGrid />

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-8">
        {/* Navigation Bar */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-800 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)] border border-white/20">
              <Radio className="w-5 h-5 animate-pulse text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white font-sans">
                  AETHER
                </h1>
                <span className="text-[10px] tracking-widest font-mono uppercase px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  Radar v2.0
                </span>
              </div>
              <p className="text-xs text-neutral-400">Personal Hackathon Command Center</p>
            </div>
          </div>

          {/* Action buttons & Connection state */}
          <div className="flex items-center gap-2.5">
            {/* Supabase status badge */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-white/20 transition-all text-xs"
              title="Click to configure Supabase Realtime DB"
            >
              <Database className="w-3.5 h-3.5 text-neutral-400" />
              <span className="text-neutral-300">
                {isRealtimeActive ? "Supabase Live" : "Local DB"}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isRealtimeActive ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-amber-400"
                }`}
              />
            </button>

            {/* Settings button */}
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-neutral-400 hover:text-white hover:border-white/20 transition-colors"
              title="Database & API Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Quick Add Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(124,58,237,0.35)] transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Hackathon</span>
            </button>
          </div>
        </header>

        {/* Hero Section & Stats */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Total */}
          <div className="p-4 rounded-2xl bg-[#121217]/60 border border-white/[0.08] backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Total Tracked</span>
              <CalendarDays className="w-4 h-4 text-neutral-500" />
            </div>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
          </div>

          {/* Ongoing */}
          <div className="p-4 rounded-2xl bg-[#121217]/60 border border-emerald-500/20 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                Live Now
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-300">{stats.ongoing}</div>
          </div>

          {/* Upcoming */}
          <div className="p-4 rounded-2xl bg-[#121217]/60 border border-cyan-500/20 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/10 blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between text-xs text-cyan-400 mb-1">
              <span className="font-medium">Upcoming</span>
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-cyan-300">{stats.upcoming}</div>
          </div>

          {/* Completed */}
          <div className="p-4 rounded-2xl bg-[#121217]/60 border border-white/[0.08] backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
              <span>Completed</span>
              <CheckCircle2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-neutral-300">{stats.completed}</div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mt-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-neutral-900/80 border border-white/[0.08] overflow-x-auto no-scrollbar">
            {(
              [
                { id: "all", label: "All Events" },
                { id: "ongoing", label: "Live Now" },
                { id: "upcoming", label: "Upcoming" },
                { id: "completed", label: "Completed" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-violet-600 text-white shadow-sm"
                    : "text-neutral-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search bar & Platform dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events, tags, teams..."
                className="w-full bg-[#121217]/70 border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 transition-colors"
              />
            </div>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="bg-[#121217]/70 border border-white/[0.08] text-neutral-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-violet-500/80 transition-colors"
            >
              <option value="all">All Platforms</option>
              <option value="Devpost">Devpost</option>
              <option value="Devfolio">Devfolio</option>
              <option value="Unstop">Unstop</option>
              <option value="MLH">MLH</option>
              <option value="DoraHacks">DoraHacks</option>
              <option value="Kaggle">Kaggle</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Hackathon Cards Grid */}
        <div className="mt-6">
          {loading ? (
            <div className="text-center py-20 text-neutral-500 text-xs">
              Loading your hackathon radar...
            </div>
          ) : filteredHackathons.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-neutral-950/40">
              <div className="w-12 h-12 rounded-2xl bg-violet-600/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1">No hackathons found</h3>
              <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
                Tell the Gemini AI Chatbot in the bottom-right or click "Add Hackathon" to add your first event!
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 transition-colors shadow-lg shadow-violet-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Hackathon</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredHackathons.map((h) => (
                <HackathonCard
                  key={h.id}
                  hackathon={h}
                  onDelete={handleDeleteHackathon}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddHackathonModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddHackathon}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSave={() => {
          loadData();
          const client = getSupabaseClient();
          setIsRealtimeActive(!!client);
        }}
      />

      {/* Floating AI Chatbot */}
      <ChatWidget
        currentHackathons={hackathons}
        onAddHackathon={handleAddHackathon}
        onDeleteHackathon={handleDeleteHackathon}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
      />
    </main>
  );
}
