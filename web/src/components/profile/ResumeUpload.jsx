import React, { useCallback, useState } from 'react';
import { useProfileStore } from '../../store/useProfileStore';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, ArrowUpCircle } from 'lucide-react';

export default function ResumeUpload() {
  const { uploadResume, parsingResume, error, education } = useProfileStore();
  const [dragActive, setDragActive] = useState(false);

  const handleFile = (file) => {
    if (file && file.type === 'application/pdf') {
      uploadResume(file);
    }
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="space-y-8">
      <div 
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
        className={`
          relative group cursor-pointer overflow-hidden
          border border-dashed rounded-3xl p-12 transition-all duration-500
          flex flex-col items-center justify-center text-center
          ${dragActive ? 'border-brand-blue bg-brand-blue/5 scale-[1.01]' : 'border-border-subtle hover:border-white/20 bg-black'}
          ${parsingResume ? 'pointer-events-none opacity-50' : ''}
        `}
      >
        {parsingResume ? (
          <div className="space-y-6 animate-fade-in">
            <Loader2 className="w-10 h-10 text-brand-blue animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">Analyzing Artifact</h3>
              <p className="text-text-dim text-sm">Our AI is extracting semantic details from your resume...</p>
            </div>
          </div>
        ) : education.length > 0 ? (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto border border-green-500/20">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-semibold text-white">Resume Processed</h3>
              <p className="text-text-dim text-sm">{education.length} academic records identified</p>
            </div>
            <button 
              onClick={() => document.getElementById('resume-input').click()}
              className="text-xs font-bold uppercase tracking-widest text-brand-blue hover:text-white transition-colors"
            >
              Update Resume
            </button>
          </div>
        ) : (
          <>
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-8 group-hover:scale-105 transition-all duration-500 border border-border-subtle">
              <ArrowUpCircle className="w-8 h-8 text-white/50 group-hover:text-white transition-colors" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-bold tracking-tight">Import Resume</h3>
              <p className="text-text-dim text-sm max-w-xs mx-auto">
                Drop your PDF here. Our AI will automatically configure your application profile.
              </p>
            </div>
            <input 
              id="resume-input"
              type="file" 
              className="hidden" 
              accept=".pdf"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <button 
              onClick={() => document.getElementById('resume-input').click()}
              className="mt-10 btn-primary px-8 py-3 rounded-full"
            >
              Browse Files
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/10 rounded-2xl text-red-500 animate-fade-in">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-semibold uppercase tracking-tight">{error}</p>
        </div>
      )}

      {education.length > 0 && (
        <div className="bento-card p-8 space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-brand-blue text-xs font-bold uppercase tracking-widest">
              <FileText className="w-4 h-4" />
              Education Records
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 bg-white/5 text-white/50 rounded-full border border-border-subtle uppercase tracking-tighter">AI Extracted</span>
          </div>
          <div className="grid gap-4">
            {education.map((edu, idx) => (
              <div key={idx} className="p-5 bg-white/[0.02] rounded-2xl border border-border-subtle hover:border-white/10 transition-all duration-300">
                <div className="font-semibold text-lg">{edu.institution}</div>
                <div className="text-sm text-text-dim flex items-center gap-2 mt-1">
                  {edu.degree} in {edu.major}
                  <div className="w-1 h-1 bg-white/10 rounded-full" />
                  GPA: {edu.gpa}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

