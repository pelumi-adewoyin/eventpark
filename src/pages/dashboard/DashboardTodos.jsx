import { useState } from 'react';
import { Plus, CheckCircle, Circle, Clock, X, ChevronDown, Layers, Star, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const TEMPLATE_LIBRARY = [
  { id: 'wedding', label: 'Wedding', emoji: '💍', count: 28, eventType: 'private',
    tasks: ['Book venue (12 months before)', 'Hire wedding photographer (8 months)', 'Choose and order aso-ebi (4 months)', 'Confirm catering and menu tasting (3 months)', 'Send save-the-dates (6 months)', 'Book DJ / live band (6 months)', 'Finalise seating chart (2 weeks)', 'Final headcount confirmation (2 weeks)', 'Day-of timeline draft (1 week)', 'Confirm all vendor arrival times (3 days)', 'Prepare groom\'s speech', 'Book honeymoon accommodation', 'Order wedding cake', 'Arrange transport for VIP guests'] },
  { id: 'wedding_traditional', label: 'Traditional Wedding', emoji: '👘', count: 24, eventType: 'private',
    tasks: ['Family introduction meeting', 'Agree on bride price list', 'Order aso-oke fabrics', 'Book traditional caterers', 'Source souvenirs & party favors', 'Book live cultural band', 'Prepare engagement gift list', 'Confirm family travel arrangements', 'Order palm wine & traditional drinks', 'Hire MC for traditional ceremony'] },
  { id: 'birthday', label: 'Birthday Party', emoji: '🎂', count: 16, eventType: 'private',
    tasks: ['Choose theme', 'Book venue', 'Order birthday cake', 'Hire DJ or playlist', 'Order decorations', 'Design invitation cards', 'Send invitations (3 weeks before)', 'Book photographer / photo booth', 'Arrange souvenirs', 'Confirm final headcount (1 week)'] },
  { id: 'birthday_milestone', label: 'Milestone Birthday (50th/60th/70th)', emoji: '🎊', count: 22, eventType: 'private',
    tasks: ['Book premium venue (6 months out)', 'Commission tribute video', 'Arrange photo wall / memory wall', 'Coordinate speeches & tributes', 'Organise family travel logistics', 'Book live entertainment', 'Create commemorative programme', 'Order personalised gifts', 'Arrange family group photo shoot', 'Hire event coordinator'] },
  { id: 'naming', label: 'Naming Ceremony', emoji: '👶', count: 18, eventType: 'private',
    tasks: ['Book officiant / pastor', 'Source ceremony items (Bible, knife, etc.)', 'Order aso-ebi for family', 'Book catering', 'Order souvenirs for guests', 'Send invitations', 'Arrange décor', 'Book photographer', 'Confirm venue capacity', 'Prepare ceremony programme'] },
  { id: 'graduation', label: 'Graduation Party', emoji: '🎓', count: 12, eventType: 'private',
    tasks: ['Book restaurant or venue', 'Arrange family travel', 'Order graduation robe / gown', 'Book photographer', 'Prepare speeches', 'Organize after-party', 'Create guest list', 'Order celebration cake'] },
  { id: 'funeral', label: 'Funeral / Memorial', emoji: '🕊️', count: 20, eventType: 'private',
    tasks: ['Coordinate with mortuary', 'Book burial location', 'Design service programme', 'Arrange family travel logistics', 'Book repast venue & catering', 'Print order of service', 'Hire event MC', 'Arrange floral tributes', 'Coordinate security', 'Manage condolence register'] },
  { id: 'housewarming', label: 'Housewarming', emoji: '🏠', count: 10, eventType: 'private',
    tasks: ['Arrange furniture & staging', 'Plan catering & drinks', 'Create guest list', 'Send invitations', 'Arrange music / playlist', 'Plan house tour route', 'Order decorations', 'Arrange parking'] },
  { id: 'engagement', label: 'Engagement', emoji: '💎', count: 14, eventType: 'private',
    tasks: ['Choose & order ring', 'Family meeting logistics', 'Book photographer', 'Book venue for celebration', 'Send save-the-dates', 'Plan proposal moment', 'Arrange surprise elements', 'Book celebratory dinner'] },
  { id: 'retreat', label: 'Corporate Retreat', emoji: '🏕️', count: 26, eventType: 'corporate',
    tasks: ['Scout and book retreat venue (3 months)', 'Confirm headcount & departments', 'Arrange group transport', 'Collect dietary restrictions', 'Design retreat agenda', 'Book workshops / facilitators', 'Plan team-building activities', 'Arrange accommodation', 'Plan awards & recognition', 'Plan after-party / social event', 'Book photographer', 'Prepare swag bags'] },
  { id: 'conference', label: 'Conference / Summit', emoji: '📢', count: 32, eventType: 'corporate',
    tasks: ['Book conference venue (6 months)', 'Confirm keynote speakers', 'Secure sponsors', 'Set up ticket / registration system', 'Plan A/V & tech setup', 'Organise marketing campaign', 'Arrange catering for all days', 'Design event programme', 'Prepare press kit', 'Set up live streaming', 'Organize swag / merchandise', 'Arrange speaker accommodation', 'Set up registration desk', 'Plan networking sessions'] },
  { id: 'eoy_party', label: 'End-of-Year Party', emoji: '🎉', count: 18, eventType: 'corporate',
    tasks: ['Choose theme', 'Book venue', 'Plan awards ceremony', 'Set dress code', 'Book performers / DJ', 'Order souvenirs', 'Arrange catering', 'Plan team games', 'Coordinate speeches', 'Book photographer'] },
  { id: 'product_launch', label: 'Product Launch', emoji: '🚀', count: 22, eventType: 'corporate',
    tasks: ['Draft PR strategy', 'Plan product demo flow', 'Prepare press kit', 'Invite media & influencers', 'Set up live stream', 'Book venue & A/V', 'Design launch collateral', 'Arrange after-party', 'Prepare spokesperson talking points', 'Media follow-up plan'] },
  { id: 'concert', label: 'Concert / Show', emoji: '🎵', count: 24, eventType: 'public',
    tasks: ['Book venue & negotiate contract (6 months)', 'Obtain event permits', 'Book sound & lighting team', 'Hire security team', 'Launch marketing campaign', 'Set up ticket tiers (Paystack)', 'Confirm artist/performer bookings', 'Arrange backstage hospitality', 'Coordinate door management', 'Set up merch table', 'Arrange media passes', 'Day-of soundcheck schedule'] },
  { id: 'workshop', label: 'Workshop / Masterclass', emoji: '📚', count: 12, eventType: 'public',
    tasks: ['Develop curriculum & materials', 'Prepare slide deck', 'Book venue / zoom setup', 'Set up ticket system', 'Arrange catering (if in-person)', 'Set up recording equipment', 'Prepare certificates', 'Send pre-workshop resources', 'Follow-up survey'] },
  { id: 'popup_dinner', label: 'Pop-up Dinner', emoji: '🍽️', count: 14, eventType: 'public',
    tasks: ['Design seasonal menu', 'Source premium ingredients', 'Select wine pairings', 'Plan service flow', 'Book venue with kitchen access', 'Set ticket pricing & quantities', 'Hire service staff', 'Brief photographer', 'Source table décor', 'Plan playlist / ambient music'] },
];

const MOCK_TASKS = [
  { id: 1, text: 'Confirm catering menu tasting', done: false, due: 'May 10', priority: 'high', event: 'Tunde & Bola Wedding' },
  { id: 2, text: 'Finalise seating chart', done: false, due: 'May 20', priority: 'medium', event: 'Tunde & Bola Wedding' },
  { id: 3, text: 'Send remaining save-the-dates', done: true, priority: 'low', event: 'Tunde & Bola Wedding' },
  { id: 4, text: 'Book photographer', done: true, priority: 'high', event: 'Tunde & Bola Wedding' },
  { id: 5, text: 'Add venue details to invitations', done: false, due: 'May 15', priority: 'high', event: "Sister's Birthday Pop-up" },
  { id: 6, text: 'Create guest list', done: false, due: 'May 18', priority: 'medium', event: "Sister's Birthday Pop-up" },
  { id: 7, text: 'Order birthday cake', done: false, due: 'May 25', priority: 'medium', event: "Sister's Birthday Pop-up" },
];

const PRIORITY = {
  high: { label: 'High', cls: 'bg-red-100 text-red-600' },
  medium: { label: 'Medium', cls: 'bg-yellow-100 text-yellow-600' },
  low: { label: 'Low', cls: 'bg-gray-100 text-gray-500' },
};

const EVENTS = ['Tunde & Bola Wedding', "Sister's Birthday Pop-up", 'Mum\'s 60th Milestone'];

// ─── Template Preview Modal ───────────────────────────────────────────────────
function TemplatePreviewModal({ template, onUse, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <div className="px-6 pt-6 pb-4 border-b border-gray-50 flex items-start justify-between">
          <div>
            <div className="text-3xl mb-1">{template.emoji}</div>
            <h3 className="font-extrabold text-gray-900 text-lg">{template.label}</h3>
            <p className="text-sm text-gray-400">{template.count} tasks · spaced by event date</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors mt-1">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Sample tasks</p>
          <div className="space-y-2">
            {template.tasks.map((task, i) => (
              <div key={i} className="flex items-start gap-2.5 py-1.5">
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{task}</span>
              </div>
            ))}
            {template.count > template.tasks.length && (
              <p className="text-xs text-gray-400 pl-7.5">+ {template.count - template.tasks.length} more tasks included</p>
            )}
          </div>
        </div>
        <div className="px-6 pb-6 pt-4 border-t border-gray-50 space-y-2">
          <button onClick={onUse}
            className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2">
            <Check className="w-4 h-4" /> Use this template
          </button>
          <button onClick={onClose}
            className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Task Modal ───────────────────────────────────────────────────────────
function AddTaskModal({ onAdd, onClose }) {
  const [f, setF] = useState({ text: '', priority: 'medium', event: EVENTS[0], due: '' });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleAdd = () => {
    if (!f.text.trim()) { toast.error('Task name is required'); return; }
    onAdd({ id: Date.now(), text: f.text.trim(), done: false, priority: f.priority, event: f.event, due: f.due || undefined });
    toast.success('Task added!');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-extrabold text-gray-900">Add task</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Task <span className="text-red-400">*</span></label>
            <input autoFocus value={f.text} onChange={e => set('text', e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. Confirm catering menu"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Priority</label>
              <select value={f.priority} onChange={e => set('priority', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Due date</label>
              <input type="date" value={f.due} onChange={e => set('due', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Event</label>
            <select value={f.event} onChange={e => set('event', e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white">
              {EVENTS.map(ev => <option key={ev} value={ev}>{ev}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button onClick={handleAdd}
            className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-xl text-sm transition-colors">
            Add task
          </button>
          <button onClick={onClose}
            className="px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DashboardTodos() {
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [filter, setFilter] = useState('all');
  const [showTemplates, setShowTemplates] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const toggle = (id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const addTask = (task) => setTasks(prev => [...prev, task]);

  const useTemplate = (template) => {
    const newTasks = template.tasks.slice(0, 10).map((text, i) => ({
      id: Date.now() + i,
      text,
      done: false,
      priority: i < 3 ? 'high' : i < 6 ? 'medium' : 'low',
      event: EVENTS[0],
      due: undefined,
    }));
    setTasks(prev => [...prev, ...newTasks]);
    setPreviewTemplate(null);
    setShowTemplates(false);
    toast.success(`Loaded ${newTasks.length} tasks from ${template.label} template`);
  };

  const filtered = tasks.filter(t => {
    if (filter === 'pending') return !t.done;
    if (filter === 'done') return t.done;
    return true;
  });

  const doneCount = tasks.filter(t => t.done).length;

  const filteredTemplates = TEMPLATE_LIBRARY.filter(t => {
    const matchSearch = t.label.toLowerCase().includes(templateSearch.toLowerCase());
    const matchType = typeFilter === 'all' || t.eventType === typeFilter;
    return matchSearch && matchType;
  });

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
            className={`flex items-center gap-1.5 px-3 py-2 border text-sm font-medium rounded-xl transition-all ${showTemplates ? 'border-brand-300 text-brand-600 bg-brand-50' : 'border-gray-200 hover:border-brand-300 text-gray-600 hover:text-brand-600'}`}>
            <Layers className="w-4 h-4" />
            <span className="hidden sm:inline">Templates</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showTemplates ? 'rotate-180' : ''}`} />
          </button>
          <button onClick={() => setShowAddTask(true)}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-3 py-2 rounded-xl transition-colors">
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
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-bold text-gray-900">Choose a template</p>
            <div className="flex gap-1.5">
              {[['all', 'All'], ['private', 'Private'], ['corporate', 'Corporate'], ['public', 'Public']].map(([val, label]) => (
                <button key={val} onClick={() => setTypeFilter(val)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${typeFilter === val ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          <input value={templateSearch} onChange={e => setTemplateSearch(e.target.value)}
            placeholder="Search templates..."
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto">
            {filteredTemplates.map(t => (
              <button key={t.id}
                onClick={() => setPreviewTemplate(t)}
                className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-brand-300 hover:bg-brand-50 transition-all text-left group">
                <span className="text-xl flex-shrink-0">{t.emoji}</span>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-gray-800 truncate">{t.label}</div>
                  <div className="text-xs text-gray-400">{t.count} tasks</div>
                </div>
              </button>
            ))}
            {filteredTemplates.length === 0 && (
              <p className="col-span-3 text-center text-sm text-gray-400 py-4">No templates match your search</p>
            )}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
        {[['all', 'All'], ['pending', 'Pending'], ['done', 'Done']].map(([key, label]) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              filter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            {label}
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

        {/* Add task shortcut */}
        <button onClick={() => setShowAddTask(true)}
          className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-400 hover:text-brand-500 text-sm font-medium transition-all">
          <Plus className="w-4 h-4" />
          Add a task
        </button>
      </div>

      {/* Template preview modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          onUse={() => useTemplate(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
        />
      )}

      {/* Add task modal */}
      {showAddTask && (
        <AddTaskModal
          onAdd={addTask}
          onClose={() => setShowAddTask(false)}
        />
      )}
    </div>
  );
}
