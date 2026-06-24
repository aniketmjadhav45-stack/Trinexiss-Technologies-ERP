import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Sparkles, 
  TrendingUp, 
  Plus, 
  Check, 
  X,
  FileCheck2,
  CalendarCheck2,
  UserPlus,
  ShieldAlert,
  Settings2,
  Mail,
  Phone,
  Shield,
  Trash2,
  Edit,
  KeyRound,
  Copy,
  ExternalLink,
  UserCheck,
  Power,
  Ban,
  Camera,
  Layers,
  Search,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Employee, ERPData, AttendanceRecord, LeaveRequest, UserSession } from '../types.ts';

interface EmployeesProps {
  data: ERPData;
  onSaveData: (newData: ERPData) => void;
  session?: UserSession | null;
}

export default function Employees({ data, onSaveData, session }: EmployeesProps) {
  // Current user's credentials
  const currentUserRole = session?.role || 'Employee';
  const isAdminOrHigher = currentUserRole === 'Admin' || currentUserRole === 'Founder' || currentUserRole === 'AI Engineer';

  // Sub-view tabs: 'directory', 'invitations', 'attendance', 'leaves'
  const [activeSubTab, setActiveSubTab] = useState<'directory' | 'invitations' | 'attendance' | 'leaves'>('directory');

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal control states
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isAddDirectModalOpen, setIsAddDirectModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [isRbacModalOpen, setIsRbacModalOpen] = useState(false);

  // Selected employee for modal tasks
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  // Form states for inviting employee
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDesignation, setInviteDesignation] = useState('');
  const [inviteDept, setInviteDept] = useState('Engineering');
  const [generatedLink, setGeneratedLink] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  // Form states for adding employee directly
  const [directName, setDirectName] = useState('');
  const [directEmail, setDirectEmail] = useState('');
  const [directRole, setDirectRole] = useState('');
  const [directDept, setDirectDept] = useState('Engineering');
  const [directContact, setDirectContact] = useState('');
  const [directHourlyRate, setDirectHourlyRate] = useState('45');
  const [directProductivity, setDirectProductivity] = useState('90');

  // Form states for editing employee
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editHourlyRate, setEditHourlyRate] = useState('');
  const [editPhoto, setEditPhoto] = useState('');

  // Form states for password reset
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Form states for RBAC assignments
  const [assignedRbacModules, setAssignedRbacModules] = useState<string[]>([]);

  // Attendance logging states (used by active staff logs)
  const [selectedDate, setSelectedDate] = useState('2026-06-19');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [attStatus, setAttStatus] = useState<'Present' | 'Absent' | 'Leave'>('Present');
  const [hoursWorked, setHoursWorked] = useState('8');

  // Leave request states
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveType, setLeaveType] = useState<'Casual' | 'Sick' | 'Paid' | 'WFH'>('Paid');
  const [adminRemarks, setAdminRemarks] = useState('');

  // Self Employee Daily Punch Clock States (Non-Admins)
  const [clockedIn, setClockedIn] = useState(() => {
    return localStorage.getItem('trinexiss_clocked_in') === 'true';
  });
  const [clockInTimeStr, setClockInTimeStr] = useState(() => {
    return localStorage.getItem('trinexiss_clock_in_time') || '';
  });
  const [clockOutTimeStr, setClockOutTimeStr] = useState(() => {
    return localStorage.getItem('trinexiss_clock_out_time') || '';
  });
  const [onBreak, setOnBreak] = useState(() => {
    return localStorage.getItem('trinexiss_on_break') === 'true';
  });
  const [breakStartMs, setBreakStartMs] = useState(() => {
    return Number(localStorage.getItem('trinexiss_break_start_ms') || '0');
  });
  const [breakAccumulatedMins, setBreakAccumulatedMins] = useState(() => {
    return Number(localStorage.getItem('trinexiss_break_accumulated_mins') || '0');
  });
  const [punchLateMark, setPunchLateMark] = useState(() => {
    return localStorage.getItem('trinexiss_punch_late') === 'true';
  });

  // General message helpers
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // June week dates representing the seed ledger
  const dates = ['2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19'];

  // Track invitations in local storage
  const [invitations, setInvitations] = useState<any[]>([]);

  useEffect(() => {
    loadInvitations();
  }, []);

  const loadInvitations = () => {
    try {
      const stored = localStorage.getItem('trinexiss_invites');
      if (stored) {
        setInvitations(JSON.parse(stored));
      } else {
        // Initial mock invitation
        const initialInvites = [
          {
            id: 'inv-1',
            fullName: 'Simulated Employee',
            email: 'shweta.tester@trinexiss.tech',
            designation: 'QA Engineer',
            department: 'QA',
            token: 'inv_shweta_1234',
            status: 'Invited',
            dateGenerated: '2026-06-24'
          }
        ];
        localStorage.setItem('trinexiss_invites', JSON.stringify(initialInvites));
        setInvitations(initialInvites);
      }
    } catch {
      setInvitations([]);
    }
  };

  // Helper to normalize employee objects to have safe default values for status, contact, and photos
  const normalizedEmployees = data.employees.map(emp => {
    const hasPhoto = !!emp.profilePhoto;
    const defaultPhoto = emp.name.includes('Singh') 
      ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=face'
      : emp.name.includes('Shweta')
      ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=128&h=128&fit=crop&crop=face'
      : emp.name.includes('Sunita')
      ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=face'
      : emp.name.includes('Manju')
      ? 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=128&h=128&fit=crop&crop=face'
      : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=128&h=128&fit=crop&crop=face';

    return {
      ...emp,
      status: emp.status || 'Active',
      contactNumber: emp.contactNumber || '+91 98765 43210',
      profilePhoto: emp.profilePhoto || defaultPhoto,
      joiningDate: emp.joiningDate || '2026-01-15',
      assignedModules: emp.assignedModules || ['My Profile', 'Projects Portfolio']
    };
  });

  // Enforce notifications timeout
  const showNotification = (msg: string, isError = false) => {
    if (isError) {
      setErrorMsg(msg);
      setTimeout(() => setErrorMsg(''), 5000);
    } else {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(''), 5000);
    }
  };

  // Flow Step 1-3: Admin creates and triggers secure invitation dispatch link
  const handleGenerateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !inviteDesignation) {
      showNotification('Please fill out all invitation parameters.', true);
      return;
    }

    const uniqueToken = `inv_${inviteName.toLowerCase().replace(/\s+/g, '_')}_${Math.floor(1000 + Math.random() * 9000)}`;
    const inviteUrl = `${window.location.origin}/?invite=${uniqueToken}`;

    const newInvite = {
      id: `inv-${Date.now()}`,
      fullName: inviteName,
      email: inviteEmail.trim().toLowerCase(),
      designation: inviteDesignation,
      department: inviteDept,
      token: uniqueToken,
      status: 'Invited',
      dateGenerated: new Date().toISOString().split('T')[0]
    };

    try {
      const stored = localStorage.getItem('trinexiss_invites');
      const currentList = stored ? JSON.parse(stored) : [];
      const updatedList = [newInvite, ...currentList];
      localStorage.setItem('trinexiss_invites', JSON.stringify(updatedList));
      setInvitations(updatedList);

      setGeneratedLink(inviteUrl);
      setGeneratedCode(uniqueToken);
      showNotification('Corporate invitation dispatch records generated successfully.');
    } catch {
      showNotification('Failed to generate invite.', true);
    }
  };

  // Admin directly registers a new active employee (bypasses email invitation flow)
  const handleAddEmployeeDirectly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directName || !directEmail || !directRole) {
      showNotification('Please input all mandatory profile fields.', true);
      return;
    }

    const newEmpId = `e-${Math.floor(1000 + Math.random() * 9000)}`;
    const newEmp: Employee = {
      id: newEmpId,
      name: directName,
      role: directRole,
      email: directEmail.toLowerCase().trim(),
      hourlyRate: Number(directHourlyRate) || 45,
      productivityScore: Number(directProductivity) || 90,
      attendance: [],
      leaves: [],
      department: directDept,
      contactNumber: directContact || '+91 98765 43210',
      profilePhoto: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=128&h=128&fit=crop&crop=face',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      assignedModules: ['My Profile', 'Projects Portfolio']
    };

    // Also register them in auth users under default password
    try {
      const storedUsers = localStorage.getItem('trinexiss_auth_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      if (users.some((u: any) => u.email.toLowerCase() === directEmail.toLowerCase())) {
        showNotification('A user with this email is already registered.', true);
        return;
      }
      users.push({
        fullName: directName,
        email: directEmail.toLowerCase().trim(),
        contact: directContact,
        password: 'Password123!', // default seed password
        role: 'Employee',
        isVerified: true,
        profilePhoto: newEmp.profilePhoto
      });
      localStorage.setItem('trinexiss_auth_users', JSON.stringify(users));

      // Append to local state list
      const updatedEmployees = [...normalizedEmployees, newEmp];
      onSaveData({
        ...data,
        employees: updatedEmployees
      });

      showNotification(`Employee ${directName} added successfully with default Password: Password123!`);
      setIsAddDirectModalOpen(false);
      // Reset fields
      setDirectName('');
      setDirectEmail('');
      setDirectRole('');
      setDirectContact('');
    } catch {
      showNotification('An error occurred while creating direct employee parameters.', true);
    }
  };

  // Open Edit profile modal
  const openEditModal = (emp: Employee) => {
    setSelectedEmp(emp);
    setEditName(emp.name);
    setEditEmail(emp.email);
    setEditRole(emp.role);
    setEditDept(emp.department || 'Engineering');
    setEditContact(emp.contactNumber || '');
    setEditHourlyRate(String(emp.hourlyRate));
    setEditPhoto(emp.profilePhoto || '');
    setIsEditModalOpen(true);
  };

  // Handle saving the edited profile parameters
  const handleSaveEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const updatedEmployees = normalizedEmployees.map(emp => {
      if (emp.id === selectedEmp.id) {
        return {
          ...emp,
          name: editName,
          email: editEmail.toLowerCase().trim(),
          role: editRole,
          department: editDept,
          contactNumber: editContact,
          hourlyRate: Number(editHourlyRate) || emp.hourlyRate,
          profilePhoto: editPhoto
        };
      }
      return emp;
    });

    onSaveData({
      ...data,
      employees: updatedEmployees
    });

    // Sync back with auth credentials database
    try {
      const storedUsers = localStorage.getItem('trinexiss_auth_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const updatedUsers = users.map((u: any) => {
          if (u.email.toLowerCase() === selectedEmp.email.toLowerCase()) {
            return {
              ...u,
              fullName: editName,
              email: editEmail.toLowerCase().trim(),
              contact: editContact,
              profilePhoto: editPhoto
            };
          }
          return u;
        });
        localStorage.setItem('trinexiss_auth_users', JSON.stringify(updatedUsers));
      }
    } catch {}

    showNotification(`Profile parameters for ${editName} successfully synchronized.`);
    setIsEditModalOpen(false);
    setSelectedEmp(null);
  };

  // Toggle user's suspension status
  const handleToggleStatus = (emp: Employee) => {
    const currentStatus = emp.status || 'Active';
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';

    const updatedEmployees = normalizedEmployees.map(e => {
      if (e.id === emp.id) {
        return { ...e, status: newStatus as any };
      }
      return e;
    });

    onSaveData({
      ...data,
      employees: updatedEmployees
    });

    showNotification(`Account status for ${emp.name} altered to: ${newStatus.toUpperCase()}`);
  };

  // Delete employee profile permanently
  const handleDeleteEmployee = (emp: Employee) => {
    if (!confirm(`Are you absolutely sure you want to permanently delete Employee ${emp.name}? This will revoke all database authorizations immediately.`)) {
      return;
    }

    const updatedEmployees = normalizedEmployees.filter(e => e.id !== emp.id);
    onSaveData({
      ...data,
      employees: updatedEmployees
    });

    // Remove from simulated auth database
    try {
      const storedUsers = localStorage.getItem('trinexiss_auth_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers);
        const filteredUsers = users.filter((u: any) => u.email.toLowerCase() !== emp.email.toLowerCase());
        localStorage.setItem('trinexiss_auth_users', JSON.stringify(filteredUsers));
      }
    } catch {}

    showNotification(`Employee ${emp.name} profile has been hard-purged from Trinexiss nodes.`);
  };

  // Open password reset form
  const openPasswordResetModal = (emp: Employee) => {
    setSelectedEmp(emp);
    setNewPassword('');
    setConfirmNewPassword('');
    setIsResetPasswordModalOpen(true);
  };

  // Execute password reset
  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    if (!newPassword || newPassword.length < 4) {
      showNotification('Password must contain at least 4 characters.', true);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      showNotification('Passwords do not match.', true);
      return;
    }

    try {
      const storedUsers = localStorage.getItem('trinexiss_auth_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      let foundUser = false;

      const updatedUsers = users.map((u: any) => {
        if (u.email.toLowerCase() === selectedEmp.email.toLowerCase()) {
          foundUser = true;
          return { ...u, password: newPassword };
        }
        return u;
      });

      if (!foundUser) {
        // Create an entry if it didn't exist in auth cache
        updatedUsers.push({
          fullName: selectedEmp.name,
          email: selectedEmp.email,
          contact: selectedEmp.contactNumber,
          password: newPassword,
          role: 'Employee',
          isVerified: true,
          profilePhoto: selectedEmp.profilePhoto
        });
      }

      localStorage.setItem('trinexiss_auth_users', JSON.stringify(updatedUsers));
      showNotification(`Credentials for ${selectedEmp.name} updated successfully.`);
      setIsResetPasswordModalOpen(false);
      setSelectedEmp(null);
    } catch {
      showNotification('Failed to update credentials in storage.', true);
    }
  };

  // Open RBAC checklist
  const openRbacModal = (emp: Employee) => {
    setSelectedEmp(emp);
    setAssignedRbacModules(emp.assignedModules || ['My Profile']);
    setIsRbacModalOpen(true);
  };

  // Handle RBAC modifications
  const handleSaveRbac = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const updatedEmployees = normalizedEmployees.map(emp => {
      if (emp.id === selectedEmp.id) {
        return {
          ...emp,
          assignedModules: assignedRbacModules
        };
      }
      return emp;
    });

    onSaveData({
      ...data,
      employees: updatedEmployees
    });

    showNotification(`Role-Based Access Control parameters for ${selectedEmp.name} committed successfully.`);
    setIsRbacModalOpen(false);
    setSelectedEmp(null);
  };

  const toggleRbacModule = (modName: string) => {
    if (assignedRbacModules.includes(modName)) {
      setAssignedRbacModules(assignedRbacModules.filter(m => m !== modName));
    } else {
      setAssignedRbacModules([...assignedRbacModules, modName]);
    }
  };

  // Simulate Accepting Invite
  const handleSimulateInviteAccept = (invite: any) => {
    const confirmation = confirm(`This will simulate copying the secure link and opening it. It will log you out and load the Activation interface for ${invite.fullName}. Proceed?`);
    if (confirmation) {
      localStorage.removeItem('trinexiss_erp_session');
      window.location.href = `${window.location.origin}/?invite=${invite.token}`;
    }
  };

  // Copy link to clipboard helper
  const handleCopyLink = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('Invitation link copied securely to clipboard!');
  };

  // Attendance management submission
  const handleMarkAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !selectedDate) {
      showNotification('Please select employee and date.', true);
      return;
    }

    const updatedEmployees = normalizedEmployees.map(emp => {
      if (emp.id === selectedEmpId) {
        const cleanAttendance = emp.attendance.filter(a => a.date !== selectedDate);
        const newRecord: AttendanceRecord = {
          date: selectedDate,
          status: attStatus,
          hoursWorked: attStatus === 'Present' ? Number(hoursWorked) : 0
        };

        let baseProductivity = emp.productivityScore;
        if (attStatus === 'Absent') {
          baseProductivity = Math.max(50, baseProductivity - 10);
        } else if (attStatus === 'Present' && Number(hoursWorked) >= 9) {
          baseProductivity = Math.min(100, baseProductivity + 2);
        }

        return {
          ...emp,
          attendance: [...cleanAttendance, newRecord],
          productivityScore: baseProductivity
        };
      }
      return emp;
    });

    onSaveData({
      ...data,
      employees: updatedEmployees
    });

    showNotification('Staff attendance log entry added successfully.');
  };

  // PTO Request Submissions
  const handleRequestLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStart || !leaveEnd || !leaveReason) {
      showNotification('Please fill in leave parameters.', true);
      return;
    }

    // Find the logged-in employee ID or default to e1
    let selfId = 'e1';
    const selfEmp = normalizedEmployees.find(emp => emp.email.toLowerCase() === session?.email?.toLowerCase());
    if (selfEmp) selfId = selfEmp.id;

    const newRequest: LeaveRequest = {
      id: `l-${Date.now()}`,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      status: 'Pending',
      leaveType: leaveType,
      adminRemarks: ''
    };

    const updatedEmployees = normalizedEmployees.map(emp => {
      if (emp.id === selfId) {
        return {
          ...emp,
          leaves: [...(emp.leaves || []), newRequest]
        };
      }
      return emp;
    });

    onSaveData({
      ...data,
      employees: updatedEmployees
    });

    showNotification(`Your ${leaveType} Time Off (PTO) request has been dispatched to administrators.`);
    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
    setLeaveType('Paid');
  };

  // Approve leaves
  const handleAuthorizeLeave = (employeeId: string, requestId: string, authStatus: 'Approved' | 'Rejected', remarks: string = '') => {
    const updatedEmployees = normalizedEmployees.map(emp => {
      if (emp.id === employeeId) {
        const currentBalances = emp.leaveBalances || { casual: 10, sick: 8, paid: 15, wfh: 20 };
        const updatedBalances = { ...currentBalances };
        
        const updatedLeaves = emp.leaves.map(req => {
          if (req.id === requestId) {
            if (authStatus === 'Approved') {
              // Deduct days from selected type
              const start = new Date(req.startDate);
              const end = new Date(req.endDate);
              const diffTime = Math.abs(end.getTime() - start.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
              const typeKey = (req.leaveType || 'Paid').toLowerCase() as 'casual' | 'sick' | 'paid' | 'wfh';
              if (updatedBalances[typeKey] !== undefined) {
                updatedBalances[typeKey] = Math.max(0, updatedBalances[typeKey] - diffDays);
              }
            }
            return { 
              ...req, 
              status: authStatus, 
              adminRemarks: remarks || (authStatus === 'Approved' ? 'Approved by Administrator' : 'Rejected by Administrator') 
            };
          }
          return req;
        });

        return { 
          ...emp, 
          leaves: updatedLeaves,
          leaveBalances: updatedBalances 
        };
      }
      return emp;
    });

    onSaveData({
      ...data,
      employees: updatedEmployees
    });

    showNotification(`PTO leave request processed successfully: ${authStatus.toUpperCase()}`);
  };

  // Filter logic for personnel directory search
  const filteredEmployeesList = normalizedEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          emp.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  // Calculate high-level summary cards
  const totalEmployeesCount = normalizedEmployees.length;
  const activeCount = normalizedEmployees.filter(e => e.status === 'Active').length;
  const suspendedCount = normalizedEmployees.filter(e => e.status === 'Suspended').length;
  const pendingInvitesCount = invitations.filter(i => i.status === 'Invited').length;

  // Single employee profile retrieval for non-admins
  const selfProfile = normalizedEmployees.find(emp => emp.email.toLowerCase() === session?.email?.toLowerCase());

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Users className="h-5.5 w-5.5 text-slate-700" />
            <span>Personnel Directory & Access Controls (RBAC)</span>
          </h2>
          <p className="text-xs text-slate-500">
            {isAdminOrHigher 
              ? 'Formulate staff parameters, generate secure employee invites, and manage granular system module permissions.'
              : 'View your profile registry, record daily workspace hours, and dispatch Paid Time Off (PTO) leaves.'
            }
          </p>
        </div>

        {/* Global Admin Buttons */}
        {isAdminOrHigher && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setInviteName('');
                setInviteEmail('');
                setInviteDesignation('');
                setGeneratedLink('');
                setIsInviteModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              <span>Invite Employee</span>
            </button>
            <button
              onClick={() => setIsAddDirectModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add Directly</span>
            </button>
          </div>
        )}
      </div>

      {/* Notifications banner */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <ShieldAlert className="h-4 w-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="bg-indigo-50 p-2.5 rounded-xl text-indigo-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Directory</p>
            <p className="text-lg font-black text-slate-900 leading-tight">{totalEmployeesCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="bg-emerald-50 p-2.5 rounded-xl text-emerald-600">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Staff</p>
            <p className="text-lg font-black text-emerald-700 leading-tight">{activeCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="bg-amber-50 p-2.5 rounded-xl text-amber-600">
            <Mail className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Invites</p>
            <p className="text-lg font-black text-amber-700 leading-tight">{pendingInvitesCount}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="bg-rose-50 p-2.5 rounded-xl text-rose-600">
            <Ban className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Suspended Users</p>
            <p className="text-lg font-black text-rose-700 leading-tight">{suspendedCount}</p>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Selector */}
      <div className="border-b border-slate-200 flex space-x-6 text-xs font-bold text-slate-500">
        <button
          onClick={() => setActiveSubTab('directory')}
          className={`pb-3 border-b-2 transition-all ${
            activeSubTab === 'directory' 
              ? 'border-slate-900 text-slate-950 font-extrabold' 
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          Personnel Directory
        </button>
        {isAdminOrHigher && (
          <button
            onClick={() => {
              loadInvitations();
              setActiveSubTab('invitations');
            }}
            className={`pb-3 border-b-2 relative transition-all ${
              activeSubTab === 'invitations' 
                ? 'border-slate-900 text-slate-950 font-extrabold' 
                : 'border-transparent hover:text-slate-800'
            }`}
          >
            Pending Invites
            {pendingInvitesCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[9px] font-extrabold">
                {pendingInvitesCount}
              </span>
            )}
          </button>
        )}
        <button
          onClick={() => setActiveSubTab('attendance')}
          className={`pb-3 border-b-2 transition-all ${
            activeSubTab === 'attendance' 
              ? 'border-slate-900 text-slate-950 font-extrabold' 
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          Attendance Matrix
        </button>
        <button
          onClick={() => setActiveSubTab('leaves')}
          className={`pb-3 border-b-2 transition-all ${
            activeSubTab === 'leaves' 
              ? 'border-slate-900 text-slate-950 font-extrabold' 
              : 'border-transparent hover:text-slate-800'
          }`}
        >
          PTO Leave Workflows
        </button>
      </div>

      {/* RENDER MODE: STANDARD EMPLOYEE ACCESS BLOCK (When non-admin logs in and views Directory) */}
      {!isAdminOrHigher && activeSubTab === 'directory' && selfProfile && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Detailed self-profile visual badge */}
          <div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6 text-center">
            <div className="relative inline-block mx-auto">
              <img 
                src={selfProfile.profilePhoto} 
                alt={selfProfile.name} 
                className="w-24 h-24 rounded-full object-cover border-4 border-slate-100 shadow-sm"
              />
              <span className="absolute bottom-1 right-1 h-5 w-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center text-white" title="Active">
                <Check className="h-3 w-3" />
              </span>
            </div>

            <div>
              <h3 className="text-md font-black text-slate-900">{selfProfile.name}</h3>
              <p className="text-xs text-indigo-600 font-extrabold mt-0.5 uppercase tracking-wide">{selfProfile.role}</p>
              <span className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-750 font-bold text-[9px] rounded-full uppercase mt-2">
                ID: {selfProfile.id}
              </span>
            </div>

            <div className="text-left text-xs space-y-3 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Department</span>
                <span className="font-bold text-slate-800">{selfProfile.department || 'Core Operations'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Corporate Email</span>
                <span className="font-bold text-slate-800 font-mono text-[11px]">{selfProfile.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Contact Number</span>
                <span className="font-bold text-slate-800">{selfProfile.contactNumber || 'Not Configured'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Joining Date</span>
                <span className="font-bold text-slate-800">{selfProfile.joiningDate || '2026-06-19'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Attendance Score</span>
                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>{selfProfile.productivityScore}%</span>
                </span>
              </div>
            </div>

            {/* Simulated password reset trigger */}
            <button
              onClick={() => openPasswordResetModal(selfProfile)}
              className="w-full flex items-center justify-center gap-1.5 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition active:scale-95"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>Modify Login Password</span>
            </button>
          </div>

          {/* Module checklist / Assigned components */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-black text-slate-900">Your Authorized Modules (RBAC)</h3>
              <p className="text-xs text-slate-500">Below is the complete set of enterprise ledger items assigned specifically to your role profile by administrators.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { name: 'Projects Portfolio', desc: 'Read portfolio milestones & report task progress.', code: 'Projects Portfolio' },
                { name: 'CRM Leads', desc: 'Identify qualified customer leads and edit communications.', code: 'CRM Leads' },
                { name: 'Finance Ledger', desc: 'View pending receivables and invoice ledgers.', code: 'Finance Ledger' },
                { name: 'Staff Attendance', desc: 'Access directory coordinates and marks workspace hours.', code: 'Staff Attendance' }
              ].map((mod) => {
                const isAssigned = selfProfile.assignedModules?.includes(mod.code);
                return (
                  <div key={mod.name} className={`p-4 rounded-2xl border transition ${
                    isAssigned 
                      ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950' 
                      : 'bg-slate-50/30 border-slate-100 text-slate-400'
                  }`}>
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-xs">{mod.name}</p>
                      {isAssigned ? (
                        <span className="px-1.5 py-0.5 bg-indigo-100 border border-indigo-200 text-indigo-700 rounded text-[8px] font-black uppercase">AUTHORIZED</span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded text-[8px] font-black uppercase">DENIED</span>
                      )}
                    </div>
                    <p className={`text-[10px] mt-1 ${isAssigned ? 'text-indigo-700 font-medium' : 'text-slate-400'}`}>{mod.desc}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-2xl flex gap-3 text-xs text-amber-800 font-semibold leading-relaxed">
              <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">🔒 Role-Based Access Control Rule Enforced:</p>
                <p className="mt-1">In compliance with Phase 1 policies, non-admin accounts are restricted to assigned modules only. If you require access to financial invoices or client leads, please trigger a request to Sunita Dwivedi or Shweta Dwivedi to grant permissions.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RENDER MODE: ADMIN DIRECTORY LIST VIEW */}
      {activeSubTab === 'directory' && (isAdminOrHigher || !selfProfile) && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Search bar & filter control panel */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search staff by Name, Email, or Designation..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 text-xs font-bold text-slate-650"
              >
                <option value="All">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Design">Design</option>
                <option value="QA">QA</option>
                <option value="DevOps">DevOps</option>
                <option value="Sales">Sales</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl p-2 px-3 text-xs font-bold text-slate-650"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Personnel Table Grid */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-4">Personnel Profile</th>
                    <th className="p-4">Employee ID</th>
                    <th className="p-4">Department & Role</th>
                    <th className="p-4">Joining Date</th>
                    <th className="p-4">Hourly Rate</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">RBAC Modules</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployeesList.length > 0 ? (
                    filteredEmployeesList.map((emp) => {
                      const isSuspended = emp.status === 'Suspended';
                      return (
                        <tr key={emp.id} className={`hover:bg-slate-50/50 transition ${isSuspended ? 'bg-slate-50/30 text-slate-400' : ''}`}>
                          
                          {/* Photo + Contact details */}
                          <td className="p-4 max-w-xs">
                            <div className="flex items-center gap-3">
                              <img 
                                src={emp.profilePhoto} 
                                alt={emp.name} 
                                className={`w-10 h-10 rounded-full object-cover border border-slate-200 shadow-3xs shrink-0 ${
                                  isSuspended ? 'grayscale' : ''
                                }`}
                              />
                              <div className="min-w-0">
                                <p className={`font-extrabold text-slate-900 leading-tight ${isSuspended ? 'line-through text-slate-400' : ''}`}>{emp.name}</p>
                                <p className="text-[10px] text-slate-450 font-medium truncate mt-0.5">{emp.email}</p>
                                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{emp.contactNumber}</p>
                              </div>
                            </div>
                          </td>

                          {/* ID badge */}
                          <td className="p-4 font-mono font-bold text-slate-600">
                            {emp.id}
                          </td>

                          {/* Dept/Role */}
                          <td className="p-4">
                            <p className="font-extrabold text-slate-850 text-xs leading-none">{emp.role}</p>
                            <p className="text-[9px] text-indigo-650 font-bold mt-1 tracking-wider uppercase">{emp.department || 'Engineering'}</p>
                          </td>

                          {/* Joining Date */}
                          <td className="p-4 font-semibold text-slate-600">
                            {emp.joiningDate || '2026-06-19'}
                          </td>

                          {/* Hourly Rate */}
                          <td className="p-4 font-extrabold text-slate-800">
                            ${emp.hourlyRate}/hr
                          </td>

                          {/* Status Badge */}
                          <td className="p-4 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase border ${
                              isSuspended 
                                ? 'bg-rose-50 border-rose-200 text-rose-750' 
                                : 'bg-emerald-50 border-emerald-200 text-emerald-850'
                            }`}>
                              {emp.status}
                            </span>
                          </td>

                          {/* RBAC Modules Count */}
                          <td className="p-4 text-center">
                            <button
                              onClick={() => openRbacModal(emp)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition"
                            >
                              <Shield className="h-3 w-3 text-slate-500" />
                              <span>{emp.assignedModules?.length || 0} Modules</span>
                            </button>
                          </td>

                          {/* Action Controls */}
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-1.5">
                              {/* Edit details */}
                              <button
                                onClick={() => openEditModal(emp)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition"
                                title="Edit Profile Details"
                              >
                                <Edit className="h-4 w-4" />
                              </button>

                              {/* Reset Credentials */}
                              <button
                                onClick={() => openPasswordResetModal(emp)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-indigo-650 transition"
                                title="Reset Login Credentials"
                              >
                                <KeyRound className="h-4 w-4" />
                              </button>

                              {/* Suspend Toggle */}
                              <button
                                onClick={() => handleToggleStatus(emp)}
                                className={`p-1.5 hover:bg-slate-100 rounded-lg transition ${
                                  isSuspended ? 'text-emerald-600 hover:text-emerald-800' : 'text-amber-500 hover:text-amber-700'
                                }`}
                                title={isSuspended ? 'Reactivate Profile' : 'Suspend Profile'}
                              >
                                {isSuspended ? <Power className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                              </button>

                              {/* Hard Purge */}
                              <button
                                onClick={() => handleDeleteEmployee(emp)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-rose-600 transition"
                                title="Permanently Purge Profile"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-bold">
                        No employee records found matching filter constraints.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER MODE: PENDING INVITATIONS TAB */}
      {activeSubTab === 'invitations' && isAdminOrHigher && (
        <div className="space-y-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/70 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-4">Invited Name</th>
                    <th className="p-4">Designation & Dept</th>
                    <th className="p-4">Corporate Email</th>
                    <th className="p-4">Invitation Link / Token</th>
                    <th className="p-4">Date Generated</th>
                    <th className="p-4 text-center">Evaluation Simulate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invitations.length > 0 ? (
                    invitations.map((inv) => {
                      const link = `${window.location.origin}/?invite=${inv.token}`;
                      return (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="p-4 font-extrabold text-slate-900">
                            {inv.fullName}
                          </td>
                          <td className="p-4">
                            <p className="font-bold text-slate-850">{inv.designation}</p>
                            <p className="text-[9px] text-indigo-600 font-extrabold uppercase mt-0.5">{inv.department}</p>
                          </td>
                          <td className="p-4 font-mono font-bold text-slate-600">
                            {inv.email}
                          </td>
                          <td className="p-4 max-w-xs">
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/70 rounded-lg p-1.5 text-slate-500 truncate min-w-0 select-all">
                              <span className="font-mono text-[10px] font-bold text-slate-700 truncate flex-grow">{link}</span>
                              <button
                                onClick={() => handleCopyLink(link)}
                                className="p-1 hover:bg-slate-200 text-slate-700 rounded transition shrink-0"
                                title="Copy secure invite link"
                              >
                                <Copy className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="p-4 font-semibold text-slate-500">
                            {inv.dateGenerated}
                          </td>
                          <td className="p-4 text-center">
                            {inv.status === 'Invited' ? (
                              <button
                                onClick={() => handleSimulateInviteAccept(inv)}
                                className="inline-flex items-center gap-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-850 border border-emerald-200 rounded-lg text-[10px] font-extrabold transition duration-150 shadow-3xs cursor-pointer"
                                title="Log out and simulate accepting invitation"
                              >
                                <ExternalLink className="h-3 w-3 shrink-0" />
                                <span>Simulate Link Open</span>
                              </button>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-500 font-bold text-[9px] rounded-full uppercase">
                                Already Activated
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400 font-bold">
                        No pending corporate invitations registered. Use "Invite Employee" to generate parameters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RENDER MODE: ATTENDANCE MATRIX (Existing table rendering kept clean!) */}
      {activeSubTab === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          
          {/* Main Table logs - takes 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/85">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                  <CalendarCheck2 className="h-4.5 w-4.5 text-slate-500" />
                  <span>Weekly Attendance Log Matrix</span>
                </h3>

                <button
                  onClick={() => {
                    // Export Attendance Matrix to CSV
                    const headers = ['Employee Name', 'Department', 'Date', 'Status', 'Hours Worked', 'Check In', 'Check Out', 'Late Mark'];
                    const rows: string[][] = [];
                    normalizedEmployees.forEach(e => {
                      e.attendance.forEach(att => {
                        rows.push([
                          e.name,
                          e.department || 'Engineering',
                          att.date,
                          att.status,
                          String(att.hoursWorked),
                          att.checkIn || 'N/A',
                          att.checkOut || 'N/A',
                          att.isLate ? 'LATE' : 'On-Time'
                        ]);
                      });
                    });

                    const csvContent = [
                      headers.join(','),
                      ...rows.map(row => row.map(val => `"${val.replace(/"/g, '""')}"`).join(','))
                    ].join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', 'corporate_attendance_report.csv');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showNotification('Attendance records exported successfully to CSV.');
                  }}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px] uppercase px-3 py-1.5 rounded-lg border border-slate-200 transition cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-slate-550" />
                  <span>Export Logs</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-xs bg-slate-50/50 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="p-3.5">Assigned Developer</th>
                      {dates.map((d) => (
                        <th key={d} className="p-3.5 font-mono text-center">
                          {d.substring(5)}
                        </th>
                      ))}
                      <th className="p-3.5 text-center">Velocity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {normalizedEmployees.map((emp) => {
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50">
                          <td className="p-3.5">
                            <p className="font-bold text-slate-900 leading-none">{emp.name}</p>
                            <p className="text-[9px] text-indigo-600 font-bold uppercase mt-1">
                              {emp.department || 'Engineering'} • {emp.role}
                            </p>
                          </td>

                          {dates.map((d) => {
                            const record = emp.attendance.find(a => a.date === d);
                            return (
                              <td key={d} className="p-3.5 text-center">
                                {record ? (
                                  <span className={`inline-block px-2 py-1 rounded text-[10px] font-bold border ${
                                    record.status === 'Present' 
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                                      : record.status === 'Absent' 
                                      ? 'bg-rose-50 text-rose-850 border-rose-100' 
                                      : 'bg-amber-50 text-amber-850 border-amber-100'
                                  }`} title={record.checkIn ? `Check-In: ${record.checkIn} | Out: ${record.checkOut || 'N/A'}` : undefined}>
                                    {record.status === 'Present' ? `${record.hoursWorked}h` : record.status}
                                    {record.isLate && <span className="block text-[8px] font-extrabold text-rose-600 font-sans tracking-wide">LATE</span>}
                                  </span>
                                ) : (
                                  <span className="text-slate-300 font-medium">--</span>
                                )}
                              </td>
                            );
                          })}

                          <td className="p-3.5 text-center">
                            <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                              <TrendingUp className="h-3 w-3" />
                              <span>{emp.productivityScore}%</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Interactive Attendance & Punch Clock panel */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* SELF DAILY PUNCH CLOCK CARD */}
            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-5 rounded-2xl text-white shadow-md space-y-4">
              <div>
                <span className="text-[10px] bg-indigo-500/35 border border-indigo-500/50 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Self daily punch desk</span>
                <h3 className="text-sm font-bold mt-2 flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-indigo-300" />
                  <span>Workday Attendance Tracker</span>
                </h3>
                <p className="text-[10px] text-slate-300 mt-1">Clock in your daily sprint hours, record break sessions, and finalize your corporate logs.</p>
              </div>

              {/* Punch Status metrics */}
              <div className="bg-white/10 p-3.5 rounded-xl border border-white/10 text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Current Check In:</span>
                  <span className="font-mono font-bold text-white">{clockInTimeStr || 'Not Checked In'}</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Break Sessions:</span>
                  <span className="font-mono font-bold text-white">
                    {onBreak ? 'Active Break' : `${breakAccumulatedMins} mins accumulated`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span>Duty State:</span>
                  <span className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded ${
                    clockedIn ? (onBreak ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40') : 'bg-slate-500/30 text-slate-300 border border-slate-500/40'
                  }`}>
                    {clockedIn ? (onBreak ? 'On Break' : 'On Duty') : 'Offline'}
                  </span>
                </div>
                {punchLateMark && (
                  <p className="text-[9.5px] bg-rose-500/20 text-rose-300 border border-rose-500/35 p-1 rounded text-center font-extrabold uppercase tracking-widest animate-pulse">
                    Late Mark Triggered (Post 10:00 AM)
                  </p>
                )}
              </div>

              {/* Clock Buttons */}
              <div className="grid grid-cols-1 gap-2 text-xs pt-1">
                {!clockedIn ? (
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                      const hours = now.getHours();
                      const minutes = now.getMinutes();
                      const isLate = hours > 10 || (hours === 10 && minutes > 0);
                      
                      setClockedIn(true);
                      setClockInTimeStr(timeStr);
                      setPunchLateMark(isLate);
                      localStorage.setItem('trinexiss_clocked_in', 'true');
                      localStorage.setItem('trinexiss_clock_in_time', timeStr);
                      localStorage.setItem('trinexiss_punch_late', String(isLate));
                      
                      showNotification(`Clock-in recorded at ${timeStr}. Status: Present. ${isLate ? 'Late Mark Registered.' : 'On Time.'}`);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl shadow-xs transition cursor-pointer text-center"
                  >
                    Check In / Begin Workday
                  </button>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      {!onBreak ? (
                        <button
                          type="button"
                          onClick={() => {
                            setOnBreak(true);
                            setBreakStartMs(Date.now());
                            localStorage.setItem('trinexiss_on_break', 'true');
                            localStorage.setItem('trinexiss_break_start_ms', String(Date.now()));
                            showNotification('Break session initiated.');
                          }}
                          className="py-2.5 bg-amber-600 hover:bg-amber-500 font-bold rounded-xl transition cursor-pointer text-center"
                        >
                          Start Break
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            const diffMs = Date.now() - breakStartMs;
                            const diffMins = Math.round(diffMs / 60000) || 1; 
                            const updatedBreak = breakAccumulatedMins + diffMins;
                            
                            setOnBreak(false);
                            setBreakAccumulatedMins(updatedBreak);
                            localStorage.setItem('trinexiss_on_break', 'false');
                            localStorage.setItem('trinexiss_break_accumulated_mins', String(updatedBreak));
                            showNotification(`Break completed. Duration: ${diffMins} minutes logged.`);
                          }}
                          className="py-2.5 bg-emerald-700 hover:bg-emerald-600 font-bold rounded-xl transition cursor-pointer text-center animate-pulse"
                        >
                          End Break
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const outTimeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                          const simulatedHours = 8.5;
                          
                          let selfId = 'e1';
                          const selfEmp = normalizedEmployees.find(emp => emp.email.toLowerCase() === session?.email?.toLowerCase());
                          if (selfEmp) selfId = selfEmp.id;

                          const newDailyRecord: AttendanceRecord = {
                            date: '2026-06-19',
                            status: 'Present',
                            hoursWorked: simulatedHours,
                            checkIn: clockInTimeStr,
                            checkOut: outTimeStr,
                            breakTime: breakAccumulatedMins,
                            isLate: punchLateMark,
                            history: []
                          };

                          const updatedEmployees = normalizedEmployees.map(emp => {
                            if (emp.id === selfId) {
                              const cleanedAtt = emp.attendance.filter(a => a.date !== '2026-06-19');
                              return {
                                ...emp,
                                attendance: [...cleanedAtt, newDailyRecord]
                              };
                            }
                            return emp;
                          });

                          onSaveData({
                            ...data,
                            employees: updatedEmployees
                          });

                          // Reset clock states
                          setClockedIn(false);
                          setClockInTimeStr('');
                          setClockOutTimeStr(outTimeStr);
                          setOnBreak(false);
                          setBreakAccumulatedMins(0);
                          setPunchLateMark(false);
                          
                          localStorage.removeItem('trinexiss_clocked_in');
                          localStorage.removeItem('trinexiss_clock_in_time');
                          localStorage.removeItem('trinexiss_on_break');
                          localStorage.removeItem('trinexiss_break_start_ms');
                          localStorage.removeItem('trinexiss_break_accumulated_mins');
                          localStorage.removeItem('trinexiss_punch_late');

                          showNotification(`Clock-out recorded at ${outTimeStr}. Today's hours: ${simulatedHours}h recorded successfully.`);
                        }}
                        className="py-2.5 bg-rose-600 hover:bg-rose-500 font-bold rounded-xl transition cursor-pointer text-center"
                      >
                        Check Out / End Day
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ADMIN MARK ATTENDANCE CARD */}
            {isAdminOrHigher && (
              <div className="bg-white p-5 rounded-2xl border border-slate-200/85 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-slate-500" />
                  <span>Administrative Manual Entry</span>
                </h3>

                <form onSubmit={handleMarkAttendance} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Select Employee *</label>
                    <select
                      value={selectedEmpId}
                      onChange={e => setSelectedEmpId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                    >
                      <option value="">Choose Developer...</option>
                      {normalizedEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Select Date *</label>
                    <select
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
                    >
                      {dates.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Status *</label>
                      <select
                        value={attStatus}
                        onChange={e => setAttStatus(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none text-slate-700"
                      >
                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>
                        <option value="Leave">On Leave</option>
                      </select>
                    </div>

                    {attStatus === 'Present' && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase">Hours Worked *</label>
                        <input
                          type="number"
                          min={1}
                          max={16}
                          value={hoursWorked}
                          onChange={e => setHoursWorked(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none focus:bg-white text-slate-700"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Commit Attendance Parameters
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RENDER MODE: LEAVE WORKFLOWS TAB */}
      {activeSubTab === 'leaves' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* PTO BALANCE LEAVE MATRIX AT THE TOP */}
          <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">My Standing Leave Balances</h4>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Casual Leaves</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                  {selfProfile?.leaveBalances?.casual ?? 10} days
                </h3>
                <p className="text-[9px] text-slate-400 mt-0.5">Remaining out of 10</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Sick Leaves</p>
                <h3 className="text-xl font-extrabold text-slate-900 mt-1 font-mono">
                  {selfProfile?.leaveBalances?.sick ?? 8} days
                </h3>
                <p className="text-[9px] text-slate-400 mt-0.5">Remaining out of 8</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Paid Leaves</p>
                <h3 className="text-xl font-extrabold text-indigo-650 mt-1 font-mono">
                  {selfProfile?.leaveBalances?.paid ?? 15} days
                </h3>
                <p className="text-[9px] text-indigo-400 mt-0.5">Remaining out of 15</p>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase">WFH Allocation</p>
                <h3 className="text-xl font-extrabold text-emerald-600 mt-1 font-mono">
                  {selfProfile?.leaveBalances?.wfh ?? 20} days
                </h3>
                <p className="text-[9px] text-emerald-500 mt-0.5">Remaining out of 20</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Leave approvals table - 2/3 */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/85">
                <h3 className="text-sm font-bold text-slate-950 mb-4 flex items-center gap-1.5">
                  <FileCheck2 className="h-4.5 w-4.5 text-slate-500" />
                  <span>Paid Time Off (PTO) Leave Applications</span>
                </h3>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-100 text-left text-xs bg-slate-50/50 rounded-xl overflow-hidden">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                        <th className="p-3.5">Staff Requesting</th>
                        <th className="p-3.5">Leave Type</th>
                        <th className="p-3.5">Duration Timeline</th>
                        <th className="p-3.5 font-sans">Reason & Remarks</th>
                        <th className="p-3.5 text-center">Workflow Status</th>
                        {isAdminOrHigher && <th className="p-3.5 text-right">Approve Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {normalizedEmployees.some(e => e.leaves && e.leaves.length > 0) ? (
                        normalizedEmployees.flatMap(emp => 
                          (emp.leaves || []).map(leave => (
                            <tr key={leave.id} className="hover:bg-slate-50">
                              <td className="p-3.5">
                                <p className="font-bold text-slate-900 leading-none">{emp.name}</p>
                                <p className="text-[9px] text-slate-400 font-semibold mt-1">{emp.role}</p>
                              </td>
                              <td className="p-3.5">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 border border-slate-200 text-slate-700">
                                  {leave.leaveType || 'Paid Leave'}
                                </span>
                              </td>
                              <td className="p-3.5 font-mono font-bold text-slate-600">
                                {leave.startDate} to {leave.endDate}
                              </td>
                              <td className="p-3.5 max-w-xs text-slate-650 font-medium">
                                <p className="truncate font-semibold text-slate-850" title={leave.reason}>{leave.reason}</p>
                                {leave.adminRemarks && (
                                  <p className="text-[9.5px] text-indigo-700 font-bold mt-1 bg-indigo-50 border border-indigo-150 px-1.5 py-0.5 rounded italic">
                                    Remarks: {leave.adminRemarks}
                                  </p>
                                )}
                              </td>
                              <td className="p-3.5 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                                  leave.status === 'Approved' 
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-850' 
                                    : leave.status === 'Rejected' 
                                    ? 'bg-rose-50 border-rose-200 text-rose-850' 
                                    : 'bg-amber-50 border-amber-200 text-amber-850'
                                }`}>
                                  {leave.status}
                                </span>
                              </td>
                              {isAdminOrHigher && (
                                <td className="p-3.5 text-right">
                                  {leave.status === 'Pending' ? (
                                    <div className="flex justify-end gap-1.5 items-center">
                                      {/* Mini Remarks Input */}
                                      <input
                                        type="text"
                                        placeholder="Add remarks..."
                                        onChange={(e) => setAdminRemarks(e.target.value)}
                                        className="bg-slate-50 border border-slate-250 p-1 rounded text-[10px] focus:outline-none w-24 font-medium text-slate-800"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleAuthorizeLeave(emp.id, leave.id, 'Approved', adminRemarks)}
                                        className="p-1 hover:bg-emerald-50 text-emerald-700 rounded transition cursor-pointer"
                                        title="Approve PTO Request"
                                      >
                                        <Check className="h-4.5 w-4.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleAuthorizeLeave(emp.id, leave.id, 'Rejected', adminRemarks)}
                                        className="p-1 hover:bg-rose-50 text-rose-700 rounded transition cursor-pointer"
                                        title="Reject PTO Request"
                                      >
                                        <X className="h-4.5 w-4.5" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-400 font-bold">Closed</span>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))
                        )
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-6 text-center text-slate-400 font-bold">
                            No Paid Time Off (PTO) leaves recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Leave submission form - available for all logged-in staff */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/85 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-slate-500" />
                  <span>Submit PTO Request</span>
                </h3>

                <form onSubmit={handleRequestLeave} className="space-y-4 font-semibold text-slate-700">
                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Leave Category *</label>
                    <select
                      value={leaveType}
                      onChange={e => setLeaveType(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none text-slate-750"
                    >
                      <option value="Paid">Paid Leave</option>
                      <option value="Sick">Sick Leave</option>
                      <option value="Casual">Casual Leave</option>
                      <option value="WFH">WFH Allocation</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Start Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveStart}
                      onChange={e => setLeaveStart(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">End Date *</label>
                    <input
                      type="date"
                      required
                      value={leaveEnd}
                      onChange={e => setLeaveEnd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none text-slate-700"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase">Reason for Leave *</label>
                    <textarea
                      required
                      placeholder="e.g., Annual health checkup or family holiday parameters..."
                      rows={3}
                      value={leaveReason}
                      onChange={e => setLeaveReason(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none text-slate-700"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition active:scale-95 cursor-pointer"
                  >
                    Dispatch PTO Request
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* MODAL 1: COPRORATE INVITE GENERATOR (Flow Step 1-3) */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            
            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                <h3 className="font-extrabold text-sm uppercase">Generate Corporate Invite Link</h3>
              </div>
              <button 
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateInvite} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Sweta Singh"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none text-slate-700"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g., sweta.s@trinexiss.tech"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none text-slate-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Designation *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Lead AI Developer"
                    value={inviteDesignation}
                    onChange={e => setInviteDesignation(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold focus:outline-none text-slate-700"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Department *</label>
                  <select
                    value={inviteDept}
                    onChange={e => setInviteDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="QA">QA</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition"
              >
                Generate Verification parameters
              </button>

              {/* Generated Links outputs */}
              {generatedLink && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                  <p className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider">🔗 Secure Activation link generated!</p>
                  
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-500 font-bold">INVITE LINK (SIMULATION DEMO):</p>
                    <div className="flex gap-2 items-center bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono">
                      <span className="truncate text-slate-700 flex-grow select-all font-bold">{generatedLink}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(generatedLink)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600 transition"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[10px] text-slate-500 font-bold">MANUAL BYPASS INVITE CODE:</p>
                    <div className="flex gap-2 items-center bg-white border border-slate-200 rounded-lg p-2 text-xs font-mono">
                      <span className="truncate text-indigo-700 font-black tracking-widest uppercase flex-grow">{generatedCode}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyLink(generatedCode)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-650 transition"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-[10px] text-emerald-700 leading-relaxed font-semibold">
                    Simulate opening this invite by going to <strong>"Pending Invites"</strong> in the parent tab, and click <strong>"Simulate Link Open"</strong>!
                  </p>
                </div>
              )}
            </form>
          </div>
        </div>
      )}


      {/* MODAL 2: ADD EMPLOYEE DIRECTLY */}
      {isAddDirectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            
            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <UserPlus className="h-5 w-5 text-indigo-600" />
                <h3 className="font-extrabold text-sm uppercase">Add Active Employee Directly</h3>
              </div>
              <button 
                onClick={() => setIsAddDirectModalOpen(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployeeDirectly} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Sunita Dwivedi"
                    value={directName}
                    onChange={e => setDirectName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Contact Phone</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 00000"
                    value={directContact}
                    onChange={e => setDirectContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Corporate Email *</label>
                <input
                  type="email"
                  required
                  placeholder="sunita.d@trinexiss.tech"
                  value={directEmail}
                  onChange={e => setDirectEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Role / Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="DevOps Architect"
                    value={directRole}
                    onChange={e => setDirectRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Department *</label>
                  <select
                    value={directDept}
                    onChange={e => setDirectDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="QA">QA</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Hourly Rate ($) *</label>
                  <input
                    type="number"
                    required
                    value={directHourlyRate}
                    onChange={e => setDirectHourlyRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Productivity Score (%)</label>
                  <input
                    type="number"
                    value={directProductivity}
                    onChange={e => setDirectProductivity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95"
              >
                Provision Active Personnel Profile
              </button>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 3: EDIT PROFILE PARAMETERS */}
      {isEditModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            
            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <Edit className="h-5 w-5 text-indigo-600" />
                <h3 className="font-extrabold text-sm uppercase">Edit Staff Profile Parameters</h3>
              </div>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Contact Phone</label>
                  <input
                    type="tel"
                    value={editContact}
                    onChange={e => setEditContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Corporate Email Address *</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Designation / Role *</label>
                  <input
                    type="text"
                    required
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Department *</label>
                  <select
                    value={editDept}
                    onChange={e => setEditDept(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="QA">QA</option>
                    <option value="DevOps">DevOps</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Hourly Rate ($/hr) *</label>
                  <input
                    type="number"
                    required
                    value={editHourlyRate}
                    onChange={e => setEditHourlyRate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase">Profile Photo URL</label>
                  <input
                    type="url"
                    value={editPhoto}
                    onChange={e => setEditPhoto(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition active:scale-95"
              >
                Synchronize Profile Parameters
              </button>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 4: SIMULATED PASSWORD RESET */}
      {isResetPasswordModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            
            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <KeyRound className="h-5 w-5 text-indigo-650" />
                <h3 className="font-extrabold text-sm uppercase">Force Reset Staff Password</h3>
              </div>
              <button 
                onClick={() => setIsResetPasswordModalOpen(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-[11px] text-amber-800 leading-relaxed font-semibold">
                This triggers a simulated secure credential reset for <strong>{selectedEmp.name}</strong> ({selectedEmp.email}). Future logins will require the newly designated keys.
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-750 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-500 uppercase">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-semibold text-slate-750 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition"
              >
                Execute Secure Reset Parameters
              </button>
            </form>
          </div>
        </div>
      )}


      {/* MODAL 5: GRANULAR MODULE ACCESS CONTROL (RBAC) */}
      {isRbacModalOpen && selectedEmp && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-scaleIn">
            
            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2 text-slate-900">
                <Shield className="h-5 w-5 text-indigo-650" />
                <h3 className="font-extrabold text-sm uppercase">Manage System Permissions</h3>
              </div>
              <button 
                onClick={() => setIsRbacModalOpen(false)}
                className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRbac} className="p-6 space-y-4">
              <div className="text-xs space-y-1.5 pb-2 border-b border-slate-100">
                <p className="font-extrabold text-slate-850">Granular Module Selection for {selectedEmp.name}:</p>
                <p className="text-[11px] text-slate-500">Unchecked modules will be dynamically hidden from the navigation bar when this employee logs in.</p>
              </div>

              <div className="space-y-2.5">
                {[
                  { id: 'My Profile', label: 'My Personal Profile & PTO', desc: 'Allows viewing active self profile stats and launching leaves requests.' },
                  { id: 'Projects Portfolio', label: 'Projects & Milestones', desc: 'Allows viewing allocated active projects, boards, and tasks checklists.' },
                  { id: 'CRM Leads', label: 'CRM Contacts & Proposals', desc: 'Allows tracking qualified leads pipeline and meetings summaries.' },
                  { id: 'Finance Ledger', label: 'Invoices & Receivables Ledger', desc: 'Allows checking financial invoice records and transaction statuses.' },
                  { id: 'Staff Attendance', label: 'Staff Matrix & Hours Attendance', desc: 'Allows viewing coworker lists, velocity ratings, and attendance sheets.' }
                ].map((mod) => {
                  const isChecked = assignedRbacModules.includes(mod.id);
                  return (
                    <div 
                      key={mod.id} 
                      onClick={() => toggleRbacModule(mod.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition flex items-start gap-3 select-none ${
                        isChecked 
                          ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950' 
                          : 'bg-slate-50/30 border-slate-100 text-slate-400 hover:border-slate-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // toggled by parent div click
                        className="mt-1 shrink-0 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="min-w-0">
                        <p className={`text-xs font-bold ${isChecked ? 'text-indigo-900' : 'text-slate-700'}`}>{mod.label}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">{mod.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsRbacModalOpen(false)}
                  className="flex-1 py-2 border border-slate-200 text-slate-650 text-xs font-bold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition"
                >
                  Commit Access Rules
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
