import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Video, 
  Briefcase, 
  UserX, 
  FileText, 
  CheckSquare, 
  Users, 
  Filter,
  Plus
} from 'lucide-react';
import { ERPData, Project, Invoice, Employee } from '../types.ts';

interface CalendarViewProps {
  data: ERPData;
  session: any;
}

type CalendarType = 'All' | 'deadlines' | 'meetings' | 'leaves' | 'invoices' | 'tasks';

export default function CalendarView({ data, session }: CalendarViewProps) {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-06-19')); // Standardized around the database's date frame
  const [filterType, setFilterType] = useState<CalendarType>('All');
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  // Helper date conversions
  const formatYYYYMMDD = (d: Date): string => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${date}`;
  };

  const getDaysInMonth = (d: Date): Date[] => {
    const year = d.getFullYear();
    const month = d.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    
    // Add padding days from previous month
    const startPadding = firstDay.getDay(); // 0 is Sunday
    for (let i = startPadding; i > 0; i--) {
      days.push(new Date(year, month, 1 - i));
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    // Add padding days for next month to complete the row of 7
    const remaining = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i));
    }
    
    return days;
  };

  // Compile calendar events from all modules
  const compileEvents = (): any[] => {
    const events: any[] = [];

    // 1. Project Deadlines
    data.projects.forEach(p => {
      events.push({
        id: `proj-${p.id}`,
        type: 'deadlines',
        title: `Project Deadline: ${p.name}`,
        date: p.deadline,
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        icon: <Briefcase className="h-3 w-3" />,
        raw: p,
        description: `Risk Level: ${p.riskLevel}. Progress: ${p.progress}%. ${p.description}`
      });
    });

    // 2. Corporate Meetings (from CRM clients/leads)
    data.clients.forEach(client => {
      client.meetings.forEach(meet => {
        events.push({
          id: `meet-${meet.id}`,
          type: 'meetings',
          title: `Meeting: ${meet.topic} with ${client.company}`,
          date: meet.date,
          time: meet.time,
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Users className="h-3 w-3" />,
          raw: meet,
          description: `Discussion Topic: ${meet.topic}. Contact Email: ${client.email}. Summary: ${meet.summary}`
        });
      });
    });

    // 3. Employee Leaves
    data.employees.forEach(emp => {
      (emp.leaves || []).forEach(l => {
        if (l.status === 'Approved') {
          // Add leave days for duration
          const start = new Date(l.startDate);
          const end = new Date(l.endDate);
          const curr = new Date(start);
          while (curr <= end) {
            events.push({
              id: `leave-${l.id}-${formatYYYYMMDD(curr)}`,
              type: 'leaves',
              title: `${emp.name} on Leave`,
              date: formatYYYYMMDD(curr),
              color: 'bg-amber-50 text-amber-700 border-amber-200',
              icon: <UserX className="h-3 w-3" />,
              raw: l,
              description: `Approved Paid Time Off for ${emp.name} (${emp.role}). Reason: ${l.reason}`
            });
            curr.setDate(curr.getDate() + 1);
          }
        }
      });
    });

    // 4. Invoice Due Dates
    data.invoices.forEach(inv => {
      events.push({
        id: `inv-${inv.id}`,
        type: 'invoices',
        title: `Invoice Due: ${inv.invoiceNumber} ($${inv.amount.toLocaleString()})`,
        date: inv.dueDate,
        color: 'bg-rose-50 text-rose-700 border-rose-200',
        icon: <FileText className="h-3 w-3" />,
        raw: inv,
        description: `Project: ${inv.projectName}. Milestone: ${inv.milestone}. Invoice amount: $${inv.amount}. Status: ${inv.status}.`
      });
    });

    // 5. Task Deadlines
    data.projects.forEach(p => {
      (p.tasks || []).forEach(t => {
        if (t.dueDate) {
          events.push({
            id: `task-${t.id}`,
            type: 'tasks',
            title: `Task Due: ${t.title}`,
            date: t.dueDate,
            color: 'bg-sky-50 text-sky-700 border-sky-200',
            icon: <CheckSquare className="h-3 w-3" />,
            raw: t,
            description: `Project: ${p.name}. Priority: ${t.priority}. Status: ${t.status}. Description: ${t.description}. Assigned To: ${t.assignedTo.join(', ')}`
          });
        }
      });
    });

    // Filter events
    if (filterType === 'All') return events;
    return events.filter(e => e.type === filterType);
  };

  const allEvents = compileEvents();

  // Navigation handlers
  const handlePrev = () => {
    const newD = new Date(currentDate);
    if (viewMode === 'month') {
      newD.setMonth(newD.getMonth() - 1);
    } else if (viewMode === 'week') {
      newD.setDate(newD.getDate() - 7);
    } else {
      newD.setDate(newD.getDate() - 1);
    }
    setCurrentDate(newD);
  };

  const handleNext = () => {
    const newD = new Date(currentDate);
    if (viewMode === 'month') {
      newD.setMonth(newD.getMonth() + 1);
    } else if (viewMode === 'week') {
      newD.setDate(newD.getDate() + 7);
    } else {
      newD.setDate(newD.getDate() + 1);
    }
    setCurrentDate(newD);
  };

  const handleToday = () => {
    setCurrentDate(new Date('2026-06-19'));
  };

  // MONTH VIEW RENDER
  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const currentMonth = currentDate.getMonth();

    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-center text-xs font-bold text-slate-500 py-3">
          {dayLabels.map(label => (
            <div key={label}>{label}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-150 border-l border-slate-150">
          {days.map((day, idx) => {
            const isCurrentMonth = day.getMonth() === currentMonth;
            const dateStr = formatYYYYMMDD(day);
            const isToday = dateStr === '2026-06-19';
            const dayEvents = allEvents.filter(e => e.date === dateStr);

            return (
              <div 
                key={idx} 
                className={`min-h-28 p-2 flex flex-col justify-between transition-colors hover:bg-slate-50/50 ${
                  isCurrentMonth ? 'bg-white' : 'bg-slate-50/40 text-slate-400'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold font-mono h-5 w-5 flex items-center justify-center rounded-full ${
                    isToday ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-700'
                  }`}>
                    {day.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[9px] bg-slate-100 font-bold text-slate-500 px-1.5 py-0.5 rounded-full">
                      {dayEvents.length} Event{dayEvents.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="flex-grow space-y-1 overflow-y-auto max-h-20 scrollbar-none pb-1">
                  {dayEvents.slice(0, 3).map(e => (
                    <button
                      key={e.id}
                      onClick={() => setSelectedEvent(e)}
                      className={`w-full text-left truncate text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 cursor-pointer transition active:scale-95 ${e.color}`}
                    >
                      {e.icon}
                      <span className="truncate">{e.title}</span>
                    </button>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[8px] font-extrabold text-slate-400 text-center uppercase">
                      + {dayEvents.length - 3} more events
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // WEEK VIEW RENDER
  const renderWeekView = () => {
    // Generate dates of current week
    const dayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - dayOfWeek);

    const weekDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      weekDays.push(d);
    }

    const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-7 divide-x divide-slate-150">
          {weekDays.map((day, idx) => {
            const dateStr = formatYYYYMMDD(day);
            const isToday = dateStr === '2026-06-19';
            const dayEvents = allEvents.filter(e => e.date === dateStr);

            return (
              <div key={idx} className="min-h-120 p-3 flex flex-col bg-white">
                <div className="text-center pb-3 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">{dayLabels[idx]}</p>
                  <p className={`text-md font-extrabold font-mono inline-block h-7 w-7 flex items-center justify-center rounded-full mt-1 mx-auto ${
                    isToday ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-800'
                  }`}>
                    {day.getDate()}
                  </p>
                </div>

                <div className="flex-grow space-y-2 mt-4 overflow-y-auto max-h-100 pb-2">
                  {dayEvents.map(e => (
                    <div 
                      key={e.id}
                      onClick={() => setSelectedEvent(e)}
                      className={`p-2.5 rounded-xl border flex flex-col gap-1.5 cursor-pointer transition hover:shadow-xs active:scale-95 ${e.color}`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wide">
                        {e.icon}
                        <span>{e.type}</span>
                      </div>
                      <p className="text-xs font-bold leading-tight">{e.title}</p>
                      {e.time && (
                        <span className="text-[9px] font-mono flex items-center gap-1 opacity-75">
                          <Clock className="h-2.5 w-2.5" />
                          <span>{e.time}</span>
                        </span>
                      )}
                    </div>
                  ))}
                  {dayEvents.length === 0 && (
                    <p className="text-center text-[10px] text-slate-300 font-semibold py-20 uppercase tracking-wider">No Events</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // DAY VIEW RENDER
  const renderDayView = () => {
    const dateStr = formatYYYYMMDD(currentDate);
    const dayEvents = allEvents.filter(e => e.date === dateStr);
    const isToday = dateStr === '2026-06-19';

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Day metrics summary */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/85 space-y-4">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Detailed Timeline</span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </h2>
            {isToday && (
              <span className="inline-block mt-2 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wider animate-pulse">
                Current Business Day
              </span>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl space-y-2">
            <p className="text-xs font-bold text-slate-600">Scheduler Summary</p>
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
              <span>Timeline Deliverables:</span>
              <span className="font-mono text-slate-800 font-bold">{dayEvents.length} active event{dayEvents.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 font-semibold">
              <span>Deadlines:</span>
              <span className="font-mono text-slate-800 font-bold">{dayEvents.filter(e => e.type === 'deadlines' || e.type === 'tasks').length} records</span>
            </div>
          </div>
        </div>

        {/* Right columns - Events list */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200/85">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-1.5">
            <CalendarIcon className="h-4.5 w-4.5 text-slate-500" />
            <span>Timeline Activities ({dayEvents.length})</span>
          </h3>

          <div className="space-y-3">
            {dayEvents.map(e => (
              <div 
                key={e.id}
                onClick={() => setSelectedEvent(e)}
                className={`p-4 rounded-2xl border flex items-start gap-3.5 cursor-pointer hover:shadow-xs transition active:scale-98 ${e.color}`}
              >
                <div className="p-2 bg-white/70 border border-current rounded-xl">
                  {e.icon}
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-extrabold uppercase tracking-widest">{e.type}</span>
                    {e.time && (
                      <span className="text-[10px] font-mono font-bold flex items-center gap-1 bg-white/55 px-2 py-0.5 rounded-full border border-current">
                        <Clock className="h-3 w-3" />
                        <span>{e.time}</span>
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">{e.title}</h4>
                  <p className="text-xs opacity-85 leading-relaxed">{e.description}</p>
                </div>
              </div>
            ))}
            {dayEvents.length === 0 && (
              <div className="text-center py-20 text-slate-400 font-semibold uppercase tracking-wider text-xs border border-dashed border-slate-200 rounded-2xl">
                No corporate activities or milestone deadlines registered on this date.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarIcon className="h-5.5 w-5.5 text-emerald-600" />
            <span>Corporate Calendar & Deliverables</span>
          </h2>
          <p className="text-xs text-slate-500">Cross-department schedules aggregating project deadlines, client meetings, invoice schedules, and employee leaves.</p>
        </div>

        {/* View togglers */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'month' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'week' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'day' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Day
          </button>
        </div>
      </div>

      {/* Controller toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-3xs">
        {/* Navigation triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={handleToday}
            className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-xs font-bold text-slate-750 transition"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 text-slate-600 transition"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          
          <h3 className="text-sm font-bold text-slate-800 ml-2 font-mono">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        {/* Categories selector */}
        <div className="flex items-center gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0">
          <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as CalendarType)}
            className="bg-transparent text-xs font-bold text-slate-650 focus:outline-none cursor-pointer"
          >
            <option value="All">All Deliverables</option>
            <option value="deadlines">Project Deadlines</option>
            <option value="meetings">Meetings</option>
            <option value="leaves">Approved Leaves</option>
            <option value="invoices">Invoice Due Dates</option>
            <option value="tasks">Assigned Tasks</option>
          </select>
        </div>
      </div>

      {/* CALENDAR VIEWS CORE MOUNT */}
      <div className="animate-fadeIn">
        {viewMode === 'month' && renderMonthView()}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      {/* EVENT DRILLDOWN MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 max-w-md w-full shadow-2xl animate-scaleUp text-left space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <span className="text-[10px] font-extrabold text-indigo-650 uppercase tracking-widest">{selectedEvent.type} Detail Log</span>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-xs"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2.5 items-start">
                <div className={`p-2 rounded-xl shrink-0 ${selectedEvent.color}`}>
                  {selectedEvent.icon}
                </div>
                <div>
                  <h4 className="text-md font-bold text-slate-900 leading-tight">{selectedEvent.title}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-1 font-semibold flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    <span>Target Date: {selectedEvent.date}</span>
                    {selectedEvent.time && (
                      <>
                        <span className="mx-1">•</span>
                        <Clock className="h-3 w-3" />
                        <span>{selectedEvent.time}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Details & Context</p>
                <p className="text-xs text-slate-650 leading-relaxed font-medium">
                  {selectedEvent.description}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
