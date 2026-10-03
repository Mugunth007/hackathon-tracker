import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Hackathon } from "@/types/hackathon";
import { computeHackathonStatus } from "./utils";

let cachedClient: SupabaseClient | null = null;
let lastUsedConfig = { url: "", anonKey: "" };

export function getSupabaseCredentials() {
  if (typeof window === "undefined") {
    return {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    };
  }

  const customUrl = localStorage.getItem("ht_supabase_url") || "";
  const customKey = localStorage.getItem("ht_supabase_anon_key") || "";

  const url = customUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anonKey = customKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return { url, anonKey };
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseCredentials();

  if (!url || !anonKey) {
    return null;
  }

  // Reuse client if config hasn't changed
  if (cachedClient && lastUsedConfig.url === url && lastUsedConfig.anonKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
    lastUsedConfig = { url, anonKey };
    return cachedClient;
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    return null;
  }
}

// Convert DB snake_case row to frontend Hackathon
export function mapRowToHackathon(row: any): Hackathon {
  const startDate = row.start_date || row.startDate || "";
  const endDate = row.end_date || row.endDate || "";
  
  return {
    id: String(row.id),
    title: row.title || "Untitled Hackathon",
    startDate,
    endDate,
    websiteUrl: row.website_url || row.websiteUrl || "",
    platform: row.platform || "Other",
    status: computeHackathonStatus(startDate, endDate),
    description: row.description || "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    teamName: row.team_name || row.teamName || "",
    prizePool: row.prize_pool || row.prizePool || "",
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
  };
}

// Convert frontend Hackathon to DB snake_case payload
export function mapHackathonToRow(hackathon: Partial<Hackathon>): Record<string, any> {
  const row: Record<string, any> = {
    title: hackathon.title,
    start_date: hackathon.startDate,
    end_date: hackathon.endDate,
    website_url: hackathon.websiteUrl || null,
    platform: hackathon.platform || "Other",
    status: hackathon.status || "upcoming",
    description: hackathon.description || "",
    tags: hackathon.tags || [],
    team_name: hackathon.teamName || null,
    prize_pool: hackathon.prizePool || null,
  };

  if (hackathon.id) {
    row.id = hackathon.id;
  }

  return row;
}
