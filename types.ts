import React from 'react';

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  description: string;
  category: 'events' | 'projects' | 'news';
  imageUrl: string;
  status: 'published' | 'draft';
}

export interface Announcement {
  id: number;
  title: string;
  date: string;
  description: string;
  priority: 'high' | 'normal';
  imageUrl: string;
}

export interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  read: boolean;
}

export interface StatCard {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

export interface MediaItem {
  id: number;
  type: 'photo' | 'video';
  url: string;
  thumbnail?: string;
  description?: string;
}

export interface Album {
  id: number;
  title: string;
  coverUrl: string;
  items: MediaItem[];
  date: string;
}