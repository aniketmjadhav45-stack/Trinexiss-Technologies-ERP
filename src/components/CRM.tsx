import React, { useState } from 'react';
import { 
  Users, 
  MapPin, 
  TrendingUp, 
  Phone, 
  Mail, 
  MessageSquare, 
  FileCheck, 
  Award, 
  Sparkles, 
  Calendar,
  Layers,
  PlusSquare,
  ChevronDown,
  ChevronUp,
  FilePlus,
  Plus
} from 'lucide-react';
import { ClientLead, ERPData, Meeting, Proposal } from '../types.ts';

interface CRMProps {
  data: ERPData;
  onSaveData: (newData: ERPData) => void;
}

export default function CRM({ data, onSaveData }: CRMProps) {
  const [filterType, setFilterType] = useState<'All' | 'Client' | 'Lead'>('All');
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isAddingLead, setIsAddingLead] = useState(false);

  // New Lead state definitions
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [type, setType] = useState<'Client' | 'Lead'>('Lead');
  const [leadStage, setLeadStage] = useState<'Prospect' | 'Qualified' | 'Proposal Sent' | 'Negotiation' | 'Closed'>('Prospect');
  const [dealValue, setDealValue] = useState('');
  
  // Custom metadata inputs
  const [industry, setIndustry] = useState('');
  const [country, setCountry] = useState('');
  const [segmentation, setSegmentation] = useState<'Domestic' | 'International'>('Domestic');
  const [healthScore, setHealthScore] = useState('80');

  // Meeting logger inputs
  const [meetingTopic, setMeetingTopic] = useState('');
  const [meetingSummary, setMeetingSummary] = useState('');
  const [meetingDate, setMeetingDate] = useState('');
  const [meetingTime, setMeetingTime] = useState('');

  // Proposal writer inputs
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalCost, setProposalCost] = useState('');

  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !company || !email) {
      alert('Please fill out Name, Company and Email.');
      return;
    }

    const newLead: ClientLead = {
      id: `c-${Date.now()}`,
      name,
      email,
      phone: phone || '+1 (555) 000-0000',
      company,
      type,
      leadStage: type === 'Lead' ? leadStage : undefined,
      meetings: [],
      proposals: [],
      leadScore: type === 'Lead' ? 40 : undefined, // initial score default
      scoreExplanation: type === 'Lead' ? 'Initial setup score. Run Gemini Audit to calculate deeper conversion likelihood.' : undefined,
      dealValue: dealValue ? Number(dealValue) : 0,
      industry: industry || 'SaaS',
      country: country || 'India',
      segmentation,
      healthScore: Number(healthScore) || 80
    };

    onSaveData({
      ...data,
      clients: [...data.clients, newLead]
    });

    // Reset fields
    setIsAddingLead(false);
    setName('');
    setEmail('');
    setPhone('');
    setCompany('');
    setType('Lead');
    setLeadStage('Prospect');
    setDealValue('');
    setIndustry('');
    setCountry('');
    setSegmentation('Domestic');
    setHealthScore('80');
  };

  // Change lead pipeline stage
  const handleStageChange = (clientId: string, stage: ClientLead['leadStage']) => {
    const updatedClients = data.clients.map(c => {
      if (c.id === clientId) {
        return { 
          ...c, 
          leadStage: stage,
          // if stage is closed, convert they to Client type
          type: stage === 'Closed' ? ('Client' as const) : c.type
        };
      }
      return c;
    });

    onSaveData({
      ...data,
      clients: updatedClients
    });
  };

  // Log a new meeting to client history
  const handleLogMeeting = (clientId: string) => {
    if (!meetingTopic || !meetingSummary || !meetingDate) {
      alert('Fill out Topic, Summary, and Date to log a meeting.');
      return;
    }

    const newMeeting: Meeting = {
      id: `m-${Date.now()}`,
      date: meetingDate,
      time: meetingTime || '12:00',
      topic: meetingTopic,
      summary: meetingSummary
    };

    const updatedClients = data.clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          meetings: [newMeeting, ...c.meetings]
        };
      }
      return c;
    });

    onSaveData({
      ...data,
      clients: updatedClients
    });

    // reset fields
    setMeetingTopic('');
    setMeetingSummary('');
    setMeetingDate('');
    setMeetingTime('');
  };

  // Append new proposal
  const handleDraftProposal = (clientId: string) => {
    if (!proposalTitle || !proposalCost) {
      alert('Please fill out proposal title and financial scope.');
      return;
    }

    const newProposal: Proposal = {
      id: `prop-${Date.now()}`,
      title: proposalTitle,
      cost: Number(proposalCost),
      sentDate: new Date().toISOString().split('T')[0],
      status: 'Sent' as const
    };

    const updatedClients = data.clients.map(c => {
      if (c.id === clientId) {
        return {
          ...c,
          proposals: [...c.proposals, newProposal],
          // automatically bump stage to Proposal Sent if it was prospect
          leadStage: c.leadStage === 'Prospect' ? ('Proposal Sent' as const) : c.leadStage
        };
      }
      return c;
    });

    onSaveData({
      ...data,
      clients: updatedClients
    });

    setProposalTitle('');
    setProposalCost('');
  };

  const filteredClients = data.clients.filter(c => {
    if (filterType === 'All') return true;
    return c.type === filterType;
  });

  return (
    <div className="space-y-6">
      
      {/* Visual top bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">CRM & Sales Pipelines</h2>
          <p className="text-xs text-slate-500">Track strategic communications, map deal sizes, and review AI scoring conversion ratios.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Filtering */}
          <div className="flex items-center gap-1 bg-white border border-slate-200/80 px-2 rounded-xl shadow-xs">
            <button
              onClick={() => setFilterType('All')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filterType === 'All' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('Client')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filterType === 'Client' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Clients
            </button>
            <button
              onClick={() => setFilterType('Lead')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
                filterType === 'Lead' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              Leads
            </button>
          </div>

          <button
            onClick={() => setIsAddingLead(!isAddingLead)}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition hover:bg-slate-800 active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Create Entity</span>
          </button>
        </div>
      </div>

      {/* Slide-down template to register Lead/Client directory */}
      {isAddingLead && (
        <form onSubmit={handleCreateLead} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4 max-w-3xl animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-900">Create Contact Profile</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Representative Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Jean-Luc Picard"
                value={name}
                onChange={e => setName(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Corporate Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Starfleet Communications"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Email ID *</label>
              <input
                type="email"
                required
                placeholder="picard@starfleet.org"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Contact Phone</label>
              <input
                type="text"
                placeholder="+1 (555) 123-4567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Profile Strategy</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as 'Client' | 'Lead')}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold"
              >
                <option value="Lead">Lead Opportunity</option>
                <option value="Client">Closed Contract Client</option>
              </select>
            </div>

            {type === 'Lead' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Current Stage</label>
                <select
                  value={leadStage}
                  onChange={e => setLeadStage(e.target.value as any)}
                  className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700"
                >
                  <option value="Prospect">Prospect</option>
                  <option value="Qualified">Qualified</option>
                  <option value="Proposal Sent">Proposal Sent</option>
                  <option value="Negotiation">Negotiation</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Deals Value ($)</label>
              <input
                type="number"
                placeholder="40000"
                value={dealValue}
                onChange={e => setDealValue(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Industry</label>
              <input
                type="text"
                placeholder="e.g. Fintech, Retail, SaaS"
                value={industry}
                onChange={e => setIndustry(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Base Country</label>
              <input
                type="text"
                placeholder="e.g. India, US, UK"
                value={country}
                onChange={e => setCountry(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Segmentation Classification</label>
              <select
                value={segmentation}
                onChange={e => setSegmentation(e.target.value as 'Domestic' | 'International')}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700"
              >
                <option value="Domestic">Domestic Market</option>
                <option value="International">International Market</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Account Health Score (0-100)</label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="85"
                value={healthScore}
                onChange={e => setHealthScore(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingLead(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white font-semibold text-xs rounded-lg hover:bg-slate-800"
            >
              Create contact directory
            </button>
          </div>
        </form>
      )}

      {/* Main layout splitting leads ledger with interactive panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Directory Row - takes 2/3 */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/85 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-4">Entity & Company</th>
                    <th className="p-4">Contact Person</th>
                    <th className="p-4">Strategic Type</th>
                    <th className="p-4">Deal Value</th>
                    <th className="p-4">Stage / Score</th>
                    <th className="p-4 text-center">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredClients.map((client) => {
                    const isSelected = selectedLeadId === client.id;
                    return (
                      <tr key={client.id} className={`hover:bg-slate-50/50 transition ${isSelected ? 'bg-slate-50 border-l border-emerald-600' : ''}`}>
                        <td className="p-4">
                          <p className="font-bold text-slate-900 leading-tight">{client.company}</p>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5 tracking-wide">
                            {client.industry || 'Tech'} • {client.country || 'India'} ({client.segmentation || 'Domestic'})
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-slate-700">{client.name}</p>
                          <p className="text-[10px] text-slate-400">{client.email}</p>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-medium font-semibold text-[10px] ${
                            client.type === 'Client' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                          }`}>
                            {client.type}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-800">
                          ${client.dealValue.toLocaleString()}
                        </td>
                        <td className="p-4 mr-1">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2">
                              {client.type === 'Lead' ? (
                                <>
                                  <span className="text-[10px] bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded font-black text-slate-700 uppercase">{client.leadStage}</span>
                                  {client.leadScore !== undefined && (
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold ${
                                      client.leadScore >= 75 ? 'bg-emerald-100 text-emerald-800' :
                                      client.leadScore >= 45 ? 'bg-amber-100 text-amber-800' :
                                      'bg-slate-100 text-slate-700'
                                    }`}>
                                      AI: {client.leadScore}%
                                    </span>
                                  )}
                                </>
                              ) : (
                                <span className="text-emerald-600 text-[10px] font-black flex items-center gap-1 uppercase">
                                  <Award className="h-3.5 w-3.5" />
                                  <span>Closed won</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-slate-400 font-semibold">Client Health:</span>
                              <span className={`font-mono text-[10px] font-black ${
                                (client.healthScore || 80) >= 90 ? 'text-emerald-600' :
                                (client.healthScore || 80) >= 75 ? 'text-indigo-600' :
                                'text-amber-600'
                              }`}>
                                {client.healthScore || 80}%
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => setSelectedLeadId(isSelected ? null : client.id)}
                            className="px-2.5 py-1 hover:bg-slate-100 text-slate-500 rounded-md font-semibold text-[11px] flex items-center gap-1 mx-auto"
                          >
                            <span>Toggle</span>
                            {isSelected ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Detailed Inspection Column - takes 1/3 */}
        <div>
          {selectedLeadId ? (() => {
            const client = data.clients.find(c => c.id === selectedLeadId);
            if (!client) return <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl text-xs text-slate-400">Select any contact on left.</div>;
            return (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/85 shadow-xs space-y-5 animate-fadeIn">
                
                {/* Visual title */}
                <div className="pb-4 border-b border-slate-100">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-slate-900 text-md">{client.company}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-500 p-1 rounded-md font-mono">{client.type}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Lead Representative: <span className="font-semibold text-slate-600">{client.name}</span></p>

                  {/* contact details */}
                  <div className="space-y-1.5 mt-3 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" />
                      <span>{client.email}</span>
                    </div>
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Corporate Metadata Metrics Breakdown */}
                <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-xs space-y-2 h-auto">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1">Client Parameters</p>
                  <div className="grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600">
                    <div>
                      <p className="text-[9px] uppercase text-slate-400">Industry Sector</p>
                      <p className="text-slate-800 font-bold mt-0.5">{client.industry || 'SaaS Tech'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase text-slate-400">Geographic Base</p>
                      <p className="text-slate-800 font-bold mt-0.5">{client.country || 'India'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase text-slate-400">Market Segment</p>
                      <p className="text-slate-800 font-bold mt-0.5">{client.segmentation || 'Domestic'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] uppercase text-slate-400">Client Health Index</p>
                      <p className={`font-black mt-0.5 ${(client.healthScore || 80) >= 90 ? 'text-emerald-600' : 'text-indigo-600'}`}>
                        {client.healthScore || 85}% Safe
                      </p>
                    </div>
                  </div>
                </div>

                {/* Lead stage configuration (Only for Leeds) */}
                {client.type === 'Lead' && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Update Pipeline Stage</p>
                    <select
                      value={client.leadStage}
                      onChange={(e) => handleStageChange(client.id, e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-semibold text-slate-700"
                    >
                      <option value="Prospect">Prospect</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal Sent">Proposal Sent</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Closed">Closed / Won</option>
                    </select>
                  </div>
                )}

                {/* AI Score breakdown panel */}
                {client.type === 'Lead' && client.leadScore !== undefined && (
                  <div className="bg-emerald-50/20 border border-emerald-100 p-4 rounded-xl space-y-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="h-4.5 w-4.5 text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-800">Gemini Predictive Score</span>
                      <span className="font-mono font-black text-emerald-700 text-sm ml-auto">{client.leadScore}%</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                      {client.scoreExplanation || 'Awaiting system operations audit to parse granular proposal parameters.'}
                    </p>
                  </div>
                )}

                {/* Meetings history logs */}
                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Communication Logs ({client.meetings.length})</p>
                  
                  {/* list meetings */}
                  {client.meetings.length > 0 ? (
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {client.meetings.map((meeting) => (
                        <div key={meeting.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs">
                          <div className="flex justify-between items-center text-slate-400 text-[10px] mb-1 font-semibold">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {meeting.date}
                            </span>
                            <span>{meeting.time}</span>
                          </div>
                          <p className="font-bold text-slate-900">{meeting.topic}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{meeting.summary}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400/80">No registered physical or virtual meetings logged.</p>
                  )}

                  {/* Add meeting template */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Register Touchpoint</p>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Meeting Topic (e.g. Scope Signoff)"
                        value={meetingTopic}
                        onChange={e => setMeetingTopic(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Key Takeaways Summary"
                        value={meetingSummary}
                        onChange={e => setMeetingSummary(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-1 px-0.5">
                        <input
                          type="date"
                          value={meetingDate}
                          onChange={e => setMeetingDate(e.target.value)}
                          className="bg-white border border-slate-200 rounded-md p-1 text-[10px]"
                        />
                        <input
                          type="time"
                          value={meetingTime}
                          onChange={e => setMeetingTime(e.target.value)}
                          className="bg-white border border-slate-200 rounded-md p-1 text-[10px]"
                        />
                      </div>
                      <button
                        onClick={() => handleLogMeeting(client.id)}
                        className="w-full bg-slate-900 text-white font-semibold text-[10px] py-1.5 rounded-lg text-center"
                      >
                        Register Log
                      </button>
                    </div>
                  </div>
                </div>

                {/* Proposals section */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Financial Proposals</p>
                  
                  {client.proposals.length > 0 ? (
                    <div className="space-y-2">
                      {client.proposals.map((prop) => (
                        <div key={prop.id} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg text-xs">
                          <div>
                            <p className="font-semibold text-slate-800">{prop.title}</p>
                            <p className="text-[10px] text-slate-400">Delivered on: {prop.sentDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600 font-mono">${prop.cost.toLocaleString()}</p>
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded-sm font-semibold">{prop.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">No proposals currently drafted for this account.</p>
                  )}

                  {/* Proposals Quick drafting */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Draft Proposal</p>
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        placeholder="Proposal Title (e.g. Migration Phase II)"
                        value={proposalTitle}
                        onChange={e => setProposalTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                      <input
                        type="number"
                        placeholder="Budget Cost Matrix ($ sum)"
                        value={proposalCost}
                        onChange={e => setProposalCost(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-md p-1.5 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                      />
                      <button
                        onClick={() => handleDraftProposal(client.id)}
                        className="w-full bg-blue-600 text-white font-semibold text-[10px] py-1.5 rounded-lg text-center"
                      >
                        Send proposal to Client
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            );
          })() : (
            <div className="hidden lg:block bg-slate-50 p-10 border border-slate-200 border-dashed rounded-2xl text-center text-xs text-slate-400">
              <PlusSquare className="h-8 w-8 text-slate-300 mx-auto mb-2" />
              <p>Select any corporate contact from the ledger to inspect logs, register touchpoints, or outline proposals.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
