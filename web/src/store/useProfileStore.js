import { create } from 'zustand';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useProfileStore = create((set, get) => ({
  profile: null,
  education: [],
  loading: false,
  error: null,
  parsingResume: false,

  fetchProfile: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const [statusRes, eduRes] = await Promise.all([
        axios.get(`${API_URL}/resume/status`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }),
        axios.get(`${API_URL}/resume`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
      ]);

      set({ 
        profile: statusRes.data,
        education: eduRes.data ? [eduRes.data] : [],
        loading: false 
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  updatePreferences: async (preferences) => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.post(`${API_URL}/resume/preferences`, preferences, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      await get().fetchProfile();
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  uploadResume: async (file) => {
    set({ parsingResume: true, error: null });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const formData = new FormData();
      formData.append('resume', file);

      await axios.post(`${API_URL}/resume/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session.access_token}` 
        }
      });

      // Polling for parsing results
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        await get().fetchProfile();
        
        if (get().education.length > 0 || attempts > 20) {
          clearInterval(poll);
          set({ parsingResume: false });
        }
      }, 5000);

    } catch (err) {
      set({ error: err.message, parsingResume: false });
    }
  }
}));
