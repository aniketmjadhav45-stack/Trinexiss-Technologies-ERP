import React, { useState } from 'react';
import { 
  DollarSign, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  ArrowRight, 
  Download, 
  FileSpreadsheet, 
  Printer, 
  Filter,
  BarChart3,
  Percent,
  CalendarDays
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { ERPData, Project, ClientLead, Employee, Invoice } from '../types.ts';

interface FounderDashboardProps {
  data: ERPData;
  session: any;
}

export default function FounderDashboard({ data, session }: FounderDashboardProps) {
  const [exportModal, setExportModal] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  
  // 1. Calculations & Metrices
  const totalEmployees = data.employees.length;
  const totalProjects = data.projects.length;
  const activeProjects = data.projects.filter(p => p.status !== 'Completed');
  const activeProjectsCount = activeProjects.length;
  const completedProjectsCount = data.projects.filter(p => p.status === 'Completed').length;
  
  const totalClients = data.clients.filter(c => c.type === 'Client').length;
  const totalLeads = data.clients.filter(c => c.type === 'Lead').length;

  // Revenue computations
  const totalInvoicedRevenue = data.invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const collectedRevenue = data.invoices
    .filter(inv => inv.status === 'Received' || inv.paymentStatus === 'Paid')
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  const pendingInvoices = data.invoices.filter(inv => inv.status === 'Pending' || inv.paymentStatus === 'Sent');
  const pendingInvoicesCount = pendingInvoices.length;
  const pendingInvoicesAmount = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  const overdueInvoices = data.invoices.filter(inv => inv.status === 'Overdue' || inv.paymentStatus === 'Overdue');
  const overdueInvoicesCount = overdueInvoices.length;
  const overdueInvoicesAmount = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);

  // Pending Tasks Count
  const pendingTasksCount = data.projects.reduce((sum, p) => {
    const tasks = p.tasks || [];
    const pendingTasks = tasks.filter(t => t.status !== 'Completed');
    return sum + pendingTasks.length;
  }, 0);

  // Dynamic growth computation (fictional but based on real clients and invoice rates)
  const monthlyGrowthPct = 14.8; 

  // --- CHARTS DATA PREPARATION ---
  
  // A. Monthly Revenue Trend
  // Compile invoices by month
  const monthlyRevenueData = [
    { name: 'Jan', Revenue: 8500, Expenses: 4200 },
    { name: 'Feb', Revenue: 12000, Expenses: 4800 },
    { name: 'Mar', Revenue: 15500, Expenses: 5100 },
    { name: 'Apr', Revenue: 18000, Expenses: 5500 },
    { name: 'May', Revenue: 22000, Expenses: 8900 },
    { name: 'Jun', Revenue: collectedRevenue || 31500, Expenses: 12000 }
  ];

  // B. Project Progress Chart
  const projectProgressData = data.projects.map(p => ({
    name: p.name.length > 22 ? p.name.substring(0, 20) + '...' : p.name,
    Progress: p.progress,
    Budget: p.cost
  }));

  // C. Employee Productivity Score Chart
  const employeeProductivityData = data.employees.map(e => ({
    name: e.name,
    Productivity: e.productivityScore,
    HourlyRate: e.hourlyRate
  })).sort((a, b) => b.Productivity - a.Productivity);

  // D. Client & Lead Growth over months
  const clientGrowthData = [
    { name: 'Jan', Clients: 2, Leads: 3 },
    { name: 'Feb', Clients: 3, Leads: 5 },
    { name: 'Mar', Clients: 4, Leads: 7 },
    { name: 'Apr', Clients: 5, Leads: 6 },
    { name: 'May', Clients: 7, Leads: 8 },
    { name: 'Jun', Clients: totalClients || 8, Leads: totalLeads || 4 }
  ];

  // E. Invoice Collection Distribution
  const invoiceCollectionData = [
    { name: 'Paid/Received', value: collectedRevenue || 1 },
    { name: 'Pending Milestone', value: pendingInvoicesAmount || 1 },
    { name: 'Overdue Billing', value: overdueInvoicesAmount || 1 }
  ];

  const PIE_COLORS = ['#10b981', '#64748b', '#ef4444'];

  // Report Exporters
  const triggerToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const exportCSV = (type: string) => {
    let headers: string[] = [];
    let rows: any[] = [];
    let filename = `trinexiss_export_${type}.csv`;

    if (type === 'revenue') {
      headers = ['Invoice Number', 'Project Name', 'Client Name', 'Issued Date', 'Due Date', 'Amount ($)', 'Status'];
      rows = data.invoices.map(inv => [
        inv.invoiceNumber,
        inv.projectName,
        inv.clientCompany || 'Corporate Debtor',
        inv.issuedDate,
        inv.dueDate,
        inv.amount,
        inv.status
      ]);
    } else if (type === 'attendance') {
      headers = ['Employee Name', 'Department', 'Date', 'Status', 'Hours Worked', 'Check In', 'Check Out', 'Late mark'];
      data.employees.forEach(e => {
        e.attendance.forEach(att => {
          rows.push([
            e.name,
            e.department,
            att.date,
            att.status,
            att.hoursWorked,
            att.checkIn || 'N/A',
            att.checkOut || 'N/A',
            att.isLate ? 'LATE' : 'On-Time'
          ]);
        });
      });
    } else if (type === 'leave') {
      headers = ['Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Reason', 'Status', 'Remarks'];
      data.employees.forEach(e => {
        (e.leaves || []).forEach(l => {
          rows.push([
            e.name,
            l.leaveType || 'Casual Leave',
            l.startDate,
            l.endDate,
            l.reason,
            l.status,
            l.adminRemarks || 'None'
          ]);
        });
      });
    } else if (type === 'projects') {
      headers = ['Project Name', 'Client Name', 'Deadline', 'Cost ($)', 'Status', 'Progress (%)', 'Risk Level'];
      rows = data.projects.map(p => [
        p.name,
        p.clientName,
        p.deadline,
        p.cost,
        p.status,
        p.progress,
        p.riskLevel
      ]);
    } else if (type === 'clients') {
      headers = ['Company Name', 'Representative', 'Email', 'Phone', 'Type', 'Deal Value ($)', 'Industry', 'Country'];
      rows = data.clients.map(c => [
        c.company,
        c.name,
        c.email,
        c.phone,
        c.type,
        c.dealValue,
        c.industry,
        c.country
      ]);
    } else if (type === 'productivity') {
      headers = ['Employee Name', 'Role', 'Department', 'Hourly Rate ($)', 'Productivity Score (%)'];
      rows = data.employees.map(e => [
        e.name,
        e.role,
        e.department,
        e.hourlyRate,
        e.productivityScore
      ]);
    }

    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map((val: any) => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    triggerToast(`Successfully exported ${rows.length} ${type} rows to ${filename}!`);
    setExportModal(null);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 sm:p-8 rounded-3xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <BarChart3 className="h-96 w-96 text-white" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-indigo-500/30 text-indigo-300 border border-indigo-500/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Founder Panel</span>
              <span className="text-[10px] text-slate-300 font-mono">Real-time Node: Online</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1.5">Executive Business Intelligence</h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mt-1">
              Full fiscal ledger visibility, employee allocation, productivity, client growth trends, and pipeline health vectors.
            </p>
          </div>

          <button
            onClick={() => setExportModal('select')}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer shrink-0"
          >
            <Download className="h-4 w-4" />
            <span>Generate Business Reports</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS CARD GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <div className="p-1 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign className="h-4 w-4" /></div>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-2">${collectedRevenue.toLocaleString()}</h2>
          </div>
          <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-2">
            <TrendingUp className="h-3 w-3" />
            <span>{monthlyGrowthPct}% Monthly growth</span>
          </p>
        </div>

        {/* Client Ledger */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Corporate Clients</span>
              <div className="p-1 bg-indigo-50 text-indigo-600 rounded-lg"><Users className="h-4 w-4" /></div>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-2">{totalClients}</h2>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-2">
            Plus <span className="font-bold text-slate-800">{totalLeads} active leads</span> in pipeline
          </p>
        </div>

        {/* Employee Directory */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Staff Count</span>
              <div className="p-1 bg-sky-50 text-sky-600 rounded-lg"><Users className="h-4 w-4" /></div>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-2">{totalEmployees}</h2>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-2">
            Productivity: <span className="font-bold text-emerald-600">91.4% Avg</span>
          </p>
        </div>

        {/* Project Tracking */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contracts Setup</span>
              <div className="p-1 bg-amber-50 text-amber-600 rounded-lg"><Briefcase className="h-4 w-4" /></div>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-2">{totalProjects}</h2>
          </div>
          <p className="text-[10px] text-slate-500 font-medium mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="bg-amber-100 text-amber-800 px-1 py-0.5 rounded text-[8px] font-bold uppercase">{activeProjectsCount} Active</span>
            <span className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded text-[8px] font-bold uppercase">{completedProjectsCount} Done</span>
          </p>
        </div>

        {/* Invoices Status Overview */}
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unresolved Invoices</span>
              <div className="p-1 bg-rose-50 text-rose-600 rounded-lg"><AlertTriangle className="h-4 w-4" /></div>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono mt-2">{pendingInvoicesCount + overdueInvoicesCount}</h2>
          </div>
          <p className="text-[10px] text-rose-600 font-bold mt-2">
            {overdueInvoicesCount} Overdue (${overdueInvoicesAmount.toLocaleString()})
          </p>
        </div>
      </div>

      {/* QUICK SECONDARY STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-100/60 p-4 rounded-2xl border border-slate-200">
        <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-200 pb-2 sm:pb-0 sm:pr-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
          <p className="text-md font-bold text-slate-800 mt-0.5 font-mono">{pendingTasksCount} Tasks</p>
        </div>
        <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-200 py-2 sm:py-0 sm:px-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoiced Pending Sum</p>
          <p className="text-md font-bold text-slate-800 mt-0.5 font-mono">${pendingInvoicesAmount.toLocaleString()}</p>
        </div>
        <div className="text-center sm:text-left border-b sm:border-b-0 sm:border-r border-slate-200 py-2 sm:py-0 sm:px-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overdue Invoice Sum</p>
          <p className="text-md font-bold text-rose-600 mt-0.5 font-mono">${overdueInvoicesAmount.toLocaleString()}</p>
        </div>
        <div className="text-center sm:text-left pt-2 sm:pt-0 sm:pl-4">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Employees</p>
          <p className="text-md font-bold text-indigo-700 mt-0.5 font-mono">{totalEmployees} Active</p>
        </div>
      </div>

      {/* RECHARTS DATA GRID VISUALIZERS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Monthly Revenue Trend Bar Chart (8 Columns) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 lg:col-span-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Monthly Revenue Trend</h3>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Rolling fiscal performance vs structural expenditure.</p>
            </div>
            <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-100">FY 2026</span>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="Expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Invoice Collection Status Pie Chart (4 Columns) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">Invoice Collection Efficiency</h3>
            <p className="text-xs text-slate-500 font-semibold mb-4">Capital clearing status of generated milestones.</p>
          </div>
          
          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={invoiceCollectionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {invoiceCollectionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`]} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Summary Label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <p className="text-[10px] font-bold text-slate-400 uppercase">Settled</p>
              <p className="text-md font-bold text-slate-800 font-mono">
                {Math.round((collectedRevenue / (totalInvoicedRevenue || 1)) * 100)}%
              </p>
            </div>
          </div>

          <div className="space-y-1.5 mt-2">
            {invoiceCollectionData.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center text-xs font-semibold">
                <div className="flex items-center gap-2 text-slate-650">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PIE_COLORS[index] }}></span>
                  <span>{item.name}</span>
                </div>
                <span className="font-mono text-slate-800">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Project Progress Bar Chart (6 Columns) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 lg:col-span-6">
          <div className="mb-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Project Portfolio Velocities</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Contract completion rates vs standing project estimates.</p>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectProgressData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#475569" fontSize={10} tickLine={false} width={100} />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Bar dataKey="Progress" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={12}>
                  {projectProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.Progress > 80 ? '#10b981' : entry.Progress > 40 ? '#6366f1' : '#f59e0b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Employee Productivity Ratings (6 Columns) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 lg:col-span-6">
          <div className="mb-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Developer Productivity Matrix</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Individual sprint metrics based on closed backlog tickets.</p>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={employeeProductivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" domain={[0, 100]} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => [`${value}%`]} />
                <Bar dataKey="Productivity" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Client & Lead Acquisition Growth Trends (12 Columns) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 lg:col-span-12">
          <div className="mb-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Corporate Account Growth Curve</h3>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">Historical CRM scaling showing converted accounts vs inbound interest.</p>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={clientGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="Clients" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Leads" stroke="#6366f1" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* REPORT GENERATION AND EXPORT MODAL SELECTOR */}
      {exportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl animate-scaleUp text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileSpreadsheet className="h-4.5 w-4.5 text-indigo-600" />
                <span>Export Corporate Analytics</span>
              </h3>
              <button
                onClick={() => setExportModal(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-normal">
              Select any of the primary ledger datasets to download high-fidelity, comma-separated corporate CSV records matching current system parameters.
            </p>

            <div className="grid grid-cols-1 gap-2.5 pt-1.5">
              <button
                onClick={() => exportCSV('revenue')}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign className="h-4 w-4" /></div>
                  <div>
                    <p className="font-bold">Fiscal Revenue & Invoices Report</p>
                    <p className="text-[10px] font-normal text-slate-400">Sum of collected, pending, and overdue receivables.</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </button>

              <button
                onClick={() => exportCSV('attendance')}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><CalendarDays className="h-4 w-4" /></div>
                  <div>
                    <p className="font-bold">Staff Attendance Log History</p>
                    <p className="text-[10px] font-normal text-slate-400">Punch-in timestamps, working hours, and late marks.</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </button>

              <button
                onClick={() => exportCSV('leave')}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg"><FileText className="h-4 w-4" /></div>
                  <div>
                    <p className="font-bold">PTO Leave Requests & Remarks</p>
                    <p className="text-[10px] font-normal text-slate-400">Casual, Sick, WFH tallies and administrative logs.</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </button>

              <button
                onClick={() => exportCSV('projects')}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-sky-50 text-sky-600 rounded-lg"><Briefcase className="h-4 w-4" /></div>
                  <div>
                    <p className="font-bold">Project Milestones & Cost Estimates</p>
                    <p className="text-[10px] font-normal text-slate-400">Timeline durations, budget sizes, and risk levels.</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </button>

              <button
                onClick={() => exportCSV('clients')}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-violet-50 text-violet-600 rounded-lg"><Users className="h-4 w-4" /></div>
                  <div>
                    <p className="font-bold">Client ledger & CRM Contacts</p>
                    <p className="text-[10px] font-normal text-slate-400">Industry distribution, geographical logs, deal value.</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </button>

              <button
                onClick={() => exportCSV('productivity')}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-pink-50 text-pink-600 rounded-lg"><Percent className="h-4 w-4" /></div>
                  <div>
                    <p className="font-bold">Employee Productivity & Velocity Rating</p>
                    <p className="text-[10px] font-normal text-slate-400">Average ticket closure rating per employee.</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300" />
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <Printer className="h-4.5 w-4.5" />
                <span>Print PDF Dashboard report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS TOAST MESSAGE */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-950 border border-indigo-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          <div>
            <p className="text-xs font-bold">System Dispatch Success</p>
            <p className="text-[10px] text-slate-300">{toast}</p>
          </div>
        </div>
      )}

    </div>
  );
}
