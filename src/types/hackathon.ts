export type HackathonStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Hackathon {
  id: string;
  title: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  websiteUrl?: string;
  platform?: string; // e.g. Devpost, Devfolio, Unstop, MLH, DoraHacks, Other
  status: HackathonStatus;
  description?: string;
  tags?: string[];
  teamName?: string;
  prizePool?: string;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  actionTaken?: {
    type: 'add' | 'delete';
    hackathonTitle: string;
  };
}
