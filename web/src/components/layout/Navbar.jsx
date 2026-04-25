import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LayoutDashboard, FileText, Key, LogOut, Bot } from 'lucide-react';

export default function Navbar() {
  const { signOut } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Applications', path: '/applications', icon: FileText },
    { name: 'API Keys', path: '/keys', icon: Key },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <Bot className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-bold text-white hidden sm:block">ApplyPilot</span>
          </Link>

          <div className="flex items-center space-x-1 sm:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="hidden md:block">{item.name}</span>
                </Link>
              );
            })}
            
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg text-slate-400 hover:bg-red-900/20 hover:text-red-400 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:block">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
