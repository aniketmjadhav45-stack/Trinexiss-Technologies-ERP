import React, { useState } from 'react';
import { 
  DollarSign, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  Lightbulb, 
  Zap,
  Globe2,
  Mail,
  Send,
  CheckCircle2,
  ListFilter,
  Layers,
  Heart,
  BarChart3,
  BadgeAlert
} from 'lucide-react';
import { ERPData, ClientLead, Project, Employee } from '../types.ts';

interface DashboardProps {
  data: ERPData;
  onTriggerAudit: () => void;
  isAiAnalyzing: boolean;
}

export default function Dashboard({ data, onTriggerAudit, isAiAnalyzing }: DashboardProps) {
  const today = '2026-06-19';
  const managerEmail = 'info@trinexiss.com';

  // Manager report submission state
  const [reportRecipient, setReportRecipient] = useState(managerEmail);
  const [reportSubject, setReportSubject] = useState('Trinexiss Technologies - Executive Weekly Status Report');
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [reportSentStatus, setReportSentStatus] = useState<string | null>(null);

  // 1. Core General Metrics
  const activeProjectsCount = data.projects.filter(p => p.status !== 'Completed').length;
  
  // Total of all active contract values
  const totalRevenueBook = data.projects.reduce((acc, p) => acc + p.cost, 0);
  
  // Received/cleared funds
  const receivedRevenue = data.invoices
    .filter(i => i.status === 'Received')
    .reduce((acc, i) => acc + i.amount, 0);

  // Pending vs Overdue
  const pendingRevenue = data.invoices.filter(i => i.status === 'Pending').reduce((acc, i) => acc + i.amount, 0);
  const overdueRevenue = data.invoices.filter(i => i.status === 'Overdue').reduce((acc, i) => acc + i.amount, 0);

  // CRM Leads
  const leads = data.clients.filter(c => c.type === 'Lead');
  const clientsCount = data.clients.filter(c => c.type === 'Client').length;
  const pipelineValue = leads.reduce((acc, l) => acc + l.dealValue, 0);
  
  // Attendance metrics
  const staffPresentCount = data.employees.filter(e => {
    const record = e.attendance.find(a => a.date === today);
    return record && record.status === 'Present';
  }).length;

  const averageProductivity = Math.round(
    data.employees.reduce((acc, e) => acc + e.productivityScore, 0) / data.employees.length
  );

  // 2. Client segmentation metrics (Domestic vs. International)
  const domesticCount = data.clients.filter(c => c.segmentation === 'Domestic').length;
  const internationalCount = data.clients.filter(c => c.segmentation === 'International').length;

  // 3. Country-wise project distribution & Country-wise revenue
  const countriesSet = Array.from(new Set(data.projects.map(p => p.country).filter(Boolean)));
  
  const projectsByCountry: { [key: string]: number } = {};
  data.projects.forEach(p => {
    projectsByCountry[p.country] = (projectsByCountry[p.country] || 0) + 1;
  });

  const revenueByCountry: { [key: string]: number } = {};
  data.invoices.forEach(inv => {
    if (inv.status === 'Received') {
      const proj = data.projects.find(p => p.id === inv.projectId);
      const country = proj?.country || 'US';
      revenueByCountry[country] = (revenueByCountry[country] || 0) + inv.amount;
    }
  });

  // 4. Employee Department distribution
  const departmentCounts: { [key: string]: number } = {};
  data.employees.forEach(emp => {
    departmentCounts[emp.department] = (departmentCounts[emp.department] || 0) + 1;
  });

  // 5. Simulate sending email report to manager
  const handleSendReportEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSendingReport(true);
    setReportSentStatus(null);
    
    setTimeout(() => {
      setIsSendingReport(false);
      setReportSentStatus(`Weekly Status Report has been successfully compiled and dispatched to ${reportRecipient}.`);
      
      // Auto fadeout success prompt
      setTimeout(() => {
        setReportSentStatus(null);
      }, 7000);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Dynamic Greetings Bar with AI status summary */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900 text-white rounded-2xl shadow-md border border-slate-800 gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Trinexiss Global Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyzing company operations: {data.projects.length} Projects, {data.clients.length} Corporate Accounts, and {data.employees.length} Engineers.
          </p>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] uppercase bg-slate-800 border border-slate-700 text-teal-400 px-2 py-0.5 rounded-md font-semibold tracking-wider font-mono">
              Live: {data.aiInsights?.weeklyReport || 'Awaiting Sync'}
            </span>
          </div>
        </div>
        <button
          onClick={onTriggerAudit}
          disabled={isAiAnalyzing}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 font-semibold text-xs px-5 py-2.5 rounded-xl text-slate-950 transition-all active:scale-95 cursor-pointer disabled:opacity-50 shrink-0"
        >
          <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
          <span>{isAiAnalyzing ? 'Extracting Insights...' : 'Run Gemini Audit Command'}</span>
        </button>
      </div>

      {/* KPI Core Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div id="kpi-revenue" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Booked Value</p>
            <h3 className="text-lg font-bold text-slate-950 font-mono mt-0.5">
              ${totalRevenueBook.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Collected: <span className="font-semibold text-emerald-600">${receivedRevenue.toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div id="kpi-projects" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Briefcase className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active projects</p>
            <h3 className="text-lg font-bold text-slate-950 font-mono mt-0.5">{activeProjectsCount} Projects</h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
              Across ({countriesSet.join(', ')})
            </p>
          </div>
        </div>

        {/* Metric 3 */}
        <div id="kpi-leads" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pipeline Lead Bid</p>
            <h3 className="text-lg font-bold text-slate-950 font-mono mt-0.5">
              ${pipelineValue.toLocaleString()}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
              Invoiced: <span className="font-bold text-indigo-600">${leads.length} Leads</span>
            </p>
          </div>
        </div>

        {/* Metric 4 */}
        <div id="kpi-staff" className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Attendance Index</p>
            <h3 className="text-lg font-bold text-slate-950 font-mono mt-0.5">
              {staffPresentCount} / {data.employees.length} Present
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Rating index: <span className="font-semibold text-teal-600">{averageProductivity}% Prod</span>
            </p>
          </div>
        </div>
      </div>

      {/* NEW BENTO GRIDS - GATHERING REGIONAL AND SEGMENT DASHBOARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Widget 1: Client Overview & Domestic vs International Segmentation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-250 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Globe2 className="h-4 w-4 text-indigo-500" />
                <span>Client Base & Segmentation</span>
              </h3>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                Total: {data.clients.length} Profiles
              </span>
            </div>

            {/* Segmentation Ratio Visualizer */}
            <div className="py-4 space-y-3">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">Domestic Markets</span>
                  <span>{domesticCount} ({Math.round((domesticCount / data.clients.length) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${(domesticCount / data.clients.length) * 100}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1">International Markets</span>
                  <span>{internationalCount} ({Math.round((internationalCount / data.clients.length) * 100)}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${(internationalCount / data.clients.length) * 100}%` }}></div>
                </div>
              </div>
            </div>

            {/* Minor Client list table preview with custom health scores */}
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto pr-1">
              {data.clients.slice(0, 4).map(client => (
                <div key={client.id} className="flex justify-between items-center text-xs p-2 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-bold text-slate-800">{client.company}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{client.industry} • {client.country}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      client.healthScore >= 90 ? 'bg-emerald-100 text-emerald-800' :
                      client.healthScore >= 75 ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      Health: {client.healthScore}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="pt-3 border-t border-slate-100 mt-4 text-[10px] text-slate-400 font-semibold italic text-center">
            Domestic: India • International: US, UK, Germany
          </div>
        </div>

        {/* Widget 2: Country-wise Project Distribution & Revenue Dashboards */}
        <div className="bg-white p-5 rounded-2xl border border-slate-250 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="h-4 w-4 text-emerald-600" />
                <span>Geographic Project & Revenue Book</span>
              </h3>
            </div>

            <div className="py-4 space-y-3">
              {projectsByCountry && Object.keys(projectsByCountry).map((country) => {
                const projCount = projectsByCountry[country];
                const revenueReceived = revenueByCountry[country] || 0;
                return (
                  <div key={country} className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs text-slate-700">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span className="flex items-center gap-1.5 uppercase font-mono tracking-wider">{country}</span>
                      <span>{projCount} {projCount === 1 ? 'Project' : 'Projects'}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-semibold font-mono">
                      <span>Cleared Revenues:</span>
                      <span className="text-emerald-600 font-bold">${revenueReceived.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-500 font-semibold text-center leading-relaxed">
            Regional conversion scale is predicted steady based on global billing records.
          </div>
        </div>

        {/* Widget 3: Personnel Departments & Dynamic Allocations */}
        <div className="bg-white p-5 rounded-2xl border border-slate-250 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-blue-500" />
                <span>Personnel Departments</span>
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-bold">
                {data.employees.length} Staff
              </span>
            </div>

            {/* Department representation */}
            <div className="py-4 space-y-3">
              {Object.keys(departmentCounts).map((dept) => {
                const count = departmentCounts[dept];
                const percent = Math.round((count / data.employees.length) * 100);
                return (
                  <div key={dept} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-slate-700">
                      <span>{dept}</span>
                      <span className="font-bold text-slate-900">{count} {count === 1 ? 'person' : 'personnel'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full rounded-full" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[10px] text-slate-400 font-semibold text-center leading-normal">
            Continuous dev assignments: Sarah, David, Maria, Alex.
          </div>
        </div>

      </div>

      {/* AI Strategy & Alerts split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Gemini Executive Insights - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              <h2 className="text-md font-bold text-slate-950">Gemini Corporate AI Analytics</h2>
              {data.aiInsights?.lastUpdated && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full font-mono ml-auto">
                  Synced: {new Date(data.aiInsights.lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              )}
            </div>

            {/* AI Weekly Status Report */}
            <div className="space-y-4">
              <div className="bg-emerald-50/20 p-4.5 rounded-xl border border-emerald-100/50">
                <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5 mb-2 font-mono">
                  <Zap className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Real status weekly briefing</span>
                </h3>
                <p className="text-xs font-extrabold text-emerald-900 leading-relaxed font-mono">
                  {data.aiInsights?.weeklyReport || 'Audit needed. Launch command from console.'}
                </p>
              </div>

              {/* AI Resource Reallocation suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-150 p-4 rounded-xl space-y-1 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-1 text-slate-700">
                    <Lightbulb className="h-3.5 w-3.5 text-blue-500 animate-pulse" />
                    Resource Realignment
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {data.aiInsights?.resourceSuggestions || 'Execute Audit to compute staff reallocation suggestions.'}
                  </p>
                </div>

                <div className="border border-slate-150 p-4 rounded-xl space-y-1 bg-slate-50/50">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 mb-1 text-slate-700">
                    <Clock className="h-3.5 w-3.5 text-emerald-500" />
                    Finances & Asset Flow
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                    {data.aiInsights?.cashFlowForecast || 'Ready to forecast regional collections.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI completion date forecasts table */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/85 shadow-xs">
            <h3 className="text-sm font-bold text-slate-950 mb-3.5 flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-slate-600" />
              <span>AI Completion Date Forecasts & Deliverables</span>
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs bg-slate-50/50 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] tracking-wider">
                    <th className="p-3.5">Project Block</th>
                    <th className="p-3.5">Contract Deadline</th>
                    <th className="p-3.5">AI Scheduled Forecast</th>
                    <th className="p-3.5 text-center">Status</th>
                    <th className="p-3.5">Reallocation / Logic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs font-medium">
                  {data.projects.map((proj) => {
                    const forecast = data.aiInsights?.completionForecasts?.find(f => f.projectId === proj.id);
                    return (
                      <tr key={proj.id} className="hover:bg-slate-50">
                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{proj.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase">{proj.country} • {proj.tools.slice(0, 3).join(', ')}</p>
                        </td>
                        <td className="p-3.5 font-mono text-slate-500">{proj.deadline}</td>
                        <td className="p-3.5 font-mono text-slate-800 font-bold">
                          {forecast ? forecast.forecastedDate : 'Re-run analysis'}
                        </td>
                        <td className="p-3.5 text-center">
                          {forecast ? (
                            <span className={`px-2 py-0.5 rounded font-black text-[9px] uppercase ${
                              forecast.riskStatus === 'On Track' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                              forecast.riskStatus === 'At Risk' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                              'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}>
                              {forecast.riskStatus}
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500 text-[11px]" title={forecast?.reasoning}>
                          {forecast?.reasoning || 'Awaiting analysis triggers...'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Operational Alerts & NEW manager email module - 1/3 */}
        <div className="space-y-6">
          
          {/* Email Report to Managers Widget */}
          <div className="bg-white p-5 rounded-2xl border border-indigo-150 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 pb-2 border-b border-slate-100">
              <Mail className="h-4.5 w-4.5 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Email Status to Manager</h3>
            </div>
            
            <p className="text-[11px] text-slate-500 leading-normal font-medium">
              Send a weekly summary report of client satisfaction, project performance, country-wise metrics, and finances directly to executive managers.
            </p>

            <form onSubmit={handleSendReportEmail} className="space-y-3.5 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Manager Recipient *</label>
                <input 
                  type="email"
                  required
                  value={reportRecipient}
                  onChange={e => setReportRecipient(e.target.value)}
                  className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase">Subject *</label>
                <input 
                  type="text"
                  required
                  value={reportSubject}
                  onChange={e => setReportSubject(e.target.value)}
                  className="mt-1 w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none"
                />
              </div>

              {/* Live formatted report preview block */}
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[10px] text-teal-400 space-y-1.5 overflow-hidden select-none">
                <p className="text-slate-500 text-[9px] uppercase border-b border-slate-800 pb-1">Report Contents Preview</p>
                <p className="text-white font-bold">TO: {reportRecipient}</p>
                <p className="truncate text-slate-400 font-bold">{data.aiInsights?.weeklyReport || "Clients: 8, Employees: 6, Projects: 4 (India, US, UK), Revenue: ₹3,103,500 / $37,500"}</p>
                <p className="text-slate-400">Total Pipeline Bid: ${pipelineValue.toLocaleString()}</p>
                <p className="text-[10px] text-teal-500 leading-normal">Operational risk alerts count: {data.aiInsights?.anomalies.length || 3}</p>
              </div>

              <button
                type="submit"
                disabled={isSendingReport}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-xs transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                {isSendingReport ? (
                  <>
                    <Clock className="h-3.5 w-3.5 animate-spin" />
                    <span>Dispatched draft...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-3.5 w-3.5 text-slate-100" />
                    <span>Email Report to Manager</span>
                  </>
                )}
              </button>
            </form>

            {reportSentStatus && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 p-3 rounded-xl text-[11px] font-medium leading-relaxed animate-fadeIn flex gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{reportSentStatus}</span>
              </div>
            )}
          </div>

          {/* Operational Risk Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-1.5 text-rose-600 border-b border-slate-50 pb-2">
              <BadgeAlert className="h-4 w-4" />
              <span>Operational risk alerts</span>
            </h3>
            
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {data.aiInsights?.anomalies && data.aiInsights.anomalies.length > 0 ? (
                data.aiInsights.anomalies.map((anomaly, idx) => (
                  <div key={idx} className="flex gap-2.5 p-3 rounded-xl bg-orange-50/50 border border-orange-100/60 text-xs font-semibold leading-relaxed">
                    <AlertTriangle className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                    <p className="text-slate-600">{anomaly}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  All systems operational. No immediate alerts flagged.
                </div>
              )}
            </div>
          </div>

          {/* Quick cash inflow indicators */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/85">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2 flex items-center justify-between">
              <span>Financial Cash Flow</span>
              <span className="text-[10px] bg-slate-100 p-1 rounded font-mono font-bold">${receivedRevenue.toLocaleString()} Received</span>
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs text-slate-500 mb-1 font-bold">
                  <span>Collected Progress Bar</span>
                  <span className="font-semibold text-slate-900">{Math.round((receivedRevenue / (totalRevenueBook || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full" 
                    style={{ width: `${(receivedRevenue / (totalRevenueBook || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs font-semibold">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Milestones Pending</p>
                  <p className="text-sm font-bold text-slate-800 font-mono mt-0.5">${pendingRevenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">Payments Overdue</p>
                  <p className="text-sm font-bold text-rose-600 font-mono mt-0.5">${overdueRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
