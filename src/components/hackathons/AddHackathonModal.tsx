"use client";

import React, { useState } from "react";
import { Hackathon } from "@/types/hackathon";
import { X, Sparkles, Calendar, Globe, Tag, Trophy, Users } from "lucide-react";
import confetti from "canvas-confetti";

interface AddHackathonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (hackathon: Omit<Hackathon, "id">) => Promise<any>;
}

export function AddHackathonModal({ isOpen, onClose, onAdd }: AddHackathonModalProps) {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [platform, setPlatform] = useState("Devpost");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [teamName, setTeamName] = useState("");
  const [prizePool, setPrizePool] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startDate || !endDate) return;

    setIsSubmitting(true);
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    await onAdd({
      title,
      startDate,
      endDate,
      websiteUrl: websiteUrl.trim() || undefined,
      platform,
      description: description.trim() || undefined,
      tags,
      teamName: teamName.trim() || undefined,
      prizePool: prizePool.trim() || undefined,
      status: "upcoming",
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
    });

    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#101014] p-6 shadow-2xl overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-32 bg-violet-600/20 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-semibold text-white">Add New Hackathon</h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white p-1 rounded-md hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Hackathon Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. ETHDenver 2026 or HackIndia"
              className="w-full rounded-xl bg-neutral-900/90 border border-neutral-800 px-3.5 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                Start Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl bg-neutral-900/90 border border-neutral-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500/80 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">
                End Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl bg-neutral-900/90 border border-neutral-800 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-violet-500/80 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full rounded-xl bg-neutral-900/90 border border-neutral-800 px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500/80 transition-colors"
              >
                <option value="Devpost">Devpost</option>
                <option value="Devfolio">Devfolio</option>
                <option value="Unstop">Unstop</option>
                <option value="MLH">Major League Hacking (MLH)</option>
                <option value="DoraHacks">DoraHacks</option>
                <option value="Kaggle">Kaggle</option>
                <option value="Other">Other / Independent</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Website URL</label>
              <input
                type="text"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="devpost.com/hackathon..."
                className="w-full rounded-xl bg-neutral-900/90 border border-neutral-800 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Team Name (Optional)</label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. QuantumHackers"
                className="w-full rounded-xl bg-neutral-900/90 border border-neutral-800 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-neutral-300 mb-1">Prize Pool (Optional)</label>
              <input
                type="text"
                value={prizePool}
                onChange={(e) => setPrizePool(e.target.value)}
                placeholder="e.g. $50,000"
                className="w-full rounded-xl bg-neutral-900/90 border border-neutral-800 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="AI, Web3, Solana, Healthcare"
              className="w-full rounded-xl bg-neutral-900/90 border border-neutral-800 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ideas, track focus, submission criteria..."
              className="w-full rounded-xl bg-neutral-900/90 border border-neutral-800 px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-violet-500/80 transition-colors resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative px-5 py-2 rounded-xl text-xs font-medium text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add to Radar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
