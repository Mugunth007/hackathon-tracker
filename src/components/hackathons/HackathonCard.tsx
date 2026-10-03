"use client";

import React, { useState } from "react";
import { Hackathon } from "@/types/hackathon";
import { formatHackathonDate, getCountdownBadge } from "@/lib/utils";
import { StatusBadge, PlatformBadge, CountdownPill } from "@/components/ui/Badge";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import {
  Calendar,
  ExternalLink,
  Trash2,
  Trophy,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";

interface HackathonCardProps {
  hackathon: Hackathon;
  onDelete: (id: string) => void;
  onStatusChange?: (id: string, status: Hackathon["status"]) => void;
}

export function HackathonCard({ hackathon, onDelete, onStatusChange }: HackathonCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const countdown = getCountdownBadge(hackathon.startDate, hackathon.endDate);

  const handleDelete = async () => {
    if (confirm(`Remove "${hackathon.title}" from your radar?`)) {
      setIsDeleting(true);
      await onDelete(hackathon.id);
      setIsDeleting(false);
    }
  };

  return (
    <SpotlightCard className="p-5 flex flex-col justify-between h-full group border-white/[0.08] hover:border-white/[0.2]">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={hackathon.status} />
            <CountdownPill label={countdown.label} tone={countdown.tone} />
          </div>
          <PlatformBadge platform={hackathon.platform} />
        </div>

        {/* Title & External Link */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
            {hackathon.title}
          </h3>
          {hackathon.websiteUrl && (
            <a
              href={hackathon.websiteUrl.startsWith("http") ? hackathon.websiteUrl : `https://${hackathon.websiteUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
              title="Open Website"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Date details */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-3">
          <Calendar className="w-3.5 h-3.5 text-neutral-500" />
          <span>
            {formatHackathonDate(hackathon.startDate)} – {formatHackathonDate(hackathon.endDate)}
          </span>
        </div>

        {/* Description */}
        {hackathon.description && (
          <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed mb-4">
            {hackathon.description}
          </p>
        )}

        {/* Extra info: Team and Prize */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {hackathon.teamName && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300">
              <Users className="w-3 h-3 text-cyan-400" />
              {hackathon.teamName}
            </span>
          )}
          {hackathon.prizePool && (
            <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-amber-300">
              <Trophy className="w-3 h-3 text-amber-400" />
              {hackathon.prizePool}
            </span>
          )}
        </div>

        {/* Tags */}
        {hackathon.tags && hackathon.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {hackathon.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          {onStatusChange && (
            <select
              value={hackathon.status}
              onChange={(e) => onStatusChange(hackathon.id, e.target.value as Hackathon["status"])}
              className="bg-neutral-900/90 text-neutral-400 text-[11px] rounded-md px-2 py-1 border border-neutral-800 hover:border-neutral-700 focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Live (Ongoing)</option>
              <option value="completed">Completed</option>
            </select>
          )}
        </div>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-neutral-500 hover:text-rose-400 transition-colors p-1.5 rounded-md hover:bg-rose-500/10"
          title="Delete hackathon"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </SpotlightCard>
  );
}
