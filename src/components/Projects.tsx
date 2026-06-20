import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  UserPlus, 
  FileText, 
  ArrowRight,
  Filter,
  Users
} from 'lucide-react';
import { Project, ERPData, Employee } from '../types.ts';

interface ProjectsProps {
  data: ERPData;
  onSaveData: (newData: ERPData) => void;
}

export default function Projects({ data, onSaveData }: ProjectsProps) {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isAddingProject, setIsAddingProject] = useState(false);
  
  // New Project Form State
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [toolsStr, setToolsStr] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const [country, setCountry] = useState('');

  // Invoice generator modal/state
  const [activeInvoiceProjectId, setActiveInvoiceProjectId] = useState<string | null>(null);
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneInvoicedCost, setMilestoneInvoicedCost] = useState('');

  // Handle Mark Completed
  const handleMarkCompleted = (projectId: string) => {
    const updatedProjects = data.projects.map(p => {
      if (p.id === projectId) {
        return { ...p, status: 'Completed' as const, progress: 100, riskLevel: 'Low' as const };
      }
      return p;
    });

    onSaveData({
      ...data,
      projects: updatedProjects
    });
  };

  // Generate milestone invoice
  const triggerMilestoneInvoice = (projectId: string, projectName: string) => {
    const defaultCost = 5000;
    const invId = `inv-${Date.now()}`;
    const invNum = `INV-2026-${Math.round(100 + Math.random() * 900)}`;

    const newInvoice = {
      id: invId,
      projectId: projectId,
      projectName: projectName,
      invoiceNumber: invNum,
      amount: milestoneInvoicedCost ? Number(milestoneInvoicedCost) : defaultCost,
      milestone: milestoneName || 'Project Development Deliverable Milestone',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
      status: 'Pending' as const,
      issuedDate: new Date().toISOString().split('T')[0]
    };

    onSaveData({
      ...data,
      invoices: [...data.invoices, newInvoice]
    });

    // Reset fields
    setActiveInvoiceProjectId(null);
    setMilestoneName('');
    setMilestoneInvoicedCost('');
  };

  // Submit new project
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || !deadline || !cost) {
      alert('Please fill out all required parameters.');
      return;
    }

    const clientObj = data.clients.find(c => c.id === clientId);
    if (!clientObj) return;

    const projectId = `p-${Date.now()}`;
    
    // Format assigned employees with default allocations
    const assignedEmployees = selectedStaffIds.map(empId => {
      const emp = data.employees.find(e => e.id === empId);
      return {
        id: empId,
        name: emp?.name || 'Unassigned Staff',
        role: emp?.role || 'Staff',
        allocatedHoursPerWeek: 15
      };
    });

    const newProj: Project = {
      id: projectId,
      name,
      clientId,
      clientName: clientObj.company,
      assignedEmployees,
      tools: toolsStr ? toolsStr.split(',').map(t => t.trim()) : ['React', 'TypeScript'],
      deadline,
      cost: Number(cost),
      status: 'In Progress',
      progress: 0,
      riskLevel: 'Low',
      description,
      country: country || clientObj.country || 'India'
    };

    onSaveData({
      ...data,
      projects: [...data.projects, newProj]
    });

    // Reset
    setIsAddingProject(false);
    setName('');
    setClientId('');
    setDeadline('');
    setCost('');
    setDescription('');
    setToolsStr('');
    setSelectedStaffIds([]);
    setCountry('');
  };

  const toggleStaffSelection = (id: string) => {
    if (selectedStaffIds.includes(id)) {
      setSelectedStaffIds(selectedStaffIds.filter(idx => idx !== id));
    } else {
      setSelectedStaffIds([...selectedStaffIds, id]);
    }
  };

  const filteredProjects = data.projects.filter(p => {
    if (filterStatus === 'All') return true;
    return p.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      
      {/* Portfolio Title & controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Project Portfolio Ledger</h2>
          <p className="text-xs text-slate-500">Track milestones, assign teams, and trigger milestone receivables.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status filtering */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 px-2.5 py-1.5 rounded-xl shadow-xs">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-transparent border-none focus:outline-none"
            >
              <option value="All">All Projects</option>
              <option value="In Progress">In Progress</option>
              <option value="Not Started">Not Started</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddingProject(!isAddingProject)}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition hover:bg-slate-800 active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Slide-down form for creating project */}
      {isAddingProject && (
        <form onSubmit={handleCreateProject} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 max-w-3xl animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-900">Open New Project Contract</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Project Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. NextGen Mobile Sandbox"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Client Company *</label>
              <select
                required
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Select Associated Client</option>
                {data.clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company} (Representative: {c.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Deadline *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Budget / Cost ($) *</label>
              <input
                type="number"
                required
                placeholder="45000"
                value={cost}
                onChange={e => setCost(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Location Country</label>
              <input
                type="text"
                placeholder="e.g. India, US, UK"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase">Tools & Technologies (comma separated)</label>
            <input
              type="text"
              placeholder="React, Python, Gemini API"
              value={toolsStr}
              onChange={e => setToolsStr(e.target.value)}
              className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase">Project Description</label>
            <textarea
              rows={2}
              placeholder="Identify core deliverables and requirements scope..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Developer Workload Assignment */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Assign Developers</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {data.employees.map(emp => {
                const selected = selectedStaffIds.includes(emp.id);
                return (
                  <button
                    type="button"
                    key={emp.id}
                    onClick={() => toggleStaffSelection(emp.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-left text-xs transition ${
                      selected 
                        ? 'border-emerald-600 bg-emerald-50/30' 
                        : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/50'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-800">{emp.name}</p>
                      <p className="text-[10px] text-slate-400">{emp.role}</p>
                    </div>
                    {selected && <div className="h-2 w-2 rounded-full bg-emerald-600"></div>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingProject(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 text-white font-semibold text-xs rounded-lg hover:bg-emerald-700"
            >
              Create Project
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredProjects.map((proj) => {
          const isOverdue = proj.status !== 'Completed' && proj.deadline < '2026-06-19';
          return (
            <div key={proj.id} id={`project-card-${proj.id}`} className="bg-white rounded-2xl border border-slate-200/85 p-5 shadow-xs flex flex-col justify-between space-y-4">
              
              {/* Card top */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-start">
                  <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                    proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                    proj.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                    proj.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                    'bg-slate-50 text-slate-700 border border-slate-200'
                  }`}>
                    {proj.status}
                  </span>

                  {proj.riskLevel === 'High' ? (
                    <span className="flex items-center gap-1 text-[10px] bg-rose-50 border border-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-md">
                      <AlertTriangle className="h-3 w-3 text-rose-600" />
                      <span>High Risk</span>
                    </span>
                  ) : proj.riskLevel === 'Medium' || isOverdue ? (
                    <span className="flex items-center gap-1 text-[10px] bg-amber-50 border border-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-md">
                      <AlertTriangle className="h-3 w-3 text-amber-600" />
                      <span>{isOverdue ? 'Delayed' : 'Medium Risk'}</span>
                    </span>
                  ) : null}
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-md tracking-tight leading-snug">{proj.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <p>Client: <span className="font-semibold text-slate-600">{proj.clientName}</span></p>
                    <span className="hidden sm:inline text-slate-350">•</span>
                    <p>Location: <span className="font-bold text-indigo-600">{proj.country || 'India'}</span></p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed pt-1">{proj.description}</p>
              </div>

              {/* Progress and team assignments */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Milestone Progress</span>
                    <span className="font-bold text-slate-700 font-mono">{proj.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${proj.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Assigned employees row */}
                <div>
                  <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-1.5">
                    <span>Assigned Personnel</span>
                    <span className="font-mono text-slate-500">{proj.assignedEmployees.length} Developers</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.assignedEmployees.map((emp) => (
                      <span key={emp.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-semibold text-slate-600">
                        <Users className="h-2.5 w-2.5 text-slate-400" />
                        <span>{emp.name} ({emp.allocatedHoursPerWeek}h/w)</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Tools used tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {proj.tools.map((t, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 font-mono px-2 py-0.5 rounded-sm">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Deadline & cost ledger summary */}
              <div className="flex justify-between items-center bg-slate-50/50 border border-slate-100 p-3 rounded-xl">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-[10px] text-slate-400">Deadline</p>
                    <p className="text-xs font-semibold text-slate-700 font-mono">{proj.deadline}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <div>
                    <p className="text-[10px] text-slate-400">Total Valuation</p>
                    <p className="text-xs font-bold text-emerald-700 font-mono">${proj.cost.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Project Card Actions */}
              <div className="flex gap-2 pt-2">
                {proj.status !== 'Completed' && (
                  <button
                    onClick={() => handleMarkCompleted(proj.id)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Mark Complete</span>
                  </button>
                )}

                {/* Milestone invoice trigger */}
                <button
                  onClick={() => setActiveInvoiceProjectId(proj.id)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer"
                >
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  <span>Invoice Milestone</span>
                </button>
              </div>

              {/* Custom micro modal to generate invoice for this specific project */}
              {activeInvoiceProjectId === proj.id && (
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mt-2 animate-fadeIn space-y-3">
                  <p className="text-xs font-bold text-slate-800">Trigger Progress Payment Invoice</p>
                  
                  <div className="space-y-2">
                    <div>
                      <input
                        type="text"
                        placeholder="Milestone Deliverable Name (e.g., Code Handover)"
                        value={milestoneName}
                        onChange={e => setMilestoneName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Milestone Invoiced Sum ($ Price)"
                        value={milestoneInvoicedCost}
                        onChange={e => setMilestoneInvoicedCost(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveInvoiceProjectId(null)}
                      className="px-2.5 py-1 text-slate-500 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => triggerMilestoneInvoice(proj.id, proj.name)}
                      className="px-3 py-1 bg-slate-900 text-white font-semibold rounded-lg flex items-center gap-1"
                    >
                      <span>Draft Invoice</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
