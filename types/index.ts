// VibeSphere Unique Terminology System
// Videos = "Pulses" (short-form content)
// Reels = "Waves" (trending content)
// Posts = "Vibes" (general content)
// Likes = "Resonance" 
// Comments = "Echoes"
// Shares = "Ripples"
// Followers = "Tribe"
// Following = "Vibing With"

export interface User {
  uid: string;
  username: string;
  displayName: string;
  email: string;
  photoURL?: string;
  bio?: string;
  tribe: string[]; // followers
  vibingWith: string[]; // following
  favorites: string[]; // favorite pulse IDs
  resonanceCount: number; // total likes received
  createdAt: Date;
  isOnline?: boolean;
}

export interface Pulse {
  id: string;
  userId: string;
  username: string;
  userPhoto?: string;
  videoUrl: string;
  thumbnailUrl?: string;
  caption: string;
  tags: string[];
  resonance: number; // likes
  resonatedBy: string[]; // user IDs who liked
  echoes: Echo[]; // comments
  ripples: number; // shares
  views: number;
  duration: number;
  createdAt: Date;
  isWave?: boolean; // trending status
}

export interface Wave extends Pulse {
  trendingScore: number;
  isWave: true;
}

export interface Vibe {
  id: string;
  userId: string;
  username: string;
  userPhoto?: string;
  content: string;
  mediaUrls?: string[];
  resonance: number;
  echoes: Echo[];
  ripples: number;
  createdAt: Date;
}

export interface Echo {
  id: string;
  userId: string;
  username: string;
  userPhoto?: string;
  content: string;
  createdAt: Date;
  resonance: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
  isRead: boolean;
  createdAt: Date;
  type: 'text' | 'image' | 'video' | 'pulse';
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage: Message;
  unreadCount: number;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'resonance' | 'echo' | 'ripple' | 'tribe' | 'message';
  fromUserId: string;
  fromUsername: string;
  fromUserPhoto?: string;
  content: string;
  pulseId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface ChatBotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}