// DEPRECATED: This component is no longer mounted.
// /corporate now redirects to /dashboard which renders corporate pages from the corporate/ folder.
// This file is kept to avoid import errors until cleaned up.

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Calendar, Users, DollarSign, Wallet, Bell, Building2,
  ChevronRight, ChevronDown, CheckCircle, AlertCircle, ArrowUpRight,
  FileText, TrendingUp, LogOut, BarChart2, Settings, Clock, Shield,
  Send, Download, Search, Filter, MoreVertical, Eye, Edit2, Trash2,
  Package, ShoppingCart, Receipt, Layers, Globe, Link2, UserPlus,
  AlertTriangle, XCircle, Check, X, RefreshCw, Hash, Lock, Zap,
  MapPin, Phone, Mail, Star, Flag, ChevronLeft, Upload, FileUp,
  Briefcase, CreditCard, PieChart, Activity, ArrowDownLeft, ArrowUpRight as AUR
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (n) => '₦' + Number(n).toLocaleString('en-NG');
const pct = (a, b) => b ? Math.min(100, Math.round((a / b) * 100)) : 0;
const statusColor = { active: 'green', planning: 'blue', completed: 'gray', cancelled: 'red' };
const pill = (s) => {
  const c = { active:'green', planning:'blue', approved:'green', pending:'yellow', rejected:'red', sent:'blue', draft:'gray', awarded:'purple', matched:'green', partial:'yellow', unmatched:'red' }[s] || 'gray';
  return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-${c}-100 text-${c}-700`;
};

// ─── MOCK DATA ───────────────────────────────────────────────────────────────
const COMPANY = { name: 'Nexus Corp Ltd', kyb: 3, plan: 'Enterprise', walletBalance: 48_200_000, pendingOut: 23_400_000 };

const CORP_EVENTS = [
  { id:'e1', title:'2026 Annual Company Retreat', type:'Internal', date:'Aug 15–17, 2026', budget:40_000_000, spent:12_400_000, headcount:250, rsvpd:198, status:'active', approvalsPending:2, location:'Transcorp Hilton, Abuja' },
  { id:'e2', title:'Q2 All-Hands Town Hall', type:'Internal', date:'Jun 30, 2026', budget:3_500_000, spent:800_000, headcount:250, rsvpd:210, status:'planning', approvalsPending:0, location:'HQ Auditorium' },
  { id:'e3', title:'Product Launch — NexGen Suite', type:'External', date:'Jul 22, 2026', budget:15_000_000, spent:4_200_000, headcount:500, rsvpd:312, status:'active', approvalsPending:1, location:'Eko Hotel, Lagos' },
];

const EMPLOYEES = [
  { id:'emp1', name:'Chioma Nwosu', role:'Event Organizer', dept:'Marketing', email:'c.nwosu@nexuscorp.ng', status:'active', avatar:'CN' },
  { id:'emp2', name:'Emeka Fadeyi', role:'Finance', dept:'Finance', email:'e.fadeyi@nexuscorp.ng', status:'active', avatar:'EF' },
  { id:'emp3', name:'Bola Adeyemi', role:'Approver', dept:'Operations', email:'b.adeyemi@nexuscorp.ng', status:'active', avatar:'BA' },
  { id:'emp4', name:'Ngozi Eze', role:'Procurement', dept:'Procurement', email:'n.eze@nexuscorp.ng', status:'active', avatar:'NE' },
  { id:'emp5', name:'Tunde Olaiya', role:'Admin', dept:'HR', email:'t.olaiya@nexuscorp.ng', status:'active', avatar:'TO' },
  { id:'emp6', name:'Fatima Usman', role:'Comms', dept:'Comms', email:'f.usman@nexuscorp.ng', status:'inactive', avatar:'FU' },
];

const DEPARTMENTS = [
  { id:'d1', name:'Marketing', head:'Chioma Nwosu', members:14, budget:5_000_000 },
  { id:'d2', name:'Finance', head:'Emeka Fadeyi', members:8, budget:2_000_000 },
  { id:'d3', name:'Operations', head:'Bola Adeyemi', members:22, budget:3_500_000 },
  { id:'d4', name:'Procurement', head:'Ngozi Eze', members:6, budget:1_200_000 },
  { id:'d5', name:'HR', head:'Tunde Olaiya', members:10, budget:1_800_000 },
];

const APPROVAL_ITEMS = [
  { id:'ap1', type:'PO', ref:'PO-2026-041', event:'Annual Retreat', vendor:'Transcorp Hilton', amount:8_500_000, requestedBy:'Chioma Nwosu', date:'2026-05-04', urgency:'high', status:'pending', notes:'Venue deposit — deadline May 10' },
  { id:'ap2', type:'PO', ref:'PO-2026-042', event:'Annual Retreat', vendor:'Royal Caterers', amount:12_000_000, requestedBy:'Chioma Nwosu', date:'2026-05-05', urgency:'medium', status:'pending', notes:'Full catering engagement' },
  { id:'ap3', type:'Invoice', ref:'INV-0089', event:'Product Launch', vendor:'AV Solutions Ng', amount:2_800_000, requestedBy:'Emeka Fadeyi', date:'2026-05-05', urgency:'medium', status:'pending', notes:'Final AV invoice' },
  { id:'ap4', type:'Expense', ref:'EXP-1102', event:'Town Hall', vendor:'Staff Reimbursements', amount:185_000, requestedBy:'Tunde Olaiya', date:'2026-05-03', urgency:'low', status:'pending', notes:'Travel reimbursements batch' },
  { id:'ap5', type:'RFQ Award', ref:'RFQ-2026-007', event:'Annual Retreat', vendor:'Skyline Photography', amount:1_200_000, requestedBy:'Ngozi Eze', date:'2026-05-02', urgency:'low', status:'pending', notes:'Award photography contract' },
];

const VENDORS = [
  { id:'v1', name:'Transcorp Hilton', category:'Venue', email:'events@transcorp.ng', phone:'0802-111-2222', rating:4.8, status:'preferred', totalPaid:0 },
  { id:'v2', name:'Royal Caterers', category:'Catering', email:'info@royalcaterers.ng', phone:'0803-222-3333', rating:4.5, status:'preferred', totalPaid:3_200_000 },
  { id:'v3', name:'AV Solutions Ng', category:'Tech & AV', email:'sales@avsolutions.ng', phone:'0804-333-4444', rating:4.2, status:'active', totalPaid:1_400_000 },
  { id:'v4', name:'Skyline Photography', category:'Photography', email:'hello@skyline.ng', phone:'0805-444-5555', rating:4.7, status:'active', totalPaid:0 },
  { id:'v5', name:'FastMove Logistics', category:'Transport', email:'ops@fastmove.ng', phone:'0806-555-6666', rating:3.9, status:'active', totalPaid:850_000 },
  { id:'v6', name:'Dodgy Prints Ltd', category:'Print', email:'info@dodgy.ng', phone:'0807-666-7777', rating:2.1, status:'blacklisted', totalPaid:0 },
];

const RFQS = [
  { id:'r1', ref:'RFQ-2026-007', title:'Photography & Videography – Annual Retreat', event:'Annual Retreat', responses:3, deadline:'2026-05-15', status:'awarded', awarded:'Skyline Photography' },
  { id:'r2', ref:'RFQ-2026-008', title:'DJ & Entertainment', event:'Annual Retreat', responses:2, deadline:'2026-05-20', status:'open', awarded:null },
  { id:'r3', ref:'RFQ-2026-009', title:'Branded Souvenirs', event:'Product Launch', responses:5, deadline:'2026-05-18', status:'evaluating', awarded:null },
  { id:'r4', ref:'RFQ-2026-010', title:'Conference Chairs Rental', event:'Town Hall', responses:0, deadline:'2026-06-01', status:'draft', awarded:null },
];

const POS = [
  { id:'po1', ref:'PO-2026-041', vendor:'Transcorp Hilton', event:'Annual Retreat', amount:8_500_000, issued:'2026-05-04', status:'pending_approval', grDone:false },
  { id:'po2', ref:'PO-2026-042', vendor:'Royal Caterers', event:'Annual Retreat', amount:12_000_000, issued:'2026-05-05', status:'pending_approval', grDone:false },
  { id:'po3', ref:'PO-2026-039', vendor:'AV Solutions Ng', event:'Product Launch', amount:2_800_000, issued:'2026-04-28', status:'approved', grDone:true },
  { id:'po4', ref:'PO-2026-038', vendor:'FastMove Logistics', event:'Annual Retreat', amount:1_500_000, issued:'2026-04-25', status:'approved', grDone:false },
  { id:'po5', ref:'PO-2026-035', vendor:'Skyline Photography', event:'Annual Retreat', amount:1_200_000, issued:'2026-04-20', status:'approved', grDone:false },
];

const INVOICES = [
  { id:'i1', ref:'INV-0089', vendor:'AV Solutions Ng', po:'PO-2026-039', event:'Product Launch', amount:2_800_000, vat:210_000, wht:140_000, net:2_870_000, status:'matched', matchStatus:'matched', date:'2026-05-01' },
  { id:'i2', ref:'INV-0090', vendor:'Royal Caterers', po:'PO-2026-042', event:'Annual Retreat', amount:12_000_000, vat:900_000, wht:600_000, net:12_300_000, status:'pending_approval', matchStatus:'partial', date:'2026-05-05' },
  { id:'i3', ref:'INV-0088', vendor:'FastMove Logistics', po:'PO-2026-038', event:'Annual Retreat', amount:1_500_000, vat:112_500, wht:75_000, net:1_537_500, status:'unmatched', matchStatus:'unmatched', date:'2026-04-30' },
];

const WALLET_TXS = [
  { id:'w1', type:'credit', desc:'Top-up via bank transfer', amount:50_000_000, date:'2026-05-01', ref:'TRF-9821', balance:50_000_000 },
  { id:'w2', type:'debit', desc:'PO-2026-039 – AV Solutions Ng', amount:2_800_000, date:'2026-05-02', ref:'PO-2026-039', balance:47_200_000 },
  { id:'w3', type:'debit', desc:'PO-2026-038 – FastMove Logistics', amount:1_000_000, date:'2026-05-03', ref:'PO-2026-038', balance:46_200_000 },
  { id:'w4', type:'credit', desc:'Top-up via bank transfer', amount:5_000_000, date:'2026-05-04', ref:'TRF-9902', balance:51_200_000 },
  { id:'w5', type:'debit', desc:'Staff reimbursements – EXP-1101', amount:3_000_000, date:'2026-05-05', ref:'EXP-1101', balance:48_200_000 },
];

const AUDIT_ENTRIES = [
  { id:'au1', ts:'2026-05-05 14:32', actor:'Chioma Nwosu', action:'Created PO', detail:'PO-2026-042 – Royal Caterers ₦12,000,000', hash:'a3f9c1' },
  { id:'au2', ts:'2026-05-05 11:10', actor:'Emeka Fadeyi', action:'Approved Invoice', detail:'INV-0089 – AV Solutions Ng', hash:'b7e2d4' },
  { id:'au3', ts:'2026-05-04 16:55', actor:'System', action:'3-Way Match Passed', detail:'PO-2026-039 + GR-001 + INV-0089', hash:'c2a8f5' },
  { id:'au4', ts:'2026-05-04 09:20', actor:'Ngozi Eze', action:'Awarded RFQ', detail:'RFQ-2026-007 → Skyline Photography', hash:'d5b1e3' },
  { id:'au5', ts:'2026-05-03 17:45', actor:'Bola Adeyemi', action:'Rejected Expense', detail:'EXP-1100 – missing receipts', hash:'e9c4a2' },
  { id:'au6', ts:'2026-05-02 13:00', actor:'System', action:'Wallet Top-up', detail:'₦5,000,000 received – TRF-9902', hash:'f1d7b8' },
];

// ─── MODAL WRAPPER ────────────────────────────────────────────────────────────
function Modal({ title, onClose, children, wide }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ─── HOME DASHBOARD ───────────────────────────────────────────────────────────
function HomeDashboard({ setPage, setActiveEvent }) {
  const totalBudget = CORP_EVENTS.reduce((s,e)=>s+e.budget,0);
  const totalSpent = CORP_EVENTS.reduce((s,e)=>s+e.spent,0);
  return (
    <div className="space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label:'Active Events', value:CORP_EVENTS.filter(e=>e.status==='active').length, icon:Calendar, color:'orange' },
          { label:'Pending Approvals', value:APPROVAL_ITEMS.length, icon:Clock, color:'yellow' },
          { label:'Total Budget', value:fmt(totalBudget), icon:DollarSign, color:'blue' },
          { label:'Wallet Balance', value:fmt(COMPANY.walletBalance), icon:Wallet, color:'green' },
        ].map(kpi=>(
          <div key={kpi.label} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-100 flex items-center justify-center mb-3`}>
              <kpi.icon className={`w-5 h-5 text-${kpi.color}-600`}/>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{kpi.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Events */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Active Events</h3>
            <button onClick={()=>setPage('events')} className="text-sm text-orange-600 font-semibold hover:underline">View all</button>
          </div>
          <div className="space-y-4">
            {CORP_EVENTS.map(ev=>(
              <div key={ev.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors" onClick={()=>{setActiveEvent(ev);setPage('workspace');}}>
                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-orange-600"/>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{ev.title}</p>
                  <p className="text-xs text-gray-500">{ev.date} · {ev.location}</p>
                  <div className="mt-1.5 w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-orange-500 h-1.5 rounded-full" style={{width:`${pct(ev.spent,ev.budget)}%`}}/>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs font-bold text-gray-900">{pct(ev.spent,ev.budget)}%</p>
                  <p className="text-xs text-gray-400">spent</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Needs Approval</h3>
            <button onClick={()=>setPage('approvals')} className="text-sm text-orange-600 font-semibold hover:underline">View all</button>
          </div>
          <div className="space-y-3">
            {APPROVAL_ITEMS.slice(0,4).map(ap=>(
              <div key={ap.id} className="p-3 rounded-xl border border-gray-100 hover:border-orange-200 transition-colors cursor-pointer" onClick={()=>setPage('approvals')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{ap.vendor}</p>
                    <p className="text-xs text-gray-500">{ap.ref}</p>
                  </div>
                  <span className={`text-xs font-bold flex-shrink-0 ${ap.urgency==='high'?'text-red-600':ap.urgency==='medium'?'text-yellow-600':'text-gray-400'}`}>
                    {ap.urgency.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm font-bold text-orange-600 mt-1">{fmt(ap.amount)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spend by Category */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Spend vs Budget by Category</h3>
        <div className="space-y-3">
          {[
            { name:'Venue', spent:8_500_000, budget:18_000_000, color:'bg-orange-500' },
            { name:'Catering', spent:3_200_000, budget:12_000_000, color:'bg-yellow-500' },
            { name:'A/V & Tech', spent:1_400_000, budget:4_000_000, color:'bg-purple-500' },
            { name:'Transport', spent:850_000, budget:3_000_000, color:'bg-green-500' },
            { name:'Accommodation', spent:0, budget:8_000_000, color:'bg-blue-500' },
          ].map(c=>(
            <div key={c.name} className="flex items-center gap-4">
              <p className="w-28 text-sm text-gray-600 flex-shrink-0">{c.name}</p>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className={`${c.color} h-2 rounded-full`} style={{width:`${pct(c.spent,c.budget)}%`}}/>
              </div>
              <p className="w-36 text-xs text-gray-500 text-right">{fmt(c.spent)} / {fmt(c.budget)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Audit Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Recent Activity</h3>
          <button onClick={()=>setPage('audit')} className="text-sm text-orange-600 font-semibold hover:underline">Audit log</button>
        </div>
        <div className="space-y-3">
          {AUDIT_ENTRIES.slice(0,4).map(a=>(
            <div key={a.id} className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Activity className="w-3.5 h-3.5 text-gray-500"/>
              </div>
              <div>
                <p className="text-sm text-gray-800"><span className="font-semibold">{a.actor}</span> — {a.action}</p>
                <p className="text-xs text-gray-400">{a.detail} · {a.ts}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── EVENTS LIST ──────────────────────────────────────────────────────────────
function EventsList({ setPage, setActiveEvent }) {
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title:'', type:'Internal', date:'', location:'', budget:'' });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Events</h2>
        <button onClick={()=>setShowNew(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-colors">
          <Plus className="w-4 h-4"/> New Event
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {CORP_EVENTS.map(ev=>(
          <div key={ev.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={()=>{setActiveEvent(ev);setPage('workspace');}}>
            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ev.status==='active'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>{ev.status}</span>
                <span className="text-xs text-gray-400">{ev.type}</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{ev.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{ev.date} · {ev.location}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Budget used</span><span className="font-semibold">{pct(ev.spent,ev.budget)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{width:`${pct(ev.spent,ev.budget)}%`}}/>
                </div>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-gray-50 text-xs text-gray-500">
                <span>{ev.rsvpd}/{ev.headcount} RSVPs</span>
                {ev.approvalsPending>0 && <span className="text-orange-600 font-bold">{ev.approvalsPending} pending approvals</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showNew && (
        <Modal title="New Corporate Event" onClose={()=>setShowNew(false)}>
          <div className="space-y-4">
            {[['title','Event Title','text'],['date','Date','text'],['location','Location','text'],['budget','Budget (₦)','number']].map(([k,l,t])=>(
              <div key={k}>
                <label className="block text-xs font-bold text-gray-600 mb-1">{l}</label>
                <input type={t} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Type</label>
              <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                <option>Internal</option><option>External</option><option>Hybrid</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={()=>setShowNew(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={()=>{toast.success('Event created!');setShowNew(false);}} className="flex-1 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold">Create Event</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── EVENT WORKSPACE ──────────────────────────────────────────────────────────
function EventWorkspace({ event, setPage }) {
  const TABS = ['Overview','Budget','Vendors & RFQs','POs & Invoices','Attendees','Travel','Comms','To-Do','Check-in','Reports','Settings'];
  const [tab, setTab] = useState('Overview');
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={()=>setPage('events')} className="p-2 hover:bg-gray-100 rounded-xl transition-colors"><ChevronLeft className="w-5 h-5 text-gray-500"/></button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{event.title}</h2>
          <p className="text-sm text-gray-500">{event.date} · {event.location}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${event.status==='active'?'bg-green-100 text-green-700':'bg-blue-100 text-blue-700'}`}>{event.status}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto mb-6 pb-1">
        {TABS.map(t=>(
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${tab===t?'bg-orange-600 text-white':'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'}`}>{t}</button>
        ))}
      </div>

      {/* Tab Content */}
      {tab==='Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[{l:'Total Budget',v:fmt(event.budget)},{l:'Spent',v:fmt(event.spent)},{l:'Remaining',v:fmt(event.budget-event.spent)},{l:'Headcount',v:event.headcount},{l:'RSVPs',v:event.rsvpd},{l:'Confirmed Rate',v:`${pct(event.rsvpd,event.headcount)}%`}].map(s=>(
            <div key={s.l} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{s.l}</p>
              <p className="text-2xl font-bold text-gray-900">{s.v}</p>
            </div>
          ))}
        </div>
      )}
      {tab==='Budget' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900">Budget Breakdown</h3>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-bold"><Plus className="w-3.5 h-3.5"/>Add Line</button>
          </div>
          <div className="space-y-3">
            {[{cat:'Venue',alloc:18_000_000,spent:8_500_000},{cat:'Catering',alloc:12_000_000,spent:3_200_000},{cat:'A/V & Tech',alloc:4_000_000,spent:1_400_000},{cat:'Transport',alloc:3_000_000,spent:850_000},{cat:'Accommodation',alloc:8_000_000,spent:0}].map(b=>(
              <div key={b.cat} className="grid grid-cols-4 gap-4 items-center py-2 border-b border-gray-50 last:border-0">
                <span className="font-medium text-gray-700">{b.cat}</span>
                <span className="text-sm text-gray-500">{fmt(b.alloc)} alloc</span>
                <span className="text-sm font-semibold text-orange-600">{fmt(b.spent)} spent</span>
                <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-orange-500 h-1.5 rounded-full" style={{width:`${pct(b.spent,b.alloc)}%`}}/></div>
              </div>
            ))}
          </div>
        </div>
      )}
      {(tab==='Vendors & RFQs'||tab==='POs & Invoices'||tab==='Attendees'||tab==='Travel'||tab==='Comms'||tab==='To-Do'||tab==='Check-in'||tab==='Reports'||tab==='Settings') && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <Layers className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
          <p className="font-semibold text-gray-500">{tab} tab</p>
          <p className="text-sm text-gray-400 mt-1">Full feature pane — manage from the global {tab.split(' ')[0]} section in the sidebar</p>
        </div>
      )}
    </div>
  );
}

// ─── APPROVALS ────────────────────────────────────────────────────────────────
function ApprovalsInbox() {
  const [items, setItems] = useState(APPROVAL_ITEMS);
  const [selected, setSelected] = useState(null);
  const [action, setAction] = useState(null); // 'approve'|'reject'|'changes'|'delegate'
  const [note, setNote] = useState('');

  const handle = (id, act) => {
    setItems(p=>p.map(i=>i.id===id?{...i,status:act==='approve'?'approved':act==='reject'?'rejected':'changes_requested'}:i));
    toast.success(act==='approve'?'Approved!':act==='reject'?'Rejected.':'Changes requested.');
    setSelected(null); setAction(null); setNote('');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Approvals Inbox <span className="ml-2 text-sm font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">{items.filter(i=>i.status==='pending').length}</span></h2>
        <div className="flex gap-2">
          <select className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
            <option>All types</option><option>PO</option><option>Invoice</option><option>Expense</option><option>RFQ Award</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {items.map(ap=>(
          <div key={ap.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${ap.status==='pending'?'border-gray-100':'border-gray-50 opacity-60'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">{ap.type}</span>
                  <span className={`text-xs font-bold ${ap.urgency==='high'?'text-red-600':ap.urgency==='medium'?'text-yellow-600':'text-gray-400'}`}>{ap.urgency.toUpperCase()}</span>
                </div>
                <p className="font-bold text-gray-900">{ap.vendor}</p>
                <p className="text-sm text-gray-500">{ap.ref} · {ap.event}</p>
                {ap.notes && <p className="text-xs text-gray-400 mt-1 italic">"{ap.notes}"</p>}
                <p className="text-sm text-gray-400 mt-1">Requested by {ap.requestedBy} on {ap.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-orange-600">{fmt(ap.amount)}</p>
                {ap.status==='pending' ? (
                  <div className="flex gap-2 mt-2">
                    <button onClick={()=>handle(ap.id,'approve')} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold">Approve</button>
                    <button onClick={()=>handle(ap.id,'reject')} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-bold">Reject</button>
                    <button onClick={()=>{setSelected(ap);setAction('changes');}} className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">Changes</button>
                  </div>
                ) : (
                  <span className={`text-xs font-bold mt-2 inline-block ${ap.status==='approved'?'text-green-600':ap.status==='rejected'?'text-red-600':'text-yellow-600'}`}>{ap.status.replace('_',' ').toUpperCase()}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && action==='changes' && (
        <Modal title="Request Changes" onClose={()=>{setSelected(null);setAction(null);}}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">What changes are needed for <strong>{selected.vendor}</strong>?</p>
            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={4} placeholder="Describe the changes required…" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
            <div className="flex gap-3">
              <button onClick={()=>{setSelected(null);setAction(null);}} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
              <button onClick={()=>handle(selected.id,'changes')} className="flex-1 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">Send Request</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── EMPLOYEES ────────────────────────────────────────────────────────────────
function EmployeesPage() {
  const [employees, setEmployees] = useState(EMPLOYEES);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name:'', role:'member', dept:'', email:'' });
  const ROLES = ['member','event_organizer','approver','finance','procurement','comms','admin'];
  const filtered = employees.filter(e=>e.name.toLowerCase().includes(search.toLowerCase())||e.dept.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Employees</h2>
        <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm transition-colors"><UserPlus className="w-4 h-4"/>Add Employee</button>
      </div>

      <div className="flex gap-3 mb-5">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search employees…" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Name','Department','Role','Email','Status',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(emp=>(
              <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-orange-700">{emp.avatar}</div>
                    <span className="font-semibold text-gray-900">{emp.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600">{emp.dept}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">{emp.role}</span></td>
                <td className="px-4 py-3 text-gray-500">{emp.email}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${emp.status==='active'?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'}`}>{emp.status}</span>
                </td>
                <td className="px-4 py-3">
                  {emp.status==='active' ? (
                    <button onClick={()=>{setEmployees(p=>p.map(e=>e.id===emp.id?{...e,status:'inactive'}:e));toast.success('Employee deactivated.');}} className="text-xs text-red-500 hover:text-red-700 font-semibold">Deactivate</button>
                  ) : (
                    <button onClick={()=>{setEmployees(p=>p.map(e=>e.id===emp.id?{...e,status:'active'}:e));toast.success('Employee reactivated.');}} className="text-xs text-green-600 hover:text-green-800 font-semibold">Reactivate</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <Modal title="Add Employee" onClose={()=>setShowAdd(false)}>
          <div className="space-y-4">
            {[['name','Full Name'],['email','Work Email'],['dept','Department']].map(([k,l])=>(
              <div key={k}>
                <label className="block text-xs font-bold text-gray-600 mb-1">{l}</label>
                <input value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Role</label>
              <select value={form.role} onChange={e=>setForm(p=>({...p,role:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300">
                {ROLES.map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={()=>setShowAdd(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
              <button onClick={()=>{toast.success(`${form.name} added!`);setShowAdd(false);setForm({name:'',role:'member',dept:'',email:''}); }} className="flex-1 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">Add</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── VENDORS PAGE ─────────────────────────────────────────────────────────────
function VendorsPage() {
  const [vendors, setVendors] = useState(VENDORS);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name:'', category:'', email:'', phone:'' });
  const toggle = (id, field) => {
    setVendors(p=>p.map(v=>v.id===id?{...v,status:v.status===field?'active':field}:v));
    toast.success('Vendor status updated.');
  };
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Vendor Directory</h2>
        <button onClick={()=>setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm"><Plus className="w-4 h-4"/>Add Vendor</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {vendors.map(v=>(
          <div key={v.id} className={`bg-white rounded-2xl border shadow-sm p-5 ${v.status==='blacklisted'?'border-red-200 bg-red-50/30':v.status==='preferred'?'border-orange-200':'border-gray-100'}`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-bold text-gray-900">{v.name}</p>
                <p className="text-xs text-gray-500">{v.category}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400"/>
                <span className="text-xs font-bold text-gray-700">{v.rating}</span>
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1 mb-3">
              <p>{v.email}</p><p>{v.phone}</p>
              <p className="font-semibold text-gray-700">Total paid: {fmt(v.totalPaid)}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>toggle(v.id,'preferred')} className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${v.status==='preferred'?'bg-orange-600 text-white':'bg-gray-100 text-gray-600 hover:bg-orange-50'}`}>
                {v.status==='preferred'?'✓ Preferred':'Mark Preferred'}
              </button>
              <button onClick={()=>toggle(v.id,'blacklisted')} className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-colors ${v.status==='blacklisted'?'bg-red-600 text-white':'bg-gray-100 text-gray-600 hover:bg-red-50'}`}>
                {v.status==='blacklisted'?'✗ Blacklisted':'Blacklist'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <Modal title="Add Vendor" onClose={()=>setShowAdd(false)}>
          <div className="space-y-4">
            {[['name','Company Name'],['category','Category'],['email','Email'],['phone','Phone']].map(([k,l])=>(
              <div key={k}><label className="block text-xs font-bold text-gray-600 mb-1">{l}</label>
                <input value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
              </div>
            ))}
            <div className="flex gap-3 pt-2">
              <button onClick={()=>setShowAdd(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
              <button onClick={()=>{toast.success(`${form.name} added!`);setShowAdd(false);}} className="flex-1 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">Add Vendor</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── RFQs ─────────────────────────────────────────────────────────────────────
function RFQsPage() {
  const [rfqs, setRfqs] = useState(RFQS);
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ title:'', event:'Annual Retreat', deadline:'', desc:'' });
  const statusColor2 = { draft:'gray', open:'blue', evaluating:'yellow', awarded:'green' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">RFQs</h2>
        <button onClick={()=>{setShowCreate(true);setStep(1);}} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm"><Plus className="w-4 h-4"/>Create RFQ</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Ref','Title','Event','Responses','Deadline','Status',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rfqs.map(r=>(
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.ref}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{r.title}</td>
                <td className="px-4 py-3 text-gray-600">{r.event}</td>
                <td className="px-4 py-3 text-center font-bold text-orange-600">{r.responses}</td>
                <td className="px-4 py-3 text-gray-500">{r.deadline}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-${statusColor2[r.status]}-100 text-${statusColor2[r.status]}-700`}>{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  {r.status==='evaluating' && <button onClick={()=>{setRfqs(p=>p.map(x=>x.id===r.id?{...x,status:'awarded',awarded:'Best Vendor'}:x));toast.success('RFQ awarded!');}} className="text-xs font-bold text-orange-600 hover:underline">Award</button>}
                  {r.status==='draft' && <button onClick={()=>{setRfqs(p=>p.map(x=>x.id===r.id?{...x,status:'open'}:x));toast.success('RFQ sent to vendors!');}} className="text-xs font-bold text-blue-600 hover:underline">Send</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <Modal title={`Create RFQ — Step ${step} of 4`} onClose={()=>setShowCreate(false)} wide>
          {step===1 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 font-semibold">Step 1: Basics</p>
              {[['title','RFQ Title'],['desc','Description']].map(([k,l])=>(
                <div key={k}><label className="block text-xs font-bold text-gray-600 mb-1">{l}</label>
                  {k==='desc'?<textarea value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
                  :<input value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>}
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Event</label>
                  <select value={form.event} onChange={e=>setForm(p=>({...p,event:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                    {CORP_EVENTS.map(ev=><option key={ev.id}>{ev.title}</option>)}
                  </select>
                </div>
                <div><label className="block text-xs font-bold text-gray-600 mb-1">Deadline</label>
                  <input type="date" value={form.deadline} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none"/>
                </div>
              </div>
              <button onClick={()=>setStep(2)} className="w-full py-2 bg-orange-600 text-white rounded-xl text-sm font-bold mt-2">Next →</button>
            </div>
          )}
          {step===2 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 font-semibold">Step 2: Requirements Form</p>
              <p className="text-sm text-gray-400">Add custom questions for vendors to answer in their response.</p>
              <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center text-gray-400 text-sm">+ Add question field</div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(1)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">← Back</button>
                <button onClick={()=>setStep(3)} className="flex-1 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">Next →</button>
              </div>
            </div>
          )}
          {step===3 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 font-semibold">Step 3: Invite Vendors</p>
              <div className="space-y-2">
                {VENDORS.filter(v=>v.status!=='blacklisted').map(v=>(
                  <label key={v.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:bg-gray-50 cursor-pointer">
                    <input type="checkbox" className="accent-orange-600"/>
                    <div><p className="text-sm font-semibold text-gray-900">{v.name}</p><p className="text-xs text-gray-400">{v.category}</p></div>
                    {v.status==='preferred' && <span className="ml-auto text-xs font-bold text-orange-600">⭐ Preferred</span>}
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(2)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">← Back</button>
                <button onClick={()=>setStep(4)} className="flex-1 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">Preview →</button>
              </div>
            </div>
          )}
          {step===4 && (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 font-semibold">Step 4: Preview & Send</p>
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <p><span className="font-bold text-gray-700">Title:</span> {form.title||'—'}</p>
                <p><span className="font-bold text-gray-700">Event:</span> {form.event}</p>
                <p><span className="font-bold text-gray-700">Deadline:</span> {form.deadline||'—'}</p>
                <p><span className="font-bold text-gray-700">Description:</span> {form.desc||'—'}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={()=>setStep(3)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">← Back</button>
                <button onClick={()=>{toast.success('RFQ sent to vendors!');setShowCreate(false);}} className="flex-1 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold"><Send className="w-4 h-4 inline mr-1"/>Send RFQ</button>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── POs PAGE ─────────────────────────────────────────────────────────────────
function POsPage() {
  const [pos, setPos] = useState(POS);
  const [showGR, setShowGR] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ vendor:'', event:'', amount:'', notes:'' });
  const statusC = { pending_approval:'yellow', approved:'green', closed:'gray' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Purchase Orders</h2>
        <button onClick={()=>setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm"><Plus className="w-4 h-4"/>Create PO</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['PO Ref','Vendor','Event','Amount','Status','GR',''].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {pos.map(po=>(
              <tr key={po.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{po.ref}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">{po.vendor}</td>
                <td className="px-4 py-3 text-gray-600">{po.event}</td>
                <td className="px-4 py-3 font-bold text-orange-600">{fmt(po.amount)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold bg-${statusC[po.status]}-100 text-${statusC[po.status]}-700`}>{po.status.replace('_',' ')}</span>
                </td>
                <td className="px-4 py-3">
                  {po.grDone ? <span className="text-green-600 font-bold text-xs">✓ Done</span>
                  : <button onClick={()=>setShowGR(po)} className="text-xs text-blue-600 font-bold hover:underline">Record GR</button>}
                </td>
                <td className="px-4 py-3">
                  <button className="p-1 hover:bg-gray-100 rounded-lg"><Download className="w-4 h-4 text-gray-400"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showGR && (
        <Modal title={`Record Goods Receipt — ${showGR.ref}`} onClose={()=>setShowGR(null)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Confirm goods/services received from <strong>{showGR.vendor}</strong></p>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Received Date</label><input type="date" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"/></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Notes</label><textarea rows={3} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"/></div>
            <div className="flex gap-3">
              <button onClick={()=>setShowGR(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
              <button onClick={()=>{setPos(p=>p.map(x=>x.id===showGR.id?{...x,grDone:true}:x));toast.success('GR recorded!');setShowGR(null);}} className="flex-1 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">Confirm Receipt</button>
            </div>
          </div>
        </Modal>
      )}

      {showCreate && (
        <Modal title="Create Purchase Order" onClose={()=>setShowCreate(false)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Vendor</label>
                <select value={form.vendor} onChange={e=>setForm(p=>({...p,vendor:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  <option value="">Select vendor…</option>{VENDORS.map(v=><option key={v.id}>{v.name}</option>)}
                </select>
              </div>
              <div><label className="block text-xs font-bold text-gray-600 mb-1">Event</label>
                <select value={form.event} onChange={e=>setForm(p=>({...p,event:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none">
                  <option value="">Select event…</option>{CORP_EVENTS.map(ev=><option key={ev.id}>{ev.title}</option>)}
                </select>
              </div>
            </div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Amount (₦)</label><input type="number" value={form.amount} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/></div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Description / Scope</label><textarea rows={3} value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/></div>
            <div className="flex gap-3">
              <button onClick={()=>setShowCreate(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
              <button onClick={()=>{toast.success('PO created & sent for approval!');setShowCreate(false);}} className="flex-1 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">Create & Submit</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── INVOICES PAGE ────────────────────────────────────────────────────────────
function InvoicesPage() {
  const [invoices] = useState(INVOICES);
  const [selected, setSelected] = useState(null);
  const matchIcon = { matched:<CheckCircle className="w-4 h-4 text-green-600"/>, partial:<AlertCircle className="w-4 h-4 text-yellow-500"/>, unmatched:<XCircle className="w-4 h-4 text-red-500"/> };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Invoices</h2>
        <button onClick={()=>toast.success('Upload invoice coming soon!')} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm"><Upload className="w-4 h-4"/>Upload Invoice</button>
      </div>

      <div className="space-y-4">
        {invoices.map(inv=>(
          <div key={inv.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <p className="font-bold text-gray-900">{inv.vendor}</p>
                  <span className="font-mono text-xs text-gray-400">{inv.ref}</span>
                  <span className="text-xs text-gray-400">→ {inv.po}</span>
                </div>
                {/* 3-way match indicator */}
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-green-500"/><span className="text-gray-600">PO {inv.po}</span>
                  </div>
                  <span className="text-gray-300">→</span>
                  <div className="flex items-center gap-1.5">
                    {inv.matchStatus==='matched'?<CheckCircle className="w-4 h-4 text-green-500"/>:<AlertCircle className="w-4 h-4 text-yellow-400"/>}
                    <span className="text-gray-600">Goods Receipt</span>
                  </div>
                  <span className="text-gray-300">→</span>
                  <div className="flex items-center gap-1.5">
                    {matchIcon[inv.matchStatus]}<span className="text-gray-600">Invoice</span>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded-full font-semibold ${inv.matchStatus==='matched'?'bg-green-100 text-green-700':inv.matchStatus==='partial'?'bg-yellow-100 text-yellow-700':'bg-red-100 text-red-700'}`}>{inv.matchStatus}</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-orange-600">{fmt(inv.amount)}</p>
                <p className="text-xs text-gray-400">VAT {fmt(inv.vat)} · WHT -{fmt(inv.wht)}</p>
                <p className="text-sm font-bold text-gray-700 mt-0.5">Net: {fmt(inv.net)}</p>
                {inv.matchStatus==='matched' && inv.status!=='paid' && (
                  <button onClick={()=>setSelected(inv)} className="mt-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold">Pay Now</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <Modal title={`Pay Invoice — ${selected.ref}`} onClose={()=>setSelected(null)}>
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Vendor</span><span className="font-semibold">{selected.vendor}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Gross Amount</span><span>{fmt(selected.amount)}</span></div>
              <div className="flex justify-between text-green-600"><span>+ VAT (7.5%)</span><span>+{fmt(selected.vat)}</span></div>
              <div className="flex justify-between text-red-500"><span>- WHT (5%)</span><span>-{fmt(selected.wht)}</span></div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-2"><span>Net Payable</span><span>{fmt(selected.net)}</span></div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-sm text-orange-800">
              <p className="font-semibold">Wallet balance: {fmt(COMPANY.walletBalance)}</p>
              <p className="text-xs mt-0.5">After payment: {fmt(COMPANY.walletBalance - selected.net)}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={()=>setSelected(null)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
              <button onClick={()=>{toast.success(`Payment of ${fmt(selected.net)} initiated!`);setSelected(null);}} className="flex-1 py-2 bg-green-600 text-white rounded-xl text-sm font-bold">Confirm Payment</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── WALLET PAGE ──────────────────────────────────────────────────────────────
function WalletPage() {
  const [showTopup, setShowTopup] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState('');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Corporate Wallet</h2>
        <div className="flex gap-3">
          <button onClick={()=>setShowTopup(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-sm"><ArrowDownLeft className="w-4 h-4"/>Top Up</button>
          <button onClick={()=>setShowWithdraw(true)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl font-bold text-sm"><AUR className="w-4 h-4"/>Withdraw</button>
        </div>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl p-6 text-white mb-6">
        <p className="text-orange-200 text-sm font-semibold mb-1">Available Balance</p>
        <p className="text-4xl font-bold mb-4">{fmt(COMPANY.walletBalance)}</p>
        <div className="flex gap-6 text-sm">
          <div><p className="text-orange-200">Pending Outflows</p><p className="font-bold">{fmt(COMPANY.pendingOut)}</p></div>
          <div><p className="text-orange-200">KYB Tier</p><p className="font-bold">{COMPANY.kyb} / 3 ✓</p></div>
        </div>
      </div>

      {/* Ledger */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100"><h3 className="font-bold text-gray-900">Transaction Ledger</h3></div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Date','Description','Ref','Amount','Balance'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {WALLET_TXS.map(tx=>(
              <tr key={tx.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 text-xs">{tx.date}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{tx.desc}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-400">{tx.ref}</td>
                <td className={`px-4 py-3 font-bold ${tx.type==='credit'?'text-green-600':'text-red-500'}`}>{tx.type==='credit'?'+':'-'}{fmt(tx.amount)}</td>
                <td className="px-4 py-3 font-semibold text-gray-700">{fmt(tx.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showTopup && (
        <Modal title="Top Up Wallet" onClose={()=>setShowTopup(false)}>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
              <p className="font-bold">Bank Transfer Details</p>
              <p className="mt-1">Bank: First Bank Nigeria · Acct No: <strong>3086201947</strong></p>
              <p>Account Name: <strong>Nexus Corp Ltd – EventPark</strong></p>
            </div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Amount (₦)</label>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
            </div>
            <button onClick={()=>{toast.success('Top-up instruction generated. Funds reflect within 1 hour.');setShowTopup(false);setAmount('');}} className="w-full py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">Generate Payment Reference</button>
          </div>
        </Modal>
      )}
      {showWithdraw && (
        <Modal title="Withdraw Funds" onClose={()=>setShowWithdraw(false)}>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-800 font-semibold">⚠ Multi-signatory required for withdrawals above ₦5,000,000</div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Amount (₦)</label>
              <input type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="0.00" className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
            </div>
            <div><label className="block text-xs font-bold text-gray-600 mb-1">Reason</label><textarea rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"/></div>
            <div className="flex gap-3">
              <button onClick={()=>setShowWithdraw(false)} className="flex-1 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
              <button onClick={()=>{toast.success('Withdrawal request sent to signatories for approval.');setShowWithdraw(false);setAmount('');}} className="flex-1 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">Request Withdrawal</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── AUDIT LOG ────────────────────────────────────────────────────────────────
function AuditLogPage() {
  const [filter, setFilter] = useState('');
  const filtered = AUDIT_ENTRIES.filter(a=>!filter||a.action.toLowerCase().includes(filter.toLowerCase())||a.actor.toLowerCase().includes(filter.toLowerCase()));
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Audit Log</h2>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-xl">
          <Shield className="w-4 h-4 text-green-600"/><span className="text-xs font-bold text-green-700">Hash-chain verified</span>
        </div>
      </div>
      <div className="flex gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
          <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filter by action or actor…" className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"><Download className="w-4 h-4"/>Export</button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>{['Timestamp','Actor','Action','Detail','Hash'].map(h=><th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map((a,i)=>(
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-xs text-gray-500 font-mono">{a.ts}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">{a.actor}</td>
                <td className="px-4 py-3 text-gray-700">{a.action}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{a.detail}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-gray-400">{a.hash}</span>
                    <CheckCircle className="w-3.5 h-3.5 text-green-500"/>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
function ReportsPage() {
  const reports = [
    { title:'Event Budget vs Actuals', desc:'Per-event spend summary with variance analysis', icon:BarChart2 },
    { title:'Vendor Spend Analysis', desc:'Breakdown by vendor category, preferred vs others', icon:PieChart },
    { title:'Approval Turnaround', desc:'Time-to-approve metrics by approver and type', icon:Clock },
    { title:'Headcount & Attendance', desc:'RSVP vs actual attendance per event', icon:Users },
    { title:'Wallet Cashflow', desc:'Credits, debits, and balance trend over time', icon:TrendingUp },
    { title:'Audit Compliance Report', desc:'Full audit chain export for compliance review', icon:Shield },
  ];
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Reports</h2>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50"><Download className="w-4 h-4"/>Export All</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {reports.map(r=>(
          <button key={r.title} onClick={()=>toast.success(`Generating ${r.title}…`)} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-left hover:shadow-md hover:border-orange-200 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center mb-3 transition-colors">
              <r.icon className="w-5 h-5 text-orange-600"/>
            </div>
            <p className="font-bold text-gray-900 mb-1">{r.title}</p>
            <p className="text-xs text-gray-500">{r.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── INTEGRATIONS PAGE ────────────────────────────────────────────────────────
function IntegrationsPage() {
  const integrations = [
    { name:'Slack', desc:'Send approvals & event nudges to Slack', connected:true, icon:'💬' },
    { name:'Google Calendar', desc:'Sync events to team calendars', connected:true, icon:'📅' },
    { name:'QuickBooks', desc:'Export invoices and POs to QuickBooks', connected:false, icon:'📒' },
    { name:'Paystack', desc:'Accept ticket payments & registrations', connected:true, icon:'💳' },
    { name:'Zoom', desc:'Auto-create Zoom links for virtual events', connected:false, icon:'📹' },
    { name:'HubSpot', desc:'Sync event attendees to CRM', connected:false, icon:'🔶' },
    { name:'Zapier', desc:'Connect to 5,000+ apps via Zapier', connected:false, icon:'⚡' },
    { name:'Webhook', desc:'Send real-time events to any endpoint', connected:false, icon:'🔗' },
  ];
  const [conns, setConns] = useState(integrations);
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-900 mb-6">Integrations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {conns.map((int,i)=>(
          <div key={int.name} className={`bg-white rounded-2xl border shadow-sm p-5 ${int.connected?'border-green-200':'border-gray-100'}`}>
            <div className="text-3xl mb-3">{int.icon}</div>
            <p className="font-bold text-gray-900">{int.name}</p>
            <p className="text-xs text-gray-500 mb-3 mt-0.5">{int.desc}</p>
            <button onClick={()=>{setConns(p=>p.map((x,j)=>j===i?{...x,connected:!x.connected}:x));toast.success(int.connected?`${int.name} disconnected.`:`${int.name} connected!`);}}
              className={`w-full py-1.5 rounded-xl text-xs font-bold transition-colors ${int.connected?'bg-green-50 text-green-700 hover:bg-red-50 hover:text-red-600':'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-700'}`}>
              {int.connected?'✓ Connected — Disconnect':'Connect'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage() {
  const [subPage, setSubPage] = useState('Company');
  const SUB = ['Company','Departments','Approval Rules','Brand Kit','Billing','Security'];
  return (
    <div className="flex gap-6">
      <div className="w-48 flex-shrink-0">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-2">
          {SUB.map(s=>(
            <button key={s} onClick={()=>setSubPage(s)} className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${subPage===s?'bg-orange-600 text-white':'text-gray-600 hover:bg-gray-100'}`}>{s}</button>
          ))}
        </div>
      </div>
      <div className="flex-1">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {subPage==='Company' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Company Profile</h3>
              {[['Company Name','Nexus Corp Ltd'],['Registration Number','RC-1234567'],['Tax ID (TIN)','12345678-0001'],['Industry','Technology'],['HQ Address','Victoria Island, Lagos']].map(([l,v])=>(
                <div key={l}><label className="block text-xs font-bold text-gray-600 mb-1">{l}</label>
                  <input defaultValue={v} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"/>
                </div>
              ))}
              <button onClick={()=>toast.success('Company profile updated!')} className="px-5 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">Save Changes</button>
            </div>
          )}
          {subPage==='Departments' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Departments</h3>
              <div className="space-y-3">
                {DEPARTMENTS.map(d=>(
                  <div key={d.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                    <div><p className="font-semibold text-gray-900">{d.name}</p><p className="text-xs text-gray-500">Head: {d.head} · {d.members} members · Budget: {fmt(d.budget)}</p></div>
                    <button className="text-xs text-orange-600 font-bold hover:underline">Edit</button>
                  </div>
                ))}
              </div>
              <button onClick={()=>toast.success('Add department coming soon!')} className="flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-orange-400 hover:text-orange-600 transition-colors"><Plus className="w-4 h-4"/>Add Department</button>
            </div>
          )}
          {subPage==='Approval Rules' && (
            <div className="space-y-4">
              <h3 className="font-bold text-gray-900 text-lg">Approval Rules</h3>
              {[{label:'PO Approval Threshold',val:'₦500,000'},{label:'Invoice Auto-Approve Below',val:'₦50,000'},{label:'Multi-sig Wallet Threshold',val:'₦5,000,000'},{label:'Approval Chain',val:'Organizer → Finance → Owner'}].map(r=>(
                <div key={r.label} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                  <span className="text-sm text-gray-700 font-medium">{r.label}</span>
                  <span className="font-bold text-orange-600 text-sm">{r.val}</span>
                </div>
              ))}
              <button onClick={()=>toast.success('Approval rules saved!')} className="px-5 py-2 bg-orange-600 text-white rounded-xl text-sm font-bold">Save Rules</button>
            </div>
          )}
          {(subPage==='Brand Kit'||subPage==='Billing'||subPage==='Security') && (
            <div className="text-center py-12">
              <Settings className="w-12 h-12 text-gray-200 mx-auto mb-3"/>
              <p className="font-semibold text-gray-500">{subPage} settings</p>
              <p className="text-sm text-gray-400 mt-1">Coming in next release</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR NAV ──────────────────────────────────────────────────────────────
const NAV = [
  { id:'home', label:'Home', icon:Building2 },
  { id:'events', label:'Events', icon:Calendar },
  { id:'employees', label:'Employees', icon:Users },
  { id:'procurement', label:'Procurement', icon:ShoppingCart, sub:[
    { id:'vendors', label:'Vendors' },
    { id:'rfqs', label:'RFQs' },
    { id:'pos', label:'Purchase Orders' },
    { id:'invoices', label:'Invoices' },
  ]},
  { id:'approvals', label:'Approvals', icon:CheckCircle, badge:APPROVAL_ITEMS.filter(a=>a.status==='pending').length },
  { id:'wallet', label:'Wallet', icon:Wallet },
  { id:'audit', label:'Audit Log', icon:Shield },
  { id:'reports', label:'Reports', icon:BarChart2 },
  { id:'integrations', label:'Integrations', icon:Globe },
  { id:'settings', label:'Settings', icon:Settings },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CorporateDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [activePage, setActivePage] = useState('home');
  const [activeEvent, setActiveEvent] = useState(null);
  const [procOpen, setProcOpen] = useState(true);
  const [notifOpen, setNotifOpen] = useState(false);

  const setPage = (page) => {
    setActivePage(page);
    if (page !== 'workspace') setActiveEvent(null);
  };

  const isProc = ['vendors','rfqs','pos','invoices'].includes(activePage);

  const renderPage = () => {
    switch(activePage) {
      case 'home': return <HomeDashboard setPage={setPage} setActiveEvent={setActiveEvent}/>;
      case 'events': return <EventsList setPage={setPage} setActiveEvent={setActiveEvent}/>;
      case 'workspace': return activeEvent ? <EventWorkspace event={activeEvent} setPage={setPage}/> : <EventsList setPage={setPage} setActiveEvent={setActiveEvent}/>;
      case 'approvals': return <ApprovalsInbox/>;
      case 'employees': return <EmployeesPage/>;
      case 'vendors': return <VendorsPage/>;
      case 'rfqs': return <RFQsPage/>;
      case 'pos': return <POsPage/>;
      case 'invoices': return <InvoicesPage/>;
      case 'wallet': return <WalletPage/>;
      case 'audit': return <AuditLogPage/>;
      case 'reports': return <ReportsPage/>;
      case 'integrations': return <IntegrationsPage/>;
      case 'settings': return <SettingsPage/>;
      default: return <HomeDashboard setPage={setPage} setActiveEvent={setActiveEvent}/>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-950 flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white"/>
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-tight">{COMPANY.name}</p>
              <p className="text-gray-400 text-xs">{COMPANY.plan}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-0.5">
          {NAV.map(item=>{
            if(item.sub) {
              return (
                <div key={item.id}>
                  <button onClick={()=>setProcOpen(o=>!o)} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${isProc?'text-orange-400':'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 flex-shrink-0"/>
                      <span>{item.label}</span>
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${procOpen?'rotate-180':''}`}/>
                  </button>
                  {procOpen && (
                    <div className="ml-7 mt-0.5 space-y-0.5">
                      {item.sub.map(sub=>(
                        <button key={sub.id} onClick={()=>setPage(sub.id)} className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${activePage===sub.id?'bg-orange-600 text-white':'text-gray-500 hover:text-white hover:bg-gray-800'}`}>
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <button key={item.id} onClick={()=>setPage(item.id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${activePage===item.id||( item.id==='events'&&activePage==='workspace')?'bg-orange-600 text-white':'text-gray-400 hover:text-white hover:bg-gray-800'}`}>
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 flex-shrink-0"/>
                  <span>{item.label}</span>
                </div>
                {item.badge>0 && <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Wallet card */}
        <div className="mx-3 mb-3 bg-gray-900 rounded-xl p-3 border border-gray-800">
          <p className="text-gray-400 text-xs mb-0.5">Wallet</p>
          <p className="text-white font-bold text-sm">{fmt(COMPANY.walletBalance)}</p>
          <button onClick={()=>setPage('wallet')} className="text-orange-400 text-xs font-semibold mt-1 hover:underline">View →</button>
        </div>

        {/* User footer */}
        <div className="px-3 pb-4 border-t border-gray-800 pt-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-orange-700 flex items-center justify-center text-xs font-bold text-white">TO</div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">Tunde Olaiya</p>
              <p className="text-gray-500 text-xs">Admin</p>
            </div>
            <button onClick={()=>{logout();navigate('/');}} className="p-1.5 hover:bg-gray-800 rounded-lg transition-colors">
              <LogOut className="w-4 h-4 text-gray-500"/>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="font-bold text-gray-900 capitalize">{activePage==='workspace'&&activeEvent?activeEvent.title:activePage.replace('_',' ')}</h1>
            <p className="text-xs text-gray-400">{COMPANY.name} · {new Date().toLocaleDateString('en-NG',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button onClick={()=>setNotifOpen(o=>!o)} className="relative p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-500"/>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"/>
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 p-4">
                  <p className="font-bold text-gray-900 mb-3">Notifications</p>
                  {APPROVAL_ITEMS.slice(0,3).map(ap=>(
                    <div key={ap.id} className="py-2 border-b border-gray-50 last:border-0">
                      <p className="text-sm font-semibold text-gray-800">{ap.type}: {ap.vendor}</p>
                      <p className="text-xs text-gray-400">{ap.ref} · {fmt(ap.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button onClick={()=>setPage('events')} className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-sm font-bold transition-colors">
              <Plus className="w-4 h-4"/>New Event
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderPage()}
        </main>
      </div>

      {/* Notification overlay dismiss */}
      {notifOpen && <div className="fixed inset-0 z-40" onClick={()=>setNotifOpen(false)}/>}
    </div>
  );
}
