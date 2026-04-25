import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { supabase } from './lib/supabase';
import { Zap } from 'lucide-react';

// Components
import Auth from './components/auth/Auth';
import Dashboard from './pages/Dashboard';
import Applications from './pages/Applications';
import Keys from './pages/Keys';
import Profile from './pages/Profile';
import EmailLogs from './pages/EmailLogs';
import Navbar from './components/layout/Navbar';

function App() {
  const { user, setUser, loading } = useAuthStore();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-blue/20 blur-[120px] rounded-full animate-pulse" />
        
        <div className="relative space-y-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-2xl animate-bounce">
            <Zap className="w-8 h-8 text-black fill-current" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-black tracking-tighter uppercase">Initializing Pilot</h2>
            <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
              <div className="w-full h-full bg-white/40 origin-left animate-reveal" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white selection:bg-brand-blue/30 selection:text-white">
        {!user ? (
          <Auth />
        ) : (
          <>
            <Navbar />
            <main className="container mx-auto px-6 pt-32 pb-20">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/applications" element={<Applications />} />
                <Route path="/keys" element={<Keys />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/logs" element={<EmailLogs />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
