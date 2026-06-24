export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: 'Backlog' | 'To Do' | 'In Progress' | 'Review' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  assignedTo: string[]; // Employee IDs or Names assigned
  attachments?: string[]; // Log of files uploaded
  comments?: {
    id: string;
    user: string;
    text: string;
    timestamp: string;
  }[];
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  assignedEmployees: {
    id: string;
    name: string;
    role: string;
    allocatedHoursPerWeek: number;
  }[];
  tools: string[];
  deadline: string; // YYYY-MM-DD
  cost: number;
  status: 'Not Started' | 'In Progress' | 'On Hold' | 'Completed';
  progress: number; // 0 to 100
  riskLevel: 'Low' | 'Medium' | 'High';
  riskReason?: string;
  description: string;
  country: string; // Added: country (e.g., 'India', 'US', 'Germany', etc.)
  tasks?: KanbanTask[]; // Trello Kanban Tasks board
  startDate?: string; // YYYY-MM-DD
  priority?: 'Low' | 'Medium' | 'High'; // Low, Medium, High
  isArchived?: boolean; // Archived flag
}

export interface Meeting {
  id: string;
  date: string;
  time: string;
  topic: string;
  summary: string;
}

export interface Proposal {
  id: string;
  title: string;
  cost: number;
  sentDate: string;
  status: 'Draft' | 'Sent' | 'Accepted' | 'Rejected';
}

export interface ClientLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  type: 'Client' | 'Lead';
  leadStage?: 'Prospect' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed';
  meetings: Meeting[];
  proposals: Proposal[];
  leadScore?: number; // 0-100
  scoreExplanation?: string;
  dealValue: number;
  industry: string; // e.g. Retail, Healthcare, Fintech, SaaS, Cybersecurity
  country: string;  // e.g. India, US, Germany, UK, etc.
  segmentation: 'Domestic' | 'International'; // Segment: Domestic vs. International
  healthScore: number; // 0 to 100 payment reliability & engagement
  address?: string;
  gstNumber?: string;
  website?: string;
  notes?: string;
  clientLogo?: string;
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Leave';
  hoursWorked: number;
  checkIn?: string; // HH:MM
  checkOut?: string; // HH:MM
  breakTime?: number; // In minutes
  isLate?: boolean;
  history?: {
    type: 'CheckIn' | 'CheckOut' | 'BreakStart' | 'BreakEnd';
    timestamp: string; // ISO string
  }[];
}

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  leaveType?: 'Casual Leave' | 'Sick Leave' | 'Paid Leave' | 'Work From Home';
  adminRemarks?: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  email: string;
  hourlyRate: number;
  attendance: AttendanceRecord[];
  leaves: LeaveRequest[];
  productivityScore: number; // 0 - 100
  department: string; // Added: department (e.g. Engineering, Design, QA, DevOps)
  profilePhoto?: string;
  contactNumber?: string;
  joiningDate?: string;
  status?: 'Active' | 'Suspended' | 'Invited';
  assignedModules?: string[]; // RBAC: assigned modules (e.g., 'Projects Portfolio', 'CRM Leads', 'Finance Ledger', 'Staff Attendance')
  leaveBalances?: {
    casual: number;
    sick: number;
    paid: number;
    wfh: number;
  };
}

export interface Invoice {
  id: string;
  projectId: string;
  projectName: string;
  invoiceNumber: string;
  amount: number;
  milestone: string;
  dueDate: string; // YYYY-MM-DD
  status: 'Pending' | 'Received' | 'Overdue';
  issuedDate: string; // YYYY-MM-DD;
  clientCompany?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
  tax?: number;
  totalAmount?: number;
  paymentStatus?: 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue';
}

export interface FinancialTransaction {
  id: string;
  type: 'Income' | 'Expense';
  category: 'Client Payment' | 'Revenue' | 'Salary' | 'Software Subscription' | 'Operational Expense' | 'Other';
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  status: 'Cleared' | 'Pending' | 'Failed';
}

export interface AIInsights {
  lastUpdated: string;
  weeklyReport: string;
  resourceSuggestions: string;
  completionForecasts: {
    projectId: string;
    forecastedDate: string;
    riskStatus: 'On Track' | 'At Risk' | 'Delayed';
    reasoning: string;
  }[];
  leadScoringAnalysis: {
    leadId: string;
    score: number;
    reasoning: string;
  }[];
  cashFlowForecast: string;
  anomalies: string[];
}

export interface UserSession {
  fullName: string;
  email: string;
  contactNumber?: string;
  role: 'Founder' | 'Admin' | 'AI Engineer' | 'Employee';
  employeeId?: string;
  isVerified: boolean;
}

export interface CompanyInfo {
  name: string;
  logo: string; // Icon identifier or standard text
  email: string;
  phone: string;
  address: string;
  gstNumber: string;
  industry: string;
  website: string;
  description?: string; // Company description
  brandColor?: string; // Branding brand color
}

export interface InAppNotification {
  id: string;
  timestamp: string; // Date string ISO
  user: string; // Recipient name/email or "All"
  title: string;
  message: string;
  read: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface RolePermissions {
  founder: string[];
  admin: string[];
  aiEngineer: string[];
  employee: string[];
}

export interface ActivityLog {
  id: string;
  timestamp: string; // Date String ISO
  user: string;
  action: string;
  category: 'System' | 'Employee' | 'Client' | 'Project' | 'Invoice' | 'AI';
  module?: string; // Action's specific module (Company, Client, Project, Task, etc.)
}

export interface ERPData {
  projects: Project[];
  clients: ClientLead[];
  employees: Employee[];
  invoices: Invoice[];
  companyInfo?: CompanyInfo;
  rolePermissions?: RolePermissions;
  activityLogs?: ActivityLog[];
  aiInsights?: AIInsights;
  notificationsEnabled?: boolean; // Toggled by Admin
  notifications?: InAppNotification[]; // In-app notification logs
  transactions?: FinancialTransaction[];
}
