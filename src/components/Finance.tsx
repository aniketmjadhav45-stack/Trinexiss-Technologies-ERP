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
  ArrowRight,
  Printer,
  Download,
  Send,
  X,
  FileCheck,
  TrendingUp,
  FileSpreadsheet,
  Trash2,
  Edit,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Mail
} from 'lucide-react';
import { Invoice, ERPData, FinancialTransaction } from '../types.ts';

interface FinanceProps {
  data: ERPData;
  onSaveData: (newData: ERPData) => void;
  session?: any;
}

export default function Finance({ data, onSaveData, session }: FinanceProps) {
  const [activeTab, setActiveTab] = useState<'ledger' | 'invoices' | 'reports'>('ledger');
  const [filterType, setFilterType] = useState<string>('All');
  const [filterInvoiceStatus, setFilterInvoiceStatus] = useState<string>('All');
  
  // Modals & form state
  const [isAddingInvoice, setIsAddingInvoice] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  
  const [isAddingTransaction, setIsAddingTransaction] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<FinancialTransaction | null>(null);
  
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form State: INVOICES
  const [invProjectId, setInvProjectId] = useState('');
  const [invClientCompany, setInvClientCompany] = useState('');
  const [invMilestone, setInvMilestone] = useState('');
  const [invDescription, setInvDescription] = useState('');
  const [invQuantity, setInvQuantity] = useState(1);
  const [invUnitPrice, setInvUnitPrice] = useState('');
  const [invTax, setInvTax] = useState(18); // Default 18% GST/Tax
  const [invDueDate, setInvDueDate] = useState('');
  const [invIssuedDate, setInvIssuedDate] = useState(new Date().toISOString().split('T')[0]);
  const [invPaymentStatus, setInvPaymentStatus] = useState<'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue'>('Draft');

  // Form State: TRANSACTIONS
  const [txType, setTxType] = useState<'Income' | 'Expense'>('Income');
  const [txCategory, setTxCategory] = useState<any>('Client Payment');
  const [txAmount, setTxAmount] = useState('');
  const [txDescription, setTxDescription] = useState('');
  const [txDate, setTxDate] = useState(new Date().toISOString().split('T')[0]);
  const [txStatus, setTxStatus] = useState<'Cleared' | 'Pending' | 'Failed'>('Cleared');

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4500);
  };

  // Safe initialize transactions
  const ledgerTransactions: FinancialTransaction[] = data.transactions || [];

  // PROJECT SELECT HANDLER
  const handleProjectSelect = (projId: string) => {
    setInvProjectId(projId);
    const matched = data.projects.find(p => p.id === projId);
    if (matched) {
      setInvClientCompany(matched.clientName);
    }
  };

  // --- CRUD FOR INVOICES ---
  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!invProjectId || !invMilestone || !invUnitPrice || !invDueDate) {
      alert('Please fill out all required invoice fields.');
      return;
    }

    const matchedProject = data.projects.find(p => p.id === invProjectId);
    if (!matchedProject) return;

    const baseAmount = Number(invQuantity) * Number(invUnitPrice);
    const taxVal = baseAmount * (Number(invTax) / 100);
    const totalWithTax = baseAmount + taxVal;

    const invoiceNum = `INV-2026-${Math.round(400 + Math.random() * 500)}`;
    
    // Map paymentStatus to legacy status
    let legacyStatus: 'Pending' | 'Received' | 'Overdue' = 'Pending';
    if (invPaymentStatus === 'Paid') legacyStatus = 'Received';
    if (invPaymentStatus === 'Overdue') legacyStatus = 'Overdue';

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      projectId: invProjectId,
      projectName: matchedProject.name,
      invoiceNumber: invoiceNum,
      amount: totalWithTax, // Keep amount consistent with existing charts
      milestone: invMilestone,
      dueDate: invDueDate,
      status: legacyStatus,
      issuedDate: invIssuedDate,
      clientCompany: invClientCompany || matchedProject.clientName,
      description: invDescription,
      quantity: Number(invQuantity),
      unitPrice: Number(invUnitPrice),
      tax: Number(invTax),
      totalAmount: totalWithTax,
      paymentStatus: invPaymentStatus
    };

    const updatedInvoices = [newInvoice, ...data.invoices];
    
    // Also log to Activity Log
    const newLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: session?.fullName || 'Admin',
      action: `Created invoice ${invoiceNum} for $${totalWithTax.toLocaleString()}`,
      category: 'Invoice' as const,
      module: 'Finance Ledger'
    };

    onSaveData({
      ...data,
      invoices: updatedInvoices,
      activityLogs: [newLog, ...(data.activityLogs || [])]
    });

    // Reset Form
    setIsAddingInvoice(false);
    resetInvoiceForm();
    triggerToast(`Invoice ${invoiceNum} compiled as ${invPaymentStatus} successfully.`);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setInvProjectId(inv.projectId);
    setInvClientCompany(inv.clientCompany || '');
    setInvMilestone(inv.milestone);
    setInvDescription(inv.description || '');
    setInvQuantity(inv.quantity || 1);
    setInvUnitPrice(String(inv.unitPrice || inv.amount));
    setInvTax(inv.tax !== undefined ? inv.tax : 18);
    setInvDueDate(inv.dueDate);
    setInvIssuedDate(inv.issuedDate);
    setInvPaymentStatus(inv.paymentStatus || (inv.status === 'Received' ? 'Paid' : inv.status === 'Overdue' ? 'Overdue' : 'Sent'));
  };

  const handleUpdateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    const baseAmount = Number(invQuantity) * Number(invUnitPrice);
    const taxVal = baseAmount * (Number(invTax) / 100);
    const totalWithTax = baseAmount + taxVal;

    let legacyStatus: 'Pending' | 'Received' | 'Overdue' = 'Pending';
    if (invPaymentStatus === 'Paid') legacyStatus = 'Received';
    if (invPaymentStatus === 'Overdue') legacyStatus = 'Overdue';

    const updatedInvoices = data.invoices.map(inv => {
      if (inv.id === editingInvoice.id) {
        return {
          ...inv,
          projectId: invProjectId,
          projectName: data.projects.find(p => p.id === invProjectId)?.name || inv.projectName,
          clientCompany: invClientCompany,
          milestone: invMilestone,
          description: invDescription,
          quantity: Number(invQuantity),
          unitPrice: Number(invUnitPrice),
          tax: Number(invTax),
          amount: totalWithTax,
          totalAmount: totalWithTax,
          dueDate: invDueDate,
          issuedDate: invIssuedDate,
          paymentStatus: invPaymentStatus,
          status: legacyStatus
        };
      }
      return inv;
    });

    onSaveData({
      ...data,
      invoices: updatedInvoices
    });

    setEditingInvoice(null);
    resetInvoiceForm();
    triggerToast(`Invoice ${editingInvoice.invoiceNumber} successfully revised.`);
  };

  const handleDeleteInvoice = (invId: string, invNum: string) => {
    if (!window.confirm(`Are you sure you want to permanently discard Invoice ${invNum}?`)) return;

    const filtered = data.invoices.filter(i => i.id !== invId);
    onSaveData({
      ...data,
      invoices: filtered
    });
    triggerToast(`Invoice ${invNum} has been permanently deleted.`);
  };

  const resetInvoiceForm = () => {
    setInvProjectId('');
    setInvClientCompany('');
    setInvMilestone('');
    setInvDescription('');
    setInvQuantity(1);
    setInvUnitPrice('');
    setInvTax(18);
    setInvDueDate('');
    setInvIssuedDate(new Date().toISOString().split('T')[0]);
    setInvPaymentStatus('Draft');
  };

  // --- CRUD FOR GENERAL LEDGER ---
  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txAmount || !txDescription || !txDate) {
      alert('Please fill out all required transaction fields.');
      return;
    }

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      type: txType,
      category: txCategory,
      amount: Number(txAmount),
      description: txDescription,
      date: txDate,
      status: txStatus
    };

    const updatedTxs = [newTx, ...ledgerTransactions];

    onSaveData({
      ...data,
      transactions: updatedTxs
    });

    setIsAddingTransaction(false);
    resetTransactionForm();
    triggerToast(`Transaction recorded successfully: $${Number(txAmount).toLocaleString()} (${txType}).`);
  };

  const handleEditTransaction = (tx: FinancialTransaction) => {
    setEditingTransaction(tx);
    setTxType(tx.type);
    setTxCategory(tx.category);
    setTxAmount(String(tx.amount));
    setTxDescription(tx.description);
    setTxDate(tx.date);
    setTxStatus(tx.status);
  };

  const handleUpdateTransactionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;

    const updatedTxs = ledgerTransactions.map(tx => {
      if (tx.id === editingTransaction.id) {
        return {
          ...tx,
          type: txType,
          category: txCategory,
          amount: Number(txAmount),
          description: txDescription,
          date: txDate,
          status: txStatus
        };
      }
      return tx;
    });

    onSaveData({
      ...data,
      transactions: updatedTxs
    });

    setEditingTransaction(null);
    resetTransactionForm();
    triggerToast('Transaction record updated successfully.');
  };

  const handleDeleteTransaction = (txId: string) => {
    if (!window.confirm('Are you sure you want to discard this transaction from ledger audit logs?')) return;

    const filtered = ledgerTransactions.filter(tx => tx.id !== txId);
    onSaveData({
      ...data,
      transactions: filtered
    });
    triggerToast('Transaction entry deleted.');
  };

  const resetTransactionForm = () => {
    setTxType('Income');
    setTxCategory('Client Payment');
    setTxAmount('');
    setTxDescription('');
    setTxDate(new Date().toISOString().split('T')[0]);
    setTxStatus('Cleared');
  };

  // SIMULATE DISPATCH EMAIL NOTIFICATION FOR INVOICES (#7)
  const handleSendInvoiceEmail = (inv: Invoice) => {
    triggerToast(`Email dispatched to customer client accounts for Invoice ${inv.invoiceNumber}! Status: ${inv.paymentStatus || inv.status}`);
    
    // Log Notification in-app (#7)
    const newNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: 'All',
      title: `Invoice Dispatched: ${inv.invoiceNumber}`,
      message: `System forwarded the invoice request of $${inv.amount.toLocaleString()} for project "${inv.projectName}" to client workspace on ${inv.dueDate}.`,
      read: false,
      type: 'success' as const
    };

    onSaveData({
      ...data,
      notifications: [newNotification, ...(data.notifications || [])]
    });
  };

  // METRICS FOR GENERAL LEDGER
  const ledgerIncome = ledgerTransactions.filter(tx => tx.type === 'Income' && tx.status === 'Cleared').reduce((sum, tx) => sum + tx.amount, 0);
  const ledgerExpenses = ledgerTransactions.filter(tx => tx.type === 'Expense' && tx.status === 'Cleared').reduce((sum, tx) => sum + tx.amount, 0);
  const netLedgerProfit = ledgerIncome - ledgerExpenses;

  // Filter Transactions
  const filteredTransactions = ledgerTransactions.filter(tx => {
    if (filterType === 'All') return true;
    return tx.type === filterType;
  });

  // Filter Invoices
  const filteredInvoices = data.invoices.filter(inv => {
    if (filterInvoiceStatus === 'All') return true;
    const standingStatus = inv.paymentStatus || (inv.status === 'Received' ? 'Paid' : inv.status === 'Overdue' ? 'Overdue' : 'Sent');
    return standingStatus === filterInvoiceStatus;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Upper sub-tabs bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Financial Management Ledger</h2>
          <p className="text-xs text-slate-500">Track company fiscal cycles, manage standing project invoices, and generate Profit & Loss statements.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl w-full sm:w-auto self-stretch">
          <button
            onClick={() => setActiveTab('ledger')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'ledger' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Ledger Books
          </button>
          <button
            onClick={() => setActiveTab('invoices')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'invoices' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Invoice Hub
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'reports' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            P&L Reports
          </button>
        </div>
      </div>

      {/* --- RENDER 1: GENERAL LEDGER TAB --- */}
      {activeTab === 'ledger' && (
        <div className="space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50/20 p-4.5 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Cleared Income</p>
                <h3 className="text-xl font-extrabold text-emerald-700 font-mono mt-1">${ledgerIncome.toLocaleString()}</h3>
                <p className="text-[9px] text-emerald-600 mt-1 font-semibold">Incoming corporate wire transfers</p>
              </div>
              <div className="bg-emerald-100 text-emerald-800 p-2 rounded-xl"><ArrowUpRight className="h-5 w-5" /></div>
            </div>

            <div className="bg-rose-50/20 p-4.5 rounded-2xl border border-rose-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Cleared Expenses</p>
                <h3 className="text-xl font-extrabold text-rose-700 font-mono mt-1">${ledgerExpenses.toLocaleString()}</h3>
                <p className="text-[9px] text-rose-600 mt-1 font-semibold">Payroll and operations outflow</p>
              </div>
              <div className="bg-rose-100 text-rose-800 p-2 rounded-xl"><ArrowDownRight className="h-5 w-5" /></div>
            </div>

            <div className="bg-indigo-50/20 p-4.5 rounded-2xl border border-indigo-100 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Net Operating Surplus</p>
                <h3 className="text-xl font-extrabold text-indigo-700 font-mono mt-1">${netLedgerProfit.toLocaleString()}</h3>
                <p className="text-[9px] text-indigo-600 mt-1 font-semibold">Margin: {Math.round((netLedgerProfit / (ledgerIncome || 1)) * 100)}%</p>
              </div>
              <div className="bg-indigo-100 text-indigo-800 p-2 rounded-xl"><TrendingUp className="h-5 w-5" /></div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="text-xs font-bold text-slate-600 bg-transparent focus:outline-none"
              >
                <option value="All">All Transactions</option>
                <option value="Income">Income Ledger Only</option>
                <option value="Expense">Expense Ledger Only</option>
              </select>
            </div>

            <button
              onClick={() => {
                resetTransactionForm();
                setEditingTransaction(null);
                setIsAddingTransaction(!isAddingTransaction);
              }}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl active:scale-95 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Record Ledger Entry</span>
            </button>
          </div>

          {/* RECORD/EDIT TRANSACTION SLIDEOVER FORM */}
          {(isAddingTransaction || editingTransaction) && (
            <form 
              onSubmit={editingTransaction ? handleUpdateTransactionSubmit : handleCreateTransaction} 
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md max-w-2xl space-y-4 animate-fadeIn"
            >
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Layers className="h-4.5 w-4.5 text-slate-500" />
                <span>{editingTransaction ? 'Revise Corporate Entry' : 'Compile Ledger Entry'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Entry Type *</label>
                  <select
                    value={txType}
                    onChange={e => {
                      const type = e.target.value as 'Income' | 'Expense';
                      setTxType(type);
                      setTxCategory(type === 'Income' ? 'Client Payment' : 'Salary');
                    }}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-slate-900 focus:outline-none text-slate-700 font-semibold"
                  >
                    <option value="Income">Income (Receivable)</option>
                    <option value="Expense">Expense (Payable)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Ledger Category *</label>
                  <select
                    value={txCategory}
                    onChange={e => setTxCategory(e.target.value as any)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-slate-900 focus:outline-none text-slate-700 font-semibold"
                  >
                    {txType === 'Income' ? (
                      <>
                        <option value="Client Payment">Client Payment</option>
                        <option value="Revenue">Revenue</option>
                        <option value="Other">Other Income</option>
                      </>
                    ) : (
                      <>
                        <option value="Salary">Salaries & Payroll</option>
                        <option value="Software Subscription">Software Subscriptions</option>
                        <option value="Operational Expense">Operational Expenses</option>
                        <option value="Other">Other Expenses</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Transaction Amount ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="5000"
                    value={txAmount}
                    onChange={e => setTxAmount(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono text-slate-700 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Valuation Date *</label>
                  <input
                    type="date"
                    required
                    value={txDate}
                    onChange={e => setTxDate(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-slate-900 focus:outline-none font-mono text-slate-700 font-semibold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Transaction Description *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Monthly cloud hosting invoice (AWS and GitHub Enterprise accounts)"
                    value={txDescription}
                    onChange={e => setTxDescription(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-slate-900 focus:outline-none text-slate-700 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Clearing Status *</label>
                  <select
                    value={txStatus}
                    onChange={e => setTxStatus(e.target.value as any)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-slate-900 focus:outline-none text-slate-700 font-semibold"
                  >
                    <option value="Cleared">Cleared (Success)</option>
                    <option value="Pending">Pending (Processing)</option>
                    <option value="Failed">Failed (Declined)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTransaction(false);
                    setEditingTransaction(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                >
                  {editingTransaction ? 'Update Record' : 'Record Transaction'}
                </button>
              </div>
            </form>
          )}

          {/* Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Description</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Amount ($)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold">
                  {filteredTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50/60 text-slate-750">
                      <td className="p-4 font-mono font-bold text-slate-900">{tx.id.substring(0, 10)}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                          tx.type === 'Income' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' : 'bg-rose-50 text-rose-800 border border-rose-100'
                        }`}>
                          {tx.category}
                        </span>
                      </td>
                      <td className="p-4 max-w-xs truncate">{tx.description}</td>
                      <td className="p-4 font-mono">{tx.date}</td>
                      <td className={`p-4 font-mono font-extrabold ${tx.type === 'Income' ? 'text-emerald-600' : 'text-slate-850'}`}>
                        {tx.type === 'Income' ? '+' : '-'}${tx.amount.toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block h-2 w-2 rounded-full ${
                          tx.status === 'Cleared' ? 'bg-emerald-500' : tx.status === 'Pending' ? 'bg-amber-400' : 'bg-rose-500'
                        } mr-1.5`}></span>
                        <span>{tx.status}</span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleEditTransaction(tx)}
                            className="p-1 hover:bg-slate-100 text-slate-500 rounded"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTransaction(tx.id)}
                            className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-400">No matching transactions in ledger records.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- RENDER 2: INVOICE HUB TAB --- */}
      {activeTab === 'invoices' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Status filters & summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4.5 rounded-2xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoiced Total</p>
              <h3 className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                ${data.invoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-emerald-50/25 p-4.5 rounded-2xl border border-emerald-100">
              <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Paid / Cleared</p>
              <h3 className="text-lg font-bold text-emerald-700 font-mono mt-0.5">
                ${data.invoices.filter(i => i.status === 'Received' || i.paymentStatus === 'Paid').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-amber-50/25 p-4.5 rounded-2xl border border-amber-100">
              <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Outstanding Sent</p>
              <h3 className="text-lg font-bold text-amber-700 font-mono mt-0.5">
                ${data.invoices.filter(i => i.status === 'Pending' || i.paymentStatus === 'Sent').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-rose-50/25 p-4.5 rounded-2xl border border-rose-100">
              <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Past Due Overdue</p>
              <h3 className="text-lg font-bold text-rose-600 font-mono mt-0.5">
                ${data.invoices.filter(i => i.status === 'Overdue' || i.paymentStatus === 'Overdue').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </h3>
            </div>
            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Draft Estimates</p>
              <h3 className="text-lg font-bold text-slate-800 font-mono mt-0.5">
                ${data.invoices.filter(i => i.paymentStatus === 'Draft').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
              </h3>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex justify-between items-center bg-white p-3.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <select
                value={filterInvoiceStatus}
                onChange={e => setFilterInvoiceStatus(e.target.value)}
                className="text-xs font-bold text-slate-650 bg-transparent focus:outline-none"
              >
                <option value="All">All Invoices</option>
                <option value="Draft">Drafts Only</option>
                <option value="Sent">Sent (Pending)</option>
                <option value="Paid">Paid (Received)</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Overdue">Overdue Items</option>
              </select>
            </div>

            <button
              onClick={() => {
                resetInvoiceForm();
                setEditingInvoice(null);
                setIsAddingInvoice(!isAddingInvoice);
              }}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl active:scale-95 transition"
            >
              <Plus className="h-4 w-4" />
              <span>Compile Milestone Invoice</span>
            </button>
          </div>

          {/* INVOICE CRUD SLIDEOVER FORM */}
          {(isAddingInvoice || editingInvoice) && (
            <form 
              onSubmit={editingInvoice ? handleUpdateInvoiceSubmit : handleCreateInvoice} 
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md max-w-2xl space-y-4 animate-fadeIn"
            >
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <FileText className="h-4.5 w-4.5 text-indigo-600" />
                <span>{editingInvoice ? `Revise Invoice: ${editingInvoice.invoiceNumber}` : 'Draft Milestone Invoice'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Target Contract Project *</label>
                  <select
                    required
                    value={invProjectId}
                    onChange={e => handleProjectSelect(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="">Choose Project...</option>
                    {data.projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (Client: {p.clientName})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Client Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="Quantum Systems Inc."
                    value={invClientCompany}
                    onChange={e => setInvClientCompany(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Milestone / Line Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Prototype delivery & validation complete"
                    value={invMilestone}
                    onChange={e => setInvMilestone(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Quantity *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={invQuantity}
                    onChange={e => setInvQuantity(Number(e.target.value))}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Unit Price ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="5000"
                    value={invUnitPrice}
                    onChange={e => setInvUnitPrice(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Service Tax Rate (%) *</label>
                  <input
                    type="number"
                    required
                    placeholder="18"
                    value={invTax}
                    onChange={e => setInvTax(Number(e.target.value))}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Issue Date *</label>
                  <input
                    type="date"
                    required
                    value={invIssuedDate}
                    onChange={e => setInvIssuedDate(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={invDueDate}
                    onChange={e => setInvDueDate(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Detailed Description</label>
                  <textarea
                    rows={2}
                    placeholder="Item details, notes on deliverable signed, wire configurations, or bank instructions..."
                    value={invDescription}
                    onChange={e => setInvDescription(e.target.value)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase">Payment Status *</label>
                  <select
                    value={invPaymentStatus}
                    onChange={e => setInvPaymentStatus(e.target.value as any)}
                    className="mt-1 w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent (Pending Approval)</option>
                    <option value="Paid">Paid in Full</option>
                    <option value="Partially Paid">Partially Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                {/* Auto Calculated Preview Card */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 flex flex-col justify-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Auto-calculated Total</p>
                  <p className="text-md font-extrabold text-slate-900 mt-1 font-mono">
                    ${(Number(invQuantity) * Number(invUnitPrice || 0) * (1 + Number(invTax) / 100)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[8px] text-slate-400 mt-0.5">Includes {invTax}% tax rate</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 text-xs pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingInvoice(false);
                    setEditingInvoice(null);
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold"
                >
                  {editingInvoice ? 'Revise Invoice' : 'Submit Invoice Record'}
                </button>
              </div>
            </form>
          )}

          {/* Invoices List Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <th className="p-4">Serial Code</th>
                    <th className="p-4">Client Company & Project</th>
                    <th className="p-4">Description / Milestone</th>
                    <th className="p-4">Timeline</th>
                    <th className="p-4">Billing ($)</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Receipt Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {filteredInvoices.map((inv) => {
                    const currentStatus = inv.paymentStatus || (inv.status === 'Received' ? 'Paid' : inv.status === 'Overdue' ? 'Overdue' : 'Sent');
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/60 text-slate-700">
                        <td className="p-4 font-mono font-bold text-slate-900 flex items-center gap-1.5">
                          <FileText className="h-4 w-4 text-slate-400" />
                          <span>{inv.invoiceNumber}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-900 leading-tight">{inv.clientCompany || 'Quantum Corp'}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{inv.projectName}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-slate-800 leading-tight truncate max-w-xs">{inv.milestone}</p>
                          {inv.description && <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs">{inv.description}</p>}
                        </td>
                        <td className="p-4 font-mono text-[10px]">
                          <p className="text-slate-500">Issued: {inv.issuedDate}</p>
                          <p className="font-bold text-slate-750 mt-0.5">Due: {inv.dueDate}</p>
                        </td>
                        <td className="p-4 font-mono font-extrabold text-slate-950">
                          ${inv.amount.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider border ${
                            currentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            currentStatus === 'Sent' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            currentStatus === 'Draft' ? 'bg-slate-50 text-slate-500 border-slate-200' :
                            currentStatus === 'Partially Paid' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                            'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
                          }`}>
                            {currentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSendInvoiceEmail(inv)}
                              className="p-1 hover:bg-slate-100 text-slate-500 rounded"
                              title="Forward notification via Email"
                            >
                              <Send className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setViewingInvoice(inv)}
                              className="p-1 hover:bg-slate-100 text-slate-500 rounded"
                              title="View and print PDF receipt"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleEditInvoice(inv)}
                              className="p-1 hover:bg-slate-100 text-slate-500 rounded"
                              title="Revise Invoice Parameters"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(inv.id, inv.invoiceNumber)}
                              className="p-1 hover:bg-rose-50 text-rose-600 rounded"
                              title="Permanent Discard Invoice"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredInvoices.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400">No invoices match this status filter.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- RENDER 3: PROFIT & LOSS SUMMARY TAB --- */}
      {activeTab === 'reports' && (
        <div className="space-y-6 animate-fadeIn">
          {/* P&L Statement Header */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-3xs space-y-4">
            <div className="flex justify-between items-center border-b border-slate-150 pb-4">
              <div>
                <span className="text-[10px] font-extrabold text-indigo-650 uppercase tracking-widest font-mono">Consolidated Audit</span>
                <h3 className="text-md font-bold text-slate-900 mt-1">Profit & Loss (P&L) Statement</h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 transition hover:bg-slate-100"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Generate PDF Report</span>
                </button>
              </div>
            </div>

            {/* P&L Balance Sheet calculations */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-xs font-bold pb-2 border-b border-slate-100">
                <span className="text-slate-500 uppercase">Account Head</span>
                <span className="text-slate-800">Total Allocation ($)</span>
              </div>

              {/* INCOME SECTION */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-extrabold text-emerald-600">
                  <span className="uppercase tracking-wide">1. OPERATING INCOME</span>
                  <span>${ledgerIncome.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 pl-4">
                  <span>Client Clearing Invoices</span>
                  <span className="font-mono">${ledgerTransactions.filter(tx => tx.type === 'Income' && tx.category === 'Client Payment').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 pl-4">
                  <span>Other Revenue (Ad-hoc)</span>
                  <span className="font-mono">${ledgerTransactions.filter(tx => tx.type === 'Income' && tx.category === 'Revenue').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}</span>
                </div>
              </div>

              {/* EXPENSES SECTION */}
              <div className="space-y-1.5 pt-2 border-t border-dashed border-slate-100">
                <div className="flex justify-between items-center text-xs font-extrabold text-rose-600">
                  <span className="uppercase tracking-wide">2. DIRECT EXPENDITURE</span>
                  <span>-${ledgerExpenses.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 pl-4">
                  <span>Payroll & Staff Salaries</span>
                  <span className="font-mono">-${ledgerTransactions.filter(tx => tx.type === 'Expense' && tx.category === 'Salary').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 pl-4">
                  <span>Software Subscriptions (Cloud & Tools)</span>
                  <span className="font-mono">-${ledgerTransactions.filter(tx => tx.type === 'Expense' && tx.category === 'Software Subscription').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 pl-4">
                  <span>Operational & Lease Costs</span>
                  <span className="font-mono">-${ledgerTransactions.filter(tx => tx.type === 'Expense' && tx.category === 'Operational Expense').reduce((sum, tx) => sum + tx.amount, 0).toLocaleString()}</span>
                </div>
              </div>

              {/* TOTALS */}
              <div className="flex justify-between items-center text-sm font-extrabold pt-4 border-t border-slate-200 text-slate-900 font-mono">
                <span className="uppercase text-xs tracking-wider text-slate-500">NET SURPLUS (P&L CLEARING)</span>
                <span className={netLedgerProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {netLedgerProfit < 0 ? '-' : ''}${Math.abs(netLedgerProfit).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- RENDER PRINT OVERLAY FOR SELECTED INVOICE --- */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-6 animate-scaleUp text-left" id="invoice-receipt-paper">
            
            {/* Action Bar Header */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 print:hidden text-xs">
              <span className="font-bold text-slate-400 uppercase tracking-wider font-mono">Invoice Ledger Paper View</span>
              
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 border border-slate-200 rounded-lg font-bold transition"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Print / PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    triggerToast(`Invoice ${viewingInvoice.invoiceNumber}.pdf downloaded successfully.`);
                    setViewingInvoice(null);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-150 rounded-lg font-bold transition"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewingInvoice(null)}
                  className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700 font-bold"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Print Sheet Core */}
            <div className="space-y-6 pt-2 select-text font-serif bg-white text-slate-900 border-2 border-slate-100 p-6 rounded-2xl shadow-2xs print:border-none print:p-0 print:shadow-none">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-lg bg-slate-950 text-white flex items-center justify-center font-bold text-lg leading-none print:bg-black">T</span>
                    <h1 className="text-xl font-bold font-sans tracking-tight text-slate-900">Trinexiss Technologies</h1>
                  </div>
                  <div className="text-xs text-slate-500 font-sans leading-relaxed">
                    <p>Corporate Headquarters & Sandbox Systems</p>
                    <p>Email: <span className="font-semibold text-slate-800">info@trinexiss.com</span></p>
                    <p>Corporate GST ID: <span className="font-mono font-bold text-slate-700">09AAACT9835R1ZP</span></p>
                  </div>
                </div>

                <div className="text-right space-y-1 text-xs">
                  <p className="font-mono font-extrabold text-slate-850 text-lg uppercase tracking-tight">Invoice Receipt</p>
                  <p className="text-slate-500 font-sans">Serial Code: <span className="font-bold text-slate-800 font-mono">{viewingInvoice.invoiceNumber}</span></p>
                  <p className="text-slate-500 font-sans">Payment Mode: <span className="font-bold text-emerald-700 uppercase">{viewingInvoice.paymentStatus || viewingInvoice.status}</span></p>
                </div>
              </div>

              {/* Addressee Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-slate-100 py-4 text-xs font-serif leading-relaxed">
                <div>
                  <h3 className="font-sans font-bold uppercase tracking-wider text-[10px] text-slate-400">Bill To (Corporate Debtor)</h3>
                  <p className="text-slate-800 font-bold text-sm mt-1">{viewingInvoice.clientCompany || viewingInvoice.projectName}</p>
                  <p className="text-slate-500 font-sans mt-0.5">Project contract: {viewingInvoice.projectName}</p>
                  <p className="text-slate-500 font-sans">Accounts Department / Procurement Representative</p>
                </div>

                <div className="sm:text-right">
                  <h3 className="font-sans font-bold uppercase tracking-wider text-[10px] text-slate-400">Ledger Calendar Details</h3>
                  <p className="text-slate-650 mt-1 font-sans">Issued Billing: <span className="font-bold font-mono text-slate-805">{viewingInvoice.issuedDate}</span></p>
                  <p className="text-slate-650 font-sans">Term Due: <span className="font-bold font-mono text-slate-805">{viewingInvoice.dueDate}</span></p>
                </div>
              </div>

              {/* Pricing item table */}
              <div className="space-y-2">
                <table className="min-w-full divide-y divide-slate-200 text-xs font-sans text-left">
                  <thead>
                    <tr className="text-slate-500 font-bold text-[10px] uppercase">
                      <th className="py-2.5">Milestone Line Item Description</th>
                      <th className="py-2.5 text-center">Quantity</th>
                      <th className="py-2.5 text-right">Unit Rate</th>
                      <th className="py-2.5 text-right">Extended Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 font-medium text-slate-800">
                    <tr>
                      <td className="py-3.5">
                        <p className="font-bold text-slate-900">{viewingInvoice.milestone}</p>
                        {viewingInvoice.description && <p className="text-[10px] text-slate-400 mt-1 font-sans font-medium">{viewingInvoice.description}</p>}
                      </td>
                      <td className="py-3.5 text-center font-mono">{viewingInvoice.quantity || 1}</td>
                      <td className="py-3.5 text-right font-mono">${(viewingInvoice.unitPrice || viewingInvoice.amount).toLocaleString()}.00</td>
                      <td className="py-3.5 text-right font-mono font-bold text-slate-900">${((viewingInvoice.quantity || 1) * (viewingInvoice.unitPrice || viewingInvoice.amount)).toLocaleString()}.00</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Total Calculation breakdown */}
              <div className="border-t border-slate-200 pt-4 flex flex-col items-end text-xs font-sans space-y-1.5">
                <div className="flex gap-10 font-medium text-slate-500">
                  <span>Subtotal Value:</span>
                  <span className="font-mono">${((viewingInvoice.quantity || 1) * (viewingInvoice.unitPrice || viewingInvoice.amount)).toLocaleString()}.00</span>
                </div>
                <div className="flex gap-10 font-medium text-slate-500">
                  <span>Service Tax Rate ({viewingInvoice.tax !== undefined ? viewingInvoice.tax : 18}%):</span>
                  <span className="font-mono">${(((viewingInvoice.quantity || 1) * (viewingInvoice.unitPrice || viewingInvoice.amount)) * (viewingInvoice.tax !== undefined ? viewingInvoice.tax / 100 : 0.18)).toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex gap-10 font-bold text-slate-900 text-sm border-t border-dashed border-slate-200 pt-2.5">
                  <span className="uppercase text-slate-500 tracking-wide text-xs">Clearing Sum (INR Equivalent):</span>
                  <span className="font-mono">${viewingInvoice.amount.toLocaleString()}</span>
                </div>
              </div>

              {/* Terms context footer in invoice */}
              <div className="border-t border-slate-100 pt-4 text-[10px] text-slate-400 font-sans leading-normal">
                <p className="font-bold uppercase tracking-wider text-[8px] text-slate-500">Corporate Settlement Terms</p>
                <p className="mt-1 font-medium">All wire transfers should resolve net 14 days of issue date. For help or payment confirmation support services, get in touch with corporate finance desk at <span className="font-bold text-slate-650">info@trinexiss.com</span>.</p>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* --- TOAST NOTIFICATIONS --- */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-indigo-900 border border-indigo-700 text-white px-5 py-3 rounded-xl shadow-xl space-y-1 animate-fadeIn flex items-center gap-3">
          <FileCheck className="h-5 w-5 text-indigo-400" />
          <div>
            <p className="text-xs font-bold font-sans">Operation Log Success</p>
            <p className="text-[10px] text-indigo-200">{toastMessage}</p>
          </div>
        </div>
      )}

    </div>
  );
}
