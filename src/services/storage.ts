import { ResumeData, ResumeAnalytics } from '../types';

export interface SavedGeneration {
    id: string;
    date: string;
    companyName?: string;
    jobDescription: string;
    resumeData: ResumeData;
    analytics: ResumeAnalytics;
}

const STORAGE_KEY = 'ai_resume_generations_history';

export const storageService = {
    saveGeneration: (companyName: string, jobDescription: string, resumeData: ResumeData, analytics: ResumeAnalytics): SavedGeneration => {
        const newGeneration: SavedGeneration = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            companyName,
            jobDescription,
            resumeData,
            analytics,
        };

        const existingGenerations = storageService.getGenerations();
        const updatedGenerations = [newGeneration, ...existingGenerations];

        // Optional: Limit history to last 50 to prevent massive localStorage bloat
        const cappedGenerations = updatedGenerations.slice(0, 50);

        localStorage.setItem(STORAGE_KEY, JSON.stringify(cappedGenerations));
        return newGeneration;
    },

    getGenerations: (): SavedGeneration[] => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Failed to parse generation history from localStorage', e);
            return [];
        }
    },

    updateGeneration: (id: string, newResumeData: ResumeData): void => {
        const generations = storageService.getGenerations();
        const existingIndex = generations.findIndex(g => g.id === id);
        if (existingIndex > -1) {
            generations[existingIndex].resumeData = newResumeData;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(generations));
        }
    },

    deleteGeneration: (id: string): void => {
        const generations = storageService.getGenerations();
        const filtered = generations.filter(g => g.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    exportHistory: (): string => {
        return localStorage.getItem(STORAGE_KEY) || '[]';
    },

    importHistory: (jsonString: string): boolean => {
        try {
            const parsed = JSON.parse(jsonString) as SavedGeneration[];
            if (Array.isArray(parsed) && parsed.every(g => g.id && g.resumeData)) {
                // Merge with existing
                const existing = storageService.getGenerations();
                const merged = [...parsed, ...existing];

                // Remove duplicates by ID
                const uniqueIds = new Set();
                const unique = merged.filter(item => {
                    if (uniqueIds.has(item.id)) return false;
                    uniqueIds.add(item.id);
                    return true;
                });

                // Cap to 50
                const capped = unique
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 50);

                localStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
                return true;
            }
            return false;
        } catch (e) {
            console.error('Failed to import history', e);
            return false;
        }
    }
};
