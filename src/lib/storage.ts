import { Hackathon } from "@/types/hackathon";
import { getSupabaseClient, mapRowToHackathon, mapHackathonToRow } from "./supabase";
import { computeHackathonStatus } from "./utils";

const LOCAL_STORAGE_KEY = "hackathon_tracker_items_v1";

const SEED_HACKATHONS: Hackathon[] = [
  {
    id: "seed-1",
    title: "ETHGlobal Bangkok 2026",
    startDate: "2026-11-15",
    endDate: "2026-11-17",
    websiteUrl: "https://ethglobal.com/events/bangkok",
    platform: "Devpost",
    status: "upcoming",
    description: "Leading Web3 hackathon with tracks in DeFi, autonomous agents, and ZK proofs.",
    tags: ["Web3", "Ethereum", "AI Agents"],
    prizePool: "$375,000",
    teamName: "CipherNode",
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-2",
    title: "Google AI Gemini Developer Sprint",
    startDate: "2026-10-01",
    endDate: "2026-10-10",
    websiteUrl: "https://ai.google.dev",
    platform: "Devpost",
    status: "ongoing",
    description: "Building next-generation multimodal applications using Gemini 2.0 and agentic workflows.",
    tags: ["Gemini API", "AI", "Fullstack"],
    prizePool: "$100,000",
    teamName: "NeuroGravity",
    createdAt: new Date().toISOString(),
  },
  {
    id: "seed-3",
    title: "HackNITR 6.0",
    startDate: "2026-09-12",
    endDate: "2026-09-14",
    websiteUrl: "https://hacknitr.com",
    platform: "Devfolio",
    status: "completed",
    description: "One of the largest student-run hackathons in Eastern India.",
    tags: ["Open Innovation", "Cloud", "IoT"],
    prizePool: "₹500,000",
    teamName: "PixelPioneers",
    createdAt: new Date().toISOString(),
  },
];

export async function getHackathons(): Promise<Hackathon[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("hackathons")
        .select("*")
        .order("start_date", { ascending: true });

      if (!error && data) {
        return data.map(mapRowToHackathon);
      }
      console.warn("Supabase fetch failed or table empty, checking local fallback:", error);
    } catch (e) {
      console.error("Supabase connection error:", e);
    }
  }

  // Fallback to localStorage
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed: Hackathon[] = JSON.parse(stored);
        return parsed.map((h) => ({
          ...h,
          status: computeHackathonStatus(h.startDate, h.endDate),
        }));
      } else {
        // Seed default items
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(SEED_HACKATHONS));
        return SEED_HACKATHONS;
      }
    } catch (e) {
      console.error("Error reading localStorage:", e);
    }
  }

  return SEED_HACKATHONS;
}

export async function addHackathon(hackathon: Omit<Hackathon, "id">): Promise<Hackathon> {
  const id = `hack-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const fullItem: Hackathon = {
    ...hackathon,
    id,
    status: computeHackathonStatus(hackathon.startDate, hackathon.endDate),
    createdAt: new Date().toISOString(),
  };

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const payload = mapHackathonToRow(fullItem);
      const { data, error } = await supabase.from("hackathons").insert([payload]).select().single();
      if (!error && data) {
        return mapRowToHackathon(data);
      }
      console.error("Supabase insert error:", error);
    } catch (e) {
      console.error("Supabase exception:", e);
    }
  }

  // Local storage fallback
  if (typeof window !== "undefined") {
    try {
      const current = await getHackathons();
      const updated = [fullItem, ...current];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Local storage error:", e);
    }
  }

  return fullItem;
}

export async function deleteHackathon(id: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { error } = await supabase.from("hackathons").delete().eq("id", id);
      if (!error) return true;
      console.error("Supabase delete error:", error);
    } catch (e) {
      console.error("Supabase delete exception:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const current = await getHackathons();
      const updated = current.filter((h) => h.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (e) {
      console.error("Local storage delete error:", e);
      return false;
    }
  }

  return false;
}

export async function updateHackathon(id: string, updates: Partial<Hackathon>): Promise<Hackathon | null> {
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const rowUpdates = mapHackathonToRow(updates);
      delete rowUpdates.id; // Don't overwrite id
      const { data, error } = await supabase
        .from("hackathons")
        .update(rowUpdates)
        .eq("id", id)
        .select()
        .single();
      if (!error && data) {
        return mapRowToHackathon(data);
      }
      console.error("Supabase update error:", error);
    } catch (e) {
      console.error("Supabase update exception:", e);
    }
  }

  if (typeof window !== "undefined") {
    try {
      const current = await getHackathons();
      const index = current.findIndex((h) => h.id === id);
      if (index !== -1) {
        const updatedItem = {
          ...current[index],
          ...updates,
          status: computeHackathonStatus(
            updates.startDate || current[index].startDate,
            updates.endDate || current[index].endDate
          ),
        };
        current[index] = updatedItem;
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
        return updatedItem;
      }
    } catch (e) {
      console.error("Local storage update error:", e);
    }
  }

  return null;
}
