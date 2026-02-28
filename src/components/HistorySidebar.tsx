import React, { useState } from 'react';
import { SavedGeneration } from '../services/storage';
import { Clock, Briefcase, Trash2, X, FileText, Building2 } from 'lucide-react';

interface HistorySidebarProps {
    generations: SavedGeneration[];
    onSelect: (generation: SavedGeneration) => void;
    onDelete: (id: string) => void;
    activeId?: string;
}

export default function HistorySidebar({ generations, onSelect, onDelete, activeId }: HistorySidebarProps) {
    const [viewingJd, setViewingJd] = useState<{ jd: string, title?: string } | null>(null);

    if (generations.length === 0) {
        return (
            <div className="p-6 text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <Clock className="w-8 h-8 mb-3 opacity-20" />
                <p className="text-sm">No tailored resumes yet.</p>
                <p className="text-xs mt-1 opacity-70">Generate one to see it here.</p>
            </div>
        );
    }

    return (
        <div className="overflow-y-auto h-full flex flex-col gap-3 p-4">
            {generations.map((gen) => {
                const isActive = activeId === gen.id;
                const date = new Date(gen.date).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });

                return (
                    <div
                        key={gen.id}
                        onClick={() => onSelect(gen)}
                        className={`
              relative p-4 rounded-xl border cursor-pointer transition-all duration-200
              ${isActive
                                ? 'bg-primary/5 border-primary/20 shadow-sm ring-1 ring-primary/20'
                                : 'bg-surface border-slate-200 hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5'
                            }
            `}
                    >
                        <div className="flex justify-between items-start mb-2 pr-6">
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {date}
                            </span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(gen.id);
                                }}
                                className="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                title="Delete generation"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        <div className="text-sm font-bold text-primary mb-1.5 flex items-start gap-1.5 truncate">
                            <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            <span className="truncate" title={gen.resumeData.title}>{gen.resumeData.title || 'Untitled Resume'}</span>
                        </div>

                        {gen.companyName && (
                            <div className="text-xs text-slate-600 font-semibold mb-2 flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                                <span className="truncate">{gen.companyName}</span>
                            </div>
                        )}

                        <div className="text-sm text-slate-700 font-medium mb-1 leading-snug flex items-start gap-2">
                            <Briefcase className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span className="line-clamp-4">{gen.jobDescription || 'Unknown Job Description'}</span>
                        </div>

                        {gen.jobDescription && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setViewingJd({ jd: gen.jobDescription, title: gen.resumeData.title }); }}
                                className="text-xs text-primary font-semibold mb-3 hover:underline text-left"
                            >
                                View full JD
                            </button>
                        )}

                        {gen.analytics && (
                            <div className="flex gap-2 text-xs font-bold font-mono">
                                <div className={`px-2 py-1 rounded bg-accent/10 text-accent-hover border border-accent/20`}>
                                    {gen.analytics.updatedAtsScore}% ATS
                                </div>
                                <div className={`px-2 py-1 rounded bg-primary/10 text-primary border border-primary/20`}>
                                    {gen.analytics.matchingScore}% Match
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
            {viewingJd && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setViewingJd(null)}>
                    <div className="bg-surface rounded-xl shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-background shrink-0">
                            <h3 className="font-bold text-primary flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-primary" />
                                Job Description
                            </h3>
                            <button onClick={() => setViewingJd(null)} className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-md transition-colors" title="Close">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto text-sm text-slate-700 whitespace-pre-wrap leading-relaxed font-mono">
                            {viewingJd.jd}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
