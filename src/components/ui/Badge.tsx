import React from "react";
import { HackathonStatus } from "@/types/hackathon";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: HackathonStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  switch (status) {
    case "ongoing":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.15)]",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 -ml-3 inline-block" />
          Live Now
        </span>
      );
    case "upcoming":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 shadow-[0_0_10px_rgba(6,182,212,0.1)]",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
          Upcoming
        </span>
      );
    case "completed":
      return (
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-800/80 text-zinc-400 border border-zinc-700/50",
            className
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 inline-block" />
          Completed
        </span>
      );
  }
}

export function PlatformBadge({ platform }: { platform?: string }) {
  if (!platform) return null;

  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/[0.04] text-neutral-300 border border-white/[0.08] hover:border-white/[0.15] transition-colors">
      {platform}
    </span>
  );
}

export function CountdownPill({ label, tone }: { label: string; tone: "blue" | "green" | "purple" | "neutral" }) {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    neutral: "bg-neutral-800/60 text-neutral-400 border-neutral-700/40",
  };

  return (
    <span className={cn("text-[11px] font-medium px-2 py-0.5 rounded-full border", colorMap[tone])}>
      {label}
    </span>
  );
}
