import { create } from 'zustand';
import axios from 'axios';
import { supabase } from '../lib/supabase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useApplicationStore = create((set, get) => ({
  offers: [],
  applications: [],
  loading: false,
  error: null,
  subscription: null,

  fetchData: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const [offersRes, appsRes] = await Promise.all([
        axios.get(`${API_URL}/offers`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        }),
        axios.get(`${API_URL}/applications`, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        })
      ]);

      set({ 
        offers: offersRes.data.offers,
        applications: appsRes.data.applications || [],
        loading: false 
      });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  subscribeToApplications: () => {
    // Cleanup existing subscription if any
    const existingSub = get().subscription;
    if (existingSub) existingSub.unsubscribe();

    const sub = supabase
      .channel('db_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        (payload) => {
          console.log('Real-time update (applications):', payload);
          get().fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'offers' },
        (payload) => {
          console.log('Real-time update (offers):', payload);
          get().fetchData();
        }
      )
      .subscribe();

    set({ subscription: sub });
  },

  unsubscribeFromApplications: () => {
    const sub = get().subscription;
    if (sub) {
      sub.unsubscribe();
      set({ subscription: null });
    }
  },

  getStats: () => {
    const { offers, applications } = get();
    return {
      totalOffers: offers.length,
      appsSent: applications.filter(a => a.status === 'applied').length,
      inProgress: applications.filter(a => ['pending', 'processing', 'queued'].includes(a.status)).length,
      successful: applications.filter(a => a.status === 'interviewing' || a.status === 'accepted').length,
    };
  },

  triggerApply: async (offerId) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      await axios.post(`${API_URL}/offers/${offerId}/apply`, {}, {
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      // Refresh data
      get().fetchData();
    } catch (err) {
      console.error('Apply failed:', err);
    }
  }
}));

