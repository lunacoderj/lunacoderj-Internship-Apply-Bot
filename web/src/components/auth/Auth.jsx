import React from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';
import { Bot } from 'lucide-react';

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-slate-900 p-8 rounded-2xl shadow-2xl border border-slate-800">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">ApplyPilot</h2>
          <p className="text-slate-400">Your AI-powered internship companion</p>
        </div>

        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#2563eb',
                  brandAccent: '#3b82f6',
                  inputText: 'white',
                  inputBackground: '#1e293b',
                  inputBorder: '#334155',
                },
              },
            },
          }}
          theme="dark"
          providers={['github', 'google']}
        />
      </div>
    </div>
  );
}
