import React from 'react';
import { ShieldCheck, Calendar, Radio, Sparkles } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAiAnalyzing: boolean;
  onTriggerAudit: () => void;
  hasApiNotice?: string;
}

export default function Header({ currentTab, setCurrentTab, isAiAnalyzing, onTriggerAudit, hasApiNotice }: HeaderProps) {
  const tabs = [
    { id: 'dashboard', label: 'Operations & AI' },
    { id: 'projects', label: 'Project Portfolio' },
    { id: 'crm', label: 'CRM Leads' },
    { id: 'employees', label: 'Staff & Attendance' },
    { id: 'finance', label: 'Finance & Ledger' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo and branding */}
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 text-white p-2.5 rounded-xl shadow-xs flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-slate-900">Trinexiss</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md font-semibold tracking-wider uppercase">ERP+CRM</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Technologies Ltd.</p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="hidden md:flex space-x-1 lg:space-x-2">
            {tabs.map((tab) => {
              const active = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`tab-btn-${tab.id}`}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* System Timeline and Gemini Trigger */}
          <div className="flex items-center gap-3">
            {/* System Status */}
            <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>DB SYNCED</span>
            </div>

            {/* Quick Live Clock */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>June 19, 2026</span>
            </div>

            {/* Glowing AI Audit Trigger */}
            <button
              id="ai-audit-trigger"
              onClick={onTriggerAudit}
              disabled={isAiAnalyzing}
              className={`relative overflow-hidden flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all duration-300 ${
                isAiAnalyzing
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white cursor-not-allowed opacity-80'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              {isAiAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent"></div>
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-300" />
                  <span>Gemini Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu trigger / Navigation Row */}
        <div className="flex md:hidden overflow-x-auto py-2 border-t border-slate-100 scrollbar-none gap-2">
          {tabs.map((tab) => {
            const active = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`mobile-tab-btn-${tab.id}`}
                onClick={() => setCurrentTab(tab.id)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
                  active
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Floating notice for simulated AI when API Key is pending */}
      {hasApiNotice && (
        <div className="bg-amber-50 border-b border-amber-200/50 py-1.5 px-4 text-center">
          <p className="text-xs font-medium text-amber-700 flex items-center justify-center gap-1.5">
            <Radio className="h-3 w-3 animate-pulse text-amber-500" />
            <span>{hasApiNotice}</span>
          </p>
        </div>
      )}
    </header>
  );
}
