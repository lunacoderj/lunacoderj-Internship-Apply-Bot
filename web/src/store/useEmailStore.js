import { create } from 'zustand';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useEmailStore = create((set, get) => ({
  logs: [],
  loading: false,
  error: null,
  subscription: null,

  fetchLogs: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await axios.get(`${API_URL}/email-logs`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      set({ logs: response.data.emailLogs || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  subscribeToLogs: () => {
    const existingSub = get().subscription;
    if (existingSub) existingSub.unsubscribe();

    const sub = supabase
      .channel('email_logs_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'email_logs' },
        (payload) => {
          console.log('Real-time email log update:', payload);
          get().fetchLogs();
        }
      )
      .subscribe();

    set({ subscription: sub });
  },

  unsubscribeFromLogs: () => {
    const sub = get().subscription;
    if (sub) {
      sub.unsubscribe();
      set({ subscription: null });
    }
  }
}));
