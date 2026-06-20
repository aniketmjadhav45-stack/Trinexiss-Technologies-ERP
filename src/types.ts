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
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Leave';
  hoursWorked: number;
}

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
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

export interface ERPData {
  projects: Project[];
  clients: ClientLead[];
  employees: Employee[];
  invoices: Invoice[];
  aiInsights?: AIInsights;
}
