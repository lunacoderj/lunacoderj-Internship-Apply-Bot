import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { FileText, CheckCircle, Clock, AlertCircle } from 'lucide-react';

export default function Stats() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    total: 0,
    applied: 0,
    pending: 0,
    failed: 0
  });

  useEffect(() => {
    if (!user) return;

    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('status');

      if (!error && data) {
        const counts = data.reduce((acc, curr) => {
          acc.total++;
          acc[curr.status]++;
          return acc;
        }, { total: 0, applied: 0, pending: 0, failed: 0 });
        
        setStats(counts);
      }
    };

    fetchStats();

    // Subscribe to changes
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, fetchStats)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  const statItems = [
    { name: 'Total Found', value: stats.total, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { name: 'Successfully Applied', value: stats.applied, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10' },
    { name: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    { name: 'Action Needed', value: stats.failed, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statItems.map((item) => (
        <div key={item.name} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
          <div className={`${item.bg} p-3 rounded-xl`}>
            <item.icon className={`w-6 h-6 ${item.color}`} />
          </div>
          <div>
            <p className="text-slate-400 text-sm font-medium">{item.name}</p>
            <p className="text-2xl font-bold text-white">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
