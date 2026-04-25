import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabase } from '../lib/supabase';
import { Key, Shield, Eye, EyeOff, Save, CheckCircle2, AlertTriangle, ArrowRight, Lock, Fingerprint, ShieldCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

import { useKeyStore } from '../store/useKeyStore';

export default function Keys() {
  const { keys, loading, fetchKeys, saveKey, subscribeToKeys, unsubscribeFromKeys } = useKeyStore();
  const [saving, setSaving] = useState(false);
  const [showKey, setShowKey] = useState({});
  const [status, setStatus] = useState(null);

  useEffect(() => {
    fetchKeys();
    subscribeToKeys();
    return () => unsubscribeFromKeys();
  }, []);

  const handleSave = async (provider, keyValue) => {
    if (!keyValue) return;
    setSaving(true);
    setStatus(null);
    const success = await saveKey(provider, keyValue);
    if (success) {
      setStatus({ type: 'success', message: `${provider} key updated successfully!` });
    } else {
      setStatus({ type: 'error', message: 'Failed to update key.' });
    }
    setSaving(false);
  };

  const providers = [
    { id: 'gemini', name: 'Google Gemini', desc: 'High-fidelity resume parsing and multi-modal analysis.' },
    { id: 'openrouter', name: 'OpenRouter', desc: 'Access high-performance models like Gemini 2.0 and Llama 3 via a single API.' },
    { id: 'openai', name: 'OpenAI', desc: 'Core intelligence for autonomous form navigation and reasoning.' },
    { id: 'anthropic', name: 'Anthropic', desc: 'Strategic fallback for complex logical workflows.' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-20">
      <header className="relative py-12 border-b border-white/5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-red-500/5 blur-[100px] -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-red-400 text-xs font-black uppercase tracking-[0.2em]">
              <Lock className="w-4 h-4" />
              Secure Protocol
            </div>
            <h1 className="text-6xl font-bold tracking-tight">Access <span className="text-gradient">Vault</span></h1>
            <p className="text-text-dim text-xl max-w-2xl leading-relaxed">
              Your credentials are AES-256-GCM encrypted. They are only decrypted in-memory 
              within our isolated execution environment.
            </p>
          </div>
          
          <div className="flex items-center gap-3 px-6 py-3 bg-neutral-900 border border-white/5 rounded-2xl shadow-inner">
            <Fingerprint className="w-5 h-5 text-text-dim" />
            <span className="text-xs font-bold text-text-dim uppercase tracking-widest">End-to-End Encrypted</span>
          </div>
        </div>
      </header>

      {status && (
        <div className={`p-6 rounded-3xl flex items-center justify-between border animate-slide-up ${
          status.type === 'success' ? 'bg-green-500/5 text-green-500 border-green-500/10' : 'bg-red-500/5 text-red-500 border-red-500/10'
        }`}>
          <div className="flex items-center gap-4">
            {status.type === 'success' ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
            <span className="text-sm font-bold uppercase tracking-widest">{status.message}</span>
          </div>
          <button onClick={() => setStatus(null)} className="text-current opacity-50 hover:opacity-100 transition-opacity">
            <ArrowRight className="w-4 h-4 rotate-45" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        {providers.map((provider) => {
          const existingKey = keys.find(k => k.key_name === provider.id);
          const [val, setVal] = useState('');

          return (
            <div key={provider.id} className="bento-card p-10 group bg-white/[0.01] hover:bg-white/[0.02] transition-colors overflow-hidden relative">
              {existingKey && (
                <div className="absolute top-0 right-0 p-4">
                  <div className="px-3 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-full border border-green-500/20 uppercase tracking-widest shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    Securely Linked
                  </div>
                </div>
              )}
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-12">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-500 ${
                      existingKey ? 'bg-green-500/10 border-green-500/20' : 'bg-neutral-900 border-white/5'
                    }`}>
                      <Key className={`w-7 h-7 ${existingKey ? 'text-green-500' : 'text-text-dim'}`} />
                    </div>
                    <h3 className="text-3xl font-bold tracking-tight">{provider.name}</h3>
                  </div>
                  <p className="text-text-dim text-lg leading-relaxed max-w-md">{provider.desc}</p>
                </div>

                <div className="flex-1 relative max-w-xl w-full">
                  <div className="absolute -inset-1 bg-gradient-to-r from-brand-blue to-brand-indigo opacity-0 group-focus-within:opacity-10 blur transition duration-1000 group-focus-within:duration-200"></div>
                  <div className="relative">
                    <input 
                      type={showKey[provider.id] ? 'text' : 'password'}
                      placeholder={existingKey ? '••••••••••••••••••••••••••••••••' : 'Enter API Secret Key'}
                      value={val}
                      onChange={(e) => setVal(e.target.value)}
                      className="w-full bg-neutral-950 border border-white/10 rounded-3xl px-8 py-5 text-sm font-mono focus:outline-none focus:border-white/20 transition-all pr-44 placeholder:text-neutral-700"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                      <button 
                        onClick={() => setShowKey(prev => ({ ...prev, [provider.id]: !prev[provider.id] }))}
                        className="p-3 text-text-dim hover:text-white transition-colors"
                      >
                        {showKey[provider.id] ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => {
                          handleSave(provider.id, val);
                          setVal(''); // Clear input after save
                        }}
                        disabled={!val || saving}
                        className="btn-primary px-5 h-12 flex items-center justify-center disabled:opacity-10 group/btn gap-2"
                      >
                        <span className="text-[10px] font-black uppercase tracking-widest">{existingKey ? 'Update' : 'Save'}</span>
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

