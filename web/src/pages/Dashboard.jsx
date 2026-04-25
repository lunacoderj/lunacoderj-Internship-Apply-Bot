import React from 'react';
import Stats from '../components/dashboard/Stats';
import { Bot, Zap, Clock, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back!</h1>
          <p className="text-slate-400 text-lg">Here's how your internship search is going.</p>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full border border-blue-500/20">
          <Zap className="w-4 h-4 fill-current" />
          <span className="text-sm font-medium">System Active</span>
        </div>
      </div>

      <Stats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
              <Bot className="w-8 h-8 text-blue-500 mb-2" />
              <span className="text-sm font-medium">New Job Scan</span>
            </button>
            <button className="flex flex-col items-center justify-center p-4 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors border border-slate-700">
              <Clock className="w-8 h-8 text-purple-500 mb-2" />
              <span className="text-sm font-medium">History</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h3 className="text-xl font-bold text-white mb-4">Upcoming Deadlines</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-slate-200">Google Summer Intern</span>
              </div>
              <span className="text-slate-400 text-sm">Tomorrow</span>
            </div>
            {/* More placeholders or real data would go here */}
          </div>
        </div>
      </div>
    </div>
  );
}
