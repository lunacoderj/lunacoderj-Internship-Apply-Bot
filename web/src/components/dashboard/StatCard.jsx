import React from 'react';

export default function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="border border-border-subtle rounded-3xl p-6 space-y-4 hover:border-white/20 transition-all bg-bg-card">
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-dim uppercase tracking-widest font-bold">{label}</span>
        <Icon className="w-4 h-4 text-text-dim" />
      </div>
      <div className="text-4xl font-semibold tracking-tight">{value}</div>
    </div>
  );
}

