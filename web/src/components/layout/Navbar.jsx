import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { LayoutDashboard, Briefcase, Key, LogOut, Zap, User, ListTree, ChevronRight } from 'lucide-react';

export default function Navbar() {
  const { user, signOut } = useAuthStore();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Applications', path: '/applications', icon: Briefcase },
    { name: 'Signals', path: '/logs', icon: ListTree },
    { name: 'Identity', path: '/profile', icon: User },
    { name: 'Vault', path: '/keys', icon: Key },
  ];

  return (
    <nav className="fixed top-0 left-1/2 -translate-x-1/2 z-50 w-[98%] max-w-7xl animate-fade-in">
      <div className="glass px-8 py-4 rounded-[2rem] flex items-center justify-between border border-white/5 shadow-2xl">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="relative">
            <div className="absolute -inset-2 bg-brand-blue/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center relative overflow-hidden shadow-lg transition-transform duration-500 group-hover:scale-110">
              <Zap className="w-6 h-6 text-black fill-current" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black text-white tracking-tighter leading-none">ApplyPilot</span>
            <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-blue leading-none mt-1">Autonomous</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-2 bg-white/[0.03] p-1.5 rounded-2xl border border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all duration-300
                  ${isActive 
                    ? 'bg-white text-black shadow-lg shadow-white/10' 
                    : 'text-text-dim hover:text-white hover:bg-white/5'}
                `}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-text-dim group-hover:text-white'}`} />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-8">
          <div className="hidden lg:flex flex-col items-end">
            <div className="text-[9px] font-black uppercase tracking-[0.2em] text-text-dim/50">Authorized Operator</div>
            <div className="flex items-center gap-2 group cursor-default">
              <span className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{user?.email?.split('@')[0]}</span>
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
            </div>
          </div>
          
          <button 
            onClick={signOut}
            className="group relative"
          >
            <div className="absolute -inset-2 bg-red-500/10 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/5 text-text-dim hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5 relative overflow-hidden">
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>
    </nav>
  );
}

