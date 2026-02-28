import React, { useState, useRef, useEffect } from 'react';
import { initialResumeData } from './data/initialResume';
import { ResumeData, ResumeAnalytics } from './types';
import ResumePreview from './components/ResumePreview';
import { tailorResume } from './services/gemini';
import { Download, Loader2, Sparkles, FileText, CheckCircle2, TrendingUp, AlertCircle, Check, History, Code2, Upload, FileJson, RotateCcw, Menu, X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { storageService, SavedGeneration } from './services/storage';
import HistorySidebar from './components/HistorySidebar';
import JsonEditor from './components/JsonEditor';

type AppMode = 'generate' | 'history' | 'edit';

export default function App() {
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [jobDescription, setJobDescription] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isTailoring, setIsTailoring] = useState(false);
  const [summaryOfChanges, setSummaryOfChanges] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ResumeAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New State for Storage & Modes
  const [viewMode, setViewMode] = useState<AppMode>('generate');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [generations, setGenerations] = useState<SavedGeneration[]>([]);
  const [activeGenerationId, setActiveGenerationId] = useState<string | undefined>();
  const [zoom, setZoom] = useState<number>(1);
  const resumeRef = useRef<HTMLDivElement>(null);

  // Load history on mount
  useEffect(() => {
    setGenerations(storageService.getGenerations());
  }, []);

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      setError('Please enter a Job Description first.');
      return;
    }

    setIsTailoring(true);
    setError(null);
    setSummaryOfChanges(null);
    setAnalytics(null);

    try {
      const result = await tailorResume(resumeData, jobDescription);

      setResumeData(result.updatedResumeData);
      setSummaryOfChanges(result.summaryOfChanges);
      setAnalytics(result.analytics);

      // Save generation to history
      const saved = storageService.saveGeneration(companyName, jobDescription, result.updatedResumeData, result.analytics);
      setGenerations(storageService.getGenerations());
      setActiveGenerationId(saved.id);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to tailor resume. Please try again.');
    } finally {
      setIsTailoring(false);
    }
  };

  const handleSelectGeneration = (gen: SavedGeneration) => {
    setResumeData(gen.resumeData);
    setAnalytics(gen.analytics);
    setJobDescription(gen.jobDescription);
    setCompanyName(gen.companyName || '');
    setSummaryOfChanges(null);
    setActiveGenerationId(gen.id);
  };

  const handleDeleteGeneration = (id: string) => {
    storageService.deleteGeneration(id);
    setGenerations(storageService.getGenerations());
    if (activeGenerationId === id) {
      setActiveGenerationId(undefined);
    }
  };

  const handleExport = () => {
    const dataStr = storageService.exportHistory();
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const now = new Date();
    const istDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const timestamp = `${istDate.getFullYear()}-${String(istDate.getMonth() + 1).padStart(2, '0')}-${String(istDate.getDate()).padStart(2, '0')}_${String(istDate.getHours()).padStart(2, '0')}-${String(istDate.getMinutes()).padStart(2, '0')}-${String(istDate.getSeconds()).padStart(2, '0')}_IST`;

    const exportFileDefaultName = `resume_generations_backup_${timestamp}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = storageService.importHistory(content);
        if (success) {
          setGenerations(storageService.getGenerations());
          alert('History imported successfully!');
        } else {
          alert('Failed to import history. Invalid format.');
        }
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset to the default resume? Any unsaved changes will be lost.')) {
      setResumeData(initialResumeData);
      setJobDescription('');
      setCompanyName('');
      setSummaryOfChanges(null);
      setAnalytics(null);
      setActiveGenerationId(undefined);
    }
  };

  const handleManualSave = (parsedData: ResumeData) => {
    setResumeData(parsedData);
    if (activeGenerationId) {
      storageService.updateGeneration(activeGenerationId, parsedData);
      setGenerations(storageService.getGenerations());
    } else {
      // Create a manual generation if editing a brand-new untailored form
      const newGen = storageService.saveGeneration(
        companyName || 'Manual Entry',
        jobDescription || 'Manually edited JSON',
        parsedData,
        analytics || { previousAtsScore: 0, updatedAtsScore: 0, matchingScore: 0, missingKeywords: [], matchingKeywords: [] }
      );
      setActiveGenerationId(newGen.id);
      setGenerations(storageService.getGenerations());
    }
  };

  const handleDownloadPDF = useReactToPrint({
    contentRef: resumeRef,
    documentTitle: `${resumeData.name.replace(/\s+/g, '_')}_${resumeData.title.replace(/\s+/g, '_')}`,
    pageStyle: `
      @page {
        size: a4 portrait;
        margin: 0;
      }
      @media print {
        body {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `,
  });

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-surface border-b border-slate-200 px-4 md:px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 z-20 shrink-0">
        <div className="flex justify-between items-center w-full md:w-auto">
          <h1 className="text-xl font-bold text-primary flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Resume Builder
          </h1>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            title="Toggle Sidebar"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex bg-surface-muted p-1 rounded-lg border border-slate-200">
          <button
            onClick={() => setViewMode('generate')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'generate' ? 'bg-surface shadow-sm text-primary' : 'text-slate-600 hover:text-secondary'}`}
          >
            <Sparkles className="w-4 h-4" /> Generate
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'history' ? 'bg-surface shadow-sm text-primary' : 'text-slate-600 hover:text-secondary'}`}
          >
            <History className="w-4 h-4" /> History
          </button>
          <button
            onClick={() => setViewMode('edit')}
            className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === 'edit' ? 'bg-surface shadow-sm text-primary' : 'text-slate-600 hover:text-secondary'}`}
          >
            <Code2 className="w-4 h-4" /> Edit JSON
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-slate-200"
            title="Reset to default resume"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={() => handleDownloadPDF()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left/Middle Panel - Contextual Toolpanel */}
        <div className={`w-full lg:w-[400px] lg:flex-shrink-0 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 flex-col overflow-hidden relative z-10 lg:h-full lg:flex ${isSidebarOpen ? 'flex h-[55vh]' : 'hidden'}`}>

          {viewMode === 'generate' && (
            <div className="flex flex-col h-full bg-white relative">
              <div className="p-6 border-b border-slate-100 shrink-0">
                <h2 className="text-lg font-bold text-slate-900">Tailor for Job</h2>
                <p className="text-slate-500 mt-1 text-sm">
                  Let AI reframe your experience to match the exact keywords of your target job description.
                </p>
              </div>

              <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
                <div className="flex flex-col gap-2 shrink-0">
                  <label htmlFor="company" className="font-medium text-slate-700 text-sm">Company Name (Optional)</label>
                  <input
                    id="company"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Google, Apple, Startup Inc."
                    className="w-full p-3 border border-slate-200 rounded-xl bg-background focus:bg-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm text-slate-700"
                  />
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <label htmlFor="jd" className="font-medium text-slate-700 text-sm">Job Description</label>
                  <textarea
                    id="jd"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job requirements here..."
                    className="w-full h-48 p-4 border border-slate-200 rounded-xl bg-background focus:bg-surface focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none text-sm text-slate-700"
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-100 shrink-0">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleTailor}
                  disabled={isTailoring || !jobDescription.trim()}
                  className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isTailoring ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Tailoring Resume...</>
                  ) : (
                    <><Sparkles className="w-5 h-5" /> Auto-Tailor Resume</>
                  )}
                </button>

                {analytics && (
                  <div className="glass-card p-5 mt-2 animate-in fade-in flex-shrink-0">
                    <h3 className="font-semibold text-primary flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      Resume Analytics
                    </h3>

                    <div className="grid grid-cols-3 gap-2 mb-6">
                      <div className="bg-background rounded-lg p-2 text-center border border-slate-100">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1 truncate">Old ATS</div>
                        <div className="text-xl font-bold text-slate-700">{analytics.previousAtsScore}%</div>
                      </div>
                      <div className="bg-primary/5 rounded-lg p-2 text-center border border-primary/20">
                        <div className="text-[10px] text-primary uppercase font-semibold mb-1 truncate">New ATS</div>
                        <div className="text-xl font-bold text-primary">{analytics.updatedAtsScore}%</div>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-2 text-center border border-accent/20">
                        <div className="text-[10px] text-accent-hover uppercase font-semibold mb-1 truncate">Match</div>
                        <div className="text-xl font-bold text-accent-hover">{analytics.matchingScore}%</div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Keywords Hit</h4>
                        <div className="flex flex-wrap gap-1">
                          {(analytics.matchingKeywords || []).map((kw, i) => (
                            <span key={i} className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-emerald-200">{kw}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5 text-amber-500" /> Keywords Missed</h4>
                        <div className="flex flex-wrap gap-1">
                          {(analytics.missingKeywords || []).map((kw, i) => (
                            <span key={i} className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-medium border border-amber-200">{kw}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {summaryOfChanges && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-5 mb-6 shrink-0">
                    <h3 className="font-semibold text-emerald-800 flex items-center gap-2 mb-2 text-sm">
                      <CheckCircle2 className="w-4 h-4" /> AI Summary
                    </h3>
                    <div className="text-xs text-emerald-700 leading-relaxed whitespace-pre-wrap">
                      {summaryOfChanges}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {viewMode === 'history' && (
            <div className="flex flex-col h-full bg-slate-50 relative">
              <div className="p-4 bg-white border-b border-slate-200 shrink-0 flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Past Generations</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExport}
                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-surface-muted rounded-md transition-colors"
                    title="Export History"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <label
                    className="p-1.5 text-slate-500 hover:text-primary hover:bg-surface-muted rounded-md transition-colors cursor-pointer"
                    title="Import History"
                  >
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={handleImport}
                    />
                  </label>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                <HistorySidebar
                  generations={generations}
                  activeId={activeGenerationId}
                  onSelect={handleSelectGeneration}
                  onDelete={handleDeleteGeneration}
                />
              </div>
            </div>
          )}

          {viewMode === 'edit' && (
            <div className="flex flex-col h-full bg-slate-50 relative p-4">
              <JsonEditor data={resumeData} onSave={handleManualSave} />
            </div>
          )}
        </div>

        {/* Right Panel - Resume Live View */}
        <div className="flex-1 overflow-y-auto bg-slate-200/50 flex flex-col relative items-center justify-start p-4 md:p-10 print:p-0 print:bg-white">

          {/* Zoom Controls */}
          <div className="sticky top-0 mb-4 flex items-center bg-white border border-slate-200 shadow-sm rounded-lg p-1 z-10 print:hidden self-end">
            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.4))} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
            <span className="text-xs font-semibold px-2 w-12 text-center text-slate-700">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button onClick={() => setZoom(1)} className="p-1.5 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900 transition-colors" title="Reset Zoom"><Maximize className="w-4 h-4" /></button>
          </div>

          <ResumePreview data={resumeData} ref={resumeRef} zoom={zoom} />
        </div>
      </div>
    </div>
  );
}
