import { useState } from 'react';
import { Plus, CheckCircle, Circle, Clock, ChevronDown, Calendar, Layers } from 'lucide-react';

const TEMPLATES = [
  { id: 'wedding', label: 'Wedding', emoji: '💍', count: 42 },
  { id: 'birthday', label: 'Birthday', emoji: '🎂', count: 18 },
  { id: 'corporate', label: 'Corporate', emoji: '🏢', count: 24 },
  { id: 'funeral', label: 'Burial', emoji: '🕊️', count: 16 },
  { id: 'babyshower', label: 'Baby Shower', emoji: '🍼', count: 14 },
  { id: 'graduation', label: 'Graduation', emoji: '🎓', count: 12 },
];

const mockTasks = [
  { id: 1, text: 'Confirm catering menu tasting', done: false, due: 'May 10', priority: 'high', event: 'Tunde & Bola Wedding' },
  { id: 2, text: 'Finalise seating chart', done: false, due: 'May 20', priority: 'medium', event: 'Tunde & Bola Wedding' },
  { id: 3, text: 'Send remaining save-the-dates', done: true, priority: 'low', event: 'Tunde & Bola Wedding' },
  { id: 4, text: 'Book photographer', done: true, priority: 'high', event: 'Tunde & Bola Wedding' },
  { id: 5, text: 'Add venue details', done: false, due: 'May 5', priority: 'high', event: "Sister's Birthday Pop-up" },
  { id: 6, text: 'Create guest list', done: false, due: 'May 15', priority: 'medium', event: "Sister's Birthday Pop-up" },
];

const PRIORITY = {
  high: { label: 'High', cls: 'bg-red-100 text-red-600' },
  medium: { label: 'Medium', cls: 'bg-yellow-100 text-yellow-600' },
  low: { label: 'Low', cls: 'bg-gray-100 text-gray-500' },
};

export default function DashboardTodos() {
  const [tasks, setTasks] = useState(mockTasks);
  const [filter, setFilter] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);

  const toggle = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const doneCount = tasks.filter(t => t.done).length;

  return (
    <div className="p-4 sm:p-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">To-Do List</h2>
          <p className="text-sm text-gray-400 mt-0.5">{doneCount}/{tasks.length} tasks completed</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 hover:border-brand-300 text-gray-600 hover:text-brand-600 text-sm font-medium rounded-xl transition-all">
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
          </button>
          <button className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-3 py-2 rounded-xl transition-colors">
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-6 mt-4">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-500"
          style={{ width: `${tasks.length ? (doneCount / tasks.length) * 100 : 0}%` }} />
      </div>

      {/* Template picker */}
      {showTemplates && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-5 shadow-sm">
          <p className="text-sm font-semibold text-gray-700 mb-4">Load a task template for your event type</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {TEMPLATES.map(t => (
              <button key={t.id}
                onClick={() => setShowTemplates(false)}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-brand-300 hover:bg-brand-50 transition-all text-left">
                <span className="text-2xl">{t.emoji}</span>
                <div>
                  <div className="text-sm font-bold text-gray-800">{t.label}</div>
                  <div className="text-xs text-gray-400">{t.count} tasks</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'done', label: 'Done' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === f.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      <div className="space-y-2">
        {filtered.map(task => {
          const priority = PRIORITY[task.priority];
          return (
            <div key={task.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                task.done ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white hover:border-brand-200 hover:shadow-sm'
              }`}>
              <button onClick={() => toggle(task.id)} className="mt-0.5 flex-shrink-0">
                {task.done
                  ? <CheckCircle className="w-5 h-5 text-green-500" />
                  : <Circle className="w-5 h-5 text-gray-300 hover:text-brand-400 transition-colors" />
                }
              </button>
              <div className="flex-grow min-w-0">
                <p className={`text-sm font-medium leading-snug ${task.done ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.text}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <span className="text-xs text-gray-400">{task.event}</span>
                  {task.due && !task.done && (
                    <span className="flex items-center gap-0.5 text-xs text-orange-500 font-medium">
                      <Clock className="w-3 h-3" /> Due {task.due}
                    </span>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold flex-shrink-0 ${priority.cls}`}>
                {priority.label}
              </span>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="font-medium text-sm">No tasks here</p>
          </div>
        )}

        {/* Add task row */}
        <button className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-400 hover:text-brand-500 text-sm font-medium transition-all">
          <Plus className="w-4 h-4" />
          Add a task
        </button>
      </div>
    </div>
  );
}
