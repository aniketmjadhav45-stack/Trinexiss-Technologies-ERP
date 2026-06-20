import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import Projects from './components/Projects.tsx';
import CRM from './components/CRM.tsx';
import Employees from './components/Employees.tsx';
import Finance from './components/Finance.tsx';
import { ERPData } from './types.ts';
import { 
  Sparkles, 
  Activity, 
  RefreshCw, 
  Database,
  Search,
  CheckCircle,
  FileCheck2
} from 'lucide-react';

export default function App() {
  const [data, setData] = useState<ERPData | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [apiNotice, setApiNotice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStateMsg, setLoadingStateMsg] = useState<string>('Syncing core enterprise database...');

  // 1. Initial data loading protocol
  useEffect(() => {
    fetch('/api/erp/data')
      .then((res) => {
        if (!res.ok) throw new Error('Data fetch failed');
        return res.json();
      })
      .then((payload: ERPData) => {
        setData(payload);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching initial ERP data:', err);
        setIsLoading(false);
      });
  }, []);

  // 2. Persists data changes back to the Express database file
  const handleSaveData = (newData: ERPData) => {
    setData(newData);
    
    fetch('/api/erp/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newData),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to update server datastore');
        return res.json();
      })
      .then((result) => {
        console.log('Database written back to server successfully.');
      })
      .catch((err) => {
        console.error('Persistence failed:', err);
      });
  };

  // 3. Trigger server-side Gemini Operations Audit
  const handleTriggerAudit = () => {
    setIsAiAnalyzing(true);
    setLoadingStateMsg('Assembling ledger nodes...');
    
    // Stagger funny professional loading notices for extreme visual immersion!
    const notices = [
      'Synchronizing invoice milestones...',
      'Grounding forecasting models with Gemini AI...',
      'Computing project velocity completion matrices...',
      'Mapping staffing vectors with daily attendance records...',
      'Deriving CRM conversion ratios & lead scores...'
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < notices.length) {
        setLoadingStateMsg(notices[index]);
        index++;
      }
    }, 1200);

    fetch('/api/erp/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error('AI analysis failed');
        return res.json();
      })
      .then((resData) => {
        clearInterval(interval);
        if (resData.success && resData.insights) {
          // Re-sync with newly analytical database parameters!
          fetch('/api/erp/data')
            .then(res => res.json())
            .then((updatedDb: ERPData) => {
              setData(updatedDb);
              setIsAiAnalyzing(false);
              setApiNotice(resData.notice || '');
            });
        } else {
          throw new Error('Analysis payload error');
        }
      })
      .catch((err) => {
        clearInterval(interval);
        console.error('Gemini audit execution error:', err);
        setIsAiAnalyzing(false);
      });
  };

  // Initial loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white px-4">
        <div className="space-y-4 text-center max-w-sm animate-pulse">
          <div className="bg-emerald-500 p-4 rounded-2xl inline-block shadow-md">
            <RefreshCw className="h-8 w-8 text-black animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Trinexiss Core</h2>
            <p className="text-xs text-slate-400 mt-1">{loadingStateMsg}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Upper Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAiAnalyzing={isAiAnalyzing}
        onTriggerAudit={handleTriggerAudit}
        hasApiNotice={apiNotice}
      />

      {/* Main Container with subtle route animation container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data ? (
          <div>
            {currentTab === 'dashboard' && (
              <Dashboard
                data={data}
                onTriggerAudit={handleTriggerAudit}
                isAiAnalyzing={isAiAnalyzing}
              />
            )}
            
            {currentTab === 'projects' && (
              <Projects
                data={data}
                onSaveData={handleSaveData}
              />
            )}
            
            {currentTab === 'crm' && (
              <CRM
                data={data}
                onSaveData={handleSaveData}
              />
            )}
            
            {currentTab === 'employees' && (
              <Employees
                data={data}
                onSaveData={handleSaveData}
              />
            )}
            
            {currentTab === 'finance' && (
              <Finance
                data={data}
                onSaveData={handleSaveData}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl max-w-xl mx-auto space-y-4">
            <Database className="h-10 w-10 text-slate-300 mx-auto" />
            <div>
              <p className="text-sm font-semibold text-slate-700">Unable to retrieve database nodes</p>
              <p className="text-xs text-slate-400 mt-1">Please refresh the browser or restart the development server pipeline.</p>
            </div>
          </div>
        )}
      </main>

      {/* Animated full-screen audit loading screen */}
      {isAiAnalyzing && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center space-y-6">
            <div className="relative inline-block">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-teal-500 to-emerald-500 opacity-75 blur-md animate-pulse"></div>
              <div className="relative bg-black p-5 rounded-2xl">
                <Sparkles className="h-10 w-10 text-teal-400 animate-spin" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-md font-bold text-white tracking-tight">Gemini AI Audit Core Running</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-semibold">{loadingStateMsg}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Operations Analysis Model</p>
              <div className="flex justify-center gap-1">
                <span className="h-1.5 w-1.5 bg-teal-500 rounded-full animate-bounce"></span>
                <span className="h-1.5 w-1.5 bg-teal-500 rounded-full animate-bounce delay-75"></span>
                <span className="h-1.5 w-1.5 bg-teal-500 rounded-full animate-bounce delay-150"></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Corporate Footline */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 mt-12">
        <p className="font-semibold text-slate-500">© 2026 Trinexiss Technologies. All rights reserved.</p>
        <p className="text-[10px] text-slate-400 mt-1">AI-Powered ERP & CRM Suite v4.0.0 (Port 3000 Core Ingress)</p>
      </footer>

    </div>
  );
}
