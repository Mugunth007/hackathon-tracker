# 🛰️ AETHER | Hackathon Radar & AI Assistant

A sleek personal hackathon tracking platform built with **Next.js 16**, **TypeScript**, **Tailwind CSS**, and **Inter** font, styled with an **Aceternity UI** dark aesthetic. Features **Supabase Realtime Database** synchronization and an **AI Chatbot** powered by **Google Gemini API** (`@google/genai`) to parse and track hackathons naturally.

---

## ⚡ Features

- **Aceternity UI Aesthetic**: Dark palette (`#09090b`), glowing borders, ambient gradients, interactive spotlight hover effects, and Inter typography.
- **AI Chatbot (Gemini 2.5)**: Just mention a hackathon naturally:
  > *"I am participating in HackIndia starting Oct 20 to Oct 22, website is hackindia.dev"*
  
  The AI assistant extracts the start date, end date, platform, tags, and automatically adds it to your radar with confetti!
- **Realtime Database (Supabase)**: Live synchronization across devices/tabs using Supabase `postgres_changes`.
- **Zero-Setup Local Storage Fallback**: Works immediately out of the box even before configuring Supabase.
- **Live Status & Countdown Timers**: Automatically detects if an event is *Live Now*, *Upcoming*, or *Completed* with dynamic countdowns ("Starts in 2 days", "Ends in 14h").
- **Settings Modal**: Easily enter your Supabase URL, Anon Key, and Gemini API Key right from the UI or via `.env.local`.

---

## 🚀 Quick Start

### 1. Install & Run
```bash
cd hackathon-tracker
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Setup (`.env.local`)

Create or edit `.env.local` in the project root:

```env
# Gemini API Key (get from: https://aistudio.google.com/app/apikey)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase Realtime Database (get from: https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

*(Note: You can also enter these keys directly in the app by clicking the **Settings (Gear icon)** in the top right!)*

---

## 🗄️ Supabase Realtime Setup

1. In your Supabase Dashboard, go to **SQL Editor** -> **New Query**.
2. Copy and paste the script below (also located at `supabase/schema.sql`):

```sql
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

create policy "Allow all actions"
on public.hackathons for all
using (true)
with check (true);

-- Enable Realtime
alter publication supabase_realtime add table public.hackathons;
```
3. Click **Run**.
4. In the app, click the **Settings (Gear icon)**, enter your Supabase URL & Anon Key, and click **Test Supabase Connection**. You are now live!
