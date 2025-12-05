
import React from 'react';

export interface NewsItem {
  id: number;
  title: string;
  date: string;
  description: string;
  category: 'events' | 'projects' | 'news';
  imageUrl: string;
  status: 'published' | 'draft';
  link?: string;
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
  items_count?: number; // Helper for display
}

export interface ServiceItem {
  id: number;
  title: string;
  fileUrl: string;
}

export interface SliderItem {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  link?: string;
  sortOrder: number;
  active: boolean;
  mobileImageUrl?: string;
}

// User & Permissions
export interface AppUser {
  id: number;
  username: string;
  password?: string; // Optional for frontend display
  full_name: string;
  role: 'admin' | 'editor';
  permissions: string[];
}

export const AVAILABLE_PERMISSIONS = [
  { id: 'dashboard', label: 'لوحة القيادة' },
  { id: 'homepage', label: 'واجهة الموقع' },
  { id: 'news', label: 'الأخبار والمشاريع' },
  { id: 'announcements', label: 'الاعلانات' },
  { id: 'services', label: 'الخدمات والنماذج' },
  { id: 'gallery', label: 'معرض الصور' },
  { id: 'messages', label: 'الرسائل الواردة' },
  { id: 'settings', label: 'إعدادات النظام' },
  { id: 'users', label: 'إدارة المستخدمين' },
];