import React, { useEffect } from 'react';
import { useProfileStore } from '../store/useProfileStore';
import { useApplicationStore } from '../store/useApplicationStore';
import StatCard from '../components/dashboard/StatCard';
import ResumeUpload from '../components/profile/ResumeUpload';
import { Briefcase, Send, CheckCircle, Clock, Sparkles, ArrowRight, Activity, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { profile, education, fetchProfile } = useProfileStore();
  const { fetchData, getStats, applications, loading, subscribeToApplications, unsubscribeFromApplications } = useApplicationStore();

  useEffect(() => {
    fetchProfile();
    fetchData();
    subscribeToApplications();
    
    return () => unsubscribeFromApplications();
  }, []);

  const stats = getStats();

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-20">
      {/* Hero Section */}
      <header className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-indigo/10 blur-[120px] rounded-full -z-10" />
        
        <div className="flex items-center gap-3 text-brand-blue mb-8">
          <div className="p-2 bg-brand-blue/10 rounded-xl">
            <Zap className="w-5 h-5 fill-brand-blue" />
          </div>
          <span className="text-xs font-black uppercase tracking-[0.2em]">Autonomous Engine v2.0</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-8 leading-[0.9]">
          Design your <br />
          <span className="text-gradient">Career Path.</span>
        </h1>
        
        <div className="flex flex-col md:flex-row md:items-center gap-12 text-text-dim text-xl max-w-4xl">
          <p className="leading-relaxed">
            ApplyPilot is currently monitoring <span className="text-white font-semibold">{profile?.job_preferences?.roles?.length || 0} tracks</span> across 
            Global markets. Your next opportunity is being curated in real-time.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/applications" className="btn-primary group flex items-center gap-2 whitespace-nowrap">
              Launch Feed <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </header>

      {/* Stats - Glass Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Live Tracks" value={stats.totalOffers} icon={Briefcase} />
        <StatCard label="Autonomous Sends" value={stats.appsSent} icon={Send} />
        <StatCard label="Processing" value={stats.inProgress} icon={Clock} />
        <StatCard label="Success" value={stats.successful} icon={CheckCircle} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Intelligence Hub */}
        <div className="lg:col-span-8 bento-card border-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Sparkles className="w-32 h-32" />
          </div>
          
          <div className="relative space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Resume Intelligence</h2>
                <p className="text-text-dim">Our LLMs analyze your resume to match against global roles.</p>
              </div>
              {education.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 glass rounded-full text-[10px] font-black text-white">
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                  DATA SYNCED
                </div>
              )}
            </div>
            
            <div className="p-8 glass-card bg-white/[0.02]">
              <ResumeUpload />
            </div>
          </div>
        </div>

        {/* Preferences Quick-View */}
        <div className="lg:col-span-4 bento-card bg-neutral-950 border-white/5 flex flex-col justify-between">
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">Strategy</h3>
              <Activity className="w-5 h-5 text-brand-blue" />
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <span className="text-[10px] text-text-dim uppercase tracking-[0.2em] font-black">Target Roles</span>
                <div className="flex flex-wrap gap-2">
                  {(profile?.job_preferences?.roles || ['Strategic Analyst']).map(role => (
                    <span key={role} className="px-3 py-1.5 glass rounded-xl text-xs font-semibold border-white/5">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <span className="text-[10px] text-text-dim uppercase tracking-[0.2em] font-black">Geography</span>
                <p className="text-sm font-medium text-white/80">
                  {profile?.job_preferences?.locations?.join(', ') || 'Global Remote'}
                </p>
              </div>
            </div>
          </div>
          
          <Link to="/profile" className="group mt-12 flex items-center justify-between p-4 glass rounded-2xl hover:bg-white/5 transition-all">
            <span className="text-sm font-bold">Refine Strategy</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-12 bento-card border-white/5">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">System Telemetry</h2>
            <div className="text-xs text-text-dim font-medium px-3 py-1 glass rounded-full">
              Live Stream
            </div>
          </div>
          
          <div className="space-y-2">
            {applications.length === 0 && !loading ? (
              <div className="py-20 text-center">
                <p className="text-text-dim italic font-medium">The autonomous agent is initializing...</p>
              </div>
            ) : (
              applications.slice(0, 4).map((app) => (
                <div key={app.id} className="p-6 glass rounded-2xl flex items-center justify-between group hover:bg-white/[0.02] transition-all border-white/[0.02]">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all">
                      <Briefcase className="w-5 h-5 text-text-dim group-hover:text-white transition-colors" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">{app.offers?.title || 'System Task'}</div>
                      <div className="text-sm text-text-dim flex items-center gap-2">
                        <span>{app.offers?.company || 'Worker Node'}</span>
                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                        <span>{new Date(app.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                      app.status === 'applied' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      app.status === 'failed' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      'bg-white/5 text-white/50 border-white/10'
                    }`}>
                      {app.status}
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-dim opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

