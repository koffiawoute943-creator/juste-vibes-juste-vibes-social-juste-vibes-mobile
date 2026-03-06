import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface User {
  id: string;
  username: string;
  email: string;
  bio: string;
  avatar: string;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  type: 'text' | 'image' | 'video' | 'music';
  content: string;
  media_url?: string;
  music_title?: string;
  music_artist?: string;
  likes: number;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: 'text' | 'image' | 'audio';
  created_at: string;
}

export interface MusicTrend {
  id: string;
  title: string;
  artist: string;
  genre: string;
  cover_url: string;
  audio_url: string;
}
