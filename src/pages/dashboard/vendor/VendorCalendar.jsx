import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, Check } from 'lucide-react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function VendorCalendar() {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [blockedDates, setBlockedDates] = useState(new Set());
  const [selectedDate, setSelectedDate] = useState(null);
  const [availabilityMode, setAvailabilityMode] = useState('weekdays'); // 'weekdays' | 'custom'
  const [workingDays, setWorkingDays] = useState([1, 2, 3, 4, 5]); // Mon-Fri

  const { year, month } = current;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const prevMonth = () => {
    setCurrent(c => c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 });
  };
  const nextMonth = () => {
    setCurrent(c => c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 });
  };

  const dateKey = (d) => `${year}-${month + 1}-${d}`;
  const toggleBlocked = (d) => {
    const key = dateKey(d);
    setBlockedDates(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isToday = (d) => d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  const isPast = (d) => new Date(year, month, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const isBlocked = (d) => blockedDates.has(dateKey(d));
  const isWorkingDay = (d) => {
    const dayOfWeek = new Date(year, month, d).getDay();
    return workingDays.includes(dayOfWeek);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-ep-navy">Calendar</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your availability for bookings</p>
        </div>
      </div>

      {/* Availability mode */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
        <h2 className="text-sm font-bold text-ep-navy mb-4">Default availability</h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[{ id: 'weekdays', label: 'Weekdays only', sub: 'Mon–Fri' }, { id: 'custom', label: 'Custom days', sub: 'Choose specific days' }].map(m => (
            <button key={m.id} type="button" onClick={() => setAvailabilityMode(m.id)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${availabilityMode === m.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="text-sm font-bold text-ep-navy">{m.label}</div>
              <div className="text-xs text-gray-400">{m.sub}</div>
            </button>
          ))}
        </div>
        {availabilityMode === 'custom' && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Select your working days</p>
            <div className="flex gap-2">
              {DAYS.map((d, i) => (
                <button key={i} type="button"
                  onClick={() => setWorkingDays(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])}
                  className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${workingDays.includes(i) ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                  {d[0]}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <button type="button" onClick={prevMonth}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <h2 className="text-base font-bold text-ep-navy">{MONTHS[month]} {year}</h2>
          <button type="button" onClick={nextMonth}
            className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array(firstDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
          {Array(daysInMonth).fill(null).map((_, i) => {
            const d = i + 1;
            const past = isPast(d);
            const blocked = isBlocked(d);
            const working = isWorkingDay(d);
            const todayCell = isToday(d);
            return (
              <button
                key={d}
                type="button"
                onClick={() => !past && toggleBlocked(d)}
                disabled={past}
                className={`relative aspect-square rounded-xl flex items-center justify-center text-sm font-semibold transition-all
                  ${todayCell ? 'ring-2 ring-brand-500' : ''}
                  ${past ? 'text-gray-200 cursor-not-allowed' :
                    blocked ? 'bg-red-100 text-red-600 hover:bg-red-200' :
                    working ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                    'bg-gray-50 text-gray-400 hover:bg-gray-100'}
                `}
              >
                {d}
                {blocked && !past && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
          {[
            { color: 'bg-green-100', text: 'Available' },
            { color: 'bg-red-100', text: 'Blocked (click to toggle)' },
            { color: 'bg-gray-100', text: 'Unavailable / non-working day' },
          ].map(l => (
            <div key={l.text} className="flex items-center gap-1.5">
              <div className={`w-4 h-4 rounded-lg ${l.color}`} />
              <span className="text-xs text-gray-500">{l.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Save */}
      <button type="button"
        className="mt-5 w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
        <Check className="w-4 h-4" /> Save availability settings
      </button>
    </div>
  );
}
