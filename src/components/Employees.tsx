import React, { useState } from 'react';
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
  CalendarCheck2
} from 'lucide-react';
import { Employee, ERPData, AttendanceRecord, LeaveRequest } from '../types.ts';

interface EmployeesProps {
  data: ERPData;
  onSaveData: (newData: ERPData) => void;
}

export default function Employees({ data, onSaveData }: EmployeesProps) {
  const [selectedDate, setSelectedDate] = useState('2026-06-19');
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [attStatus, setAttStatus] = useState<'Present' | 'Absent' | 'Leave'>('Present');
  const [hoursWorked, setHoursWorked] = useState('8');

  // Submit new leave request
  const [leaveEmpId, setLeaveEmpId] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');
  const [leaveReason, setLeaveReason] = useState('');

  // June week dates representing the seed ledger
  const dates = ['2026-06-15', '2026-06-16', '2026-06-17', '2026-06-18', '2026-06-19'];

  // Handle Mark Attendance
  const handleMarkAttendance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !selectedDate) {
      alert('Please fill out employee and date parameters.');
      return;
    }

    const updatedEmployees = data.employees.map(emp => {
      if (emp.id === selectedEmpId) {
        // filter or find if there is an existing record for this date
        const cleanAttendance = emp.attendance.filter(a => a.date !== selectedDate);
        const newRecord: AttendanceRecord = {
          date: selectedDate,
          status: attStatus,
          hoursWorked: attStatus === 'Present' ? Number(hoursWorked) : 0
        };

        // Recalculate dynamic productivity rating from hours worked
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

    alert('Attendance successfully recorded.');
  };

  // Authorize Leave request status update
  const handleAuthorizeLeave = (employeeId: string, requestId: string, authStatus: 'Approved' | 'Rejected') => {
    const updatedEmployees = data.employees.map(emp => {
      if (emp.id === employeeId) {
        const updatedLeaves = emp.leaves.map(req => {
          if (req.id === requestId) {
            return { ...req, status: authStatus };
          }
          return req;
        });
        return { ...emp, leaves: updatedLeaves };
      }
      return emp;
    });

    onSaveData({
      ...data,
      employees: updatedEmployees
    });
  };

  // Submit leave request form
  const handleRequestLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveEmpId || !leaveStart || !leaveEnd || !leaveReason) {
      alert('Please fill out all leave request parameters.');
      return;
    }

    const newRequest: LeaveRequest = {
      id: `l-${Date.now()}`,
      startDate: leaveStart,
      endDate: leaveEnd,
      reason: leaveReason,
      status: 'Pending'
    };

    const updatedEmployees = data.employees.map(emp => {
      if (emp.id === leaveEmpId) {
        return {
          ...emp,
          leaves: [...emp.leaves, newRequest]
        };
      }
      return emp;
    });

    onSaveData({
      ...data,
      employees: updatedEmployees
    });

    // reset Form
    setLeaveEmpId('');
    setLeaveStart('');
    setLeaveEnd('');
    setLeaveReason('');
    alert('Leave request registered successfully (Pending Approval).');
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Personnel & Workforce Registry</h2>
        <p className="text-xs text-slate-500">Record daily hours, manage paid time off (PTO) leave workflows, and analyze staff velocity profiles.</p>
      </div>

      {/* Main split: Attendance logs matrix on left, Action logs on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Attendance Board Matrix - takes 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/85">
            <h3 className="text-sm font-bold text-slate-950 mb-4 flex items-center gap-1.5">
              <CalendarCheck2 className="h-4.5 w-4.5 text-slate-500" />
              <span>Weekly Attendance Log Matrix</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-left text-xs bg-slate-50/50 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="p-3.5">Assigned Developer</th>
                    {dates.map((d, i) => (
                      <th key={d} className="p-3.5 font-mono text-center">
                        {d.substring(5)}
                      </th>
                    ))}
                    <th className="p-3.5 text-center">Productivity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {data.employees.map((emp) => {
                    const empProjects = data.projects.filter(p => p.assignedEmployees.some(ae => ae.id === emp.id));
                    return (
                      <tr key={emp.id} className="hover:bg-slate-50">
                        <td className="p-3.5 max-w-xs">
                          <p className="font-bold text-slate-900 leading-tight">{emp.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold tracking-tight uppercase">
                            {emp.department || 'Core Engineering'} • {emp.role}
                          </p>
                          {empProjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {empProjects.map(ep => (
                                <span key={ep.id} className="inline-block px-1.5 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[9px] font-bold" title={ep.name}>
                                  {ep.name.length > 25 ? `${ep.name.substring(0, 22)}...` : ep.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="inline-block text-[9px] text-slate-400 font-semibold mt-1">Bench / Non-allocated</span>
                          )}
                        </td>

                      {/* Render each day's log cells */}
                      {dates.map((d) => {
                        const record = emp.attendance.find(a => a.date === d);
                        return (
                          <td key={d} className="p-3.5 text-center">
                            {record ? (
                              record.status === 'Present' ? (
                                <span className="inline-flex flex-col items-center justify-center min-w-11 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100 text-[10px]">
                                  <span className="font-bold">P</span>
                                  <span className="text-[9px] font-mono text-emerald-600 block leading-none mt-0.5">{record.hoursWorked}h</span>
                                </span>
                              ) : record.status === 'Leave' ? (
                                <span className="inline-block min-w-11 px-1.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-100 text-[10px] font-bold">
                                  L
                                </span>
                              ) : (
                                <span className="inline-block min-w-11 px-1.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-100 text-[10px] font-bold animate-pulse">
                                  A
                                </span>
                              )
                            ) : (
                              <span className="text-slate-300 font-mono">-</span>
                            )}
                          </td>
                        );
                      })}

                      {/* Productivity score gauge */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`font-mono font-bold text-xs ${
                            emp.productivityScore >= 90 ? 'text-emerald-600' :
                            emp.productivityScore >= 80 ? 'text-blue-600' :
                            'text-amber-500'
                          }`}>
                            {emp.productivityScore}%
                          </span>
                          <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${
                                emp.productivityScore >= 90 ? 'bg-emerald-500' :
                                emp.productivityScore >= 80 ? 'bg-blue-500' :
                                'bg-amber-500'
                              }`}
                              style={{ width: `${emp.productivityScore}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-[10px] font-semibold text-slate-500 border-t border-slate-100 pt-3">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500"></span> Present (P)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500"></span> Authorized Leave (L)</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-500"></span> Unexcused Absence (A)</span>
            </div>
          </div>

          {/* Leave PTO requests table */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/85">
            <h3 className="text-sm font-bold text-slate-950 mb-4 flex items-center gap-1.5">
              <FileCheck2 className="h-4.5 w-4.5 text-slate-500" />
              <span>PTO Leave Approvals Control</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Staff Name</th>
                    <th className="p-3">PTO Period</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Current Status</th>
                    <th className="p-3 text-center">Manager Authorization</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.employees.flatMap(emp => 
                    emp.leaves.map(req => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="p-3 font-semibold text-slate-800">{emp.name}</td>
                        <td className="p-3 font-mono text-slate-500">{req.startDate} to {req.endDate}</td>
                        <td className="p-3 text-slate-600 max-w-xs truncate">{req.reason}</td>
                        <td className="p-3 text-xs">
                          <span className={`px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            req.status === 'Approved' ? 'bg-emerald-50 text-emerald-700' :
                            req.status === 'Rejected' ? 'bg-rose-50 text-rose-700' :
                            'bg-amber-50 text-amber-700 animate-pulse'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          {req.status === 'Pending' ? (
                            <div className="flex justify-center gap-1.5">
                              <button
                                onClick={() => handleAuthorizeLeave(emp.id, req.id, 'Approved')}
                                className="p-1 hover:bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-md transition"
                                title="Approve Leave"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleAuthorizeLeave(emp.id, req.id, 'Rejected')}
                                className="p-1 hover:bg-rose-50 text-rose-600 border border-rose-100 rounded-md transition"
                                title="Reject Leave"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[10px] font-semibold">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                  {data.employees.every(e => e.leaves.length === 0) && (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">No time-off requests current registered in database.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Logging Forms columns - takes 1/3 */}
        <div className="space-y-6">
          
          {/* Form 1: Attendance Logging */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/85">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 mb-4">
              <Calendar className="h-4 w-4 text-slate-500" />
              <span>Log Daily Attendance</span>
            </h3>

            <form onSubmit={handleMarkAttendance} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Employee *</label>
                <select
                  required
                  value={selectedEmpId}
                  onChange={e => setSelectedEmpId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Choose Staff Profile</option>
                  {data.employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Log Date *</label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status</label>
                  <select
                    value={attStatus}
                    onChange={e => setAttStatus(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                    <option value="Leave">On Leave</option>
                  </select>
                </div>

                {attStatus === 'Present' && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Hours Logged</label>
                    <input
                      type="number"
                      min="1"
                      max="16"
                      value={hoursWorked}
                      onChange={e => setHoursWorked(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2 rounded-xl mt-3 transition active:scale-95 cursor-pointer"
              >
                Submit Attendance Slip
              </button>
            </form>
          </div>

          {/* Form 2: Request Leave */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/85">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1.5 mb-4">
              <Plus className="h-4 w-4 text-slate-500" />
              <span>Apply for Time-Off (PTO)</span>
            </h3>

            <form onSubmit={handleRequestLeave} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Select Employee *</label>
                <select
                  required
                  value={leaveEmpId}
                  onChange={e => setLeaveEmpId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="">Choosing requester...</option>
                  {data.employees.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStart}
                    onChange={e => setLeaveStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEnd}
                    onChange={e => setLeaveEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-[11px] focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Reason for Leave Request *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Family medical emergency"
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs py-2 rounded-xl mt-3 transition active:scale-95 cursor-pointer border border-slate-200"
              >
                Submit Leave Application
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
