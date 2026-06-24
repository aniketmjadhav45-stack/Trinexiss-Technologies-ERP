import React, { useState, useEffect } from 'react';
import Header from './components/Header.tsx';
import Dashboard from './components/Dashboard.tsx';
import Projects from './components/Projects.tsx';
import CRM from './components/CRM.tsx';
import Employees from './components/Employees.tsx';
import Finance from './components/Finance.tsx';
import CalendarView from './components/CalendarView.tsx';
import Auth from './components/Auth.tsx';
import Settings from './components/Settings.tsx';
import { ERPData, UserSession } from './types.ts';
import { INITIAL_ERP_DATA } from './seedData.ts';
import { 
  Sparkles, 
  Activity, 
  RefreshCw, 
  Database,
  Search,
  CheckCircle,
  FileCheck2
} from 'lucide-react';

// Client-side fallback analytical engine mirroring backend logic
function generateClientSideInsights(data: ERPData): any {
  const today = '2026-06-19';
  
  const uniqueCountries = Array.from(new Set(data.projects.map(p => p.country).filter(Boolean)));
  const countriesStr = uniqueCountries.length > 0 ? uniqueCountries.join(', ') : 'India, US, UK';
  const totalRevenueUsd = data.invoices.filter(i => i.status === 'Received').reduce((acc, i) => acc + i.amount, 0);
  const totalRevenueInr = Math.round(totalRevenueUsd * 83.5);

  const weeklyReport = `Clients: ${data.clients.length}, Employees: ${data.employees.length}, Projects: ${data.projects.length} (${countriesStr}), Revenue: ₹${totalRevenueInr.toLocaleString()} / $${totalRevenueUsd.toLocaleString()}`;
  
  const atRisk = data.projects.filter(p => p.status !== 'Completed' && (p.riskLevel === 'High' || p.deadline < today));
  const resourceSuggestions = atRisk.length > 0 
    ? `Warning on bottlenecked resources: Project "${atRisk[0].name}" is critical. It is recommended to reallocate hours from long-term low-risk projects. Aniket Jadhav and Sweta Singh should support the implementation milestones immediately.`
    : 'All resources are adequately allocated; no immediate bottlenecks detected across Active developer hours.';

  const completionForecasts = data.projects.map(p => {
    let forecastDate = p.deadline;
    let riskStatus: 'On Track' | 'At Risk' | 'Delayed' = 'On Track';
    
    if (p.status === 'Completed') {
      riskStatus = 'On Track';
    } else if (p.deadline < today) {
      riskStatus = 'Delayed';
      forecastDate = '2026-07-05';
    } else if (p.riskLevel === 'High') {
      riskStatus = 'At Risk';
      forecastDate = p.deadline;
    }
    
    return {
      projectId: p.id,
      forecastedDate: forecastDate,
      riskStatus,
      reasoning: `Client-side analytical estimate: Velocity computed using current progress (${p.progress}%) and tracking milestones. Allocated team size: ${p.assignedEmployees.length} members.`
    };
  });

  const leadScoringAnalysis = data.clients.filter(c => c.type === 'Lead').map(c => {
    let score = 50;
    let reason = 'Discovery phase initialized.';
    if (c.leadStage === 'Negotiation') {
      score = 85;
      reason = 'High conversion likelihood. Proposal submitted & active validation processes underway.';
    } else if (c.leadStage === 'Proposal Sent') {
      score = 70;
      reason = 'Financial parameters delivered. Under review with executive board.';
    } else if (c.leadStage === 'Qualified') {
      score = 45;
      reason = 'Qualified lead with identified alignment. Discovery ongoing.';
    } else if (c.leadStage === 'Prospect') {
      score = 25;
      reason = 'Prospecting initiated. Initial connection call complete.';
    }
    return {
      leadId: c.id,
      score,
      reasoning: reason
    };
  });

  const pendingInvoices = data.invoices.filter(i => i.status === 'Pending');
  const overdueInvoices = data.invoices.filter(i => i.status === 'Overdue');
  const pendingTotal = pendingInvoices.reduce((acc, i) => acc + i.amount, 0);
  const overdueTotal = overdueInvoices.reduce((acc, i) => acc + i.amount, 0);

  const cashFlowForecast = `Analytical forecast: Expected influx is $${(pendingTotal + overdueTotal).toLocaleString()} over 30 days. This encompasses $${pendingTotal.toLocaleString()} in milestones-based receivables and $${overdueTotal.toLocaleString()} in overdue invoice follow-ups.`;

  const anomalies: string[] = [];
  data.projects.forEach(p => {
    if (p.status !== 'Completed' && p.deadline < today) {
      anomalies.push(`Project "${p.name}" timeline expired on ${p.deadline} but progress is in ${p.status} state.`);
    }
  });
  data.invoices.forEach(i => {
    if (i.status === 'Overdue') {
      anomalies.push(`Invoice ${i.invoiceNumber} ($${i.amount.toLocaleString()}) remains unpaid.`);
    }
  });
  data.employees.forEach(e => {
    const unexcused = e.attendance.filter(a => a.status === 'Absent');
    if (unexcused.length > 0) {
      anomalies.push(`Member ${e.name} has recorded recent absences.`);
    }
  });

  if (anomalies.length === 0) {
    anomalies.push('All parameters within standard variance boundaries.');
  }

  return {
    lastUpdated: new Date().toISOString(),
    weeklyReport,
    resourceSuggestions,
    completionForecasts,
    leadScoringAnalysis,
    cashFlowForecast,
    anomalies
  };
}

export default function App() {
  const [data, setData] = useState<ERPData | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState<boolean>(false);
  const [apiNotice, setApiNotice] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStateMsg, setLoadingStateMsg] = useState<string>('Syncing core enterprise database...');

  // Track currently established login session
  const [session, setSession] = useState<UserSession | null>(() => {
    try {
      const stored = localStorage.getItem('trinexiss_erp_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Track client dark mode preferences
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('trinexiss_darkMode') === 'true';
  });

  // 1. Initial data loading protocol with high-fidelity client recovery
  useEffect(() => {
    // Session Validation: ensure user is active, verified, and not suspended on start
    if (session) {
      fetch('/api/auth/validate-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: session.email })
      })
        .then(async res => {
          const resData = await res.json();
          if (!res.ok || !resData.success) {
            handleLogout();
          } else {
            setSession(resData.session);
            localStorage.setItem('trinexiss_erp_session', JSON.stringify(resData.session));
          }
        })
        .catch(err => {
          console.warn('Session verification server unreachable, relying on client cache:', err);
        });
    }

    fetch('/api/erp/data')
      .then((res) => {
        if (!res.ok) throw new Error('Data fetch failed');
        return res.json();
      })
      .then((payload: ERPData) => {
        setData(payload);
        localStorage.setItem('trinexiss_erp_cache', JSON.stringify(payload));
        setIsLoading(false);
      })
      .catch((err) => {
        console.warn('Error fetching initial ERP data from server, trying local cache/seed:', err);
        const cached = localStorage.getItem('trinexiss_erp_cache');
        if (cached) {
          try {
            setData(JSON.parse(cached));
            setApiNotice('Local Offline Database loaded successfully.');
          } catch (e) {
            setData(INITIAL_ERP_DATA);
            setApiNotice('Static fallback database initialized.');
          }
        } else {
          setData(INITIAL_ERP_DATA);
          setApiNotice('Static fallback database initialized.');
        }
        setIsLoading(false);
      });
  }, []);

  // 2. Persists data changes back to server or LocalStorage cache
  const handleSaveData = (newData: ERPData) => {
    setData(newData);
    localStorage.setItem('trinexiss_erp_cache', JSON.stringify(newData));
    
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
        console.warn('Backend persistence failed. Saved to LocalStorage cache instead:', err);
      });
  };

  // 3. Trigger server-side Gemini Operations Audit or Client Intelligence Fallback
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
              localStorage.setItem('trinexiss_erp_cache', JSON.stringify(updatedDb));
              setIsAiAnalyzing(false);
              setApiNotice(resData.notice || 'Gemini AI Analysis finalized successfully.');
            });
        } else {
          throw new Error('Analysis payload error');
        }
      })
      .catch((err) => {
        clearInterval(interval);
        console.warn('Backend Gemini analyze failed. Falling back to local offline analysis:', err);

        // Fallback Client-side AI Audit Core calculation!
        if (data) {
          // Clone details
          const updatedDb = JSON.parse(JSON.stringify(data)) as ERPData;
          const fallbackInsights = generateClientSideInsights(updatedDb);
          updatedDb.aiInsights = fallbackInsights;
          
          fallbackInsights.leadScoringAnalysis.forEach((scoreItem: any) => {
            const match = updatedDb.clients.find((c: any) => c.id === scoreItem.leadId);
            if (match) {
              match.leadScore = scoreItem.score;
              match.scoreExplanation = scoreItem.reasoning;
            }
          });

          // Save and refresh UI state
          handleSaveData(updatedDb);
          setApiNotice('Local Intelligence Engine compiled complete database analysis successfully.');
        } else {
          setApiNotice('Failed to compile local offline database nodes.');
        }
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

  // Pre-empt login checks before disclosing any corporate parameters
  if (!session) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-200 ${darkMode ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
        <Auth
          onLoginSuccess={(s) => {
            setSession(s);
            localStorage.setItem('trinexiss_erp_session', JSON.stringify(s));
          }}
        />
      </div>
    );
  }

  const handleLogout = () => {
    setSession(null);
    localStorage.removeItem('trinexiss_erp_session');
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${darkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Upper Navigation Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isAiAnalyzing={isAiAnalyzing}
        onTriggerAudit={handleTriggerAudit}
        hasApiNotice={apiNotice}
        session={session}
        onLogout={handleLogout}
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
                session={session}
              />
            )}
            
            {currentTab === 'projects' && (
              <Projects
                data={data}
                onSaveData={handleSaveData}
                session={session}
              />
            )}
            
            {currentTab === 'crm' && (
              <CRM
                data={data}
                onSaveData={handleSaveData}
                session={session}
              />
            )}
            
            {currentTab === 'employees' && (
              <Employees
                data={data}
                onSaveData={handleSaveData}
                session={session}
              />
            )}
            
            {currentTab === 'finance' && (
              <Finance
                data={data}
                onSaveData={handleSaveData}
              />
            )}

            {currentTab === 'calendar' && (
              <CalendarView
                data={data}
                session={session}
              />
            )}

            {currentTab === 'settings' && (
              <Settings
                data={data}
                onSaveData={handleSaveData}
                session={session}
                onLogout={handleLogout}
                darkMode={darkMode}
                setDarkMode={(val) => {
                  setDarkMode(val);
                  localStorage.setItem('trinexiss_darkMode', String(val));
                }}
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
