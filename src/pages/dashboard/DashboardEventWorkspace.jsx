import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ChevronLeft, Share2, Edit2, Users, Clock, DollarSign, QrCode,
  Plus, Bell, Download, MoreHorizontal, Search, CheckSquare,
  Square, X, CheckCircle, Circle, Printer, ExternalLink,
  UserPlus, Mail, FileUp, ArrowRight, Trash2, CalendarDays,
  Copy, Check, Link as LinkIcon, Send,
} from 'lucide-react';

// ─── Shared mock data ────────────────────────────────────────────────────────

const EVENT = {
  id: 'evt-001',
  name: 'Tunde & Bola Wedding',
  date: 'Dec 14, 2026',
  venue: 'Eko Hotel & Suites, Lagos',
  status: 'Active',
  daysLeft: 253,
  coverGradient: 'from-brand-400 to-rose-500',
};

const AVATAR_GRADIENTS = [
  'from-brand-400 to-brand-600', 'from-rose-400 to-pink-600',
  'from-violet-400 to-purple-600', 'from-amber-400 to-orange-500',
  'from-teal-400 to-cyan-600', 'from-green-400 to-emerald-600',
  'from-sky-400 to-blue-600', 'from-fuchsia-400 to-pink-600',
];

const INITIAL_GUESTS = [
  { id: 1, name: 'Ngozi Okonkwo',    email: 'ngozi@email.com',   status: 'Accepted', date: 'May 2',   token: 'abc123' },
  { id: 2, name: 'Emeka Adeyemi',    email: 'emeka@email.com',   status: 'Accepted', date: 'May 1',   token: 'def456' },
  { id: 3, name: 'Bisi Williams',    email: 'bisi@email.com',    status: 'Pending',  date: null,      token: 'ghi789' },
  { id: 4, name: 'Kemi Johnson',     email: 'kemi@email.com',    status: 'Declined', date: 'Apr 30',  token: 'jkl012' },
  { id: 5, name: 'Aunty Grace',      email: 'grace@email.com',   status: 'Accepted', date: 'May 3',   token: 'mno345' },
  { id: 6, name: 'Tolu Okafor',      email: 'tolu@email.com',    status: 'Pending',  date: null,      token: 'pqr678' },
  { id: 7, name: 'Chukwuemeka F.',   email: 'chuks@email.com',   status: 'Accepted', date: 'May 2',   token: 'stu901' },
  { id: 8, name: 'Fatima Al-Rashid', email: 'fatima@email.com',  status: 'Pending',  date: null,      token: 'vwx234' },
];

// ─── IV templates ─────────────────────────────────────────────────────────────
const IV_TEMPLATES = [
  { id: 'royal-gold',    name: 'Royal Gold',      emoji: '👑', desc: 'Cream + gold serif, ornate borders',     suitable: ['wedding', 'traditional'] },
  { id: 'modern-min',   name: 'Modern Minimal',   emoji: '⬜', desc: 'White + black sans-serif, clean lines',  suitable: ['wedding', 'engagement'] },
  { id: 'lagos-sunset', name: 'Lagos Sunset',     emoji: '🌅', desc: 'Warm gradient, hand-lettered style',     suitable: ['wedding', 'anniversary'] },
  { id: 'confetti-pop', name: 'Confetti Pop',     emoji: '🎊', desc: 'Bright primary colors, playful',         suitable: ['birthday', 'naming'] },
  { id: 'classic-cream',name: 'Classic Cream',    emoji: '📜', desc: 'Cream + navy serif, timeless elegance',  suitable: ['anniversary', 'milestone'] },
  { id: 'garden-bloom', name: 'Garden Bloom',     emoji: '🌸', desc: 'Pastel florals, soft and romantic',      suitable: ['wedding', 'baby shower'] },
  { id: 'black-tie',    name: 'Black Tie',        emoji: '🎩', desc: 'Black + gold, sophisticated',            suitable: ['gala', 'milestone'] },
  { id: 'office-hours', name: 'Office Hours',     emoji: '🏢', desc: 'Clean sans-serif, brand-color accent',   suitable: ['corporate', 'townhall'] },
  { id: 'stage-light',  name: 'Stage Light',      emoji: '🎬', desc: 'High-contrast bold, dramatic',           suitable: ['concert', 'launch'] },
  { id: 'soft-earth',   name: 'Soft Earth',       emoji: '🌿', desc: 'Muted earth tones, warm and gentle',     suitable: ['memorial', 'funeral'] },
  { id: 'naija-print',  name: 'Naija Print',      emoji: '🦋', desc: 'Adire / aso-oke pattern, vibrant',       suitable: ['traditional', 'naming'] },
  { id: 'tech-talk',    name: 'Tech Talk',         emoji: '💻', desc: 'Geometric, monospace accents',           suitable: ['conference', 'launch'] },
];

const BUDGET_CATEGORIES = [
  { name: 'Venue',       amount: 650000,  color: 'bg-brand-400' },
  { name: 'Catering',    amount: 480000,  color: 'bg-rose-400' },
  { name: 'Photography', amount: 280000,  color: 'bg-violet-400' },
  { name: 'Decor',       amount: 200000,  color: 'bg-amber-400' },
  { name: 'Music',       amount: 80000,   color: 'bg-teal-400' },
];

const TOTAL_BUDGET = 2500000;
const TOTAL_SPENT  = 1690000;

const TODOS_DATA = [
  // Pre-event
  { id: 1, group: 'Pre-event',  text: 'Confirm catering menu tasting',        done: false, priority: 'high',   due: 'May 10', assignee: 'NO' },
  { id: 2, group: 'Pre-event',  text: 'Finalise seating chart',               done: false, priority: 'medium', due: 'May 20', assignee: 'EA' },
  { id: 3, group: 'Pre-event',  text: 'Send remaining save-the-dates',        done: true,  priority: 'low',    due: null,     assignee: 'BW' },
  { id: 4, group: 'Pre-event',  text: 'Book photographer',                    done: true,  priority: 'high',   due: null,     assignee: 'NO' },
  // Event day
  { id: 5, group: 'Event day',  text: 'Set up welcome table & check-in desk', done: false, priority: 'high',   due: 'Dec 14', assignee: 'TO' },
  { id: 6, group: 'Event day',  text: 'Brief MC on programme of events',      done: false, priority: 'medium', due: 'Dec 13', assignee: 'CF' },
  // Post-event
  { id: 7, group: 'Post-event', text: 'Send thank-you messages to guests',    done: false, priority: 'low',    due: 'Dec 17', assignee: 'AG' },
  { id: 8, group: 'Post-event', text: 'Settle outstanding vendor payments',   done: false, priority: 'high',   due: 'Dec 20', assignee: 'NO' },
];

const ACTIVITY = [
  { icon: '✅', text: 'Aunty Grace confirmed attendance',             time: '2h ago' },
  { icon: '💌', text: '14 new RSVPs from save-the-date link',         time: '5h ago' },
  { icon: '📷', text: 'Lens & Light confirmed your booking',          time: 'Yesterday' },
  { icon: '🎉', text: 'Event workspace created',                      time: '3d ago' },
  { icon: '🧾', text: 'Venue deposit of ₦650,000 logged',            time: '5d ago' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function initials(name) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
}

function AvatarCircle({ name, index, size = 'w-8 h-8' }) {
  const grad = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
  return (
    <div className={`${size} rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
      {initials(name)}
    </div>
  );
}

const STATUS_STYLES = {
  Accepted: 'bg-green-100 text-green-700',
  Pending:  'bg-amber-100 text-amber-700',
  Declined: 'bg-red-100 text-red-600',
  Invited:  'bg-blue-100 text-blue-700',
};

function StatusBadge({ status }) {
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}

const PRIORITY_STYLES = {
  high:   'bg-red-100 text-red-600',
  medium: 'bg-yellow-100 text-yellow-700',
  low:    'bg-gray-100 text-gray-500',
};

// ─── OVERVIEW TAB ────────────────────────────────────────────────────────────

function OverviewTab() {
  const budgetPct = Math.round((TOTAL_SPENT / TOTAL_BUDGET) * 100);
  const stats = [
    { icon: Clock,       label: 'Days to go',    value: EVENT.daysLeft, sub: EVENT.date,     color: 'bg-brand-50 text-brand-600' },
    { icon: Users,       label: 'RSVPs',         value: 32,             sub: '20 accepted',  color: 'bg-green-50 text-green-600' },
    { icon: DollarSign,  label: 'Budget used',   value: `${budgetPct}%`,sub: '₦1.69M spent', color: 'bg-orange-50 text-orange-500' },
    { icon: QrCode,      label: 'Check-in',      value: '0%',           sub: '0 checked in', color: 'bg-purple-50 text-purple-600' },
  ];

  const quickActions = [
    { label: 'Add guests',        icon: UserPlus,  onClick: () => {} },
    { label: 'Send reminders',    icon: Bell,      onClick: () => {} },
    { label: 'Export guest list', icon: Download,  onClick: () => {} },
    { label: 'Open check-in',     icon: QrCode,    onClick: () => {} },
  ];

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${s.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              <div className="text-xs text-gray-300 mt-0.5">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Quick action cards */}
      <div>
        <h3 className="font-bold text-gray-900 text-sm mb-3">Quick actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(a => {
            const Icon = a.icon;
            return (
              <button
                key={a.label}
                onClick={a.onClick}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-left hover:border-brand-300 hover:shadow-md transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center mb-3 group-hover:bg-brand-100 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-brand-700 transition-colors">{a.label}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="font-bold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {ACTIVITY.map((act, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{act.icon}</span>
              <div>
                <p className="text-xs text-gray-700 leading-snug">{act.text}</p>
                <p className="text-xs text-gray-400 mt-0.5">{act.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── ADD GUESTS MODAL ────────────────────────────────────────────────────────

const RELATIONSHIP_OPTIONS = ['Family', 'Friend', 'Colleague', 'Acquaintance', 'VIP', 'Plus-one'];

function AddGuestsModal({ onClose, onInvite }) {
  // steps: 1=method, 2=iv-template, 3=form, 4=preview
  const [step, setStep]         = useState(1);
  const [method, setMethod]     = useState(null);
  const [ivTemplate, setIvTemplate] = useState(IV_TEMPLATES[0]);
  const [queue, setQueue]       = useState([]);
  const [form, setForm]         = useState({ firstName: '', lastName: '', email: '', phone: '', relationship: '', tags: '' });
  const [emailBulk, setEmailBulk] = useState('');

  const STEP_LABELS = ['Method', 'Invitation', 'Add guests', 'Review'];

  function handleFormChange(field, val) {
    setForm(prev => ({ ...prev, [field]: val }));
  }

  function addToQueue(andClear = true) {
    if (!form.firstName || !form.email) {
      toast.error('First name and email are required.');
      return false;
    }
    const nonce = Math.random().toString(36).slice(2, 8);
    setQueue(prev => [...prev, { ...form, id: Date.now(), token: nonce }]);
    if (andClear) setForm({ firstName: '', lastName: '', email: '', phone: '', relationship: '', tags: '' });
    return true;
  }

  function parseBulkEmails() {
    const emails = emailBulk.split(/[\s,;]+/).map(e => e.trim()).filter(e => e.includes('@'));
    const newGuests = emails.map(email => ({
      id: Date.now() + Math.random(),
      firstName: '', lastName: '', email, phone: '', relationship: '', tags: '',
      token: Math.random().toString(36).slice(2, 8),
    }));
    setQueue(prev => [...prev, ...newGuests]);
    setEmailBulk('');
    if (newGuests.length) toast.success(`Added ${newGuests.length} email${newGuests.length !== 1 ? 's' : ''} to queue`);
  }

  function handleSend() {
    const finalQueue = method === 'manual' && form.firstName && form.email
      ? [...queue, { ...form, id: Date.now(), token: Math.random().toString(36).slice(2, 8) }]
      : queue;
    if (!finalQueue.length) { toast.error('Add at least one guest.'); return; }
    onInvite(finalQueue, ivTemplate);
    onClose();
    toast.success(`✓ Invited ${finalQueue.length} guest${finalQueue.length !== 1 ? 's' : ''} with "${ivTemplate.name}"`);
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">
            {STEP_LABELS[step - 1]}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 mb-6">
            {STEP_LABELS.map((label, i) => {
              const s = i + 1;
              return (
                <div key={label} className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                    step === s ? 'bg-brand-600 text-white' : step > s ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>{step > s ? '✓' : s}</div>
                  <span className={`text-xs font-medium truncate hidden sm:block ${step === s ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
                  {i < STEP_LABELS.length - 1 && <div className={`flex-1 h-px ${step > s ? 'bg-green-400' : 'bg-gray-200'}`} />}
                </div>
              );
            })}
          </div>

          {/* Step 1 — method */}
          {step === 1 && (
            <div className="space-y-3">
              {[
                { icon: UserPlus, title: 'Add manually',  desc: "Fill in each guest's name, email and phone. Best for small lists.",    method: 'manual' },
                { icon: Mail,     title: 'Email invite',   desc: "Paste email addresses — we'll collect names when guests accept.",      method: 'email' },
                { icon: FileUp,   title: 'CSV upload',     desc: 'Have a list in Excel or Sheets? Download our template and upload.',   method: 'csv' },
              ].map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.method}
                    onClick={() => { setMethod(m.method); setStep(2); }}
                    className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-2xl hover:border-brand-400 hover:bg-brand-50 text-left transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-100 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{m.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5 leading-snug">{m.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0 group-hover:text-brand-500 transition-colors" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Step 2 — IV template picker */}
          {step === 2 && (
            <div>
              <p className="text-sm text-gray-500 mb-4">Pick an invitation card. Your event details will be filled in automatically.</p>
              <div className="grid grid-cols-2 gap-2 mb-4 max-h-72 overflow-y-auto pr-1">
                {IV_TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setIvTemplate(t)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      ivTemplate?.id === t.id ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:border-brand-300 bg-white'
                    }`}
                  >
                    <div className="text-2xl mb-1.5">{t.emoji}</div>
                    <div className={`text-sm font-bold truncate ${ivTemplate?.id === t.id ? 'text-brand-800' : 'text-gray-900'}`}>{t.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5 leading-snug">{t.desc}</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStep(3)}
                disabled={!ivTemplate}
                className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-40 transition-colors"
              >
                Use "{ivTemplate?.name}" <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setIvTemplate(null); setStep(3); }}
                className="w-full mt-2 py-2 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Skip — use plain text invite
              </button>
            </div>
          )}

          {/* Step 3 — form */}
          {step === 3 && method === 'email' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Paste email addresses separated by commas, semicolons, or new lines.</p>
              <textarea
                value={emailBulk}
                onChange={e => setEmailBulk(e.target.value)}
                placeholder="ada@email.com, emeka@email.com&#10;bisi@email.com"
                rows={5}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400 resize-none font-mono"
              />
              {queue.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {queue.map(g => (
                    <span key={g.id} className="flex items-center gap-1 px-2.5 py-1 bg-brand-50 text-brand-700 text-xs rounded-full border border-brand-200">
                      {g.email}
                      <button onClick={() => setQueue(q => q.filter(x => x.id !== g.id))} className="hover:text-red-500 transition-colors"><X className="w-3 h-3" /></button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-2">
                <button onClick={parseBulkEmails}
                  className="w-full border border-gray-200 hover:border-brand-300 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-all">
                  Parse emails
                </button>
                <button onClick={() => { if (queue.length === 0 && emailBulk.trim()) parseBulkEmails(); setStep(4); }}
                  disabled={queue.length === 0 && !emailBulk.trim()}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-40">
                  Done — preview list
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — CSV upload */}
          {step === 3 && method === 'csv' && (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-300 transition-colors p-8 text-center">
                <FileUp className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-gray-700 mb-1">Drop your CSV here, or click to browse</p>
                <p className="text-xs text-gray-400 mb-4">Columns: First Name, Last Name, Email, Phone (optional)</p>
                <label className="cursor-pointer">
                  <span className="inline-block px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl transition-colors">
                    Choose file
                  </span>
                  <input type="file" accept=".csv" className="hidden" onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = ev => {
                      const lines = ev.target.result.split('\n').filter(Boolean).slice(1); // skip header
                      const parsed = lines.map((line, i) => {
                        const [firstName = '', lastName = '', email = '', phone = ''] = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                        return { id: Date.now() + i, firstName, lastName, email, phone, relationship: '', tags: '', token: Math.random().toString(36).slice(2, 8) };
                      }).filter(g => g.email.includes('@'));
                      if (parsed.length) {
                        setQueue(prev => [...prev, ...parsed]);
                        toast.success(`Imported ${parsed.length} guest${parsed.length !== 1 ? 's' : ''} from CSV`);
                        setStep(4);
                      } else {
                        toast.error('No valid emails found in CSV. Check column order.');
                      }
                    };
                    reader.readAsText(file);
                  }} />
                </label>
              </div>
              <a href="#" onClick={e => { e.preventDefault(); toast.success('Template downloaded!'); }}
                className="flex items-center justify-center gap-2 text-sm text-brand-600 hover:text-brand-700 font-semibold transition-colors">
                <Download className="w-4 h-4" /> Download CSV template
              </a>
              {queue.length > 0 && (
                <div className="flex items-center justify-between bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
                  <span className="text-sm text-brand-700 font-semibold">{queue.length} guests imported</span>
                  <button onClick={() => setStep(4)} className="px-3 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-lg hover:bg-brand-700 transition-colors">
                    Preview list →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 3 — form (manual) */}
          {step === 3 && method !== 'email' && method !== 'csv' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">First name *</label>
                  <input
                    value={form.firstName}
                    onChange={e => handleFormChange('firstName', e.target.value)}
                    placeholder="Ada"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 mb-1 block">Last name</label>
                  <input
                    value={form.lastName}
                    onChange={e => handleFormChange('lastName', e.target.value)}
                    placeholder="Okonkwo"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => handleFormChange('email', e.target.value)}
                  placeholder="ada@email.com"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Phone</label>
                <input
                  value={form.phone}
                  onChange={e => handleFormChange('phone', e.target.value)}
                  placeholder="+234 801 234 5678"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Relationship</label>
                <select
                  value={form.relationship}
                  onChange={e => handleFormChange('relationship', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400 bg-white"
                >
                  <option value="">Select…</option>
                  {RELATIONSHIP_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Tags (comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={e => handleFormChange('tags', e.target.value)}
                  placeholder="bride side, table 3"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>

              {queue.length > 0 && (
                <p className="text-xs text-brand-600 font-semibold">{queue.length} guest{queue.length !== 1 ? 's' : ''} in queue</p>
              )}

              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => addToQueue(true)}
                  className="w-full border border-gray-200 hover:border-brand-300 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-all"
                >
                  Add to queue
                </button>
                <button
                  onClick={() => { if (addToQueue(false)) setForm({ firstName: '', lastName: '', email: '', phone: '', relationship: '', tags: '' }); }}
                  className="w-full border border-gray-200 hover:border-brand-300 text-gray-700 text-sm font-semibold py-2.5 rounded-xl transition-all"
                >
                  Add and add another
                </button>
                <button
                  onClick={() => { if (form.firstName && form.email) addToQueue(true); setStep(4); }}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors"
                >
                  Done — preview list
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — preview */}
          {step === 4 && (
            <div className="space-y-4">
              {queue.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No guests in queue. Go back and add some.</p>
              ) : (
                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left text-xs font-semibold text-gray-400 px-4 py-2.5">Name</th>
                        <th className="text-left text-xs font-semibold text-gray-400 px-4 py-2.5">Email</th>
                        <th className="px-2 py-2.5 w-8" />
                      </tr>
                    </thead>
                    <tbody>
                      {queue.map((g, i) => (
                        <tr key={g.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                          <td className="px-4 py-2.5 font-medium text-gray-800 text-xs">{g.firstName} {g.lastName}</td>
                          <td className="px-4 py-2.5 text-gray-400 text-xs">{g.email}</td>
                          <td className="px-2 py-2.5">
                            <button onClick={() => setQueue(prev => prev.filter(q => q.id !== g.id))} className="text-gray-300 hover:text-red-500 transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-2">
                <button onClick={() => setStep(3)} className="flex-1 border border-gray-200 text-gray-700 text-sm font-semibold py-2.5 rounded-xl hover:border-gray-300 transition-all">
                  ← Add more
                </button>
                <button onClick={handleSend} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                  Send invitations ({queue.length})
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── GUESTS TAB ──────────────────────────────────────────────────────────────

function CopyLinkButton({ token }) {
  const [copied, setCopied] = useState(false);
  const url = `https://eventpark.ng/rsvp/${token}`;
  const doCopy = () => {
    navigator.clipboard?.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={doCopy}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
        copied ? 'bg-green-50 text-green-700 border-green-200' : 'border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600'
      }`}>
      {copied ? <><Check className="w-3 h-3" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
    </button>
  );
}

function ReminderModal({ count, onSend, onClose, eventName = EVENT.name, eventDate = EVENT.date }) {
  const [subject, setSubject] = useState(`Don't forget — ${eventName} on ${eventDate}`);
  const [body, setBody]       = useState(`Hi {first_name},\n\nJust a friendly reminder — we'd love to know if you can make it!\n\nClick below to confirm your attendance.\n\nWith love,\nYour host`);
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-900">Send reminder to {count} guest{count !== 1 ? 's' : ''}</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Subject</label>
            <input value={subject} onChange={e => setSubject(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block">Message</label>
            <textarea rows={6} value={body} onChange={e => setBody(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-400 resize-none" />
            <p className="text-xs text-gray-400 mt-1">Use <span className="font-mono bg-gray-100 px-1 rounded">{'{'+'first_name}'}</span> to personalise.</p>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onClose}
              className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={() => { onSend(); onClose(); toast.success(`✓ Reminder sent to ${count} guest${count !== 1 ? 's' : ''}`); }}
              className="flex-1 bg-brand-600 hover:bg-brand-700 text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 transition-colors">
              <Send className="w-4 h-4" /> Send now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function GuestsTab() {
  const [guests, setGuests]           = useState(INITIAL_GUESTS);
  const [guestTab, setGuestTab]       = useState('All');
  const [search, setSearch]           = useState('');
  const [selected, setSelected]       = useState([]);
  const [showModal, setShowModal]     = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  const TABS_STATUS = ['All', 'Accepted', 'Pending', 'Declined'];

  const filteredGuests = guests.filter(g => {
    if (guestTab !== 'All' && g.status !== guestTab) return false;
    if (search && !g.name.toLowerCase().includes(search.toLowerCase()) &&
        !g.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pendingCount = guests.filter(g => g.status === 'Pending' || g.status === 'Invited').length;

  function toggleSelect(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function toggleAll() {
    if (selected.length === filteredGuests.length) setSelected([]);
    else setSelected(filteredGuests.map(g => g.id));
  }

  function handleInvite(queue, ivTemplate) {
    const newGuests = queue.map((g, i) => ({
      id: Date.now() + i,
      name: `${g.firstName || ''} ${g.lastName || ''}`.trim() || g.email,
      email: g.email,
      status: 'Invited',
      date: null,
      token: g.token || Math.random().toString(36).slice(2, 8),
    }));
    setGuests(prev => [...prev, ...newGuests]);
  }

  const stats = [
    { label: 'Invited',  val: guests.length, cls: 'text-gray-900' },
    { label: 'Accepted', val: guests.filter(g => g.status === 'Accepted').length, cls: 'text-green-600' },
    { label: 'Pending',  val: pendingCount, cls: 'text-amber-600' },
    { label: 'Declined', val: guests.filter(g => g.status === 'Declined').length, cls: 'text-red-600' },
  ];

  return (
    <div className="space-y-4">
      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <div className={`text-2xl font-extrabold ${s.cls}`}>{s.val}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Smart reminder prompt */}
      {pendingCount > 3 && (
        <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-amber-800">
            <Bell className="w-4 h-4 flex-shrink-0" />
            <span><strong>{pendingCount} guests</strong> haven't responded yet — send a reminder?</span>
          </div>
          <button onClick={() => setShowReminder(true)}
            className="flex-shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors">
            Send reminder
          </button>
        </div>
      )}

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors">
          <Plus className="w-4 h-4" /> Add guests
        </button>
        <button onClick={() => setShowReminder(true)}
          className="flex items-center gap-1.5 border border-gray-200 hover:border-brand-300 text-gray-600 hover:text-brand-600 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
          <Bell className="w-4 h-4" /> Send reminder
        </button>
        <button onClick={() => toast.success('Guest list exported!')}
          className="flex items-center gap-1.5 border border-gray-200 hover:border-brand-300 text-gray-600 hover:text-brand-600 text-sm font-semibold px-4 py-2 rounded-xl transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Bulk action bar */}
      {selected.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3">
          <span className="text-sm font-semibold text-brand-700">{selected.length} selected</span>
          {['Resend invite', 'Send reminder', 'Mark accepted', 'Remove'].map(action => (
            <button key={action}
              onClick={() => {
                if (action === 'Remove') { setGuests(prev => prev.filter(g => !selected.includes(g.id))); setSelected([]); }
                else if (action === 'Send reminder') setShowReminder(true);
                else toast.success(`${action} — done`);
              }}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                action === 'Remove' ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-brand-200 text-brand-700 hover:bg-brand-100'
              }`}>
              {action}
            </button>
          ))}
        </div>
      )}

      {/* Guest table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Search name or email…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-brand-400 placeholder:text-gray-400" />
            </div>
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-shrink-0 overflow-x-auto">
              {TABS_STATUS.map(tab => (
                <button key={tab} onClick={() => setGuestTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                    guestTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="px-4 py-3 w-10">
                  <button onClick={toggleAll} className="text-gray-400 hover:text-gray-600 transition-colors">
                    {selected.length === filteredGuests.length && filteredGuests.length > 0
                      ? <CheckSquare className="w-4 h-4 text-brand-600" />
                      : <Square className="w-4 h-4" />}
                  </button>
                </th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Guest</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden md:table-cell">Responded</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-3 hidden lg:table-cell">Accept link</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest, idx) => (
                <tr key={guest.id}
                  className={`border-b border-gray-50 hover:bg-brand-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleSelect(guest.id)} className="text-gray-400 hover:text-brand-600 transition-colors">
                      {selected.includes(guest.id) ? <CheckSquare className="w-4 h-4 text-brand-600" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <AvatarCircle name={guest.name} index={idx} />
                      <div className="min-w-0">
                        <p className="font-medium text-gray-900 truncate">{guest.name}</p>
                        <p className="text-xs text-gray-400 truncate">{guest.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={guest.status} /></td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs text-gray-400">{guest.date ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {guest.token && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 font-mono truncate max-w-[120px]">/rsvp/{guest.token}</span>
                        <CopyLinkButton token={guest.token} />
                        <a href={`/rsvp/${guest.token}`} target="_blank" rel="noreferrer"
                          className="text-gray-400 hover:text-brand-600 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredGuests.length === 0 && (
                <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">No guests match your filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test-links panel (visible below table — simulates the Test Links tab) */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-brand-600" /> 🔗 Test links
            </h4>
            <p className="text-xs text-gray-400 mt-0.5">Use these to preview the RSVP flow without sending emails.</p>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Email not wired yet</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70">
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-2.5">Guest</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-2.5">Accept link</th>
                <th className="text-left text-xs font-semibold text-gray-400 px-4 py-2.5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.filter(g => g.token).map((guest, idx) => (
                <tr key={guest.id} className={`border-b border-gray-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <td className="px-4 py-2.5">
                    <div className="font-medium text-gray-800 text-xs">{guest.name}</div>
                    <div className="text-gray-400 text-xs">{guest.email}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs font-mono text-gray-500">eventpark.ng/rsvp/{guest.token}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <CopyLinkButton token={guest.token} />
                      <a href={`/rsvp/${guest.token}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:border-brand-300 hover:text-brand-600 transition-all">
                        <ExternalLink className="w-3 h-3" /> Open
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <AddGuestsModal onClose={() => setShowModal(false)} onInvite={handleInvite} />}
      {showReminder && <ReminderModal count={pendingCount} onSend={() => {}} onClose={() => setShowReminder(false)} />}
    </div>
  );
}

// ─── BUDGET TAB ───────────────────────────────────────────────────────────────

function BudgetTab() {
  const [showModal, setShowModal] = useState(false);
  const [expense, setExpense]     = useState({ category: '', amount: '', description: '', date: '' });

  const spent      = TOTAL_SPENT;
  const remaining  = TOTAL_BUDGET - spent;
  const budgetPct  = Math.round((spent / TOTAL_BUDGET) * 100);
  const maxCat     = Math.max(...BUDGET_CATEGORIES.map(c => c.amount));

  function handleAddExpense() {
    if (!expense.category || !expense.amount) { toast.error('Category and amount are required.'); return; }
    toast.success(`✓ Expense logged: ₦${Number(expense.amount).toLocaleString()}`);
    setExpense({ category: '', amount: '', description: '', date: '' });
    setShowModal(false);
  }

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Total budget', val: `₦${(TOTAL_BUDGET / 1000000).toFixed(1)}M`, cls: 'text-gray-900' },
            { label: 'Spent',        val: `₦${(spent / 1000000).toFixed(2)}M`,        cls: 'text-orange-600' },
            { label: 'Remaining',    val: `₦${(remaining / 1000000).toFixed(2)}M`,    cls: 'text-green-600' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className={`text-xl font-extrabold ${s.cls}`}>{s.val}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all duration-500"
            style={{ width: `${budgetPct}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-1.5 text-right">{budgetPct}% used</p>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Category Breakdown</h3>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 text-sm font-bold bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-xl transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add expense
          </button>
        </div>
        <div className="space-y-3">
          {BUDGET_CATEGORIES.map(cat => {
            const pct = Math.round((cat.amount / maxCat) * 100);
            return (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{cat.name}</span>
                  <span className="text-gray-500 font-semibold">₦{cat.amount.toLocaleString()}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${cat.color} transition-all duration-500`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add expense modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Add Expense</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Category *</label>
                <select
                  value={expense.category}
                  onChange={e => setExpense(p => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400 bg-white"
                >
                  <option value="">Select category…</option>
                  {BUDGET_CATEGORIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Amount (₦) *</label>
                <input
                  type="number"
                  value={expense.amount}
                  onChange={e => setExpense(p => ({ ...p, amount: e.target.value }))}
                  placeholder="50000"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Description</label>
                <input
                  value={expense.description}
                  onChange={e => setExpense(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. Deposit for DJ"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 mb-1 block">Date</label>
                <input
                  type="date"
                  value={expense.date}
                  onChange={e => setExpense(p => ({ ...p, date: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-brand-400"
                />
              </div>
              <button onClick={handleAddExpense} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors mt-1">
                Log expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TODOS TAB ────────────────────────────────────────────────────────────────

function TodosTab() {
  const [tasks, setTasks] = useState(TODOS_DATA);

  function toggle(id) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  const groups = [...new Set(tasks.map(t => t.group))];

  return (
    <div className="space-y-5">
      {groups.map(group => (
        <div key={group} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{group}</h4>
          <div className="space-y-2">
            {tasks.filter(t => t.group === group).map(task => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                  task.done ? 'border-gray-100 bg-gray-50' : 'border-gray-200 bg-white hover:border-brand-200 hover:shadow-sm'
                }`}
              >
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
                  {task.due && !task.done && (
                    <p className="text-xs text-orange-500 font-medium mt-0.5 flex items-center gap-0.5">
                      <CalendarDays className="w-3 h-3" /> Due {task.due}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${PRIORITY_STYLES[task.priority]}`}>
                    {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                  </span>
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                    {task.assignee}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button className="w-full flex items-center gap-3 p-4 rounded-2xl border-2 border-dashed border-gray-200 hover:border-brand-300 hover:bg-brand-50 text-gray-400 hover:text-brand-500 text-sm font-medium transition-all">
        <Plus className="w-4 h-4" />
        Add a task
      </button>
    </div>
  );
}

// ─── CHECK-IN TAB ─────────────────────────────────────────────────────────────

function CheckInTab() {
  return (
    <div className="space-y-4">
      {/* Pre-event state */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-50 flex items-center justify-center">
          <QrCode className="w-8 h-8 text-purple-600" />
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2">Check-in not yet open</h3>
        <p className="text-sm text-gray-400 mb-6">
          Check-in opens 2 hours before your event · Currently <span className="font-semibold text-gray-600">{EVENT.daysLeft} days away</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/checkin/evt-001"
            className="flex items-center justify-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Open check-in now
          </Link>
          <button className="flex items-center justify-center gap-1.5 border border-gray-200 hover:border-gray-300 text-gray-700 font-semibold text-sm px-5 py-2.5 rounded-xl transition-all">
            <Printer className="w-4 h-4" />
            Print attendee list
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total expected', val: 32, cls: 'text-gray-900' },
          { label: 'Checked in',    val: 0,  cls: 'text-green-600' },
          { label: 'Check-in rate', val: '0%', cls: 'text-purple-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-2xl font-extrabold ${s.cls}`}>{s.val}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex justify-between text-xs text-gray-400 mb-1.5">
          <span>Check-in progress</span>
          <span>0 / 32</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-500" style={{ width: '0%' }} />
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const TABS = ['Overview', 'Guests', 'Budget', 'To-dos', 'Check-in'];

export default function DashboardEventWorkspace() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('Overview');

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      {/* Back link */}
      <Link
        to="/dashboard/events"
        className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-brand-600 font-medium mb-4 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        My Events
      </Link>

      {/* Event header card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex mb-4">
        {/* Cover strip */}
        <div className={`w-10 flex-shrink-0 bg-gradient-to-b ${EVENT.coverGradient}`} />

        <div className="flex-grow p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-extrabold text-xl text-gray-900 truncate">{EVENT.name}</h2>
              <p className="text-sm text-gray-400 mt-0.5">{EVENT.date} · {EVENT.venue}</p>
              <div className="mt-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-green-100 text-green-700">
                  {EVENT.status}
                </span>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button className="flex items-center gap-1.5 border border-gray-200 hover:border-brand-300 text-gray-600 hover:text-brand-600 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all">
                <Share2 className="w-3.5 h-3.5" /> Share
              </button>
              <button className="flex items-center gap-1.5 border border-gray-200 hover:border-brand-300 text-gray-600 hover:text-brand-600 text-sm font-semibold px-3 py-1.5 rounded-xl transition-all">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex gap-0 border-b border-gray-100 mb-6 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'Overview'  && <OverviewTab />}
      {activeTab === 'Guests'    && <GuestsTab />}
      {activeTab === 'Budget'    && <BudgetTab />}
      {activeTab === 'To-dos'    && <TodosTab />}
      {activeTab === 'Check-in'  && <CheckInTab />}
    </div>
  );
}
