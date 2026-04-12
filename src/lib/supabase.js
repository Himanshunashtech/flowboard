import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wyrboobykiephmaolxmu.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5cmJvb2J5a2llcGhtYW9seG11Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU5NzA3NzksImV4cCI6MjA5MTU0Njc3OX0.1sLeP0SYlxHkEYqRVFBUoEL0DrGKX4hoox5ygJqfo-o'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Simple channel registry to share channels between components
const channels = new Map();

export const getBoardChannel = (boardId) => {
  const name = `board:${boardId}`;
  if (!channels.has(name)) {
    channels.set(name, supabase.channel(name));
  }
  return channels.get(name);
};

export const removeBoardChannel = (boardId) => {
  const name = `board:${boardId}`;
  const channel = channels.get(name);
  if (channel) {
    supabase.removeChannel(channel);
    channels.delete(name);
  }
};
