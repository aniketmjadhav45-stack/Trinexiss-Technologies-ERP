import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { INITIAL_ERP_DATA } from './src/seedData.ts';
import { ERPData, AIInsights } from './src/types.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), 'trinexiss_erp_database.json');

app.use(express.json({ limit: '10mb' }));

// Helper to read database
function readDatabase(): ERPData {
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading database, reverting to seed', err);
  }
  
  // Seed initial dataset
  fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_ERP_DATA, null, 2), 'utf-8');
  return INITIAL_ERP_DATA;
}

// Helper to write database
function writeDatabase(data: ERPData): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database', err);
  }
}

// Lazy init the Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.trim() !== '') {
    geminiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    return geminiClient;
  }
  return null;
}

// Rule-based Fallback AI Insights Generator (when key is missing or API fails)
function generateFallbackInsights(data: ERPData): AIInsights {
  const today = '2026-06-19';
  
  const uniqueCountries = Array.from(new Set(data.projects.map(p => p.country).filter(Boolean)));
  const countriesStr = uniqueCountries.join(', ');
  const totalRevenueUsd = data.invoices.filter(i => i.status === 'Received').reduce((acc, i) => acc + i.amount, 0);
  const totalRevenueInr = Math.round(totalRevenueUsd * 83.5);

  const weeklyReport = `Clients: ${data.clients.length}, Employees: ${data.employees.length}, Projects: ${data.projects.length} (${countriesStr || 'Domestic'}), Revenue: ₹${totalRevenueInr.toLocaleString()} / $${totalRevenueUsd.toLocaleString()}`;
  
  // Find high risk or past deadline projects
  const atRisk = data.projects.filter(p => p.status !== 'Completed' && (p.riskLevel === 'High' || p.deadline < today));
  const resourceSuggestions = atRisk.length > 0 
    ? `Warning on bottlenecked resources: Project "${atRisk[0].name}" is critical. It is recommended to reallocate hours from long-term low-risk projects. David Chen and David Jenkins should support the implementation milestones immediately.`
    : 'All resources are adequately allocated; no immediate bottlenecks detected across Active developer hours.';

  const completionForecasts = data.projects.map(p => {
    let forecastDate = p.deadline;
    let riskStatus: 'On Track' | 'At Risk' | 'Delayed' = 'On Track';
    
    if (p.status === 'Completed') {
      riskStatus = 'On Track';
    } else if (p.deadline < today) {
      riskStatus = 'Delayed';
      forecastDate = '2026-07-05'; // estimate extension past today
    } else if (p.riskLevel === 'High') {
      riskStatus = 'At Risk';
      forecastDate = p.deadline;
    }
    
    return {
      projectId: p.id,
      forecastedDate: forecastDate,
      riskStatus,
      reasoning: `Rule-based estimate: Analysis based on progress (${p.progress}%) and deadline (${p.deadline}). Assigned capacity per week: ${p.assignedEmployees.reduce((acc, e) => acc + e.allocatedHoursPerWeek, 0)} hours.`
    };
  });

  const leadScoringAnalysis = data.clients.filter(c => c.type === 'Lead').map(c => {
    let score = 50;
    let reason = 'Undergoing discovery review.';
    if (c.leadStage === 'Negotiation') {
      score = 85;
      reason = 'High conversion potential due to active negotiation state and SOC2 compliance validation.';
    } else if (c.leadStage === 'Proposal Sent') {
      score = 70;
      reason = 'Proposal delivered. Awaiting executive budget allocation.';
    } else if (c.leadStage === 'Qualified') {
      score = 45;
      reason = 'Qualified lead actively discussing pain points. Requires scheduling high-fidelity design review.';
    } else if (c.leadStage === 'Prospect') {
      score = 25;
      reason = 'Early inbound interest. Schedule discovery call to identify project scope constraints.';
    }
    return {
      leadId: c.id,
      score,
      reasoning: reason
    };
  });

  // Financial calculations
  const pendingInvoices = data.invoices.filter(i => i.status === 'Pending');
  const overdueInvoices = data.invoices.filter(i => i.status === 'Overdue');
  const pendingTotal = pendingInvoices.reduce((acc, i) => acc + i.amount, 0);
  const overdueTotal = overdueInvoices.reduce((acc, i) => acc + i.amount, 0);

  const cashFlowForecast = `Expected incoming cash flow is $${(pendingTotal + overdueTotal).toLocaleString()} over the next 30 days. This includes $${pendingTotal.toLocaleString()} in pending milestones and $${overdueTotal.toLocaleString()} in outstanding overdue receivables.`;

  // Anomaly scanner
  const anomalies: string[] = [];
  data.projects.forEach(p => {
    if (p.status !== 'Completed' && p.deadline < today) {
      anomalies.push(`Project "${p.name}" has surpassed its deadline (${p.deadline}) but is currently still in "${p.status}" phase.`);
    }
  });
  data.invoices.forEach(i => {
    if (i.status === 'Overdue') {
      anomalies.push(`Invoice ${i.invoiceNumber} ($${i.amount.toLocaleString()}) for "${i.projectName}" is past due.`);
    }
  });
  data.employees.forEach(e => {
    const unexcused = e.attendance.filter(a => a.status === 'Absent');
    if (unexcused.length > 0) {
      anomalies.push(`Employee ${e.name} has registered unexcused absences recently, affecting current velocity rates.`);
    }
  });

  if (anomalies.length === 0) {
    anomalies.push('No critical resource, financial, or developmental anomalies detected currently.');
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

// 1. Fetch entire database
app.get('/api/erp/data', (req, res) => {
  try {
    const data = readDatabase();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve database.' });
  }
});

// 2. Save entire database
app.post('/api/erp/data', (req, res) => {
  try {
    const data: ERPData = req.body;
    if (!data || !Array.isArray(data.projects)) {
      return res.status(400).json({ error: 'Invalid ERP configuration payload.' });
    }
    writeDatabase(data);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update database.' });
  }
});

// 3. Trigger server-side Gemini AI core analysis
app.post('/api/erp/analyze', async (req, res) => {
  try {
    const database = readDatabase();
    const client = getGeminiClient();
    
    if (!client) {
      console.log('Gemini client not initialized (missing API key). Launching high-fidelity local rules engines...');
      const fallback = generateFallbackInsights(database);
      database.aiInsights = fallback;
      writeDatabase(database);
      return res.json({ 
        success: true, 
        insights: fallback,
        notice: 'Insights generated via Trinexiss Analytics Rule Engine (Gemini API key is not connected)'
      });
    }

    const payloadString = JSON.stringify({
      projects: database.projects.map(p => ({
        id: p.id,
        name: p.name,
        clientName: p.clientName,
        tools: p.tools,
        deadline: p.deadline,
        cost: p.cost,
        status: p.status,
        progress: p.progress,
        riskLevel: p.riskLevel,
        riskReason: p.riskReason
      })),
      clients: database.clients.map(c => ({
        id: c.id,
        company: c.company,
        type: c.type,
        leadStage: c.leadStage,
        meetingsCount: c.meetings.length,
        proposals: c.proposals
      })),
      employees: database.employees.map(e => ({
        id: e.id,
        name: e.name,
        role: e.role,
        productivityScore: e.productivityScore,
        attendanceSummary: e.attendance.reduce((acc: any, curr) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {})
      })),
      invoices: database.invoices.map(i => ({
        id: i.id,
        projectName: i.projectName,
        amount: i.amount,
        dueDate: i.dueDate,
        status: i.status
      }))
    });

    const userPrompt = `You are the lead AI operations consultant for Trinexiss Technologies. 
Analyze our entire current company database and generate a comprehensive ERP & CRM report.
The current date is **2026-06-19**. All deadlines, overdue invoice notices, and attendance parameters must be evaluated relative to 2026-06-19.

Database payload:
${payloadString}

Task instructions:
1. Provide a weeklyReport: You MUST summarize the current status into a single line formatted exactly as: "Clients: X, Employees: Y, Projects: Z (list of countries where projects are active), Revenue: ₹[Total collected in INR] / $[Total collected in USD]". (Let X, Y, Z represent the counts from the database, and convert cash collected in received status invoices to INR and USD).
2. Provide resourceSuggestions: Identify bottlenecks. E.g. Project p2 is "In Progress" with only 35% progress by June 30. How can we reallocate developer hours specifically? Match actual employee profiles.
3. Provide completionForecasts: For each of the projects, predict realistic completion date, riskStatus ('On Track', 'At Risk', 'Delayed'), and reasoning based on resource speed and deadlines.
4. Provide leadScoringAnalysis: Calculate a conversion score (0 to 100) and reasoning for every lead (type: 'Lead'). Match stages: Negotiation, Proposal Sent, Qualified, Prospect.
5. Provide cashFlowForecast: Forecast incoming assets vs liabilities for the next 30 days based on Pending and Overdue invoices.
6. Provide anomalies: Spot overdue payments, projects past deadlines that are not Completed, high-risk flags, low employee attendance, and list them clearly as individual alerts.`;

    // Query Gemini
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            weeklyReport: { 
              type: Type.STRING, 
              description: "A summary explaining operational efficiency, risks, active projects, and invoice balances of the firm." 
            },
            resourceSuggestions: { 
              type: Type.STRING, 
              description: "Actionable concrete developer suggestions to reallocate hours to help lagging teams." 
            },
            completionForecasts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  projectId: { type: Type.STRING },
                  forecastedDate: { type: Type.STRING, description: "Predicted completion date (YYYY-MM-DD)" },
                  riskStatus: { type: Type.STRING, description: "On Track, At Risk, or Delayed" },
                  reasoning: { type: Type.STRING }
                },
                required: ["projectId", "forecastedDate", "riskStatus", "reasoning"]
              }
            },
            leadScoringAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  leadId: { type: Type.STRING },
                  score: { type: Type.INTEGER },
                  reasoning: { type: Type.STRING }
                },
                required: ["leadId", "score", "reasoning"]
              }
            },
            cashFlowForecast: { 
              type: Type.STRING, 
              description: "Predictive short summary of upcoming income flows" 
            },
            anomalies: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "A bulleted list of clear administrative, financial, project-deadline anomalies."
            }
          },
          required: ["weeklyReport", "resourceSuggestions", "completionForecasts", "leadScoringAnalysis", "cashFlowForecast", "anomalies"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error('Gemini model returned empty response text');
    }
    
    // Parse response
    const parsedInsights: AIInsights = JSON.parse(resultText.trim());
    parsedInsights.lastUpdated = new Date().toISOString();
    
    // Update local database
    database.aiInsights = parsedInsights;
    // Map scores to lead database items for direct scoring coherence
    parsedInsights.leadScoringAnalysis.forEach(scoreItem => {
      const match = database.clients.find(c => c.id === scoreItem.leadId);
      if (match) {
        match.leadScore = scoreItem.score;
        match.scoreExplanation = scoreItem.reasoning;
      }
    });
    
    writeDatabase(database);
    res.json({ success: true, insights: parsedInsights });

  } catch (err: any) {
    console.error('Core Gemini AI Analysis failed, launching high-fidelity local backup:', err);
    // On failure, fall back to rule-based engine and report
    const db = readDatabase();
    const fallback = generateFallbackInsights(db);
    db.aiInsights = fallback;
    writeDatabase(db);
    res.json({ 
      success: true, 
      insights: fallback, 
      notice: 'AI Analysis parsed via local rules fallback (API timeout or schema match limitation)',
      errorDetails: err?.message || String(err)
    });
  }
});

// Setup development server or serve build folder in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
