export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  profile_url?: string; // Add this (optional)
  status?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  timestamp: string;
  read:boolean;
}

// In your types.ts file
export interface Chat {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  label?: string;
  profileUrl?: string; // Add this line
  unreadCount: number;
}