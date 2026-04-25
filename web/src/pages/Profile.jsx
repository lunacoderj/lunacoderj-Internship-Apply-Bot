import React, { useState, useEffect } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import ResumeUpload from '../components/profile/ResumeUpload';
import { User, Target, MapPin, GraduationCap, Save, CheckCircle2, Sparkles, X, Globe, Plus } from 'lucide-react';

export default function Profile() {
  const { profile, fetchProfile, updatePreferences, loading } = useProfileStore();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [preferences, setPreferences] = useState({
    roles: [],
    locations: [],
    min_salary: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (profile?.job_preferences) {
      setPreferences({
        roles: profile.job_preferences.roles || [],
        locations: profile.job_preferences.locations || [],
        min_salary: profile.job_preferences.min_salary || ''
      });
    } else if (profile) {
       // Fallback for old schema
       setPreferences({
        roles: profile.roles || [],
        locations: profile.locations || [],
        min_salary: profile.min_salary || ''
      });
    }
  }, [profile]);

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await updatePreferences(preferences);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const addChip = (key, value) => {
    if (!value) return;
    if (!preferences[key].includes(value)) {
      setPreferences(prev => ({
        ...prev,
        [key]: [...prev[key], value]
      }));
    }
  };

  const removeChip = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: prev[key].filter(v => v !== value)
    }));
  };

  if (loading && !profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-brand-blue"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      <header className="relative py-12 border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-indigo/5 blur-[100px] -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-brand-blue text-xs font-black uppercase tracking-[0.2em]">
              <Sparkles className="w-4 h-4" />
              Intelligence Setup
            </div>
            <h1 className="text-6xl font-bold tracking-tight">Configuration</h1>
            <p className="text-text-dim text-xl max-w-2xl leading-relaxed">
              Calibrate your autonomous engine. Your preferences dictate how our AI represents 
              your professional brand to global recruiters.
            </p>
          </div>
          
          <button 
            onClick={handleSavePreferences}
            disabled={saving}
            className="btn-primary px-8 py-4 flex items-center gap-3 shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] hover:shadow-white/20"
          >
            {success ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Save className="w-5 h-5" />}
            <span className="text-sm font-black uppercase tracking-widest">
              {saving ? 'Syncing...' : success ? 'Configured' : 'Save Strategy'}
            </span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Resume Section */}
        <div className="lg:col-span-12 bento-card bg-white/[0.01]">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
              <GraduationCap className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Resume Intelligence</h2>
              <p className="text-sm text-text-dim">Update your base professional data</p>
            </div>
          </div>
          
          <div className="p-8 glass-card bg-neutral-950/50">
            <ResumeUpload />
          </div>
        </div>

        {/* Roles Configuration */}
        <div className="lg:col-span-6 bento-card bg-white/[0.01] flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Target className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Strategic Targets</h2>
              <p className="text-sm text-text-dim">Specify the roles our AI should hunt for</p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="flex flex-wrap gap-2">
              {preferences.roles.map(role => (
                <div key={role} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-white/5 rounded-2xl group transition-all hover:border-white/20">
                  <span className="text-sm font-semibold">{role}</span>
                  <button onClick={() => removeChip('roles', role)} className="text-text-dim hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {preferences.roles.length === 0 && (
                <p className="text-text-dim italic text-sm py-4">No target roles defined yet.</p>
              )}
            </div>

            <div className="relative mt-auto">
              <Plus className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
              <input 
                type="text" 
                placeholder="Add role (e.g. Frontend Intern)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addChip('roles', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-brand-blue/30 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Geography Configuration */}
        <div className="lg:col-span-6 bento-card bg-white/[0.01] flex flex-col">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
              <Globe className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Geographic Reach</h2>
              <p className="text-sm text-text-dim">Define your operational boundaries</p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="flex flex-wrap gap-2">
              {preferences.locations.map(loc => (
                <div key={loc} className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-white/5 rounded-2xl group transition-all hover:border-white/20">
                  <span className="text-sm font-semibold">{loc}</span>
                  <button onClick={() => removeChip('locations', loc)} className="text-text-dim hover:text-red-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {preferences.locations.length === 0 && (
                <p className="text-text-dim italic text-sm py-4">Global search enabled (No restrictions).</p>
              )}
            </div>

            <div className="relative mt-auto">
              <MapPin className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-dim" />
              <input 
                type="text" 
                placeholder="Add location (e.g. Remote, SF)..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addChip('locations', e.target.value);
                    e.target.value = '';
                  }
                }}
                className="w-full bg-neutral-950 border border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm focus:outline-none focus:border-emerald-500/30 transition-all shadow-inner"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
