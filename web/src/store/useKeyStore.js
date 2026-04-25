import { create } from 'zustand';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useKeyStore = create((set, get) => ({
  keys: [],
  loading: false,
  error: null,
  subscription: null,

  fetchKeys: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const response = await axios.get(`${API_URL}/keys`, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      set({ keys: response.data || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  saveKey: async (provider, keyValue) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.post(`${API_URL}/keys`, { key_name: provider, key_value: keyValue }, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      get().fetchKeys();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  subscribeToKeys: () => {
    const existingSub = get().subscription;
    if (existingSub) existingSub.unsubscribe();

    const sub = supabase
      .channel('user_keys_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'api_keys' },
        (payload) => {
          console.log('Real-time key update:', payload);
          get().fetchKeys();
        }
      )
      .subscribe();

    set({ subscription: sub });
  },

  unsubscribeFromKeys: () => {
    const sub = get().subscription;
    if (sub) {
      sub.unsubscribe();
      set({ subscription: null });
    }
  }
}));
