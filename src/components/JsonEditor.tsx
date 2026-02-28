import React, { useState } from 'react';
import { ResumeData } from '../types';

interface JsonEditorProps {
    data: ResumeData;
    onSave: (data: ResumeData) => void;
}

export default function JsonEditor({ data, onSave }: JsonEditorProps) {
    const [jsonString, setJsonString] = useState(() => JSON.stringify(data, null, 2));
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setJsonString(value);

        try {
            const parsed = JSON.parse(value) as ResumeData;
            // Basic runtime validation
            if (!parsed.name || !parsed.workExperience) {
                throw new Error("Missing critical resume fields (e.g., name, workExperience)");
            }
            setError(null);
            onSave(parsed);
        } catch (err: any) {
            setError(`Invalid JSON: ${err.message}`);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1">
            <div className="bg-slate-800 text-slate-200 p-3 text-sm font-semibold flex justify-between items-center shadow-md z-10 shrink-0">
                <span>Raw JSON Data</span>
                {error && <span className="text-red-400 text-xs font-medium max-w-[50%] truncate">{error}</span>}
            </div>
            <textarea
                value={jsonString}
                onChange={handleChange}
                className="w-full flex-1 p-4 bg-slate-900 text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
            />
        </div>
    );
}
