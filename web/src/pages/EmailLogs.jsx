import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { Mail, Clock, ShieldCheck, AlertCircle, Search, RefreshCcw, Inbox, Sparkles, Filter, MoreHorizontal } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

import { useEmailStore } from '../store/useEmailStore';

export default function EmailLogs() {
  const { logs, loading, fetchLogs, subscribeToLogs, unsubscribeFromLogs } = useEmailStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLogs();
    subscribeToLogs();
    return () => unsubscribeFromLogs();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      <header className="relative py-12 border-b border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 blur-[100px] -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-blue text-xs font-black uppercase tracking-[0.2em]">
              <Inbox className="w-4 h-4" />
              Intelligence Stream
            </div>
            <h1 className="text-6xl font-bold tracking-tight">Discovery <span className="text-gradient">Logs</span></h1>
            <p className="text-text-dim text-xl max-w-2xl leading-relaxed">
              Real-time synchronization with your primary communication channels. Our AI agents 
              are constantly identifying high-value career signals.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-4 bg-white/5 rounded-2xl border border-white/5 text-text-dim hover:text-white transition-all">
              <Filter className="w-5 h-5" />
            </button>
            <button 
              onClick={handleRefresh}
              disabled={refreshing}
              className="btn-primary px-8 py-4 rounded-2xl flex items-center gap-3 font-bold group shadow-[0_0_20px_rgba(255,255,255,0.05)]"
            >
              <RefreshCcw className={`w-5 h-5 ${refreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
              Refresh Feed
            </button>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bento-card p-10 h-32 animate-pulse bg-white/[0.02]" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <div className="bento-card p-32 text-center space-y-8 bg-white/[0.01]">
          <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5 shadow-inner">
            <Search className="w-10 h-10 text-white/10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-3xl font-bold tracking-tight">No signals detected</h3>
            <p className="text-text-dim text-lg">Our agents are currently monitoring your incoming traffic for new opportunities.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-6 text-xs font-bold uppercase tracking-widest text-text-dim/50">
            <span>Transmission</span>
            <span>Metadata & Status</span>
          </div>
          
          {logs.map((log) => (
            <div key={log.id} className="bento-card p-8 group hover:bg-white/[0.02] transition-all duration-500 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-brand-blue opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-start gap-6 flex-1">
                  <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border transition-all duration-500 ${
                    log.status === 'processed' 
                      ? 'bg-green-500/5 border-green-500/20 text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.05)]' 
                      : log.status === 'failed' 
                        ? 'bg-red-500/5 border-red-500/20 text-red-500 shadow-[0_0_20px_rgba(239,68,68,0.05)]' 
                        : 'bg-brand-blue/5 border-brand-blue/20 text-brand-blue shadow-[0_0_20px_rgba(59,130,246,0.05)]'
                  }`}>
                    <Mail className="w-7 h-7" />
                  </div>
                  <div className="space-y-2 py-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-2xl font-bold tracking-tight leading-tight line-clamp-1">{log.subject || 'No Subject'}</h3>
                      {log.status === 'processed' && <Sparkles className="w-4 h-4 text-brand-blue animate-pulse" />}
                    </div>
                    <p className="text-lg text-text-dim font-medium line-clamp-1">{log.sender}</p>
                  </div>
                </div>

                <div className="flex items-center gap-10">
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2 text-text-dim">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm font-bold uppercase tracking-widest">
                        {formatDistanceToNow(new Date(log.received_at), { addSuffix: true })}
                      </span>
                    </div>
                    <span className="text-[10px] text-text-dim/30 font-black tracking-tighter uppercase">
                      ID: {log.id.slice(0, 8)}...
                    </span>
                  </div>

                  <div className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border transition-all duration-500 ${
                    log.status === 'processed'
                      ? 'bg-green-500/10 border-green-500/20 text-green-500'
                      : log.status === 'failed'
                        ? 'bg-red-500/10 border-red-500/20 text-red-500'
                        : 'bg-white/5 border-white/10 text-white/40'
                  }`}>
                    {log.status}
                  </div>
                  
                  <button className="p-3 text-text-dim hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
