import { useState, useEffect, useRef } from 'react';
import { Plus, Users, Share2, CheckCircle, X, ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { groupWishlist as groupWishlistApi } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

// ── Constants ─────────────────────────────────────────────────────────────────
const OCCASIONS = [
  { value: 'birthday',    label: 'Birthday',   emoji: '🎂' },
  { value: 'farewell',    label: 'Farewell',   emoji: '👋' },
  { value: 'baby_shower', label: 'New Baby',   emoji: '👶' },
  { value: 'wedding',     label: 'Wedding',    emoji: '💍' },
  { value: 'anniversary', label: 'Anniversary',emoji: '💑' },
  { value: 'promotion',   label: 'Promotion',  emoji: '🏆' },
  { value: 'get_well',    label: 'Get Well',   emoji: '💊' },
  { value: 'other',       label: 'Other',      emoji: '🎉' },
];

const OCCASION_MAP = Object.fromEntries(OCCASIONS.map(o => [o.value, o]));

const STATUS_LABELS = {
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  collecting: { label: 'Collecting', color: 'bg-blue-100 text-blue-700' },
  delivered: { label: 'Delivered', color: 'bg-gray-100 text-gray-600' },
};

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = new Date(dateStr) - new Date();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return 'Past';
  if (days === 0) return 'Today';
  return `${days}d left`;
}

// ── Skeletons ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-100 rounded-xl" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-40" />
          <div className="h-3 bg-gray-100 rounded w-24" />
        </div>
      </div>
      <div className="h-2 bg-gray-100 rounded-full mb-3" />
      <div className="flex gap-2">
        <div className="h-8 flex-1 bg-gray-100 rounded-xl" />
        <div className="h-8 flex-1 bg-gray-100 rounded-xl" />
        <div className="h-8 flex-1 bg-gray-100 rounded-xl" />
      </div>
    </div>
  );
}

// ── Group Wishlist Card ───────────────────────────────────────────────────────
function GroupCard({ item, onView, onMarkDelivered }) {
  const occ = OCCASION_MAP[item.occasion_type] || { emoji: '🎉', label: item.occasion_type };
  const status = STATUS_LABELS[item.status] || STATUS_LABELS.active;
  const raised = item.total_raised || 0;
  const goal = item.goal_amount || 0;
  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  const contributorsCount = item.contributors_count || 0;
  const invitedCount = item.invited_count || 0;

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/group-wish/${item.id}`);
    toast.success('Link copied!');
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-xl flex-shrink-0">
          {occ.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 text-sm truncate">{item.name}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.color}`}>
              {status.label}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">For {item.recipient_name}</p>
          {item.gift_date && (
            <p className="text-xs text-brand-600 font-semibold mt-0.5">{daysUntil(item.gift_date)}</p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-gray-600 mb-1.5">
          <span className="font-semibold">₦{raised.toLocaleString()} raised</span>
          <span className="text-gray-400">{goal > 0 ? `of ₦${goal.toLocaleString()}` : 'Open goal'}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all"
            style={{ width: `${pct}%` }} />
        </div>
        {invitedCount > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">
            {contributorsCount} of {invitedCount} invited have contributed
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={() => onView(item)}
          className="flex-1 text-xs font-semibold py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl transition-colors">
          View
        </button>
        <button
          onClick={handleShare}
          className="flex-1 flex items-center justify-center gap-1 text-xs font-semibold py-2 px-3 border border-gray-200 hover:border-gray-300 text-gray-600 rounded-xl transition-colors">
          <Share2 className="w-3 h-3" />
          Share
        </button>
        {item.status !== 'delivered' && (
          <button
            onClick={() => onMarkDelivered(item)}
            className="flex-1 text-xs font-semibold py-2 px-3 border border-gray-200 hover:bg-green-50 hover:border-green-200 text-gray-600 hover:text-green-700 rounded-xl transition-colors">
            Delivered
          </button>
        )}
      </div>
    </div>
  );
}

// ── Detail Slide-over ─────────────────────────────────────────────────────────
function DetailPanel({ item, onClose, onRefresh }) {
  const [inviteEmails, setInviteEmails] = useState('');
  const [showInvite, setShowInvite] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [newItem, setNewItem] = useState({ description: '', amount_ngn: '' });
  const [submittingItem, setSubmittingItem] = useState(false);
  const [submittingInvite, setSubmittingInvite] = useState(false);

  if (!item) return null;

  const occ = OCCASION_MAP[item.occasion_type] || { emoji: '🎉' };
  const items = item.items || [];
  const contributors = item.contributors || [];
  const raised = item.total_raised || 0;
  const goal = item.goal_amount || 0;
  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;

  const handleAddItem = async () => {
    if (!newItem.description.trim()) return;
    setSubmittingItem(true);
    try {
      await groupWishlistApi.addItem(item.id, {
        item_description: newItem.description,
        item_amount_ngn: parseFloat(newItem.amount_ngn) || 0,
      });
      toast.success('Item added!');
      setNewItem({ description: '', amount_ngn: '' });
      setAddingItem(false);
      onRefresh();
    } catch {
      toast.error('Failed to add item.');
    } finally {
      setSubmittingItem(false);
    }
  };

  const handleInvite = async () => {
    const emails = inviteEmails.split('\n').map(e => e.trim()).filter(Boolean);
    if (emails.length === 0) return;
    setSubmittingInvite(true);
    try {
      await groupWishlistApi.inviteContributors(item.id, { emails });
      toast.success(`Invited ${emails.length} contributor${emails.length > 1 ? 's' : ''}!`);
      setInviteEmails('');
      setShowInvite(false);
      onRefresh();
    } catch {
      toast.error('Failed to send invites.');
    } finally {
      setSubmittingInvite(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/group-wish/${item.id}`);
    toast.success('Link copied!');
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-lg h-full bg-white shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
          <div className="text-2xl">{occ.emoji}</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 truncate">{item.name}</h2>
            <p className="text-xs text-gray-400">For {item.recipient_name} · {daysUntil(item.gift_date)}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Progress */}
          <div className="bg-brand-50 rounded-2xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-bold text-brand-800">₦{raised.toLocaleString()} raised</span>
              <span className="text-brand-500">{goal > 0 ? `of ₦${goal.toLocaleString()}` : 'Open goal'}</span>
            </div>
            <div className="h-2.5 bg-brand-100 rounded-full overflow-hidden">
              <div className="h-full bg-brand-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-sm">Gift Items</h3>
              <button
                onClick={() => setAddingItem(v => !v)}
                className="text-xs font-semibold text-brand-600 hover:underline">
                + Add item
              </button>
            </div>

            {addingItem && (
              <div className="mb-3 p-3 bg-gray-50 rounded-xl space-y-2">
                <input
                  value={newItem.description}
                  onChange={e => setNewItem(v => ({ ...v, description: e.target.value }))}
                  placeholder="Item description"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <input
                  type="number"
                  value={newItem.amount_ngn}
                  onChange={e => setNewItem(v => ({ ...v, amount_ngn: e.target.value }))}
                  placeholder="Target amount (₦)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                <div className="flex gap-2">
                  <button
                    onClick={handleAddItem}
                    disabled={submittingItem}
                    className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2 rounded-xl disabled:opacity-50 transition-colors">
                    {submittingItem ? 'Adding…' : 'Add'}
                  </button>
                  <button
                    onClick={() => setAddingItem(false)}
                    className="px-4 border border-gray-200 text-sm font-semibold text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {items.length === 0 && !addingItem && (
              <p className="text-sm text-gray-400 text-center py-4">No items added yet.</p>
            )}

            <div className="space-y-3">
              {items.map((it, i) => {
                const iPct = it.target_amount > 0 ? Math.min((it.raised_amount / it.target_amount) * 100, 100) : 0;
                return (
                  <div key={it.id || i} className="bg-gray-50 rounded-xl p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold text-gray-800">{it.item_description || it.name}</span>
                      {it.target_amount > 0 && (
                        <span className="text-gray-400 text-xs">₦{(it.raised_amount || 0).toLocaleString()} / ₦{it.target_amount.toLocaleString()}</span>
                      )}
                    </div>
                    {it.target_amount > 0 && (
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full" style={{ width: `${iPct}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contributors */}
          <div>
            <h3 className="font-bold text-gray-900 text-sm mb-3">Contributors</h3>
            {contributors.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-4">No contributions yet.</p>
            )}
            <div className="space-y-2">
              {contributors.map((c, i) => (
                <div key={c.id || i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {c.anonymous ? '?' : (c.name || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900">{c.anonymous ? 'Anonymous' : c.name}</div>
                    {c.message && <div className="text-xs text-gray-400 truncate">"{c.message}"</div>}
                    <div className="text-xs text-gray-400">{c.created_at || c.date}</div>
                  </div>
                  <div className="text-sm font-extrabold text-gray-900 flex-shrink-0">₦{(c.amount || 0).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Invite more */}
          <div>
            <button
              onClick={() => setShowInvite(v => !v)}
              className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 hover:border-brand-300 hover:bg-brand-50 rounded-xl text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors">
              <Users className="w-4 h-4" />
              Invite more people
            </button>
            {showInvite && (
              <div className="mt-3 space-y-2">
                <label className="block text-xs font-bold text-gray-700">
                  Enter emails (one per line)
                </label>
                <textarea
                  value={inviteEmails}
                  onChange={e => setInviteEmails(e.target.value)}
                  rows={4}
                  placeholder="friend@example.com&#10;colleague@example.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
                <button
                  onClick={handleInvite}
                  disabled={submittingInvite}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold py-2.5 rounded-xl disabled:opacity-50 transition-colors">
                  {submittingInvite ? 'Sending…' : 'Send Invites'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 border-t border-gray-100 flex gap-3 flex-shrink-0">
          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:border-brand-300 text-gray-700 text-sm font-semibold rounded-xl transition-colors">
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Create Wizard Modal ───────────────────────────────────────────────────────
function CreateWizard({ initialOccasion, onClose, onCreated }) {
  const { activeWorkspace } = useAuth();
  const isCorporate = activeWorkspace?.type === 'corporate';

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 state
  const [occasion, setOccasion] = useState(initialOccasion || '');
  const [recipientName, setRecipientName] = useState('');
  const [giftDate, setGiftDate] = useState('');
  const [visibility, setVisibility] = useState('everyone');

  // Step 2 state
  const [items, setItems] = useState([{ type: 'cash', description: '', amount_ngn: '' }]);

  // Step 3 state
  const [fundingModel, setFundingModel] = useState('pool');
  const [suggestedAmount, setSuggestedAmount] = useState('');
  const [anonymousContributions, setAnonymousContributions] = useState(false);
  const [personalMessage, setPersonalMessage] = useState('');

  const canStep1 = occasion && recipientName.trim() && giftDate;
  const canStep2 = items.some(i => i.description.trim());

  const addItem = () => setItems(v => [...v, { type: 'cash', description: '', amount_ngn: '' }]);
  const updateItem = (idx, field, value) =>
    setItems(v => v.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  const removeItem = (idx) => setItems(v => v.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const body = {
        occasion_type: occasion,
        recipient_name: recipientName.trim(),
        gift_date: giftDate,
        visibility,
        items: items
          .filter(it => it.description.trim())
          .map(it => ({
            item_type: it.type,
            item_description: it.description,
            item_amount_ngn: parseFloat(it.amount_ngn) || 0,
          })),
        funding_model: fundingModel,
        suggested_amount_ngn: fundingModel === 'fixed' ? parseFloat(suggestedAmount) || 0 : undefined,
        anonymous_contributions: anonymousContributions,
        personal_message: personalMessage.trim() || undefined,
      };
      const created = await groupWishlistApi.create(body);
      toast.success('Group wishlist created! Share the link with contributors.');
      onCreated(created);
      onClose();
    } catch {
      toast.error('Failed to create group wishlist.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-lg">Create Group Wishlist</h2>
            <p className="text-xs text-gray-400 mt-0.5">Step {step} of 3</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Step progress bar */}
        <div className="h-1 bg-gray-100 flex-shrink-0">
          <div className="h-full bg-brand-600 transition-all duration-300" style={{ width: `${(step / 3) * 100}%` }} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* ── Step 1 ── */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-3">Occasion type</label>
                <div className="grid grid-cols-4 gap-2">
                  {OCCASIONS.map(o => (
                    <button
                      key={o.value}
                      onClick={() => setOccasion(o.value)}
                      className={`flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all text-xs font-semibold ${
                        occasion === o.value
                          ? 'border-brand-500 bg-brand-50 text-brand-700'
                          : 'border-gray-100 hover:border-gray-200 text-gray-600'
                      }`}>
                      <span className="text-2xl">{o.emoji}</span>
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Recipient name</label>
                <input
                  value={recipientName}
                  onChange={e => setRecipientName(e.target.value)}
                  placeholder="e.g. Jane Okafor"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Gift date</label>
                <input
                  type="date"
                  value={giftDate}
                  onChange={e => setGiftDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Who can see this?</label>
                <div className="space-y-2">
                  {[
                    { value: 'everyone', label: 'Everyone', desc: 'Anyone with the link can view and contribute' },
                    { value: 'invite_only', label: 'Invite only', desc: 'Only people you invite can contribute' },
                  ].map(v => (
                    <label key={v.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      visibility === v.value ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                      <input type="radio" name="visibility" value={v.value}
                        checked={visibility === v.value}
                        onChange={() => setVisibility(v.value)}
                        className="mt-0.5 accent-brand-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{v.label}</div>
                        <div className="text-xs text-gray-400">{v.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <>
              <p className="text-sm text-gray-500">
                What gifts does <span className="font-bold text-gray-900">{recipientName}</span> want?
              </p>
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-600">Item {idx + 1}</span>
                      {items.length > 1 && (
                        <button onClick={() => removeItem(idx)} className="text-gray-400 hover:text-red-400 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Type</label>
                      <select
                        value={item.type}
                        onChange={e => updateItem(idx, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-400">
                        <option value="cash">Cash fund</option>
                        <option value="gift">Gift item</option>
                        <option value="custom">Custom item</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                      <input
                        value={item.description}
                        onChange={e => updateItem(idx, 'description', e.target.value)}
                        placeholder="e.g. Honeymoon fund, KitchenAid Mixer…"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Target amount (₦)</label>
                      <input
                        type="number"
                        value={item.amount_ngn}
                        onChange={e => updateItem(idx, 'amount_ngn', e.target.value)}
                        placeholder="Leave blank for open amount"
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addItem}
                className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 hover:border-brand-300 hover:bg-brand-50 rounded-xl text-sm font-semibold text-gray-500 hover:text-brand-600 transition-colors">
                <Plus className="w-4 h-4" />
                Add another item
              </button>
            </>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">Funding model</label>
                <div className="space-y-2">
                  {[
                    { value: 'pool', label: 'Pool contributions', desc: 'Everyone contributes what they can' },
                    { value: 'fixed', label: 'Fixed per person', desc: 'Suggest a specific amount each person contributes' },
                    ...(isCorporate ? [{ value: 'company', label: 'Company pays', desc: 'The company covers the gift cost' }] : []),
                  ].map(fm => (
                    <label key={fm.value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                      fundingModel === fm.value ? 'border-brand-500 bg-brand-50' : 'border-gray-100 hover:border-gray-200'
                    }`}>
                      <input type="radio" name="funding_model" value={fm.value}
                        checked={fundingModel === fm.value}
                        onChange={() => setFundingModel(fm.value)}
                        className="mt-0.5 accent-brand-600" />
                      <div>
                        <div className="text-sm font-semibold text-gray-900">{fm.label}</div>
                        <div className="text-xs text-gray-400">{fm.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
                {fundingModel === 'fixed' && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-gray-700 mb-1.5">Suggested amount per person (₦)</label>
                    <input
                      type="number"
                      value={suggestedAmount}
                      onChange={e => setSuggestedAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                  </div>
                )}
              </div>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={anonymousContributions}
                  onChange={e => setAnonymousContributions(e.target.checked)}
                  className="mt-0.5 accent-brand-600" />
                <div>
                  <div className="text-sm font-semibold text-gray-900">Allow anonymous contributions</div>
                  <div className="text-xs text-gray-400">Contributors can choose to be anonymous</div>
                </div>
              </label>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Message to contributors <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={personalMessage}
                  onChange={e => setPersonalMessage(e.target.value)}
                  rows={3}
                  placeholder="e.g. Let's give Jane a farewell she'll never forget…"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-3 flex-shrink-0">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
          )}
          <div className="flex-1" />
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={step === 1 ? !canStep1 : !canStep2}
              className="flex items-center gap-1 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl disabled:opacity-40 transition-colors">
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors">
              {submitting ? 'Creating…' : 'Create & Share'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Mark Delivered Confirmation ────────────────────────────────────────────────
function DeliveredConfirm({ item, onConfirm, onClose }) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-500" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-2">Mark as delivered?</h3>
          <p className="text-sm text-gray-400">
            This will mark <span className="font-semibold text-gray-700">{item?.name}</span> as delivered and close contributions.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            disabled={confirming}
            onClick={async () => {
              setConfirming(true);
              await onConfirm();
              setConfirming(false);
            }}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl disabled:opacity-50 transition-colors">
            {confirming ? 'Updating…' : 'Mark Delivered'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function DashboardGroupWishlist() {
  const [groupWishlists, setGroupWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [preselectedOccasion, setPreselectedOccasion] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [deliverItem, setDeliverItem] = useState(null);

  const load = () => {
    groupWishlistApi.list()
      .then(data => setGroupWishlists(Array.isArray(data) ? data : (data.group_wishlists || [])))
      .catch(() => setGroupWishlists([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreated = (newItem) => {
    setGroupWishlists(v => [newItem, ...v]);
  };

  const handleOpenCreate = (occasion = '') => {
    setPreselectedOccasion(occasion);
    setShowCreate(true);
  };

  const handleMarkDelivered = async () => {
    if (!deliverItem) return;
    try {
      // Optimistic update — backend endpoint would be PATCH /group-wishlists/:id
      setGroupWishlists(v =>
        v.map(w => w.id === deliverItem.id ? { ...w, status: 'delivered' } : w)
      );
      toast.success('Marked as delivered!');
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setDeliverItem(null);
    }
  };

  const handleRefreshDetail = async () => {
    if (!selectedItem) return;
    try {
      const updated = await groupWishlistApi.get(selectedItem.id);
      setSelectedItem(updated);
      setGroupWishlists(v => v.map(w => w.id === updated.id ? updated : w));
    } catch {}
  };

  const occasionCards = [
    { value: 'birthday',    emoji: '🎂', label: 'Birthday' },
    { value: 'farewell',    emoji: '👋', label: 'Farewell' },
    { value: 'baby_shower', emoji: '👶', label: 'New Baby' },
    { value: 'wedding',     emoji: '💍', label: 'Wedding' },
    { value: 'other',       emoji: '🎉', label: 'Other' },
  ];

  return (
    <div className="p-4 sm:p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900">Group Gifting</h2>
          {!loading && (
            <p className="text-sm text-gray-400 mt-0.5">
              {groupWishlists.length} group wishlist{groupWishlists.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => handleOpenCreate()}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm px-4 py-2.5 rounded-xl transition-colors">
          <Plus className="w-4 h-4" />
          Create group wishlist
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && groupWishlists.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mb-5">
            <Heart className="w-8 h-8 text-brand-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">Plan a meaningful group gift</h3>
          <p className="text-sm text-gray-400 max-w-sm mb-10 leading-relaxed">
            Pool contributions from teammates, family, or friends for birthdays, farewells, celebrations, and more.
          </p>

          {/* Occasion cards */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            {occasionCards.map(o => (
              <button
                key={o.value}
                onClick={() => handleOpenCreate(o.value)}
                className="flex flex-col items-center gap-1.5 px-5 py-4 bg-white border border-gray-100 hover:border-brand-300 hover:shadow-md rounded-2xl text-sm font-semibold text-gray-700 hover:text-brand-700 transition-all">
                <span className="text-2xl">{o.emoji}</span>
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Populated — grid of cards */}
      {!loading && groupWishlists.length > 0 && (
        <div className="grid sm:grid-cols-2 gap-4">
          {groupWishlists.map(w => (
            <GroupCard
              key={w.id}
              item={w}
              onView={setSelectedItem}
              onMarkDelivered={setDeliverItem}
            />
          ))}
        </div>
      )}

      {/* Create wizard */}
      {showCreate && (
        <CreateWizard
          initialOccasion={preselectedOccasion}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Detail panel */}
      {selectedItem && (
        <DetailPanel
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onRefresh={handleRefreshDetail}
        />
      )}

      {/* Mark delivered confirmation */}
      {deliverItem && (
        <DeliveredConfirm
          item={deliverItem}
          onConfirm={handleMarkDelivered}
          onClose={() => setDeliverItem(null)}
        />
      )}
    </div>
  );
}
