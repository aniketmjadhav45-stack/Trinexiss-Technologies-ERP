import React, { useState } from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  FileText, 
  Filter, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Invoice, ERPData } from '../types.ts';

interface FinanceProps {
  data: ERPData;
  onSaveData: (newData: ERPData) => void;
}

export default function Finance({ data, onSaveData }: FinanceProps) {
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);

  // New Invoice Form State
  const [projectId, setProjectId] = useState('');
  const [milestone, setMilestone] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  // Update status (e.g., Pending -> Received)
  const handleUpdateStatus = (invoiceId: string, status: 'Pending' | 'Received' | 'Overdue') => {
    const updatedInvoices = data.invoices.map(inv => {
      if (inv.id === invoiceId) {
        return { ...inv, status };
      }
      return inv;
    });

    onSaveData({
      ...data,
      invoices: updatedInvoices
    });
  };

  // Create Custom Manual Invoice
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !milestone || !amount || !dueDate) {
      alert('Please fill out all required parameters.');
      return;
    }

    const matchedProject = data.projects.find(p => p.id === projectId);
    if (!matchedProject) return;

    const invoiceNum = `INV-2026-${Math.round(400 + Math.random() * 500)}`;
    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      projectId,
      projectName: matchedProject.name,
      invoiceNumber: invoiceNum,
      amount: Number(amount),
      milestone,
      dueDate,
      status: 'Pending',
      issuedDate: new Date().toISOString().split('T')[0] // today
    };

    onSaveData({
      ...data,
      invoices: [newInvoice, ...data.invoices]
    });

    // Reset Form
    setIsAddingInvoice(false);
    setProjectId('');
    setMilestone('');
    setAmount('');
    setDueDate('');
  };

  // Compute stats
  const totalInvoiced = data.invoices.reduce((acc, i) => acc + i.amount, 0);
  const collected = data.invoices.filter(i => i.status === 'Received').reduce((acc, i) => acc + i.amount, 0);
  const pending = data.invoices.filter(i => i.status === 'Pending').reduce((acc, i) => acc + i.amount, 0);
  const overdue = data.invoices.filter(i => i.status === 'Overdue').reduce((acc, i) => acc + i.amount, 0);

  const filteredInvoices = data.invoices.filter(inv => {
    if (filterStatus === 'All') return true;
    return inv.status === filterStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Enterprise Financial Ledger</h2>
          <p className="text-xs text-slate-500">Auto-generate invoices on milestones, adjust payment status, and audit accounts receivable.</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Status filter selection */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1.5 rounded-xl shadow-xs">
            <Filter className="h-4 w-4 text-slate-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs font-semibold text-slate-600 bg-transparent border-none focus:outline-none"
            >
              <option value="All">All Invoices</option>
              <option value="Received">Received Payments</option>
              <option value="Pending">Pending Approvals</option>
              <option value="Overdue">Overdue Items</option>
            </select>
          </div>

          <button
            onClick={() => setIsAddingInvoice(!isAddingInvoice)}
            className="flex items-center gap-1.5 bg-slate-900 text-white font-semibold text-xs px-4 py-2 rounded-xl transition hover:bg-slate-800 active:scale-95 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Issue Invoice</span>
          </button>
        </div>
      </div>

      {/* Financial stats meters row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Invoiced Billing</p>
          <h3 className="text-lg font-bold text-slate-900 font-mono mt-0.5">${totalInvoiced.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Sum of active contracts</p>
        </div>

        <div className="bg-emerald-50/20 p-4.5 rounded-2xl border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Collected revenue</p>
          <h3 className="text-lg font-bold text-emerald-700 font-mono mt-0.5">${collected.toLocaleString()}</h3>
          <p className="text-[10px] text-emerald-600 font-medium mt-1">Paid in full securely</p>
        </div>

        <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-semibold">Pending milestone</p>
          <h3 className="text-lg font-bold text-slate-800 font-mono mt-0.5">${pending.toLocaleString()}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Accounts receivable</p>
        </div>

        <div className="bg-rose-50/20 p-4.5 rounded-2xl border border-rose-150">
          <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Overdue billing</p>
          <h3 className="text-lg font-bold text-rose-600 font-mono mt-0.5">${overdue.toLocaleString()}</h3>
          <p className="text-[10px] text-rose-500 font-medium mt-1">Payment timeline exceeded</p>
        </div>
      </div>

      {/* Slide-down Manual Invoice creator form */}
      {isAddingInvoice && (
        <form onSubmit={handleCreateInvoice} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-2xl space-y-4 animate-fadeIn">
          <h3 className="text-sm font-semibold text-slate-900">Compile Standing Corporate Invoice</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Select Target Project *</label>
              <select
                required
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="">Choosing contract project...</option>
                {data.projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (Client: {p.clientName})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Invoiced Milestone Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Design Prototype Complete"
                value={milestone}
                onChange={e => setMilestone(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Invoiced Sum ($) *</label>
              <input
                type="number"
                required
                placeholder="7500"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="mt-1 w-full bg-slate-50/50 border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 text-xs pt-2">
            <button
              type="button"
              onClick={() => setIsAddingInvoice(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Submit custom invoice record
            </button>
          </div>
        </form>
      )}

      {/* Detailed Ledger list Table */}
      <div className="bg-white rounded-2xl border border-slate-200/85 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-medium">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
                <th className="p-4">Invoice Number</th>
                <th className="p-4">Assigned Project & Milestone</th>
                <th className="p-4">Cost Basis</th>
                <th className="p-4">Schedules</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4 text-center">Receipt Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 font-semibold text-slate-700">
                  <td className="p-4 font-mono font-bold text-slate-900">
                    <span className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>{inv.invoiceNumber}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-slate-800">{inv.projectName}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{inv.milestone}</p>
                  </td>
                  <td className="p-4 font-mono font-extrabold text-slate-900">
                    ${inv.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-slate-500 font-mono flex flex-col justify-center space-y-0.5 text-[10px]">
                    <span>Issued: {inv.issuedDate}</span>
                    <span className="font-semibold text-slate-700">Due Date: {inv.dueDate}</span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      inv.status === 'Received' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                      inv.status === 'Pending' ? 'bg-slate-100 text-slate-600 border border-slate-200' :
                      'bg-rose-50 text-rose-700 border border-rose-100 animate-pulse'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-1.5">
                      {inv.status !== 'Received' ? (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(inv.id, 'Received')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 rounded-lg text-[10px] font-bold"
                            title="Mark Received"
                          >
                            Mark Received
                          </button>
                          
                          {inv.status === 'Pending' && (
                            <button
                              onClick={() => handleUpdateStatus(inv.id, 'Overdue')}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-100 rounded-lg text-[10px] font-bold"
                              title="Flag Overdue"
                            >
                              Flag Overdue
                            </button>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Cleared</span>
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">No invoices matched this status filter in general log ledger.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
