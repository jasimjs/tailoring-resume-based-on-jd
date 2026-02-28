import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, Minimize2, Save, Check } from 'lucide-react';
import { ResumeData } from '../types';

interface JsonEditorProps {
    data: ResumeData;
    onSave: (data: ResumeData) => void;
}

export default function JsonEditor({ data, onSave }: JsonEditorProps) {
    const [jsonString, setJsonString] = useState(() => JSON.stringify(data, null, 2));
    const [error, setError] = useState<string | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    // Sync only if not actively editing in fullscreen to prevent overwriting
    useEffect(() => {
        if (!isFullscreen) {
            setJsonString(JSON.stringify(data, null, 2));
            setError(null);
        }
    }, [data, isFullscreen]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setJsonString(e.target.value);
        setError(null); // Clear error on edit
        setIsSaved(false);
    };

    const handleSave = () => {
        try {
            const parsed = JSON.parse(jsonString) as ResumeData;
            if (!parsed.name || !parsed.workExperience) {
                throw new Error("Missing critical resume fields (e.g., name, workExperience)");
            }
            setError(null);
            onSave(parsed);
            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 2000);
        } catch (err: any) {
            setError(`Invalid JSON: ${err.message}`);
        }
    };

    const EditorContent = () => (
        <div className="flex flex-col h-full bg-background border border-slate-200 flex-1 overflow-hidden w-full">
            <div className="bg-primary text-slate-200 p-3 text-sm font-semibold flex justify-between items-center shadow-md z-10 shrink-0">
                <div className="flex items-center gap-3">
                    <span>Raw JSON Data</span>
                    {error && <span className="text-red-400 text-xs font-medium max-w-xs truncate" title={error}>{error}</span>}
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleSave}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-xs font-bold shadow-sm ${isSaved ? 'bg-accent hover:bg-accent text-white' : 'btn-primary'}`}
                        title="Save Changes"
                    >
                        {isSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        {isSaved ? 'Saved!' : 'Save changes'}
                    </button>
                    <button
                        onClick={() => setIsFullscreen(!isFullscreen)}
                        className="p-1.5 hover:bg-secondary rounded-md transition-colors text-slate-300 hover:text-white"
                        title={isFullscreen ? "Exit Fullscreen" : "Expand Fullscreen"}
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>
            <textarea
                value={jsonString}
                onChange={handleChange}
                className="w-full flex-1 p-4 bg-secondary text-accent font-mono text-[13px] focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
            />
        </div>
    );

    return (
        <>
            <div className={`flex flex-col h-full w-full rounded-xl overflow-hidden shadow-sm`}>
                <EditorContent />
            </div>

            {isFullscreen && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-secondary/60 backdrop-blur-sm">
                    <div className="bg-surface rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 origin-center border border-slate-700">
                        <EditorContent />
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
