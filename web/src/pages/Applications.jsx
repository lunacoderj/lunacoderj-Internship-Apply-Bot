import React, { useEffect } from 'react';
import { useApplicationStore } from '../store/useApplicationStore';
import { Briefcase, ExternalLink, Play, CheckCircle, Clock, Search, Filter, Globe, Building2, MapPin } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = {
    new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    queued: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    applied: 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

export default function Applications() {
  const { offers, fetchData, triggerApply, loading, subscribeToApplications, unsubscribeFromApplications } = useApplicationStore();

  useEffect(() => {
    fetchData();
    subscribeToApplications();
    return () => unsubscribeFromApplications();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-fade-in pb-20">
      <header className="relative py-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-blue/5 blur-[100px] -z-10" />
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-brand-blue text-xs font-black uppercase tracking-[0.2em]">
            <Globe className="w-4 h-4" />
            Global Discovery Feed
          </div>
          <h1 className="text-6xl font-bold tracking-tight">Active <span className="text-gradient">Opportunities</span></h1>
          <p className="text-text-dim text-xl max-w-xl">
            Real-time curation of internship roles matching your strategic preferences.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-dim group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="Search positions..." 
              className="bg-neutral-900 border border-white/5 rounded-full py-3 pl-12 pr-6 text-sm focus:outline-none focus:border-white/20 transition-all w-72"
            />
          </div>
          <button className="p-3 rounded-full border border-white/5 hover:bg-white/5 transition-all text-text-dim hover:text-white">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {loading && offers.length === 0 ? (
          <div className="py-32 flex flex-col items-center gap-6">
            <div className="w-10 h-10 border-2 border-white/5 border-t-brand-blue rounded-full animate-spin" />
            <p className="text-text-dim font-medium animate-pulse">Scanning global markets...</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="py-40 bento-card text-center border-dashed border-white/10">
            <div className="w-20 h-20 bg-neutral-900 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/5">
              <Briefcase className="w-10 h-10 text-white/10" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No matches found</h3>
            <p className="text-text-dim max-w-sm mx-auto">
              Our agent is currently monitoring LinkedIn, Indeed, and company portals for new signals.
            </p>
          </div>
        ) : (
          offers.map((offer) => (
            <div key={offer.id} className="bento-card p-8 flex flex-col md:flex-row md:items-center justify-between gap-8 group hover:translate-y-[-4px] border-white/5 bg-white/[0.01]">
              <div className="flex items-start gap-8 flex-1">
                <div className="w-16 h-16 rounded-3xl bg-neutral-950 flex items-center justify-center border border-white/5 group-hover:border-white/20 group-hover:bg-neutral-900 transition-all duration-500">
                  <Building2 className="w-7 h-7 text-text-dim group-hover:text-white transition-colors" />
                </div>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-4">
                    <h3 className="text-2xl font-bold tracking-tight">{offer.title}</h3>
                    <StatusBadge status={offer.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-6 text-sm text-text-dim font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-white/80">{offer.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <span>{offer.location || 'Remote'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(offer.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 pl-24 md:pl-0">
                <a 
                  href={offer.apply_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-4 rounded-2xl border border-white/5 hover:bg-white/5 transition-all text-text-dim hover:text-white group/link"
                  title="View Original Listing"
                >
                  <ExternalLink className="w-5 h-5 group-hover/link:scale-110 transition-transform" />
                </a>
                <button 
                  onClick={() => triggerApply(offer.id)}
                  disabled={offer.status === 'applied' || offer.status === 'queued'}
                  className={`btn-primary px-10 py-4 flex items-center gap-3 text-sm font-black uppercase tracking-widest ${
                    offer.status === 'applied' ? 'opacity-30' : 'shadow-[0_0_30px_-10px_rgba(255,255,255,0.3)] hover:shadow-white/20'
                  }`}
                >
                  {offer.status === 'applied' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 fill-current" />
                  )}
                  {offer.status === 'applied' ? 'Success' : 'Deploy'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

