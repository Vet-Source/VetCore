'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: string;
  profile?: { firstName?: string; lastName?: string };
}

// Lightweight in-memory + localStorage auth hook (no zustand dependency).
// Replace with next-auth or a proper context for production.
let memoryToken: string | null = null;
let memoryUser: User | null = null;
const subscribers = new Set<() => void>();
const notify = () => subscribers.forEach((fn) => fn());

export function useAuth() {
  const [, force] = useState(0);

  useEffect(() => {
    if (memoryToken === null && typeof window !== 'undefined') {
      memoryToken = localStorage.getItem('vs_token');
    }
    const sub = () => force((n) => n + 1);
    subscribers.add(sub);
    return () => {
      subscribers.delete(sub);
    };
  }, []);

  const login = async (email: string, password: string, mfaCode?: string) => {
    const { data } = await api.post('/auth/login', { email, password, mfaCode });
    const { token, user } = data.data;
    if (typeof window !== 'undefined') localStorage.setItem('vs_token', token);
    memoryToken = token;
    memoryUser = user;
    notify();
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vs_token');
      window.location.href = '/auth/login';
    }
    memoryToken = null;
    memoryUser = null;
    notify();
  };

  const fetchMe = async () => {
    try {
      const { data } = await api.get('/users/me');
      memoryUser = data.data;
      notify();
    } catch {
      if (typeof window !== 'undefined') localStorage.removeItem('vs_token');
      memoryToken = null;
      memoryUser = null;
      notify();
    }
  };

  return { user: memoryUser, token: memoryToken, login, logout, fetchMe };
}
