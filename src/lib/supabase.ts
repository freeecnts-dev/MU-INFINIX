import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export type Monster = {
  id: string;
  name: string;
  level: number;
  hp: number;
  damage: number;
  created_at: string;
};

export type Player = {
  id: string;
  name: string;
  login: string;
  level: number;
  class: string;
  hp: number;
  zen: number;
  is_online: boolean;
  created_at: string;
};
