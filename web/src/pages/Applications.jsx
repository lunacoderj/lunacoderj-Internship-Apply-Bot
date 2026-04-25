import React from 'react';
import ApplicationList from '../components/applications/ApplicationList';

export default function Applications() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Applications</h1>
        <div className="flex space-x-2">
          {/* Filters could go here */}
        </div>
      </div>
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <ApplicationList />
      </div>
    </div>
  );
}
