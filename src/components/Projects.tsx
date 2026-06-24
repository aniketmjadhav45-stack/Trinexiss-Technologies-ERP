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
  Users,
  MessageSquare,
  Paperclip,
  Trash2,
  CheckCircle,
  Tag,
  Kanban,
  List,
  UploadCloud,
  ChevronRight,
  Edit,
  Archive
} from 'lucide-react';
import { Project, ERPData, Employee, KanbanTask, UserSession } from '../types.ts';

interface ProjectsProps {
  data: ERPData;
  onSaveData: (newData: ERPData) => void;
  session: UserSession;
}

const KANBAN_COLUMNS: ('Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Completed')[] = [
  'Backlog',
  'To Do',
  'In Progress',
  'Review',
  'Completed'
];

export default function Projects({ data, onSaveData, session }: ProjectsProps) {
  // Navigation layout: Grid vs Kanban
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>('kanban');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    data.projects[0]?.id || ''
  );

  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);

  // New Project Form State
  const [name, setName] = useState('');
  const [clientId, setClientId] = useState('');
  const [deadline, setDeadline] = useState('');
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');
  const [toolsStr, setToolsStr] = useState('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<string[]>([]);
  const toggleStaffSelection = (empId: string) => {
    setSelectedStaffIds(prev => 
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };
  const [country, setCountry] = useState('');
  const [startDateInput, setStartDateInput] = useState('');
  const [priorityInput, setPriorityInput] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [showArchived, setShowArchived] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // New Task Form State
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskAssignees, setTaskAssignees] = useState<string[]>([]);

  // Task Details Modal State
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  // Invoice generator modal/state
  const [activeInvoiceProjectId, setActiveInvoiceProjectId] = useState<string | null>(null);
  const [milestoneName, setMilestoneName] = useState('');
  const [milestoneInvoicedCost, setMilestoneInvoicedCost] = useState('');

  // Active targeted project object for Kanban parameters
  const activeKanbanProject = data.projects.find(p => p.id === selectedProjectId) || data.projects[0];

  // Initialize Project tasks list with mock placeholders if empty
  const getProjectTasks = (proj: Project): KanbanTask[] => {
    if (proj.tasks && proj.tasks.length > 0) {
      return proj.tasks;
    }
    // Fallback seed tasks per project
    const defaultTasks: KanbanTask[] = [
      {
        id: `t-${proj.id}-1`,
        title: 'Formulate core backend service schemas',
        description: 'Map out the PostgreSQL table relations, indices, and database triggers.',
        status: 'To Do',
        priority: 'High',
        dueDate: proj.deadline,
        assignedTo: proj.assignedEmployees.map(e => e.name),
        attachments: ['schema_diagram.png'],
        comments: [
          { id: 'c-1', user: 'Aniket Jadhav', text: 'Schemas finalized and aligned with Gemini API requirements.', timestamp: '2026-06-19T10:00:00Z' }
        ]
      },
      {
        id: `t-${proj.id}-2`,
        title: 'SaaS user onboarding workflows',
        description: 'Implement secure roles, email authentication templates, and signup filters.',
        status: 'In Progress',
        priority: 'Medium',
        dueDate: proj.deadline,
        assignedTo: [proj.assignedEmployees[0]?.name || 'Staff Member'],
        attachments: [],
        comments: []
      }
    ];
    return defaultTasks;
  };

  const handleSaveProjectTasks = (
    projectId: string, 
    updatedTasks: KanbanTask[],
    customNotif?: { title: string, message: string, user: string, type: 'info' | 'success' | 'warning' | 'error' }
  ) => {
    // Dynamic progress computing! percentage = completed tasks / total tasks
    const completedCount = updatedTasks.filter(t => t.status === 'Completed').length;
    let computedProgress = updatedTasks.length > 0 ? Math.round((completedCount / updatedTasks.length) * 100) : 0;
    
    let isProjectCompletedNow = false;
    const updatedProjects = data.projects.map(p => {
      if (p.id === projectId) {
        const wasCompleted = p.status === 'Completed';
        const isCompleted = computedProgress === 100;
        if (isCompleted && !wasCompleted) {
          isProjectCompletedNow = true;
        }
        return {
          ...p,
          tasks: updatedTasks,
          progress: computedProgress,
          status: isCompleted ? ('Completed' as const) : p.status
        };
      }
      return p;
    });

    const newNotifications = [...(data.notifications || [])];
    if (data.notificationsEnabled !== false) {
      if (customNotif) {
        newNotifications.push({
          id: `notif-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: customNotif.user,
          title: customNotif.title,
          message: customNotif.message,
          read: false,
          type: customNotif.type
        });
      }

      if (isProjectCompletedNow) {
        const proj = data.projects.find(p => p.id === projectId);
        newNotifications.push({
          id: `notif-${Date.now()}-proj-completed`,
          timestamp: new Date().toISOString(),
          user: 'All',
          title: `Project Contract Completed`,
          message: `All sprint deliveries for "${proj?.name}" have been completed successfully.`,
          read: false,
          type: 'success'
        });
      }
    }

    onSaveData({
      ...data,
      projects: updatedProjects,
      notifications: newNotifications
    });
  };

  // Create / Edit Project Callback
  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (session.role === 'Employee') {
      alert('Security Refusal: Employee accounts are restricted from generating contract portfolios.');
      return;
    }

    if (!name || !clientId || !deadline || !cost) {
      alert('All marked fields are mandatory.');
      return;
    }

    const clientObj = data.clients.find(c => c.id === clientId);
    if (!clientObj) return;

    const assignedEmployees = selectedStaffIds.map(empId => {
      const emp = data.employees.find(e => e.id === empId);
      return {
        id: empId,
        name: emp?.name || 'Unassigned Developer',
        role: emp?.role || 'Engineer',
        allocatedHoursPerWeek: 15
      };
    });

    let updatedProjects = [...data.projects];

    if (editingProjectId) {
      // Edit mode
      updatedProjects = data.projects.map(p => {
        if (p.id === editingProjectId) {
          return {
            ...p,
            name,
            clientId,
            clientName: clientObj.company,
            assignedEmployees,
            tools: toolsStr ? toolsStr.split(',').map(t => t.trim()) : p.tools,
            deadline,
            cost: Number(cost),
            description,
            country: country || clientObj.country || 'India',
            startDate: startDateInput || p.startDate,
            priority: priorityInput || p.priority
          };
        }
        return p;
      });

      const newLog = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: session.fullName,
        action: `Modified details for project contract: ${name}`,
        category: 'Project' as const,
        module: 'Projects'
      };

      const newNotifications = [...(data.notifications || [])];
      if (data.notificationsEnabled !== false) {
        newNotifications.push({
          id: `notif-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'All',
          title: `Project Contract Modified`,
          message: `The project contract "${name}" has been modified by ${session.fullName}.`,
          read: false,
          type: 'info'
        });

        assignedEmployees.forEach(emp => {
          newNotifications.push({
            id: `notif-${Date.now()}-${emp.id}`,
            timestamp: new Date().toISOString(),
            user: emp.name,
            title: `Assigned Project Updated`,
            message: `The project "${name}" which you are assigned to has been updated.`,
            read: false,
            type: 'info'
          });
        });
      }

      onSaveData({
        ...data,
        projects: updatedProjects,
        activityLogs: [newLog, ...(data.activityLogs || [])],
        notifications: newNotifications
      });
    } else {
      // Creation mode
      const projectId = `p-${Date.now()}`;
      const newProj: Project = {
        id: projectId,
        name,
        clientId,
        clientName: clientObj.company,
        assignedEmployees,
        tools: toolsStr ? toolsStr.split(',').map(t => t.trim()) : ['React', 'TypeScript', 'Tailwind'],
        deadline,
        cost: Number(cost),
        status: 'Not Started',
        progress: 0,
        riskLevel: 'Low',
        description,
        country: country || clientObj.country || 'India',
        tasks: [], // Fresh tasks board
        startDate: startDateInput || new Date().toISOString().split('T')[0],
        priority: priorityInput || 'Medium',
        isArchived: false
      };

      const newLog = {
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: session.fullName,
        action: `Created new project contract: ${name}`,
        category: 'Project' as const,
        module: 'Projects'
      };

      const newNotifications = [...(data.notifications || [])];
      if (data.notificationsEnabled !== false) {
        newNotifications.push({
          id: `notif-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: 'All',
          title: `New Project Contract Created`,
          message: `Project "${name}" has been initialized under client "${clientObj.company}".`,
          read: false,
          type: 'success'
        });

        assignedEmployees.forEach(emp => {
          newNotifications.push({
            id: `notif-${Date.now()}-${emp.id}`,
            timestamp: new Date().toISOString(),
            user: emp.name,
            title: `Assigned to New Project`,
            message: `You have been allocated to the project "${name}" (Client: ${clientObj.company}).`,
            read: false,
            type: 'success'
          });
        });
      }

      onSaveData({
        ...data,
        projects: [...data.projects, newProj],
        activityLogs: [newLog, ...(data.activityLogs || [])],
        notifications: newNotifications
      });
    }

    setIsAddingProject(false);
    // Reset inputs
    setName('');
    setClientId('');
    setDeadline('');
    setCost('');
    setDescription('');
    setToolsStr('');
    setSelectedStaffIds([]);
    setCountry('');
    setStartDateInput('');
    setPriorityInput('Medium');
    setEditingProjectId(null);
  };

  const startEditingProject = (proj: Project) => {
    setName(proj.name);
    setClientId(proj.clientId);
    setDeadline(proj.deadline);
    setCost(String(proj.cost));
    setDescription(proj.description || '');
    setToolsStr(proj.tools.join(', '));
    setCountry(proj.country || '');
    setStartDateInput(proj.startDate || '');
    setPriorityInput(proj.priority || 'Medium');
    setSelectedStaffIds(proj.assignedEmployees.map(e => e.id));
    setEditingProjectId(proj.id);
    setIsAddingProject(true);
  };

  const handleToggleArchiveProject = (projectId: string) => {
    const proj = data.projects.find(p => p.id === projectId);
    if (!proj) return;
    const updatedProjects = data.projects.map(p => {
      if (p.id === projectId) {
        return { ...p, isArchived: !p.isArchived };
      }
      return p;
    });
    const actionStr = proj.isArchived ? 'Unarchived' : 'Archived';
    const newLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: session.fullName,
      action: `${actionStr} project contract: ${proj.name}`,
      category: 'Project' as const,
      module: 'Projects'
    };
    onSaveData({
      ...data,
      projects: updatedProjects,
      activityLogs: [newLog, ...(data.activityLogs || [])]
    });
  };

  const handleDeleteProject = (projectId: string, projName: string) => {
    if (session.role === 'Employee') {
      alert('Security Refusal: Employee accounts are restricted from deleting project contracts.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete project contract: ${projName}? This action is irreversible.`)) {
      return;
    }
    const updatedProjects = data.projects.filter(p => p.id !== projectId);
    const newLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: session.fullName,
      action: `Permanently deleted project contract: ${projName}`,
      category: 'Project' as const,
      module: 'Projects'
    };
    onSaveData({
      ...data,
      projects: updatedProjects,
      activityLogs: [newLog, ...(data.activityLogs || [])]
    });
    if (selectedProjectId === projectId) {
      setSelectedProjectId(updatedProjects[0]?.id || '');
    }
  };

  // Create Kanban Task Callback
  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle || !selectedProjectId) {
      alert('Please define a task title.');
      return;
    }

    const activeProj = data.projects.find(p => p.id === selectedProjectId);
    if (!activeProj) return;

    const activeTasks = getProjectTasks(activeProj);
    const newTask: KanbanTask = {
      id: `task-${Date.now()}`,
      title: taskTitle,
      description: taskDesc,
      status: 'To Do',
      priority: taskPriority,
      dueDate: taskDueDate || activeProj.deadline,
      assignedTo: taskAssignees.length > 0 ? taskAssignees : [session.fullName],
      attachments: [],
      comments: []
    };

    const updatedTasks = [...activeTasks, newTask];
    const assigneesList = newTask.assignedTo.join(', ');
    handleSaveProjectTasks(selectedProjectId, updatedTasks, {
      title: `Task Assigned: ${newTask.title}`,
      message: `New ticket assigned to ${assigneesList} under project ${activeProj.name} by ${session.fullName}.`,
      user: newTask.assignedTo[0] || 'All',
      type: 'info'
    });

    // Reset task inputs
    setIsAddingTask(false);
    setTaskTitle('');
    setTaskDesc('');
    setTaskPriority('Medium');
    setTaskDueDate('');
    setTaskAssignees([]);
  };

  const handleUpdateTaskStatus = (taskId: string, targetStatus: any) => {
    if (!selectedProjectId || !activeKanbanProject) return;
    const activeTasks = getProjectTasks(activeKanbanProject);
    const taskObj = activeTasks.find(t => t.id === taskId);
    if (!taskObj) return;

    const updatedTasks = activeTasks.map(t => {
      if (t.id === taskId) {
        return { ...t, status: targetStatus };
      }
      return t;
    });

    handleSaveProjectTasks(selectedProjectId, updatedTasks, {
      title: `Task Status Shifted`,
      message: `The task "${taskObj.title}" has been updated to "${targetStatus}" by ${session.fullName}.`,
      user: taskObj.assignedTo[0] || 'All',
      type: targetStatus === 'Completed' ? 'success' : 'info'
    });
  };

  const handleAddTaskComment = (taskId: string) => {
    if (!commentInput.trim() || !activeKanbanProject) return;
    const activeTasks = getProjectTasks(activeKanbanProject);
    const taskObj = activeTasks.find(t => t.id === taskId);
    if (!taskObj) return;

    const updatedTasks = activeTasks.map(t => {
      if (t.id === taskId) {
        const comments = t.comments || [];
        return {
          ...t,
          comments: [
            ...comments,
            {
              id: `c-${Date.now()}`,
              user: session.fullName,
              text: commentInput,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return t;
    });

    handleSaveProjectTasks(selectedProjectId, updatedTasks, {
      title: `New Comment on: ${taskObj.title}`,
      message: `${session.fullName} added a comment: "${commentInput.substring(0, 30)}..."`,
      user: taskObj.assignedTo[0] || 'All',
      type: 'info'
    });
    setCommentInput('');
  };

  const handleSimulatedFileUpload = (taskId: string, fileName: string) => {
    if (!activeKanbanProject) return;
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return null;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress(null), 500);
          
          // Actually save file to task state
          const activeTasks = getProjectTasks(activeKanbanProject);
          const updatedTasks = activeTasks.map(t => {
            if (t.id === taskId) {
              const currentAttachments = t.attachments || [];
              return {
                ...t,
                attachments: [...currentAttachments, fileName]
              };
            }
            return t;
          });
          handleSaveProjectTasks(selectedProjectId, updatedTasks);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  const handleDeleteTask = (taskId: string) => {
    if (session.role === 'Employee') {
      alert('Security Policy: Only Admins/Founders can dismantle tasks.');
      return;
    }
    if (!confirm('Are you certain you wish to delete this work task?')) return;
    if (!activeKanbanProject) return;

    const activeTasks = getProjectTasks(activeKanbanProject);
    const updatedTasks = activeTasks.filter(t => t.id !== taskId);
    handleSaveProjectTasks(selectedProjectId, updatedTasks);
    setActiveTaskId(null);
  };

  // Trigger payments invoice handler
  const triggerMilestoneInvoice = (projectId: string, projectName: string) => {
    const defaultCost = 5000;
    const invId = `inv-${Date.now()}`;
    const invNum = `INV-226-${Math.round(100 + Math.random() * 900)}`;

    const newInvoice = {
      id: invId,
      projectId: projectId,
      projectName: projectName,
      invoiceNumber: invNum,
      amount: milestoneInvoicedCost ? Number(milestoneInvoicedCost) : defaultCost,
      milestone: milestoneName || 'Project Milestone Ledger Billing',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Pending' as const,
      issuedDate: new Date().toISOString().split('T')[0]
    };

    onSaveData({
      ...data,
      invoices: [...data.invoices, newInvoice]
    });

    setActiveInvoiceProjectId(null);
    setMilestoneName('');
    setMilestoneInvoicedCost('');
  };

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

  const filteredProjectsList = data.projects.filter(p => {
    const matchesArchived = showArchived ? p.isArchived : !p.isArchived;
    const matchesStatus = filterStatus === 'All' ? true : p.status === filterStatus;
    return matchesArchived && matchesStatus;
  });

  const activeTasksList = activeKanbanProject ? getProjectTasks(activeKanbanProject) : [];
  const activeTaskObj = activeTasksList.find(t => t.id === activeTaskId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Portfolio Title & controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Enterprise Project Workspace</h2>
          <p className="text-xs text-slate-500">Track milestones, organize agile Trello Kanban workflows, and launch billing invoices.</p>
        </div>

        {/* View Layout Switcher */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-2xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'kanban' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Kanban className="h-3.5 w-3.5" />
              <span>Trello Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                viewMode === 'grid' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Project Register</span>
            </button>
          </div>

          {session.role !== 'Employee' && (
            <button
              onClick={() => {
                setEditingProjectId(null); // Clear edit mode if toggled
                setIsAddingProject(!isAddingProject);
              }}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition active:scale-95 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span>New Contract</span>
            </button>
          )}
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center bg-slate-50 border border-slate-200/60 p-3.5 rounded-2xl shadow-3xs">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-bold text-slate-400 uppercase tracking-wide text-[10px] mr-1">Filter Portfolio:</span>
          {['All', 'Not Started', 'In Progress', 'On Hold', 'Completed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterStatus === st
                  ? 'bg-white border border-slate-200 text-slate-900 shadow-3xs'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-3xs text-xs">
          <button
            type="button"
            onClick={() => setShowArchived(false)}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              !showArchived
                ? 'bg-slate-900 text-white shadow-3xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => setShowArchived(true)}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              showArchived
                ? 'bg-slate-900 text-white shadow-3xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Archived ({data.projects.filter(p => p.isArchived).length})
          </button>
        </div>
      </div>

      {/* Slide-down form for creating project */}
      {isAddingProject && (
        <form onSubmit={handleCreateProject} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 max-w-3xl animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-900">
            {editingProjectId ? 'Modify Project Contract Details' : 'Open New Client Contract'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Project Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., Quantum Security Overhaul"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Target Client *</label>
              <select
                required
                value={clientId}
                onChange={e => setClientId(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 text-slate-705 font-bold focus:outline-none"
              >
                <option value="">Choosing Enterprise Lead...</option>
                {data.clients.map(c => (
                  <option key={c.id} value={c.id}>{c.company} (Rep: {c.name})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Project Deadline *</label>
              <input
                type="date"
                required
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Agreed Ledger Cost *</label>
              <input
                type="number"
                required
                placeholder="75000"
                value={cost}
                onChange={e => setCost(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Installation Country</label>
              <input
                type="text"
                placeholder="e.g. India"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Start Date</label>
              <input
                type="date"
                value={startDateInput}
                onChange={e => setStartDateInput(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Project Priority</label>
              <select
                value={priorityInput}
                onChange={e => setPriorityInput(e.target.value as any)}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 font-semibold text-slate-705 focus:outline-none"
              >
                <option value="Low">Low Priority</option>
                <option value="Medium">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase">Core Framework Stack (comma-separated)</label>
            <input
              type="text"
              placeholder="Next.js, Supabase, Tailwind, Gemini SDK"
              value={toolsStr}
              onChange={e => setToolsStr(e.target.value)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase">Development Objectives Outline</label>
            <textarea
              rows={2}
              placeholder="Primary milestones and technical roadmap deliverables..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold"
            />
          </div>

          {/* Dev Workload selections */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-2">Staff Allocation</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {data.employees.map(emp => {
                const isSelected = selectedStaffIds.includes(emp.id);
                return (
                  <button
                    type="button"
                    key={emp.id}
                    onClick={() => toggleStaffSelection(emp.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-[11px] transition ${
                      isSelected 
                        ? 'border-emerald-600 bg-emerald-50/20' 
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-slate-800">{emp.name}</p>
                      <p className="text-[9px] text-slate-400">{emp.role}</p>
                    </div>
                    {isSelected && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs pt-2">
            <button
              type="button"
              onClick={() => setIsAddingProject(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold"
            >
              {editingProjectId ? 'Save Contract Modifications' : 'Initialize Project Contract'}
            </button>
          </div>
        </form>
      )}

      {/* VIEW: KANBAN WORKSPACE */}
      {viewMode === 'kanban' && (
        <div className="space-y-4">
          {/* Top Panel for Selecting active Project to show on Trello board */}
          <div className="bg-slate-100/60 p-4 rounded-2xl border border-slate-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase">Active Board Scope:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-white border border-slate-200 text-xs font-extrabold text-slate-850 px-3 py-1.5 rounded-xl shadow-2xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                {data.projects.filter(p => !p.isArchived).map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.progress}% Complete)</option>
                ))}
              </select>

              {activeKanbanProject && session.role !== 'Employee' && (
                <div className="flex items-center gap-1.5 ml-1">
                  <button
                    type="button"
                    onClick={() => startEditingProject(activeKanbanProject)}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition shadow-2xs"
                    title="Edit Active Project"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleArchiveProject(activeKanbanProject.id)}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-slate-50 transition shadow-2xs"
                    title="Archive Active Project"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(activeKanbanProject.id, activeKanbanProject.name)}
                    className="p-1.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-50 transition shadow-2xs"
                    title="Delete Active Project"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-semibold text-slate-550 flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">
                <Users className="h-3.5 w-3.5 text-slate-400" />
                <span>{activeKanbanProject?.assignedEmployees.length || 0} Staff assigned</span>
              </span>

              {session.role !== 'Employee' && (
                <button
                  type="button"
                  onClick={() => setIsAddingTask(!isAddingTask)}
                  className="flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition hover:bg-slate-800 active:scale-95"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create task</span>
                </button>
              )}
            </div>
          </div>

          {/* New Kanban Task creation mini form */}
          {isAddingTask && activeKanbanProject && (
            <form onSubmit={handleCreateTask} className="bg-white border-2 border-slate-200 p-5 rounded-2xl shadow-xs space-y-4 animate-fadeIn max-w-xl">
              <p className="text-xs font-bold text-slate-800">Add Task to {activeKanbanProject.name}</p>
              
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Task Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Integrate Gemini API analytics trigger"
                    value={taskTitle}
                    onChange={e => setTaskTitle(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Context Details</label>
                  <textarea
                    rows={2}
                    placeholder="Describe specific task requirements and acceptance parameters..."
                    value={taskDesc}
                    onChange={e => setTaskDesc(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Task Priority</label>
                    <select
                      value={taskPriority}
                      onChange={e => setTaskPriority(e.target.value as any)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold focus:outline-none"
                    >
                      <option value="Low">Low Priority</option>
                      <option value="Medium">Medium Priority</option>
                      <option value="High">High Priority</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Due Date</label>
                    <input
                      type="date"
                      value={taskDueDate}
                      onChange={e => setTaskDueDate(e.target.value)}
                      className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">Delegate Team Members</label>
                  <div className="flex flex-wrap gap-1.5">
                    {activeKanbanProject.assignedEmployees.map((emp, i) => {
                      const isSelected = taskAssignees.includes(emp.name);
                      return (
                        <button
                          type="button"
                          key={i}
                          onClick={() => {
                            if (isSelected) {
                              setTaskAssignees(taskAssignees.filter(n => n !== emp.name));
                            } else {
                              setTaskAssignees([...taskAssignees, emp.name]);
                            }
                          }}
                          className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {emp.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 border border-slate-200 text-slate-500 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold"
                >
                  Deploy Task
                </button>
              </div>
            </form>
          )}

          {/* Kanban board layout representation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 items-start">
            {KANBAN_COLUMNS.map((colName) => {
              const columnTasks = activeTasksList.filter(t => t.status === colName);
              return (
                <div key={colName} className="bg-slate-100/70 p-3 rounded-2xl border border-slate-200/50 flex flex-col min-h-[350px]">
                  {/* Column Header */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[11px] font-bold text-slate-600 tracking-wider uppercase font-sans">{colName}</span>
                    <span className="font-mono text-[10px] font-black bg-slate-200/80 px-2 py-0.5 rounded-full text-slate-700">{columnTasks.length}</span>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2 flex-grow overflow-y-auto max-h-[500px]">
                    {columnTasks.map((task) => (
                      <div
                        key={task.id}
                        id={`kanban-card-${task.id}`}
                        onClick={() => setActiveTaskId(task.id)}
                        className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-3xs cursor-pointer hover:border-slate-450 hover:shadow-2xs transition group text-left space-y-2"
                      >
                        {/* Tags and parameters */}
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className={`px-1.5 py-0.5 rounded-md ${
                            task.priority === 'High' ? 'bg-rose-50 text-rose-700 border border-rose-100' :
                            task.priority === 'Medium' ? 'bg-amber-50 text-amber-700' :
                            'bg-slate-50 text-slate-600'
                          }`}>
                            {task.priority} Priority
                          </span>
                          {task.dueDate && (
                            <span className="text-slate-400 font-mono flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{task.dueDate.substring(5)}</span>
                            </span>
                          )}
                        </div>

                        <p className="text-xs font-bold text-slate-850 group-hover:text-indigo-600 transition leading-snug">{task.title}</p>
                        
                        {task.description && (
                          <p className="text-[10px] text-slate-500 leading-normal line-clamp-2">{task.description}</p>
                        )}

                        {/* Assignees initials row + Meta comments */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                          <div className="flex -space-x-1">
                            {task.assignedTo.map((nameStr, idx) => (
                              <span
                                key={idx}
                                className="h-4.5 w-4.5 rounded-full bg-slate-900 border border-white text-white flex items-center justify-center font-bold text-[8px] uppercase tracking-tighter"
                                title={nameStr}
                              >
                                {nameStr.split(' ').map(n=>n[0]).join('')}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono font-bold">
                            {(task.comments || []).length > 0 && (
                              <span className="flex items-center gap-0.5" title="Feedback comments">
                                <MessageSquare className="h-3 w-3" />
                                <span>{(task.comments || []).length}</span>
                              </span>
                            )}
                            {(task.attachments || []).length > 0 && (
                              <span className="flex items-center gap-0.5" title="Attachments">
                                <Paperclip className="h-3 w-3" />
                                <span>{(task.attachments || []).length}</span>
                              </span>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}

                    {columnTasks.length === 0 && (
                      <p className="text-[10px] text-slate-400 text-center py-6 border border-dashed border-slate-200 rounded-xl bg-white/40">Empty column</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW: PROJECT CONTRACT TABLE GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-fadeIn">
          {filteredProjectsList.map((proj) => {
            const isOverdue = proj.status !== 'Completed' && proj.deadline < '2026-06-23';
            return (
              <div key={proj.id} id={`project-card-${proj.id}`} className="bg-white rounded-2xl border border-slate-200/85 p-5 shadow-2xs flex flex-col justify-between space-y-4">
                
                {/* Header info */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase tracking-wide border ${
                      proj.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                      proj.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                      proj.status === 'On Hold' ? 'bg-amber-50 text-amber-700 border-amber-100 border-dashed' :
                      'bg-slate-50 text-slate-700 border-slate-200'
                    }`}>
                      {proj.status}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {proj.riskLevel === 'High' ? (
                        <span className="flex items-center gap-1 text-[10px] bg-rose-50 border border-rose-100 text-rose-700 font-semibold px-2 py-0.5 rounded-md">
                          <AlertTriangle className="h-3 w-3 text-rose-600" />
                          <span>High Risk</span>
                        </span>
                      ) : proj.riskLevel === 'Medium' || isOverdue ? (
                        <span className="flex items-center gap-1 text-[10px] bg-amber-50 border border-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-md">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                          <span>{isOverdue ? 'Delayed Deadline' : 'Active Oversight'}</span>
                        </span>
                      ) : null}

                      {session.role !== 'Employee' && (
                        <div className="flex items-center gap-1 bg-slate-50 border border-slate-100 p-0.5 rounded-lg">
                          <button
                            type="button"
                            onClick={() => startEditingProject(proj)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-white rounded-md transition"
                            title="Edit Project Details"
                          >
                            <Edit className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleArchiveProject(proj.id)}
                            className={`p-1 rounded-md transition ${proj.isArchived ? 'text-amber-600 hover:bg-amber-50' : 'text-slate-400 hover:text-amber-600 hover:bg-white'}`}
                            title={proj.isArchived ? "Unarchive Project" : "Archive Project"}
                          >
                            <Archive className="h-3 w-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(proj.id, proj.name)}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded-md transition"
                            title="Delete Project Contract"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
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

                {/* Progress bar info */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-400">Completion KPI</span>
                      <span className="font-extrabold text-slate-700 font-mono">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-550 h-full rounded-full transition-all duration-300"
                        style={{ width: `${proj.progress}%`, backgroundColor: '#10b981' }}
                      ></div>
                    </div>
                  </div>

                  {/* Allocated tech resource group tags */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold tracking-wider uppercase mb-1.5">
                      <span>Assigned Personnel</span>
                      <span className="font-mono text-slate-500">{proj.assignedEmployees.length} Staff</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {proj.assignedEmployees.map((emp) => (
                        <span key={emp.id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100 text-[10px] font-semibold text-slate-600">
                          <Users className="h-2.5 w-2.5 text-slate-400" />
                          <span>{emp.name} ({emp.allocatedHoursPerWeek}h/w)</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Framed Stack */}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {proj.tools.map((t, i) => (
                      <span key={i} className="text-[10px] bg-slate-150 text-slate-600 font-mono px-1.5 py-0.5 rounded-md font-semibold">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Financial overview */}
                <div className="flex justify-between items-center bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Schedule</span>
                      <span className="text-xs font-bold text-slate-800 font-mono">{proj.deadline}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-right">
                    <DollarSign className="h-4 w-4 text-emerald-600" />
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Contract Budget</span>
                      <span className="text-xs font-extrabold text-emerald-700 font-mono">${proj.cost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action lists */}
                <div className="flex gap-2 pt-2">
                  {proj.status !== 'Completed' && (
                    <button
                      onClick={() => handleMarkCompleted(proj.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Conclude contract</span>
                    </button>
                  )}

                  {session.role !== 'Employee' && (
                    <button
                      onClick={() => setActiveInvoiceProjectId(proj.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-705 border border-slate-200 text-xs font-bold rounded-xl transition active:scale-95 cursor-pointer"
                    >
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>Invoice Milestone</span>
                    </button>
                  )}
                </div>

                {/* Specific project invoice creator form element */}
                {activeInvoiceProjectId === proj.id && (
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mt-2 animate-fadeIn space-y-3">
                    <p className="text-xs font-bold text-slate-800">Issue milestone receivables</p>
                    
                    <div className="space-y-2 text-xs">
                      <input
                        type="text"
                        placeholder="Milestone Deliverable Name (e.g. Beta Handover)"
                        value={milestoneName}
                        onChange={e => setMilestoneName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <input
                        type="number"
                        placeholder="Invoiced Price Sum ($)"
                        value={milestoneInvoicedCost}
                        onChange={e => setMilestoneInvoicedCost(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
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
                        className="px-3 py-1 bg-slate-900 text-white font-bold rounded-lg"
                      >
                        Deploy receivables
                      </button>
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL DRAWER FOR KANBAN TASK */}
      {activeTaskId && activeTaskObj && activeKanbanProject && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 animate-scaleUp text-left max-h-[90vh] overflow-y-auto">
            
            {/* Header section with closing and delete options */}
            <div className="flex justify-between items-start pt-1">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest flex items-center gap-1 font-mono">
                  <span>{activeKanbanProject.name}</span>
                  <ChevronRight className="h-3 w-3" />
                  <span>Agile board card</span>
                </p>

                <h3 className="text-md sm:text-lg font-black text-slate-900 tracking-tight leading-snug">{activeTaskObj.title}</h3>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {session.role !== 'Employee' && (
                  <button
                    onClick={() => handleDeleteTask(activeTaskObj.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition rounded-lg"
                    title="Dismantle Task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setActiveTaskId(null); setUploadProgress(null); }}
                  className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Task variables row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-100 p-3.5 rounded-xl text-xs font-semibold">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Priority KPI</span>
                <span className={`inline-block px-2.5 py-0.5 rounded bg-white font-bold border ${
                  activeTaskObj.priority === 'High' ? 'text-rose-700 border-rose-100' :
                  activeTaskObj.priority === 'Medium' ? 'text-amber-700 border-amber-100' :
                  'text-slate-600'
                }`}>
                  {activeTaskObj.priority}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Milestone Column</span>
                <select
                  value={activeTaskObj.status}
                  onChange={(e) => handleUpdateTaskStatus(activeTaskObj.id, e.target.value as any)}
                  className="bg-white border border-slate-200 font-bold p-1 rounded-md text-xs focus:outline-none"
                >
                  {KANBAN_COLUMNS.map(col => (
                    <option key={col} value={col}>{col}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-bold">Target Deadline</span>
                <span className="font-mono font-bold text-slate-800">{activeTaskObj.dueDate}</span>
              </div>
            </div>

            {/* Description context */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Specifications Detail</span>
              <p className="text-xs text-slate-650 leading-relaxed bg-slate-50/50 p-3 rounded-lg border border-slate-100 font-medium">
                {activeTaskObj.description || 'No supplementary guidelines loaded for this ticket.'}
              </p>
            </div>

            {/* Assignees initials list */}
            <div className="space-y-2">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Personnel delegated</span>
              <div className="flex flex-wrap gap-1.5">
                {activeTaskObj.assignedTo.map((name, i) => (
                  <span key={i} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-bold">
                    <Users className="h-3 w-3 text-slate-400" />
                    <span>{name}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* File upload simulated section */}
            <div className="space-y-2.5">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">File Attachments Logs</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Drag and Drop simulation box */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingOver(false);
                    handleSimulatedFileUpload(activeTaskObj.id, 'specifications_review_v2.pdf');
                  }}
                  onClick={() => handleSimulatedFileUpload(activeTaskObj.id, 'design_concept_wireframe.png')}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition flex flex-col justify-center items-center space-y-1.5 ${
                    isDraggingOver 
                      ? 'border-indigo-600 bg-indigo-50/20' 
                      : 'border-slate-200.bg-slate-50/10 hover:bg-slate-50 hover:border-slate-400'
                  }`}
                >
                  <UploadCloud className="h-6 w-6 text-slate-400" />
                  <div>
                    <p className="text-[11px] font-bold text-slate-800">Simulate file drag/click</p>
                    <p className="text-[8px] text-slate-400 leading-tight">Drop wireframe or logs schema</p>
                  </div>
                </div>

                <div className="border border-slate-150 p-3 rounded-xl space-y-2 max-h-[100px] overflow-y-auto">
                  {(activeTaskObj.attachments || []).map((file, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] font-mono bg-slate-50 border border-slate-100 p-1.5 rounded text-slate-600">
                      <span className="truncate">{file}</span>
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    </div>
                  ))}
                  {(activeTaskObj.attachments || []).length === 0 && (
                    <p className="text-center py-4 text-slate-400 text-[10px] font-medium">No files uploaded.</p>
                  )}
                </div>
              </div>

              {uploadProgress !== null && (
                <div className="space-y-1 font-mono text-[9px] text-indigo-700">
                  <div className="flex justify-between font-bold">
                    <span>Dispatching sandbox file parameters...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}
            </div>

            {/* Comments Feed section */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">Feed & Internal Dialogue</span>
              
              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {(activeTaskObj.comments || []).map((comm) => (
                  <div key={comm.id} className="bg-slate-50/70 border border-slate-100 p-2.5 rounded-xl text-left text-xs font-semibold space-y-1 shadow-3xs">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                      <span className="font-extrabold text-slate-700">{comm.user}</span>
                      <span>{new Date(comm.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-850 font-sans leading-relaxed">{comm.text}</p>
                  </div>
                ))}
                {(activeTaskObj.comments || []).length === 0 && (
                  <p className="text-center text-slate-400 text-[10px] py-4">No logged feed items yet. Start the conversation below!</p>
                )}
              </div>

              {/* Comment trigger */}
              <div className="flex gap-2 text-xs">
                <input
                  type="text"
                  placeholder="Record comment notes on task progress..."
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleAddTaskComment(activeTaskObj.id); }}
                  className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleAddTaskComment(activeTaskObj.id)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 text-white font-bold rounded-xl hover:bg-slate-800 transition shadow-2xs active:scale-95 text-[11px]"
                >
                  Send
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
