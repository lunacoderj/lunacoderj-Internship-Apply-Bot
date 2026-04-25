import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Key, Eye, EyeOff, RefreshCw, Plus, Trash2 } from 'lucide-react';

export default function Keys() {
  const { user } = useAuthStore();
  const [keys, setKeys] = useState([]);
  const [showValues, setShowValues] = useState({});

  useEffect(() => {
    if (!user) return;
    fetchKeys();
  }, [user]);

  const fetchKeys = async () => {
    const { data, error } = await supabase
      .from('user_keys')
      .select('*')
      .order('service_name');
    if (!error) setKeys(data);
  };

  const toggleVisibility = (id) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">API Keys & Secrets</h1>
          <p className="text-slate-400 mt-1">Manage credentials for your external services.</p>
        </div>
        <button className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-5 h-5" />
          <span>Add Key</span>
        </button>
      </div>

      <div className="grid gap-4">
        {keys.map((k) => (
          <div key={k.id} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-800 rounded-xl">
                <Key className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg">{k.service_name}</h3>
                <p className="text-slate-500 text-sm">Last updated: {new Date(k.updated_at).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-slate-800 p-2 rounded-xl border border-slate-700 flex-1 max-w-md">
              <input
                type={showValues[k.id] ? 'text' : 'password'}
                value={k.encrypted_value}
                readOnly
                className="bg-transparent border-none text-slate-300 flex-1 px-2 focus:ring-0 font-mono text-sm"
              />
              <button 
                onClick={() => toggleVisibility(k.id)}
                className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
              >
                {showValues[k.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-blue-400 transition-colors" title="Rotate Key">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-red-400 transition-colors" title="Delete">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}

        {keys.length === 0 && (
          <div className="text-center py-20 bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-3xl">
            <div className="inline-block p-4 bg-slate-800 rounded-full mb-4">
              <Key className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-white font-medium">No keys added yet</h3>
            <p className="text-slate-500 mt-1">Add your Gemini, Resend, or LinkedIn API keys to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
