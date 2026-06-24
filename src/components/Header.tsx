import React from 'react';
import { ShieldCheck, Calendar, Radio, Sparkles, LogOut, Settings } from 'lucide-react';
import { UserSession } from '../types.ts';

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAiAnalyzing: boolean;
  onTriggerAudit: () => void;
  hasApiNotice?: string;
  session: UserSession;
  onLogout: () => void;
}

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  isAiAnalyzing, 
  onTriggerAudit, 
  hasApiNotice,
  session,
  onLogout
}: HeaderProps) {
  const allTabs = [
    { id: 'dashboard', label: 'Operations & AI' },
    { id: 'projects', label: 'Project Portfolio' },
    { id: 'crm', label: 'CRM Leads' },
    { id: 'employees', label: 'Staff & Attendance' },
    { id: 'finance', label: 'Finance & Ledger' },
    { id: 'calendar', label: 'Company Calendar' },
    { id: 'settings', label: 'Settings & Logs' }
  ];

  // Dynamic tabs filtering based on Role-Based Access Control (RBAC)
  const getTabsForUser = () => {
    const isAdmin = session.role === 'Admin' || session.role === 'Founder' || session.role === 'AI Engineer';
    if (isAdmin) {
      return allTabs;
    }

    // Standard employee: retrieve dynamic permissions from the employee profile
    const allowedTabIds = ['dashboard', 'settings', 'employees', 'calendar']; // Always allow Operations, Settings, Profile, and Calendar
    try {
      const cacheStored = localStorage.getItem('trinexiss_erp_cache');
      if (cacheStored) {
        const erpDb = JSON.parse(cacheStored);
        const empProfile = erpDb?.employees?.find((e: any) => e.email.toLowerCase() === session.email.toLowerCase());
        if (empProfile && Array.isArray(empProfile.assignedModules)) {
          empProfile.assignedModules.forEach((mod: string) => {
            if (mod === 'Projects Portfolio') allowedTabIds.push('projects');
            if (mod === 'CRM Leads') allowedTabIds.push('crm');
            if (mod === 'Finance Ledger') allowedTabIds.push('finance');
            if (mod === 'Staff Attendance') allowedTabIds.push('employees');
          });
        }
      }
    } catch (e) {
      console.warn('Could not load RBAC permissions for header navigation:', e);
    }

    // Filter to allowed tab entries
    return allTabs.filter(tab => allowedTabIds.includes(tab.id));
  };

  const tabs = getTabsForUser();

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
              <p className="text-[11px] text-slate-400 font-medium font-sans">Technologies Ltd.</p>
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
                  className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-semibold transition-all duration-200 ${
                    active
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-905 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
 
          {/* System Timeline and Gemini Trigger + Session profile */}
          <div className="flex items-center gap-3">
            
            {/* Session Identification display */}
            <div className="hidden lg:flex flex-col items-end text-right">
              <p className="text-xs font-extrabold text-slate-800 leading-none">{session.fullName}</p>
              <p className="text-[10px] text-indigo-650 font-bold tracking-wide mt-0.5 uppercase">{session.role}</p>
            </div>

            {/* Glowing AI Audit Trigger */}
            <button
              id="ai-audit-trigger"
              onClick={onTriggerAudit}
              disabled={isAiAnalyzing}
              className={`relative overflow-hidden flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition-all duration-300 cursor-pointer ${
                isAiAnalyzing
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white cursor-not-allowed opacity-80'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
              }`}
            >
              {isAiAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
                  <span>Auditing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 animate-pulse text-amber-300" />
                  <span>Gemini Audit</span>
                </>
              )}
            </button>

            {/* Logout Trigger button */}
            <button
              onClick={onLogout}
              className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition-all"
              title="Logout session"
            >
              <LogOut className="h-4 w-4" />
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
        <div className="bg-amber-50 border-b border-amber-200/50 py-1 px-4 text-center">
          <p className="text-[10px] font-bold text-amber-700 flex items-center justify-center gap-1.5">
            <Radio className="h-3 w-3 animate-pulse text-amber-500" />
            <span>{hasApiNotice}</span>
          </p>
        </div>
      )}
    </header>
  );
}
