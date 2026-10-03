import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Hackathon, HackathonStatus } from "@/types/hackathon";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function computeHackathonStatus(startDateStr: string, endDateStr: string): HackathonStatus {
  try {
    const now = new Date();
    // Normalize to date comparison (midnight local time)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "upcoming";
    }

    const startVal = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
    // End date covers the full day up to 23:59:59
    const endVal = new Date(end.getFullYear(), end.getMonth(), end.getDate(), 23, 59, 59).getTime();

    if (today < startVal) {
      return "upcoming";
    } else if (today <= endVal) {
      return "ongoing";
    } else {
      return "completed";
    }
  } catch {
    return "upcoming";
  }
}

export function formatHackathonDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export function getCountdownBadge(startDateStr: string, endDateStr: string): { label: string; tone: "blue" | "green" | "purple" | "neutral" } {
  try {
    const now = new Date().getTime();
    const start = new Date(startDateStr).getTime();
    const end = new Date(endDateStr + "T23:59:59").getTime();

    if (isNaN(start) || isNaN(end)) {
      return { label: "Date pending", tone: "neutral" };
    }

    const msUntilStart = start - now;
    const msUntilEnd = end - now;

    if (msUntilStart > 0) {
      const days = Math.ceil(msUntilStart / (1000 * 60 * 60 * 24));
      if (days === 1) return { label: "Starts tomorrow", tone: "blue" };
      return { label: `Starts in ${days} days`, tone: "blue" };
    } else if (msUntilEnd > 0) {
      const hours = Math.ceil(msUntilEnd / (1000 * 60 * 60));
      if (hours < 24) return { label: `Ends in ${hours}h`, tone: "green" };
      const days = Math.ceil(msUntilEnd / (1000 * 60 * 60 * 24));
      return { label: `Ends in ${days} days`, tone: "green" };
    } else {
      return { label: "Finished", tone: "purple" };
    }
  } catch {
    return { label: "Upcoming", tone: "blue" };
  }
}
