import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/useAuthStore';
import { ExternalLink, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function ApplicationList() {
  const { user } = useAuthStore();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchApplications = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error) setApplications(data);
      setLoading(false);
    };

    fetchApplications();

    const channel = supabase
      .channel('applications-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, fetchApplications)
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

  if (loading) return <div className="p-8 text-center text-slate-400">Loading applications...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-800/50 border-b border-slate-800">
          <tr>
            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Company</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Role</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Status</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-300">Applied At</th>
            <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">Link</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {applications.map((app) => (
            <tr key={app.id} className="hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-4">
                <span className="text-white font-medium">{app.company_name}</span>
              </td>
              <td className="px-6 py-4 text-slate-300">{app.role_title}</td>
              <td className="px-6 py-4">
                <StatusBadge status={app.status} />
              </td>
              <td className="px-6 py-4 text-slate-400 text-sm">
                {new Date(app.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-right">
                <a
                  href={app.job_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300"
                >
                  <span className="text-sm">View</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </td>
            </tr>
          ))}
          {applications.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                No applications found yet. Keep hunting!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    applied: 'bg-green-500/10 text-green-500 border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    failed: 'bg-red-500/10 text-red-500 border-red-500/20',
  };

  const icons = {
    applied: <CheckCircle className="w-3 h-3 mr-1" />,
    pending: <Clock className="w-3 h-3 mr-1" />,
    failed: <XCircle className="w-3 h-3 mr-1" />,
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      {icons[status]}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
