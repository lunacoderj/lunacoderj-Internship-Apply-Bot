import React from 'react';
import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../../lib/supabase';
import { Zap, Sparkles, Shield, Cpu, Globe, Rocket } from 'lucide-react';

export default function Auth() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-black">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-brand-blue/10 blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-brand-indigo/10 blur-[150px] rounded-full animate-pulse delay-700" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_black_100%)]" />

      <div className="max-w-xl w-full space-y-12 relative z-10">
        <div className="text-center space-y-8 animate-slide-up">
          <div className="flex justify-center">
            <div className="relative group">
              <div className="absolute -inset-4 bg-brand-blue/20 rounded-[2.5rem] blur-2xl group-hover:bg-brand-blue/30 transition-all duration-700" />
              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-2xl relative overflow-hidden transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
                <Zap className="w-12 h-12 text-black fill-current relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-brand-blue/10" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-7xl font-black tracking-tighter text-white">
              Apply<span className="text-brand-blue">Pilot</span>
            </h1>
            <div className="flex items-center justify-center gap-4 text-text-dim text-xs font-black uppercase tracking-[0.3em]">
              <div className="w-8 h-[1px] bg-white/10" />
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-blue" />
                Autonomous Engine v2.0
              </span>
              <div className="w-8 h-[1px] bg-white/10" />
            </div>
          </div>
          
          <p className="text-text-dim text-xl leading-relaxed max-w-lg mx-auto font-medium">
            Deploy your personal AI swarm to dominate the internship market. 
            Automated discovery, intelligent parsing, and instant submission.
          </p>
        </div>

        <div className="glass-card p-12 border border-white/5 animate-fade-in delay-300">
          <div className="space-y-6">
            <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl border border-white/5 w-fit mx-auto mb-8">
              <Shield className="w-4 h-4 text-brand-blue" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Military-Grade Encryption</span>
            </div>
            
            <SupabaseAuth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#ffffff',
                      brandAccent: '#f3f4f6',
                      inputText: 'white',
                      inputBackground: 'rgba(255, 255, 255, 0.03)',
                      inputBorder: 'rgba(255, 255, 255, 0.08)',
                      inputPlaceholder: 'rgba(255, 255, 255, 0.3)',
                    },
                    radii: {
                      borderRadiusButton: '16px',
                      buttonPadding: '14px 20px',
                      inputPadding: '14px 20px',
                    },
                    fonts: {
                      bodyFontFamily: `'Inter', sans-serif`,
                      buttonFontFamily: `'Inter', sans-serif`,
                      inputFontFamily: `'Inter', sans-serif`,
                      labelFontFamily: `'Inter', sans-serif`,
                    }
                  },
                },
                className: {
                  button: 'font-bold uppercase tracking-widest text-xs transition-all hover:scale-[1.02] active:scale-[0.98]',
                  input: 'bg-neutral-900/50 border-white/5 focus:border-white/20 transition-all text-sm',
                  label: 'text-[10px] font-black uppercase tracking-[0.2em] text-text-dim/50 mb-2 block',
                }
              }}
              theme="dark"
              providers={['github', 'google']}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 pt-8 animate-fade-in delay-500 opacity-50">
          {[
            { icon: Cpu, label: 'Neural Processing' },
            { icon: Globe, label: 'Global Search' },
            { icon: Rocket, label: 'Instant Deploy' }
          ].map((feature, i) => (
            <div key={i} className="flex flex-col items-center gap-3">
              <feature.icon className="w-5 h-5 text-text-dim" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-dim text-center">{feature.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

