import { ERPData } from './types.ts';

export const INITIAL_ERP_DATA: ERPData = {
  projects: [
    {
      id: 'p1',
      name: 'SaaS Enterprise ERP Integration',
      clientId: 'c1',
      clientName: 'Quantum Systems Inc.',
      assignedEmployees: [
        { id: 'e1', name: 'Aniket Jadhav', role: 'Senior Solution Architect', allocatedHoursPerWeek: 20 },
        { id: 'e2', name: 'Sweta Singh', role: 'Lead Full Stack Developer', allocatedHoursPerWeek: 25 },
        { id: 'e5', name: 'Sunita Dwivedi', role: 'DevOps Engineer', allocatedHoursPerWeek: 15 }
      ],
      tools: ['TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'AWS'],
      deadline: '2026-07-25',
      cost: 45000,
      status: 'In Progress',
      progress: 60,
      riskLevel: 'Low',
      description: 'Design and deployment of custom ERP synchronization modules connecting their legacy backend with modern SaaS web portals.',
      country: 'US'
    },
    {
      id: 'p2',
      name: 'AI Chatbot & Support Integration',
      clientId: 'c2',
      clientName: 'Apex Retailers Group',
      assignedEmployees: [
        { id: 'e2', name: 'Sweta Singh', role: 'Lead Full Stack Developer', allocatedHoursPerWeek: 15 },
        { id: 'e1', name: 'Aniket Jadhav', role: 'Senior Solution Architect', allocatedHoursPerWeek: 35 },
        { id: 'e4', name: 'Manju Shukla', role: 'QA Engineer', allocatedHoursPerWeek: 10 }
      ],
      tools: ['Gemini API', 'React', 'Tailwind CSS', 'FastAPI', 'Python'],
      deadline: '2026-06-30',
      cost: 28000,
      status: 'In Progress',
      progress: 35,
      riskLevel: 'High',
      riskReason: 'Deadline is in less than 2 weeks, with significant AI training scope and frontend edge-cases remaining.',
      description: 'Building an automated customer support concierge with specialized context grounding from Apex sales files.',
      country: 'India'
    },
    {
      id: 'p3',
      name: 'NextGen Fintech Mobile Portal',
      clientId: 'c3',
      clientName: 'Globex Financial Corp',
      assignedEmployees: [
        { id: 'e1', name: 'Aniket Jadhav', role: 'Senior Solution Architect', allocatedHoursPerWeek: 15 },
        { id: 'e3', name: 'Shweta Dwivedi', role: 'UI/UX Designer', allocatedHoursPerWeek: 30 },
        { id: 'e2', name: 'Sweta Singh', role: 'Lead Full Stack Developer', allocatedHoursPerWeek: 10 }
      ],
      tools: ['React Native', 'TypeScript', 'Tailwind CSS', 'Figma', 'NodeJS'],
      deadline: '2026-09-15',
      cost: 85000,
      status: 'Not Started',
      progress: 0,
      riskLevel: 'Low',
      description: 'Designing and prototyping a next-generation high-security consumer micro-lending dashboard app.',
      country: 'UK'
    },
    {
      id: 'p4',
      name: 'UX Redesign for Healthcare Portal',
      clientId: 'c4',
      clientName: 'Innovate Tech & Biotech',
      assignedEmployees: [
        { id: 'e3', name: 'Shweta Dwivedi', role: 'UI/UX Designer', allocatedHoursPerWeek: 25 },
        { id: 'e4', name: 'Manju Shukla', role: 'QA Engineer', allocatedHoursPerWeek: 5 }
      ],
      tools: ['Figma', 'React', 'Radix UI', 'CSS Grid', 'TailwindCSS'],
      deadline: '2026-06-18',
      cost: 15000,
      status: 'On Hold',
      progress: 85,
      riskLevel: 'Medium',
      riskReason: 'Client review of front-end mockups delayed by 10 days, putting implementation milestone on hold.',
      description: 'A complete patient dashboard visual overhaul for seamless, color-blind accessible clinical navigation.',
      country: 'India'
    }
  ],
  clients: [
    {
      id: 'c1',
      name: 'Amanda Brooks',
      email: 'a.brooks@quantumsystems.io',
      phone: '+1 (555) 234-5678',
      company: 'Quantum Systems Inc.',
      type: 'Client',
      meetings: [
        { id: 'm1', date: '2026-06-10', time: '10:00', topic: 'ERP Architecture Review', summary: 'Aligned on core database sync rates. Recommended PostgreSQL read replicas.' },
        { id: 'm2', date: '2026-06-18', time: '14:30', topic: 'Mid-term Demo', summary: 'Shown admin panel controls. Amanda requested minor CSV layout additions.' }
      ],
      proposals: [
        { id: 'prop1', title: 'ERP Core Setup', cost: 45000, sentDate: '2026-04-12', status: 'Accepted' }
      ],
      dealValue: 45000,
      industry: 'SaaS',
      country: 'US',
      segmentation: 'International',
      healthScore: 92
    },
    {
      id: 'c2',
      name: 'Vikram Patel',
      email: 'vikram.p@apexretailers.com',
      phone: '+1 (555) 876-5432',
      company: 'Apex Retailers Group',
      type: 'Client',
      meetings: [
        { id: 'm3', date: '2026-06-02', time: '11:00', topic: 'Concierge Training Config', summary: 'Defined context constraints. Discussed support ticket escalation thresholds.' },
        { id: 'm4', date: '2026-06-15', time: '09:00', topic: 'Scope Refinement', summary: 'Urgent meeting. Clarified why multilingual support is deferred to v2 to hit the June 30 target.' }
      ],
      proposals: [
        { id: 'prop2', title: 'Support Chatbot and Agent Concierge', cost: 28000, sentDate: '2026-05-02', status: 'Accepted' }
      ],
      dealValue: 28000,
      industry: 'Retail',
      country: 'India',
      segmentation: 'Domestic',
      healthScore: 78
    },
    {
      id: 'c3',
      name: 'Marcus Sterling',
      email: 'sterling.m@globex.com',
      phone: '+1 (555) 432-1098',
      company: 'Globex Financial Corp',
      type: 'Client',
      meetings: [
        { id: 'm5', date: '2026-06-12', time: '15:00', topic: 'Kickoff and Moodboarding', summary: 'Discussed security mandates and branding styles. Selected elegant dark high-contrast interface templates.' }
      ],
      proposals: [
        { id: 'prop3', title: 'Mobile Lending App Design & Code Prototype', cost: 85000, sentDate: '2026-05-20', status: 'Accepted' }
      ],
      dealValue: 85000,
      industry: 'Fintech',
      country: 'UK',
      segmentation: 'International',
      healthScore: 88
    },
    {
      id: 'c4',
      name: 'Dr. Evelyn Carter',
      email: 'e.carter@innovatemed.org',
      phone: '+1 (555) 901-2345',
      company: 'Innovate Tech & Biotech',
      type: 'Client',
      meetings: [
        { id: 'm6', date: '2026-06-08', time: '13:00', topic: 'Design Signoff Delay', summary: 'Discussed compliance delay with legal review. Estimated resolution by June 22.' }
      ],
      proposals: [
        { id: 'prop4', title: 'UX Redesign and Accessibility Audit', cost: 15000, sentDate: '2026-05-15', status: 'Accepted' }
      ],
      dealValue: 15000,
      industry: 'Healthcare',
      country: 'India',
      segmentation: 'Domestic',
      healthScore: 80
    },
    {
      id: 'c5',
      name: 'Raymond Vance',
      email: 'r.vance@fintechpay.net',
      phone: '+1 (555) 303-4567',
      company: 'FinTech Pay',
      type: 'Lead',
      leadStage: 'Negotiation',
      meetings: [
        { id: 'm7', date: '2026-06-05', time: '14:00', topic: 'Proposal Breakdown', summary: 'Raymond requested payment orchestrator security certifications. Cost model accepted partially.' },
        { id: 'm8', date: '2026-06-16', time: '16:00', topic: 'Security Compliance Details', summary: 'Delivered detailed SOC2 and tokenization blueprints. Vance was highly impressed.' }
      ],
      proposals: [
        { id: 'prop5', title: 'Fintech Gateway Orchestrator Design', cost: 60000, sentDate: '2026-05-28', status: 'Sent' }
      ],
      leadScore: 82,
      scoreExplanation: 'Highly engaged. Price is accepted; final signoff is pending legal validation of security specs which were delivered and well received.',
      dealValue: 60000,
      industry: 'Fintech',
      country: 'Germany',
      segmentation: 'International',
      healthScore: 85
    },
    {
      id: 'c6',
      name: 'Diana Prince',
      email: 'diana.prince@biohealthlabs.co',
      phone: '+1 (555) 444-9999',
      company: 'BioHealth Labs',
      type: 'Lead',
      leadStage: 'Proposal Sent',
      meetings: [
        { id: 'm9', date: '2026-06-11', time: '10:00', topic: 'Workflow Demo', summary: 'Presented clinical research tracker proof of concept. Diana was pleased with the drag-and-drop file upload idea.' }
      ],
      proposals: [
        { id: 'prop6', title: 'Research Compliance Platform Dev', cost: 40000, sentDate: '2026-06-14', status: 'Sent' }
      ],
      leadScore: 68,
      scoreExplanation: 'Satisfied by the custom demo. Currently checking internal budgets for the Q3 medical funding cycle.',
      dealValue: 40000,
      industry: 'Healthcare',
      country: 'US',
      segmentation: 'International',
      healthScore: 90
    },
    {
      id: 'c7',
      name: 'Arthur Curry',
      email: 'acurry@aquatech.net',
      phone: '+1 (555) 777-1111',
      company: 'AgriTech Solutions',
      type: 'Lead',
      leadStage: 'Qualified',
      meetings: [
        { id: 'm10', date: '2026-06-17', time: '11:00', topic: 'Discovery Call', summary: 'Identified major pain points: tracking crop sensor telemetry and managing water allocation tables.' }
      ],
      proposals: [],
      leadScore: 45,
      scoreExplanation: 'Good discovery match, but early stage budget has not been officially greenlit contextually.',
      dealValue: 30000,
      industry: 'Agriculture',
      country: 'India',
      segmentation: 'Domestic',
      healthScore: 75
    },
    {
      id: 'c8',
      name: 'Bruce Wayne',
      email: 'bwayne@cyber-shield.com',
      phone: '+1 (555) 100-3000',
      company: 'CyberShield Inc',
      type: 'Lead',
      leadStage: 'Prospect',
      meetings: [],
      proposals: [],
      leadScore: 25,
      scoreExplanation: 'Inbound request. Outstanding enterprise size, but initial communications are minimal with zero deep discovery calls yet.',
      dealValue: 120000,
      industry: 'Cybersecurity',
      country: 'US',
      segmentation: 'International',
      healthScore: 60
    }
  ],
  employees: [
    {
      id: 'e1',
      name: 'Aniket Jadhav',
      role: 'Senior Solution Architect',
      email: 'aniket.j@trinexiss.tech',
      hourlyRate: 75,
      productivityScore: 94,
      leaves: [
        { id: 'l1', startDate: '2026-07-01', endDate: '2026-07-05', reason: 'Annual Family Vacation', status: 'Approved' }
      ],
      attendance: [
        { date: '2026-06-15', status: 'Present', hoursWorked: 8.5 },
        { date: '2026-06-16', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-17', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-18', status: 'Present', hoursWorked: 9 },
        { date: '2026-06-19', status: 'Present', hoursWorked: 8 }
      ],
      department: 'Engineering'
    },
    {
      id: 'e2',
      name: 'Sweta Singh',
      role: 'Lead Full Stack Developer',
      email: 'sweta.s@trinexiss.tech',
      hourlyRate: 65,
      productivityScore: 89,
      leaves: [],
      attendance: [
        { date: '2026-06-15', status: 'Present', hoursWorked: 9 },
        { date: '2026-06-16', status: 'Present', hoursWorked: 9.5 },
        { date: '2026-06-17', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-18', status: 'Present', hoursWorked: 8.5 },
        { date: '2026-06-19', status: 'Present', hoursWorked: 8 }
      ],
      department: 'Engineering'
    },
    {
      id: 'e3',
      name: 'Shweta Dwivedi',
      role: 'UI/UX Designer',
      email: 'shweta.d@trinexiss.tech',
      hourlyRate: 55,
      productivityScore: 91,
      leaves: [],
      attendance: [
        { date: '2026-06-15', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-16', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-17', status: 'Leave', hoursWorked: 0 },
        { date: '2026-06-18', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-19', status: 'Present', hoursWorked: 8 }
      ],
      department: 'Design'
    },
    {
      id: 'e4',
      name: 'Manju Shukla',
      role: 'QA Engineer',
      email: 'manju.s@trinexiss.tech',
      hourlyRate: 45,
      productivityScore: 85,
      leaves: [],
      attendance: [
        { date: '2026-06-15', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-16', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-17', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-18', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-19', status: 'Present', hoursWorked: 8 }
      ],
      department: 'QA'
    },
    {
      id: 'e5',
      name: 'Sunita Dwivedi',
      role: 'DevOps Engineer',
      email: 'sunita.d@trinexiss.tech',
      hourlyRate: 70,
      productivityScore: 92,
      leaves: [
        { id: 'l2', startDate: '2026-06-25', endDate: '2026-06-26', reason: 'Medical Checkup', status: 'Pending' }
      ],
      attendance: [
        { date: '2026-06-15', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-16', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-17', status: 'Present', hoursWorked: 8.5 },
        { date: '2026-06-18', status: 'Present', hoursWorked: 8 },
        { date: '2026-06-19', status: 'Present', hoursWorked: 8 }
      ],
      department: 'DevOps'
    }
  ],
  invoices: [
    {
      id: 'inv1',
      projectId: 'p1',
      projectName: 'SaaS Enterprise ERP Integration',
      invoiceNumber: 'INV-2026-001',
      amount: 15000,
      milestone: 'Phase I Requirements and Schema Signoff',
      dueDate: '2026-05-30',
      status: 'Received',
      issuedDate: '2026-05-10'
    },
    {
      id: 'inv2',
      projectId: 'p1',
      projectName: 'SaaS Enterprise ERP Integration',
      invoiceNumber: 'INV-2026-002',
      amount: 15000,
      milestone: 'Phase II Core Dev Progress Deployment',
      dueDate: '2026-07-05',
      status: 'Pending',
      issuedDate: '2026-06-15'
    },
    {
      id: 'inv3',
      projectId: 'p2',
      projectName: 'AI Chatbot & Support Integration',
      invoiceNumber: 'INV-2026-003',
      amount: 10000,
      milestone: 'Project Kickoff & Knowledge Base Sync',
      dueDate: '2026-06-12',
      status: 'Received',
      issuedDate: '2026-06-01'
    },
    {
      id: 'inv4',
      projectId: 'p2',
      projectName: 'AI Chatbot & Support Integration',
      invoiceNumber: 'INV-2026-004',
      amount: 9000,
      milestone: 'Integration Beta Testing Sandbox Deliverable',
      dueDate: '2026-06-18',
      status: 'Overdue',
      issuedDate: '2026-06-05'
    },
    {
      id: 'inv5',
      projectId: 'p4',
      projectName: 'UX Redesign for Healthcare Portal',
      invoiceNumber: 'INV-2026-005',
      amount: 7500,
      milestone: 'Figma High-Fidelity Prototype Wireframes',
      dueDate: '2026-06-25',
      status: 'Pending',
      issuedDate: '2026-06-10'
    }
  ],
  aiInsights: {
    lastUpdated: '2026-06-19T03:00:00-07:00',
    weeklyReport: 'Clients: 8, Employees: 5, Projects: 4 (India, US, UK), Revenue: ₹3,103,500 / $37,500',
    resourceSuggestions: 'Project "AI Chatbot & Support Integration" (p2) is severely lagging (35% complete with 11 days remaining). Recommend shifting Sweta Singh (allocated 10 hours on p3) to dedicate an additional 10 hours per week on p2 backend API nodes to assist Aniket Jadhav.',
    completionForecasts: [
      { projectId: 'p1', forecastedDate: '2026-07-22', riskStatus: 'On Track', reasoning: 'Led by senior solution architect Aniket Jadhav; rapid deployment velocity with outstanding development adherence.' },
      { projectId: 'p2', forecastedDate: '2026-07-12', riskStatus: 'Delayed', reasoning: 'Support chatbot integration is technically complex. The June 30 milestone will slip unless resources are immediately expanded.' },
      { projectId: 'p3', forecastedDate: '2026-09-15', riskStatus: 'On Track', reasoning: 'Initial roadmap parameters verified. Shweta Dwivedi has complete mock templates ready.' },
      { projectId: 'p4', forecastedDate: '2026-07-05', riskStatus: 'At Risk', reasoning: 'Delayed 10 days by client administrative review cycles, though engineering is highly polished.' }
    ],
    leadScoringAnalysis: [
      { leadId: 'c5', score: 85, reasoning: 'Negotiations finalized with Vance; contract sent following successful delivery of SOC2 and encryption spec matrices.' },
      { leadId: 'c6', score: 68, reasoning: 'Client bio-health budget limits for 2026 currently pending executive vote; high user engagement of research workflows.' },
      { leadId: 'c7', score: 45, reasoning: 'Qualified discovery status is active, crop analytics scope aligns well. Awaiting initial seed funding approval.' },
      { leadId: 'c8', score: 25, reasoning: 'Inbound target profile represents massive potential deal size, but direct dialogue has not yet commenced.' }
    ],
    cashFlowForecast: 'Total forecast cash intake for June-July cycle is $31,500 ($15,000 from p1 milestone, $7,500 from p4 wireframes, and $9,000 from current overdue p2 Sandbox deliverable). Estimated regional domestic/international cash collections show 100% solvency.',
    anomalies: [
      'Project p4 (Innovate Healthcare Overhaul) timeline of June 18 has crossed while current state is on "On Hold".',
      'Invoice INV-2026-004 in project p2 is Overdue. Action required: Send immediate communication reminder to Apex group.',
      'Employee Sunita Dwivedi is tagged with an Unexcused Absence on June 16, resulting in immediate productivity dips.'
    ]
  }
};
