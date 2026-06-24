import React, { useState } from 'react';
import { 
  Building, 
  User, 
  ShieldAlert, 
  Moon, 
  Sun, 
  Bell, 
  Check, 
  RotateCcw,
  Clock,
  Terminal,
  FileCheck,
  Save,
  Trash2,
  Lock,
  Compass
} from 'lucide-react';
import { ERPData, UserSession, CompanyInfo, ActivityLog } from '../types.ts';

interface SettingsProps {
  data: ERPData;
  onSaveData: (newData: ERPData) => void;
  session: UserSession;
  onLogout: () => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export default function Settings({ data, onSaveData, session, onLogout, darkMode, setDarkMode }: SettingsProps) {
  // Init default values if missing
  const initialCompany: CompanyInfo = data.companyInfo || {
    name: 'Trinexiss Technologies',
    logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60',
    email: 'info@trinexiss.com',
    phone: '+91 98765 43210',
    address: 'Trinexiss Tech Hub, Sector 62, Noida, India',
    gstNumber: '09AAACT9835R1ZP',
    industry: 'Enterprise AI & Cloud SaaS',
    website: 'https://trinexiss.com',
    description: 'Trinexiss Technologies is an industry-leading provider of enterprise AI and cloud-native solutions, driving digital transformation globally.',
    brandColor: '#059669' // Default Emerald-600
  };

  const initialPermissions = data.rolePermissions || {
    founder: ['View dashboards', 'Manage companies', 'View all projects', 'View employees', 'View invoices', 'View reports', 'System settings', 'User management'],
    admin: ['Add employees', 'Edit employees', 'Delete employees', 'Create company accounts', 'Add client company', 'Create projects', 'Assign projects', 'Generate invoices', 'Manage project boards', 'Approve users'],
    aiEngineer: ['ERP optimization', 'Workflow automation', 'AI integrations', 'Dashboard improvements', 'Bug fixing', 'Analytics optimization'],
    employee: ['View assigned projects', 'Update tasks', 'View profile', 'View invoices assigned', 'Update task status']
  };

  // State hooks
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'rbac' | 'theme' | 'logs'>('profile');
  const [companyForm, setCompanyForm] = useState<CompanyInfo>(initialCompany);
  const [permissions, setPermissions] = useState(initialPermissions);
  const [notifInApp, setNotifInApp] = useState(true);
  const [notifSound, setNotifSound] = useState(false);
  const [notifEmail, setNotifEmail] = useState(true);
  const [successMsg, setSuccessMsg] = useState('');

  // User Profile States
  const [profileName, setProfileName] = useState(session.fullName);
  const [profilePhone, setProfilePhone] = useState(session.contactNumber || '+91 98765 43210');

  // Logs category filter
  const [logFilter, setLogFilter] = useState<string>('All');

  // Branding color state
  const [brandColor, setBrandColor] = useState(initialCompany.brandColor || '#059669');

  const addLog = (actionText: string, category: 'System' | 'Employee' | 'Client' | 'Project' | 'Invoice' | 'AI') => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
      user: session.fullName,
      action: actionText,
      category,
      module: 'Company'
    };
    return [newLog, ...(data.activityLogs || [])];
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    const isAuthorized = session.role === 'Founder' || session.role === 'Admin';
    if (!isAuthorized) {
      alert('Security Policy: Only Admins/Founders can alter Company settings.');
      return;
    }

    const updatedCompany = {
      ...companyForm,
      brandColor: brandColor
    };

    const updatedLogs = addLog(`Updated Corporate Profile values for ${updatedCompany.name}`, 'System');
    onSaveData({
      ...data,
      companyInfo: updatedCompany,
      activityLogs: updatedLogs
    });

    setSuccessMsg('Corporate Company details updated successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Update local profile representation
    session.fullName = profileName;
    session.contactNumber = profilePhone;

    const updatedLogs = addLog(`Updated Personal profile parameters`, 'System');
    onSaveData({
      ...data,
      activityLogs: updatedLogs
    });
    setSuccessMsg('Personal security & profile parameters written successfully.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const togglePermission = (roleKey: 'founder' | 'admin' | 'aiEngineer' | 'employee', permValue: string) => {
    // Only Founders are authorized to alter RBAC matrices
    if (session.role !== 'Founder') {
      alert('Security Alert: Only accounts holding structural Founder permissions may modify RBAC sheets.');
      return;
    }

    const currentRolePerms = [...permissions[roleKey]];
    const hasPerm = currentRolePerms.includes(permValue);
    
    let updatedRolePerms: string[];
    if (hasPerm) {
      updatedRolePerms = currentRolePerms.filter(p => p !== permValue);
    } else {
      updatedRolePerms = [...currentRolePerms, permValue];
    }

    const updatedPermissions = {
      ...permissions,
      [roleKey]: updatedRolePerms
    };

    setPermissions(updatedPermissions);

    const updatedLogs = addLog(`Modified role permission matrix for ${roleKey}`, 'System');
    onSaveData({
      ...data,
      rolePermissions: updatedPermissions,
      activityLogs: updatedLogs
    });
  };

  // Preset permission arrays to toggle against
  const allAvailableSystemPermissions = [
    'View dashboards',
    'Manage companies',
    'View all projects',
    'View employees',
    'View invoices',
    'View reports',
    'Add employees',
    'Edit employees',
    'Delete employees',
    'Create projects',
    'Assign projects',
    'Generate invoices',
    'ERP optimization',
    'AI integrations'
  ];

  const filteredLogs = (data.activityLogs || []).filter(log => {
    if (logFilter === 'All') return true;
    return log.category === logFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Settings & Authorization Core</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure corporate company attributes, authorize system security matrices, toggle styles, and audit system logs.</p>
        </div>
        
        <button
          onClick={onLogout}
          className="px-4 py-2 border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 font-bold text-xs rounded-xl transition active:scale-95 cursor-pointer"
        >
          Sign Out of Trinexiss Core
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl font-semibold text-xs flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Settings Panel Wrapper */}
      <div className="bg-white rounded-2xl border border-slate-200/85 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-4 min-h-[450px]">
        {/* Left Side Navigation Rails */}
        <div className="col-span-1 border-r border-slate-100 bg-slate-50/50 p-4 space-y-1">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Configurations</p>
          
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-650 hover:bg-slate-100'
            }`}
          >
            <User className="h-4 w-4" />
            <span>My User Profile</span>
          </button>

          {(session.role === 'Founder' || session.role === 'Admin' || session.role === 'AI Engineer') && (
            <>
              <button
                onClick={() => setActiveTab('company')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left ${
                  activeTab === 'company'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-650 hover:bg-slate-100'
                }`}
              >
                <Building className="h-4 w-4" />
                <span>Company Account</span>
              </button>

              <button
                onClick={() => setActiveTab('rbac')}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left ${
                  activeTab === 'rbac'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-650 hover:bg-slate-100'
                }`}
              >
                <ShieldAlert className="h-4 w-4" />
                <span>RBAC Security Sheet</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('theme')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left ${
              activeTab === 'theme'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-650 hover:bg-slate-100'
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Theme & Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all text-left ${
              activeTab === 'logs'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-650 hover:bg-slate-100'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>Operational Log Trails</span>
          </button>
        </div>

        {/* Right Dynamic Tab Content panels */}
        <div className="col-span-1 md:col-span-3 p-6 sm:p-8">
          
          {/* TAB: PROFILE CONFIG */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">Active User Credentials</h3>
                <p className="text-xs text-slate-400 mt-1">Review or recalibrate your logged executive authorization parameters.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold text-slate-600">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Registered Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={e => setProfileName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Contact Link</label>
                  <input
                    type="text"
                    required
                    value={profilePhone}
                    onChange={e => setProfilePhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Active Authorized Role</label>
                  <div className="p-2.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-bold tracking-wide uppercase text-[10px] flex items-center justify-between">
                    <span>{session.role}</span>
                    <Lock className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Account Security Status</label>
                  <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                    <FileCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>VERIFIED COGNITO / SUPABASE NODE SYNCED</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition hover:bg-slate-800 active:scale-95"
                >
                  <Save className="h-4 w-4" />
                  <span>Update Profile Details</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB: COMPANY PROFILE CONFIG */}
          {activeTab === 'company' && (
            <form onSubmit={handleSaveCompany} className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">Corporate Enterprise Profile</h3>
                <p className="text-xs text-slate-400 mt-1">Formulate Trinexiss Technologies company values, logo branding, GST, contact points, and billing address.</p>
              </div>

              {/* Branding and Logo Block */}
              <div className="bg-slate-50 border border-slate-200/60 p-4.5 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-800">Company Logo & Branding Identity</h4>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-16 w-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                    {companyForm.logo ? (
                      <img src={companyForm.logo} alt="Company Logo" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <Building className="h-8 w-8 text-slate-400" />
                    )}
                  </div>

                  <div className="space-y-2 w-full text-xs font-semibold text-slate-600">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase">Logo URL or Presets</label>
                    <input
                      type="text"
                      placeholder="e.g. https://domain.com/logo.png"
                      value={companyForm.logo || ''}
                      onChange={e => setCompanyForm({ ...companyForm, logo: e.target.value })}
                      className="w-full bg-white border border-slate-200 p-2 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setCompanyForm({ ...companyForm, logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=120&auto=format&fit=crop&q=60' })}
                        className="px-2 py-1 bg-white border border-slate-200 text-[10px] rounded hover:bg-slate-50"
                      >
                        Neon Wave Logo
                      </button>
                      <button
                        type="button"
                        onClick={() => setCompanyForm({ ...companyForm, logo: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=120&auto=format&fit=crop&q=60' })}
                        className="px-2 py-1 bg-white border border-slate-200 text-[10px] rounded hover:bg-slate-50"
                      >
                        Cosmic Crimson Logo
                      </button>
                    </div>
                  </div>
                </div>

                {/* Company Branding Accent Color Selector */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Corporate Branding Color Accent</label>
                  <div className="flex gap-3">
                    {[
                      { hex: '#059669', name: 'Emerald' },
                      { hex: '#4f46e5', name: 'Indigo' },
                      { hex: '#d97706', name: 'Amber' },
                      { hex: '#e11d48', name: 'Rose' },
                      { hex: '#475569', name: 'Slate' }
                    ].map((col) => (
                      <button
                        type="button"
                        key={col.hex}
                        onClick={() => setBrandColor(col.hex)}
                        className={`px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all flex items-center gap-1.5 ${
                          brandColor === col.hex
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
                        }`}
                      >
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: col.hex }}></span>
                        <span>{col.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 font-semibold">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Corporate Name *</label>
                  <input
                    type="text"
                    required
                    value={companyForm.name}
                    onChange={e => setCompanyForm({ ...companyForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Corporate Website Link</label>
                  <input
                    type="text"
                    value={companyForm.website}
                    onChange={e => setCompanyForm({ ...companyForm, website: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">GST Register Number</label>
                  <input
                    type="text"
                    value={companyForm.gstNumber}
                    onChange={e => setCompanyForm({ ...companyForm, gstNumber: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Industry Focus Sector</label>
                  <input
                    type="text"
                    value={companyForm.industry}
                    onChange={e => setCompanyForm({ ...companyForm, industry: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Primary Enterprise Email</label>
                  <input
                    type="email"
                    required
                    value={companyForm.email}
                    onChange={e => setCompanyForm({ ...companyForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Primary Contact Landline</label>
                  <input
                    type="text"
                    required
                    value={companyForm.phone}
                    onChange={e => setCompanyForm({ ...companyForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">Company Description</label>
                  <textarea
                    rows={2}
                    value={companyForm.description || ''}
                    onChange={e => setCompanyForm({ ...companyForm, description: e.target.value })}
                    placeholder="Enter short company description, core values or motto..."
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-semibold focus:outline-none"
                  ></textarea>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase">GST Registered Headquarters Address</label>
                  <textarea
                    rows={2}
                    value={companyForm.address}
                    onChange={e => setCompanyForm({ ...companyForm, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-xs font-semibold focus:outline-none"
                  ></textarea>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                {session.role === 'Founder' || session.role === 'Admin' ? (
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 bg-slate-900 text-white font-bold text-xs px-4 py-2 rounded-xl transition hover:bg-slate-800 active:scale-95 shadow-sm"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Company Information</span>
                  </button>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Notice: Only accounts holding structural Founder/Admin credentials can update Company Profile parameters.</p>
                )}
              </div>
            </form>
          )}

          {/* TAB: RBAC MATRIX */}
          {activeTab === 'rbac' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">Role-Based Access Control Sheets</h3>
                <p className="text-xs text-slate-400 mt-1">Review existing feature authorizations. Only accounts logged as **Founder** can toggle these options.</p>
                {session.role !== 'Founder' && (
                  <span className="inline-block mt-2 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-sm">
                    Read-Only Mode: Logged in as {session.role}
                  </span>
                )}
              </div>

              <div className="overflow-x-auto border border-slate-100 rounded-xl">
                <table className="min-w-full text-xs text-left">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[9px] border-b border-slate-100">
                      <th className="p-3">Permission/Access Right</th>
                      <th className="p-3 text-center">Founder</th>
                      <th className="p-3 text-center">Admin</th>
                      <th className="p-3 text-center">AI Engineer</th>
                      <th className="p-3 text-center">Employee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 font-semibold font-mono text-[10px]">
                    {allAvailableSystemPermissions.map((perm, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-3 font-sans text-xs text-slate-900 font-bold">{perm}</td>
                        
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.founder.includes(perm)}
                            onChange={() => togglePermission('founder', perm)}
                            disabled={session.role !== 'Founder'}
                            className="h-3.5 w-3.5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.admin.includes(perm)}
                            onChange={() => togglePermission('admin', perm)}
                            disabled={session.role !== 'Founder'}
                            className="h-3.5 w-3.5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.aiEngineer.includes(perm)}
                            onChange={() => togglePermission('aiEngineer', perm)}
                            disabled={session.role !== 'Founder'}
                            className="h-3.5 w-3.5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={permissions.employee.includes(perm)}
                            onChange={() => togglePermission('employee', perm)}
                            disabled={session.role !== 'Founder'}
                            className="h-3.5 w-3.5 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: THEME AND NOTIFS */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">Theme & Channel Options</h3>
                <p className="text-xs text-slate-400 mt-1">Adjust the styling guidelines, dark rendering toggles, and notification preferences.</p>
              </div>

              <div className="space-y-5">
                {/* Mode Selector */}
                <div className="bg-slate-50 border border-slate-200/80 p-4.5 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-800">Visual Aesthetic Preset</h4>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setDarkMode(false)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl text-xs font-semibold transition ${
                        !darkMode
                          ? 'bg-white border-slate-950 text-slate-950 shadow-xs font-bold'
                          : 'bg-transparent border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span>SaaS Light (Default)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDarkMode(true)}
                      className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl text-xs font-semibold transition ${
                        darkMode
                          ? 'bg-slate-950 border-slate-800 text-white shadow-xs font-bold'
                          : 'bg-transparent border-slate-200 text-slate-650 hover:bg-slate-100'
                      }`}
                    >
                      <Moon className="h-4 w-4 text-indigo-500" />
                      <span>Notion Slate Dark</span>
                    </button>
                  </div>
                </div>

                {/* Simulated Notification Toggles */}
                <div className="border border-slate-100 p-4 rounded-xl space-y-3.5 text-xs text-slate-700">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1">
                    <Bell className="h-4 w-4 text-emerald-600" />
                    <span>Real-time Operations Warnings</span>
                  </h4>

                  <div className="space-y-4 font-semibold">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.notificationsEnabled !== false}
                        onChange={(e) => {
                          const enabled = e.target.checked;
                          onSaveData({
                            ...data,
                            notificationsEnabled: enabled,
                            activityLogs: [
                              {
                                id: `act-${Date.now()}`,
                                timestamp: new Date().toISOString(),
                                user: session.fullName,
                                action: `${enabled ? 'Enabled' : 'Disabled'} system-wide automated notifications system.`,
                                category: 'System',
                                module: 'Settings'
                              },
                              ...(data.activityLogs || [])
                            ]
                          });
                        }}
                        className="h-4 w-4 rounded text-slate-900 focus:ring-slate-900 cursor-pointer"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">System-Wide Automated Notifications</p>
                        <p className="text-[11px] text-slate-400 font-normal">Automatically dispatch live notifications for task assignments, client registrations, and project handovers.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifInApp}
                        onChange={() => setNotifInApp(!notifInApp)}
                        className="h-4 w-4 rounded text-slate-900 focus:ring-slate-900"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">In-App Banner Notifications</p>
                        <p className="text-[11px] text-slate-400 font-normal">Show top alerts for newly added employees, financial invoices, or project completions.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifEmail}
                        onChange={() => setNotifEmail(!notifEmail)}
                        className="h-4 w-4 rounded text-slate-900 focus:ring-slate-900"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Weekly Email Status Summaries</p>
                        <p className="text-[11px] text-slate-400 font-normal">Auto-dispatch weekly reports containing client engagement & invoices to managers.</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifSound}
                        onChange={() => setNotifSound(!notifSound)}
                        className="h-4 w-4 rounded text-slate-900 focus:ring-slate-900"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Acoustic Indicators</p>
                        <p className="text-[11px] text-slate-400 font-normal">Sound alarm alerts and acoustic triggers for approaching delayed milestones.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: OPERATIONAL LOG TRAILS */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">Operational Audit Trails</h3>
                  <p className="text-xs text-slate-400 mt-1">Immutably traces changes loaded on the Trinexiss Technologies ledger.</p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Trace:</span>
                  <select
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="text-xs font-bold text-slate-650 bg-transparent border-none focus:outline-none"
                  >
                    <option value="All">All Events</option>
                    <option value="System">System Configurations</option>
                    <option value="Employee">Employee Auditing</option>
                    <option value="Project">Project Portfolio</option>
                    <option value="Invoice">Financing & Ledgers</option>
                    <option value="AI">AI Optimizations</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-semibold">
                    <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase font-mono shrink-0 ${
                      log.category === 'AI' ? 'bg-indigo-50 text-indigo-700' :
                      log.category === 'Invoice' ? 'bg-emerald-50 text-emerald-700' :
                      log.category === 'Project' ? 'bg-blue-50 text-blue-700' :
                      log.category === 'Employee' ? 'bg-pink-50 text-pink-700' :
                      'bg-slate-150 text-slate-700'
                    }`}>
                      {log.category}
                    </span>

                    <div className="flex-1 space-y-0.5">
                      <p className="text-slate-800 font-bold">{log.action}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                        <span className="font-bold text-slate-550">{log.user}</span>
                        <span>•</span>
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredLogs.length === 0 && (
                  <p className="text-center py-12 text-slate-400 text-xs">No ledger action records correspond to the chosen filter parameter.</p>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
