import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Plus, Check, Star, Loader2,
  AlertTriangle, Download, X
} from 'lucide-react';
import { EventParkLogo } from '../../components/Logo';
import toast from 'react-hot-toast';

const TYPE_ORDER = ['cash_gift', 'gift_item', 'store'];
const TYPE_META = {
  cash_gift: { emoji: '💸', label: 'Cash gifts', sub: 'Honeymoon fund, new home, wedding car — guests pay you directly' },
  gift_item: { emoji: '🎁', label: 'Gift items', sub: 'Paste a link from Jumia, Konga, anywhere — guests buy and ship to you' },
  store:     { emoji: '🛍️', label: 'From the EventPark store', sub: 'Browse vetted vendor products and add to your wishlist' },
};
const CASH_PH = ['Trip to Zanzibar 🌴', 'New car 🚗', 'First-home down payment 🏠', 'Honeymoon fund 💕'];

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-brand-600' : 'bg-gray-200'}`}>
      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${value ? 'left-6' : 'left-0.5'}`} />
    </button>
  );
}

// ─── Queue badge ──────────────────────────────────────────────────────────────
function QueueBadge({ count }) {
  if (count === 0) return null;
  return (
    <div className="inline-flex items-center gap-1.5 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-xs font-bold mb-4">
      🛒 Queue: {count} item{count !== 1 ? 's' : ''}
    </div>
  );
}

// ─── Step: Type Chooser ───────────────────────────────────────────────────────
function TypeChooser({ selected, setSelected, onNext }) {
  const toggle = id => setSelected(p => p.includes(id) ? p.filter(t => t !== id) : [...p, id]);
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Build your wishlist your way</h1>
      <p className="text-sm text-gray-400 mb-7">Pick one or more — you can mix all three.</p>
      <div className="space-y-3 mb-8">
        {TYPE_ORDER.map(id => {
          const m = TYPE_META[id];
          const on = selected.includes(id);
          return (
            <button key={id} onClick={() => toggle(id)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${on ? 'border-brand-500 bg-brand-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <span className="text-3xl flex-shrink-0">{m.emoji}</span>
              <div className="flex-grow min-w-0">
                <div className={`font-bold text-base ${on ? 'text-brand-800' : 'text-gray-900'}`}>{m.label}</div>
                <div className="text-sm text-gray-400 mt-0.5 leading-snug">{m.sub}</div>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${on ? 'border-brand-500 bg-brand-500' : 'border-gray-300'}`}>
                {on && <Check className="w-3.5 h-3.5 text-white" />}
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={onNext} disabled={selected.length === 0}
        className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed text-sm transition-colors">
        Continue <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Step: Cash Gift Form ─────────────────────────────────────────────────────
function CashGiftForm({ queue, onAdd, onDone, hasMore, nextType }) {
  const [f, setF] = useState({ title: '', amount: '', description: '', crowdgifting: false, minContrib: '1000', mostWanted: false });
  const [ph, setPh] = useState(0);
  const [err, setErr] = useState({});

  useEffect(() => {
    const t = setInterval(() => setPh(i => (i + 1) % CASH_PH.length), 2800);
    return () => clearInterval(t);
  }, []);

  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const amt = parseInt(f.amount.replace(/,/g, '') || '0');

  const validate = () => {
    const e = {};
    if (!f.title.trim()) e.title = 'Title is required';
    if (amt < 1000) e.amount = 'Minimum is ₦1,000';
    if (amt > 100000000) e.amount = 'Maximum is ₦100,000,000';
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length) { setErr(e); return; }
    onAdd({ id: Date.now(), type: 'cash_gift', title: f.title, amount: amt, description: f.description, crowdgifting: f.crowdgifting, minContrib: parseInt(f.minContrib || 1000), mostWanted: f.mostWanted });
    setF({ title: '', amount: '', description: '', crowdgifting: false, minContrib: '1000', mostWanted: false });
    setErr({});
    toast.success('Added to queue!');
  };

  const fmtAmt = v => { const n = v.replace(/[^0-9]/g, ''); return n ? parseInt(n).toLocaleString() : ''; };

  return (
    <div>
      <QueueBadge count={queue.length} />
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Add a cash gift</h1>
      <p className="text-sm text-gray-400 mb-7">Give guests a goal they can contribute toward.</p>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Gift title <span className="text-red-400">*</span></label>
          <input value={f.title} onChange={e => { set('title', e.target.value); setErr(er => ({ ...er, title: '' })); }}
            placeholder={CASH_PH[ph]}
            className={`w-full px-4 py-3 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white ${err.title ? 'border-red-300' : 'border-gray-200'}`} />
          {err.title && <p className="text-xs text-red-500 mt-1">{err.title}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Goal amount <span className="text-red-400">*</span></label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">₦</span>
            <input value={f.amount} inputMode="numeric"
              onChange={e => { set('amount', fmtAmt(e.target.value)); setErr(er => ({ ...er, amount: '' })); }}
              placeholder="0"
              className={`w-full pl-8 pr-4 py-3 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white ${err.amount ? 'border-red-300' : 'border-gray-200'}`} />
          </div>
          {err.amount && <p className="text-xs text-red-500 mt-1">{err.amount}</p>}
          {amt > 5000000 && !f.crowdgifting && (
            <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
              <span className="flex-shrink-0">💡</span>
              <span>Big goal! Most guests can't pay ₦{(amt / 1000000).toFixed(1)}M+ alone.{' '}
                <button onClick={() => set('crowdgifting', true)} className="font-bold underline">Enable crowd-gifting</button>{' '}
                so multiple people can chip in.
              </span>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Description <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea value={f.description} onChange={e => set('description', e.target.value)} maxLength={300} rows={2}
            placeholder="Tell guests about this gift..."
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white resize-none" />
          <div className="text-right text-xs text-gray-300 mt-0.5">{f.description.length}/300</div>
        </div>

        <div className={`p-4 rounded-2xl border-2 transition-all ${f.crowdgifting ? 'border-brand-300 bg-brand-50' : 'border-gray-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-3">
              <div className="text-sm font-bold text-gray-900">Enable crowd-gifting</div>
              <div className="text-xs text-gray-400 mt-0.5">Let multiple guests contribute together toward one bigger goal.</div>
            </div>
            <Toggle value={f.crowdgifting} onChange={v => set('crowdgifting', v)} />
          </div>
          {f.crowdgifting && (
            <div className="mt-3 pt-3 border-t border-brand-200">
              <p className="text-xs text-brand-700 mb-2">Guests will see a progress bar and can pay any amount until the goal is reached.</p>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">Minimum contribution</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">₦</span>
                <input value={f.minContrib} inputMode="numeric"
                  onChange={e => set('minContrib', e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full pl-7 pr-4 py-2.5 border border-brand-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200">
          <div>
            <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Mark as most wanted
            </div>
            <div className="text-xs text-gray-400 mt-0.5">Pins to top of guest view with a ⭐ badge</div>
          </div>
          <Toggle value={f.mostWanted} onChange={v => set('mostWanted', v)} />
        </div>
      </div>

      {queue.length > 0 && (
        <div className="mb-5 p-4 bg-gray-50 rounded-2xl border border-gray-100">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">In your queue</div>
          <div className="space-y-1.5">
            {queue.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium truncate mr-2">{item.title}</span>
                <span className="text-gray-500 flex-shrink-0">₦{item.amount.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <button onClick={handleAdd}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add to queue
        </button>
        {queue.length > 0 && (
          <button onClick={onDone}
            className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors">
            {hasMore ? `Save & continue to ${TYPE_META[nextType]?.label}` : 'Save & preview wishlist'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Step: Gift URL ───────────────────────────────────────────────────────────
function GiftUrlStep({ onFetched }) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const fetch = async () => {
    if (!url.match(/^https?:\/\/.+/)) { setErr('Enter a valid URL (e.g. https://jumia.com.ng/...)'); return; }
    setLoading(true); setErr('');
    await new Promise(r => setTimeout(r, 1800));
    setLoading(false);
    let domain = 'the store';
    try { domain = new URL(url).hostname.replace('www.', ''); } catch {}
    onFetched({
      url,
      name: `Premium Gift from ${domain}`,
      price: '75000',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      description: 'A perfect addition to your home. High quality, great reviews.',
    });
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Add a gift item from anywhere</h1>
      <p className="text-sm text-gray-400 mb-7">Paste a link from Jumia, Konga, IKEA, Amazon — we'll fetch the details.</p>
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Product URL</label>
          <input type="url" value={url} autoFocus
            onChange={e => { setUrl(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && !loading && fetch()}
            placeholder="https://www.jumia.com.ng/product-name..."
            className={`w-full px-4 py-3 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white ${err ? 'border-red-300' : 'border-gray-200'}`} />
          {err && <p className="text-xs text-red-500 mt-1">{err}</p>}
        </div>
        <div className="flex gap-2 flex-wrap">
          {['Jumia', 'Konga', 'Amazon', 'IKEA', 'Payporte', 'Any site'].map(s => (
            <span key={s} className="px-2.5 py-1 bg-gray-100 rounded-lg text-xs text-gray-500">{s}</span>
          ))}
        </div>
      </div>
      <button onClick={fetch} disabled={loading || !url}
        className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 text-sm transition-colors">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Fetching details...</> : <>Fetch details <ArrowRight className="w-4 h-4" /></>}
      </button>
    </div>
  );
}

// ─── Step: Gift Item Details ──────────────────────────────────────────────────
function GiftDetailsStep({ fetched, queue, onAdd, onDone, onReplaceUrl, hasMore, nextType }) {
  const [f, setF] = useState({ name: fetched?.name || '', price: fetched?.price || '', description: fetched?.description || '', quantity: 1, mostWanted: false, notes: '' });
  const [err, setErr] = useState({});
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleAdd = () => {
    const e = {};
    if (!f.name.trim()) e.name = 'Name is required';
    if (!f.price || parseInt(f.price) < 1) e.price = 'Price is required';
    if (Object.keys(e).length) { setErr(e); return; }
    onAdd({ id: Date.now(), type: 'gift_item', name: f.name, price: parseInt(f.price), description: f.description, quantity: f.quantity, mostWanted: f.mostWanted, notes: f.notes, url: fetched?.url, image: fetched?.image });
    toast.success('Added to queue!');
  };

  return (
    <div>
      <QueueBadge count={queue.length} />
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Confirm item details</h1>
      <p className="text-sm text-gray-400 mb-6">We've pre-filled what we could. Edit anything before adding.</p>

      <button onClick={onReplaceUrl} className="flex items-center gap-1 text-xs text-brand-600 hover:underline mb-3 font-medium">
        <ArrowLeft className="w-3 h-3" /> Replace URL
      </button>

      <div className="w-full h-40 rounded-2xl overflow-hidden bg-gray-100 mb-5">
        {fetched?.image
          ? <img src={fetched.image} alt="Product" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <AlertTriangle className="w-8 h-8" />
              <span className="text-xs">No image detected — guests won't see a picture</span>
            </div>
        }
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Item name <span className="text-red-400">*</span></label>
          <input value={f.name} onChange={e => { set('name', e.target.value); setErr(er => ({ ...er, name: '' })); }}
            className={`w-full px-4 py-3 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white ${err.name ? 'border-red-300' : 'border-gray-200'}`} />
          {err.name && <p className="text-xs text-red-500 mt-1">{err.name}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Price (₦) <span className="text-red-400">*</span></label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">₦</span>
            <input value={f.price} inputMode="numeric"
              onChange={e => { set('price', e.target.value.replace(/[^0-9]/g, '')); setErr(er => ({ ...er, price: '' })); }}
              className={`w-full pl-8 pr-4 py-3 border rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white ${err.price ? 'border-red-300' : 'border-gray-200'}`} />
          </div>
          {err.price && <p className="text-xs text-red-500 mt-1">{err.price}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">How many do you want?</label>
          <div className="flex items-center gap-4">
            {[-1, null, +1].map((delta, i) => delta === null
              ? <span key="v" className="text-2xl font-extrabold text-gray-900 w-8 text-center">{f.quantity}</span>
              : <button key={i} onClick={() => set('quantity', Math.max(1, Math.min(50, f.quantity + delta)))}
                  className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 text-xl font-medium transition-colors">
                  {delta === -1 ? '–' : '+'}
                </button>
            )}
          </div>
          {f.quantity > 1 && <p className="text-xs text-gray-400 mt-1.5">Each guest can buy 1 or more — guests see a + to gift multiples.</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Notes for guest <span className="text-gray-400 font-normal">(optional)</span></label>
          <input value={f.notes} onChange={e => set('notes', e.target.value)} maxLength={200}
            placeholder="e.g., Colour: Navy, Size: L"
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white" />
        </div>

        <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200">
          <div>
            <div className="text-sm font-bold text-gray-900 flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> Mark as most wanted</div>
            <div className="text-xs text-gray-400 mt-0.5">Pins to top of guest view with a ⭐ badge</div>
          </div>
          <Toggle value={f.mostWanted} onChange={v => set('mostWanted', v)} />
        </div>
      </div>

      <div className="space-y-2">
        <button onClick={handleAdd}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors">
          <Plus className="w-4 h-4" /> Add to queue
        </button>
        {queue.length > 0 && (
          <button onClick={onDone}
            className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors">
            {hasMore ? `Save & continue to ${TYPE_META[nextType]?.label}` : 'Save & preview wishlist'}
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
        <button onClick={onReplaceUrl} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">
          Add another item from a different store
        </button>
      </div>
    </div>
  );
}

// ─── Step: Store (empty state) ────────────────────────────────────────────────
function StoreStep({ onNext }) {
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">From the EventPark store</h1>
      <p className="text-sm text-gray-400 mb-7">Vetted vendor products — pricing and delivery handled in one place.</p>
      <div className="text-center py-16 bg-gray-50 rounded-3xl border border-gray-100 mb-6">
        <div className="text-5xl mb-4">🛍️</div>
        <h3 className="font-bold text-gray-900 mb-2">Coming soon</h3>
        <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed mb-5">
          Our vendor store is launching soon with curated products. Get notified when your category goes live.
        </p>
        <button className="px-5 py-2.5 bg-ep-navy text-white font-bold text-sm rounded-xl hover:bg-ep-navy-light transition-colors">
          Notify me when it's live
        </button>
      </div>
      <button onClick={onNext}
        className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm transition-colors">
        Preview wishlist <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Step: Preview ────────────────────────────────────────────────────────────
function PreviewStep({ allItems, onCustomize, onPublish, onEditItems }) {
  const [warned, setWarned] = useState(false);
  if (allItems.length === 1 && !warned) {
    return (
      <div className="text-center">
        <div className="text-5xl mb-5">🤔</div>
        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">You've only added 1 item</h2>
        <p className="text-gray-400 text-sm leading-relaxed mb-8">
          Wishlists with <strong>5+ items</strong> receive 3× more contributions on average. Want to add more before sharing?
        </p>
        <div className="space-y-3">
          <button onClick={onEditItems} className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-colors">Yes, add more items</button>
          <button onClick={() => setWarned(true)} className="w-full py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Publish anyway</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-3 mb-5 text-center text-xs text-brand-700 font-semibold">
        Preview mode — only you can see this until you publish
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm mb-6">
        <div className="bg-gradient-to-r from-ep-navy to-brand-800 p-6 text-center">
          <div className="text-white font-extrabold text-lg mb-1">Tunde & Bola's Wedding Wishlist</div>
          <div className="text-white/50 text-xs">Dec 14, 2026 · 225 days away</div>
          <div className="text-white/50 text-xs mt-2 italic">"Thanks for celebrating with us."</div>
        </div>
        <div className="p-4 space-y-3">
          {allItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-200 flex items-center justify-center text-xl flex-shrink-0">
                {item.type === 'cash_gift'
                  ? '💸'
                  : item.image
                    ? <img src={item.image} alt="" className="w-full h-full object-cover" />
                    : '🎁'
                }
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-sm font-bold text-gray-900 truncate flex items-center gap-1">
                  {item.mostWanted && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                  {item.title || item.name}
                </div>
                <div className="text-xs text-gray-400">
                  {item.type === 'cash_gift' ? (item.crowdgifting ? 'Crowd-gifting · ' : 'Cash gift · ') : 'Gift item · '}
                  ₦{parseInt(item.amount || item.price || 0).toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <button onClick={onCustomize}
          className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors">
          Customise & publish <ArrowRight className="w-4 h-4" />
        </button>
        <button onClick={onPublish}
          className="w-full py-3.5 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          Publish now (skip customisation)
        </button>
        <button onClick={onEditItems} className="w-full text-sm text-brand-600 hover:underline font-medium py-2">Edit items</button>
      </div>
    </div>
  );
}

// ─── Step: Customize ─────────────────────────────────────────────────────────
function CustomizeStep({ meta, setMeta, onPublish }) {
  const set = (k, v) => setMeta(m => ({ ...m, [k]: v }));
  const COLORS = ['#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#8b5cf6', '#ef4444', '#0ea5e9'];
  return (
    <div>
      <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Make it yours</h1>
      <p className="text-sm text-gray-400 mb-7">Personalise how your wishlist looks for guests.</p>
      <div className="space-y-5 mb-8">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Wishlist headline</label>
          <input value={meta.headline} onChange={e => set('headline', e.target.value)} maxLength={80}
            placeholder="Tunde & Bola's Wedding Wishlist"
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Message to guests</label>
          <textarea rows={3} value={meta.message} onChange={e => set('message', e.target.value)}
            placeholder="Thanks for celebrating with us. If you'd like to gift something, here's what would mean a lot."
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent bg-white resize-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">Theme colour</label>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c => (
              <button key={c} onClick={() => set('color', c)}
                className={`w-9 h-9 rounded-xl transition-all ${meta.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                style={{ backgroundColor: c }} />
            ))}
          </div>
        </div>
        {[
          { key: 'showContributors', label: 'Show who gave what', sub: 'Show contributor names to other guests' },
          { key: 'allowAnonymous', label: 'Allow anonymous gifts', sub: 'Let guests hide their name when gifting' },
        ].map(t => (
          <div key={t.key} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-200">
            <div>
              <div className="text-sm font-bold text-gray-900">{t.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{t.sub}</div>
            </div>
            <Toggle value={meta[t.key]} onChange={v => set(t.key, v)} />
          </div>
        ))}
      </div>
      <button onClick={onPublish}
        className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors">
        Save & publish <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Step: Published ──────────────────────────────────────────────────────────
function PublishedStep({ navigate }) {
  const slug = 'tunde-bola-dec2026';
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(`https://eventpark.ng/wish/${slug}`).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="text-center">
      <div className="text-6xl mb-4">🎉</div>
      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your wishlist is live!</h2>
      <p className="text-gray-400 text-sm mb-8">Share the link with guests and start receiving gifts.</p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5 text-left">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Your wishlist link</div>
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2.5 text-sm text-gray-600 font-mono truncate border border-gray-200">
            eventpark.ng/wish/{slug}
          </div>
          <button onClick={copy}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold flex-shrink-0 transition-colors ${copied ? 'bg-green-500 text-white' : 'bg-ep-navy text-white hover:bg-ep-navy-light'}`}>
            {copied ? <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Copied</span> : 'Copy'}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <button className="flex items-center justify-center gap-2 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-bold transition-colors">
            📱 WhatsApp
          </button>
          <button className="flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-sm font-bold transition-colors">
            📸 Instagram Story
          </button>
        </div>

        <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 rounded-lg bg-gray-900 flex-shrink-0 p-1.5 grid grid-cols-5 gap-0.5">
            {Array.from({ length: 25 }, (_, i) => (
              <div key={i} className={`rounded-sm ${[0,2,4,10,12,14,20,22,24,3,21,7,17].includes(i) ? 'bg-white' : 'bg-gray-900'}`} />
            ))}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-900">QR code</div>
            <div className="text-xs text-gray-400 mt-0.5">Print on save-the-dates or invitations</div>
            <button className="text-xs text-brand-600 font-semibold hover:underline mt-1 flex items-center gap-1">
              <Download className="w-3 h-3" /> Download PNG
            </button>
          </div>
        </div>
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-2xl p-4 mb-6 text-left">
        <div className="flex gap-2 text-sm text-brand-800">
          <span className="flex-shrink-0">💡</span>
          <span><strong>Tip:</strong> Pin the link in your wedding WhatsApp group so latecomers can always find it.</span>
        </div>
      </div>

      <button onClick={() => navigate('/dashboard/wishlist')}
        className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl text-sm transition-colors mb-3">
        Go to My Wishlist
      </button>
      <Link to={`/wish/${slug}`} className="block text-sm text-brand-600 hover:underline font-medium">
        View public page →
      </Link>
    </div>
  );
}

// ─── Flow Continue Modal ──────────────────────────────────────────────────────
function FlowContinueModal({ doneType, doneCount, nextType, onContinue, onFinish }) {
  const done = TYPE_META[doneType];
  const next = TYPE_META[nextType];
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-6 text-center">
        <div className="text-4xl mb-3">✓</div>
        <h3 className="text-lg font-extrabold text-gray-900 mb-1">{done?.label} queued — {doneCount} item{doneCount !== 1 ? 's' : ''}</h3>
        <p className="text-gray-400 text-sm mb-6">Ready to add {next?.emoji} {next?.label} next?</p>
        <div className="space-y-2">
          <button onClick={onContinue}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3 rounded-2xl text-sm transition-colors">
            Yes, continue
          </button>
          <button onClick={onFinish}
            className="w-full py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
            Save & finish here
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
const PROG_STEPS = [
  { key: 'types', label: 'Type' },
  { key: 'items', label: 'Items' },
  { key: 'preview', label: 'Preview' },
  { key: 'published', label: 'Done' },
];
function stepToProgress(step) {
  if (step === 'types') return 0;
  if (['cash_form', 'gift_url', 'gift_details', 'store'].includes(step)) return 1;
  if (['preview', 'customize'].includes(step)) return 2;
  return 3;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function WishlistCreator() {
  const navigate = useNavigate();
  const [step, setStep] = useState('types');
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [pendingTypes, setPendingTypes] = useState([]);
  const [cashItems, setCashItems] = useState([]);
  const [giftItems, setGiftItems] = useState([]);
  const [fetchedData, setFetchedData] = useState(null);
  const [showContinue, setShowContinue] = useState(false);
  const [continueCtx, setContinueCtx] = useState({ doneType: '', nextType: '' });
  const [meta, setMeta] = useState({ headline: '', message: '', color: '#6366f1', showContributors: true, allowAnonymous: true });

  const allItems = [...cashItems, ...giftItems];
  const progIdx = stepToProgress(step);

  function startFlow() {
    const ordered = TYPE_ORDER.filter(t => selectedTypes.includes(t));
    const [first, ...rest] = ordered;
    setPendingTypes(rest);
    goToFirstFor(first);
  }

  function goToFirstFor(type) {
    if (type === 'cash_gift') setStep('cash_form');
    else if (type === 'gift_item') setStep('gift_url');
    else if (type === 'store') setStep('store');
    else setStep('preview');
  }

  function finishType(doneType, queueForType) {
    if (pendingTypes.length > 0) {
      const next = pendingTypes[0];
      setContinueCtx({ doneType, nextType: next, doneCount: queueForType });
      setShowContinue(true);
    } else {
      setStep('preview');
    }
  }

  function proceedToNext() {
    setShowContinue(false);
    const [next, ...rest] = pendingTypes;
    setPendingTypes(rest);
    goToFirstFor(next);
  }

  function finishHere() {
    setShowContinue(false);
    setPendingTypes([]);
    setStep('preview');
  }

  function goBack() {
    if (step === 'types') navigate('/dashboard/wishlist');
    else if (['cash_form', 'gift_url', 'store'].includes(step)) setStep('types');
    else if (step === 'gift_details') setStep('gift_url');
    else if (step === 'preview') {
      const lastType = [...TYPE_ORDER].reverse().find(t => selectedTypes.includes(t));
      goToFirstFor(lastType || 'types');
    }
    else if (step === 'customize') setStep('preview');
    else if (step === 'published') navigate('/dashboard/wishlist');
  }

  const hasNextType = pendingTypes.length > 0;
  const nextType = pendingTypes[0];

  return (
    <div className="min-h-screen bg-ep-blue-light flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between px-12 py-14 bg-ep-navy relative overflow-hidden w-[380px] flex-shrink-0">
        <div className="absolute inset-0 dot-pattern-white opacity-20" />
        <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-brand-600 rounded-full opacity-20 blur-3xl" />
        <div className="relative"><EventParkLogo light size="md" /></div>
        <div className="relative">
          <div className="text-brand-400 text-xs font-bold uppercase tracking-widest mb-3">Create Wishlist</div>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Let guests give<br /><span className="text-ep-orange">exactly what you want.</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">Cash gifts, gift items, or store picks — mix and match to build your perfect wishlist.</p>
        </div>
        <div className="relative space-y-3">
          {[
            { emoji: '💸', text: 'Cash gifts with crowd-gifting' },
            { emoji: '🎁', text: 'Gift items from any website' },
            { emoji: '🛍️', text: 'Products from EventPark vendors' },
          ].map(f => (
            <div key={f.emoji} className="flex items-center gap-3 text-white/70 text-sm">
              <span>{f.emoji}</span> {f.text}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-8 py-5 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
          <button onClick={goBack}
            className={`flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition-colors ${step === 'published' ? 'invisible' : ''}`}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            {PROG_STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition-all ${
                  i < progIdx ? 'bg-brand-600 text-white' : i === progIdx ? 'bg-ep-navy text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {i < progIdx ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:inline ${i === progIdx ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
                {i < PROG_STEPS.length - 1 && <div className="w-6 h-px bg-gray-200" />}
              </div>
            ))}
          </div>
          <Link to="/dashboard/wishlist" className="text-gray-400 hover:text-gray-600 transition-colors"><X className="w-5 h-5" /></Link>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-start justify-center px-4 sm:px-8 py-8 sm:py-12 overflow-y-auto">
          <div className="w-full max-w-md">
            {step === 'types' && (
              <TypeChooser selected={selectedTypes} setSelected={setSelectedTypes} onNext={startFlow} />
            )}
            {step === 'cash_form' && (
              <CashGiftForm
                queue={cashItems}
                onAdd={item => setCashItems(p => [...p, item])}
                onDone={() => finishType('cash_gift', cashItems.length + 1)}
                hasMore={hasNextType}
                nextType={nextType}
              />
            )}
            {step === 'gift_url' && (
              <GiftUrlStep onFetched={data => { setFetchedData(data); setStep('gift_details'); }} />
            )}
            {step === 'gift_details' && (
              <GiftDetailsStep
                fetched={fetchedData}
                queue={giftItems}
                onAdd={item => setGiftItems(p => [...p, item])}
                onDone={() => finishType('gift_item', giftItems.length + 1)}
                onReplaceUrl={() => setStep('gift_url')}
                hasMore={hasNextType}
                nextType={nextType}
              />
            )}
            {step === 'store' && <StoreStep onNext={() => setStep('preview')} />}
            {step === 'preview' && (
              <PreviewStep
                allItems={allItems}
                onCustomize={() => setStep('customize')}
                onPublish={() => setStep('published')}
                onEditItems={() => {
                  const firstSelected = TYPE_ORDER.find(t => selectedTypes.includes(t));
                  goToFirstFor(firstSelected || 'types');
                }}
              />
            )}
            {step === 'customize' && (
              <CustomizeStep meta={meta} setMeta={setMeta} onPublish={() => setStep('published')} />
            )}
            {step === 'published' && <PublishedStep navigate={navigate} />}
          </div>
        </div>
      </div>

      {showContinue && (
        <FlowContinueModal
          doneType={continueCtx.doneType}
          doneCount={continueCtx.doneCount}
          nextType={continueCtx.nextType}
          onContinue={proceedToNext}
          onFinish={finishHere}
        />
      )}
    </div>
  );
}
