import { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Loader2, Check, ArrowRight, ExternalLink, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const WISHLIST = {
  slug: 'tunde-bola-dec2026',
  headline: "Tunde & Bola's Wedding Wishlist",
  message: "Thanks for celebrating with us! If you'd like to send a gift, here's what would mean a lot to us. Every contribution is deeply appreciated 💕",
  event: { date: 'Dec 14, 2026', daysLeft: 225 },
  hosts: [{ name: 'Tunde Adesanya', initials: 'TA' }, { name: 'Bola Okafor', initials: 'BO' }],
  stats: { items: 6, gifted: 2, contributors: 19 },
  items: [
    { id: 1, type: 'cash_gift', title: 'Honeymoon Fund 🌴', amount: 500000, raised: 185000, contributors: 12, crowdgifting: true, minContrib: 5000, mostWanted: true, description: "We've always dreamed of a beachside honeymoon. Help make it real!", status: 'open' },
    { id: 2, type: 'cash_gift', title: 'New Home Fund 🏠', amount: 2000000, raised: 450000, contributors: 7, crowdgifting: true, minContrib: 10000, mostWanted: false, description: 'Saving for our first home together.', status: 'open' },
    { id: 3, type: 'gift_item', name: 'KitchenAid Stand Mixer', price: 85000, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400', quantity: 1, remaining: 0, mostWanted: true, notes: 'Colour: Empire Red', status: 'gifted', url: 'https://jumia.com.ng' },
    { id: 4, type: 'gift_item', name: 'Premium Luggage Set', price: 120000, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', quantity: 2, remaining: 1, mostWanted: false, notes: '', status: 'open', url: 'https://jumia.com.ng' },
    { id: 5, type: 'cash_gift', title: 'Wedding Car 🚗', amount: 800000, raised: 800000, contributors: 15, crowdgifting: true, minContrib: 5000, mostWanted: false, description: 'Help us ride off in style!', status: 'funded' },
    { id: 6, type: 'gift_item', name: 'Dyson Air Purifier', price: 320000, image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400', quantity: 1, remaining: 1, mostWanted: false, notes: '', status: 'reserved', reservedBy: 'A friend', url: 'https://jumia.com.ng' },
  ],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ item }) {
  if (item.status === 'gifted' || item.status === 'funded')
    return <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{item.status === 'funded' ? '✅ Funded' : '✅ Gifted'}</span>;
  if (item.status === 'reserved')
    return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-semibold">🔒 Reserved</span>;
  if (item.mostWanted)
    return <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">⭐ Most wanted</span>;
  return null;
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end p-4 pb-0">
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}

// ─── Cash Gift Payment Flow ───────────────────────────────────────────────────
function CashGiftModal({ item, onClose }) {
  const [step, setStep] = useState('p1');
  const [f, setF] = useState({ name: '', email: '', amount: item.crowdgifting ? String(item.minContrib) : String(item.amount - item.raised), anonymous: false, note: '' });
  const [paying, setPaying] = useState(false);

  const remaining = item.amount - item.raised;
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  const amt = parseInt(f.amount.replace(/,/g, '') || '0');
  const fee = Math.min(Math.round(amt * 0.015), 2000);
  const total = amt + fee;

  const CHIPS = item.crowdgifting
    ? [item.minContrib, Math.round(remaining * 0.25), Math.round(remaining * 0.5), remaining].filter((v, i, a) => a.indexOf(v) === i && v > 0)
    : [Math.round(remaining * 0.25), Math.round(remaining * 0.5), remaining];

  const handlePay = async () => {
    setPaying(true);
    await new Promise(r => setTimeout(r, 2000));
    setPaying(false);
    setStep('success');
  };

  if (step === 'success') return (
    <div className="text-center py-4">
      <div className="text-5xl mb-4">🎉</div>
      <h3 className="text-xl font-extrabold text-gray-900 mb-2">Gift received — thank you!</h3>
      <p className="text-gray-400 text-sm mb-2">Your ₦{amt.toLocaleString()} is on its way to {WISHLIST.hosts[0].name.split(' ')[0]}.</p>
      {item.crowdgifting && (
        <div className="my-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>₦{(item.raised + amt).toLocaleString()} raised</span>
            <span>₦{item.amount.toLocaleString()} goal</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
              style={{ width: `${Math.min(((item.raised + amt) / item.amount) * 100, 100)}%` }} />
          </div>
        </div>
      )}
      <div className="space-y-2 mt-6">
        <button onClick={onClose} className="w-full py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Back to wishlist</button>
        <Link to="/signup" className="block w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-2xl text-sm font-bold transition-colors text-center">
          Get your own free wishlist →
        </Link>
      </div>
    </div>
  );

  if (step === 'p2') return (
    <div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-1">Confirm and pay</h3>
      <div className="bg-gray-50 rounded-2xl p-4 mb-5 space-y-2.5 text-sm">
        <div className="flex justify-between"><span className="text-gray-500">Going to</span><span className="font-semibold text-right">{WISHLIST.headline}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Your name</span><span className="font-semibold">{f.anonymous ? 'Anonymous' : f.name}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Gift amount</span><span className="font-semibold">₦{amt.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-gray-500">Processing fee</span><span className="font-semibold text-gray-400">₦{fee.toLocaleString()}</span></div>
        <div className="border-t border-gray-200 pt-2.5 flex justify-between font-extrabold text-gray-900"><span>Total to pay</span><span>₦{total.toLocaleString()}</span></div>
      </div>
      <p className="text-xs text-gray-400 mb-5">Fees are paid by you so 100% of your gift amount goes to {WISHLIST.hosts[0].name.split(' ')[0]}.</p>
      <div className="space-y-2">
        <button onClick={handlePay} disabled={paying}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
          {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing...</> : `Pay ₦${total.toLocaleString()} with Paystack`}
        </button>
        <button onClick={() => setStep('p1')} className="w-full text-sm text-gray-400 hover:text-gray-600 py-2 transition-colors">← Back</button>
      </div>
    </div>
  );

  return (
    <div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-1">Send a cash gift</h3>
      <p className="text-sm text-gray-400 mb-1">toward <strong className="text-gray-700">{item.title}</strong></p>
      {item.crowdgifting && (
        <div className="my-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>₦{item.raised.toLocaleString()} raised · {item.contributors} contributors</span>
            <span>₦{item.amount.toLocaleString()}</span>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400"
              style={{ width: `${Math.min((item.raised / item.amount) * 100, 100)}%` }} />
          </div>
        </div>
      )}
      <div className="space-y-4 mt-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Your name <span className="text-red-400">*</span></label>
          <input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Aunty Ngozi"
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Email address <span className="text-red-400">*</span></label>
          <input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">How much would you like to send?</label>
          <div className="flex gap-2 flex-wrap mb-3">
            {CHIPS.map(c => (
              <button key={c} onClick={() => set('amount', c.toLocaleString())}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${f.amount === c.toLocaleString() ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                ₦{c.toLocaleString()}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-500 text-sm">₦</span>
            <input value={f.amount} inputMode="numeric"
              onChange={e => set('amount', e.target.value.replace(/[^0-9,]/g, ''))}
              className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
          </div>
        </div>
        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl">
          <span className="text-sm text-gray-700 font-medium">Send anonymously</span>
          <button onClick={() => set('anonymous', !f.anonymous)}
            className={`relative w-11 h-6 rounded-full transition-colors ${f.anonymous ? 'bg-brand-600' : 'bg-gray-200'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${f.anonymous ? 'left-5.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
      <button onClick={() => setStep('p2')} disabled={!f.name || !f.email || amt < 100}
        className="w-full mt-6 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
        Continue to payment <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Reserve Modal ────────────────────────────────────────────────────────────
function ReserveModal({ item, onClose }) {
  const [f, setF] = useState({ name: '', email: '', qty: 1, anonymous: false, note: '' });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    setDone(true);
  };

  if (done) return (
    <div className="text-center py-4">
      <div className="text-5xl mb-4">✓</div>
      <h3 className="text-xl font-extrabold text-gray-900 mb-2">Reserved!</h3>
      <p className="text-gray-400 text-sm mb-1">We sent a confirmation to <strong>{f.email}</strong>.</p>
      <p className="text-gray-400 text-sm mb-6">You have <strong>48 hours</strong> to complete the purchase.</p>
      <button onClick={onClose} className="w-full py-3 bg-ep-navy text-white rounded-2xl text-sm font-bold hover:bg-ep-navy-light transition-colors">Back to wishlist</button>
    </div>
  );

  return (
    <div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-1">Reserve {item.name}</h3>
      <p className="text-xs text-gray-400 mb-5">Reservations expire in <strong>48 hours</strong>. After that, the item opens for someone else.</p>
      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl mb-5">
        <img src={item.image} alt="" className="w-14 h-14 rounded-xl object-cover flex-shrink-0" />
        <div>
          <div className="font-bold text-gray-900 text-sm">{item.name}</div>
          <div className="text-gray-400 text-xs">₦{item.price.toLocaleString()}</div>
          {item.notes && <div className="text-xs text-brand-600 mt-0.5">{item.notes}</div>}
        </div>
      </div>
      <div className="space-y-4 mb-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Your name <span className="text-red-400">*</span></label>
          <input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Your full name"
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Email address <span className="text-red-400">*</span></label>
          <input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
          <p className="text-xs text-gray-400 mt-1">We'll send your confirmation here.</p>
        </div>
        <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl">
          <span className="text-sm text-gray-700 font-medium">Send anonymously</span>
          <button onClick={() => set('anonymous', !f.anonymous)}
            className={`relative w-11 h-6 rounded-full transition-colors ${f.anonymous ? 'bg-brand-600' : 'bg-gray-200'}`}>
            <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${f.anonymous ? 'left-5.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>
      <button onClick={handleConfirm} disabled={loading || !f.name || !f.email}
        className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Reserving...</> : 'Confirm reservation'}
      </button>
    </div>
  );
}

// ─── Buy Now Bridge Modal ─────────────────────────────────────────────────────
function BuyBridgeModal({ item, onClose, onReserveInstead }) {
  const [step, setStep] = useState('g1');
  const [f, setF] = useState({ name: '', email: '' });
  const [returned, setReturned] = useState(false);
  const [purchaseStep, setPurchaseStep] = useState('confirm');
  const [orderNum, setOrderNum] = useState('');
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));
  let domain = '';
  try { domain = new URL(item.url || '').hostname.replace('www.', ''); } catch {}

  const handleOpenSite = () => {
    setStep('g2_return');
    window.open(item.url, '_blank');
    setTimeout(() => setReturned(true), 3000);
  };

  const handleMarkGifted = async () => {
    setPurchaseStep('done');
    toast.success('Marked as gifted! 🎉');
    setTimeout(onClose, 2000);
  };

  if (step === 'g1') return (
    <div>
      <h3 className="text-lg font-extrabold text-gray-900 mb-5">Complete your purchase of {item.name}</h3>
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div className="bg-gray-50 rounded-2xl p-4">
          <img src={item.image} alt="" className="w-full h-28 object-cover rounded-xl mb-3" />
          <div className="font-bold text-gray-900 text-sm">{item.name}</div>
          <div className="text-gray-500 text-xs mt-0.5">₦{item.price.toLocaleString()} each</div>
          {item.notes && <div className="text-xs text-brand-600 mt-1">{item.notes}</div>}
        </div>
        <div className="bg-brand-50 rounded-2xl p-4">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Deliver to</div>
          <div className="text-sm font-bold text-gray-900 mb-1">Tunde & Bola Adesanya</div>
          <div className="text-xs text-gray-500 leading-relaxed">14 Adeola Odeku Street,<br />Victoria Island, Lagos 101241</div>
          <button className="mt-2 text-xs text-brand-600 font-semibold hover:underline">Copy address</button>
        </div>
      </div>
      <div className="space-y-3 mb-5">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Your name <span className="text-red-400">*</span></label>
          <input value={f.name} onChange={e => set('name', e.target.value)} placeholder="Your full name"
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1.5">Email <span className="text-red-400">*</span></label>
          <input type="email" value={f.email} onChange={e => set('email', e.target.value)} placeholder="you@email.com"
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
        </div>
      </div>
      <div className="space-y-2">
        <button onClick={handleOpenSite} disabled={!f.name || !f.email}
          className="w-full bg-ep-navy hover:bg-ep-navy-light text-white font-bold py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
          Open {domain || 'merchant site'} <ExternalLink className="w-4 h-4" />
        </button>
        <button onClick={onReserveInstead} className="w-full py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
          Reserve this item instead
        </button>
      </div>
    </div>
  );

  if (step === 'g2_return') return (
    <div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 text-sm text-amber-800">
        <div className="font-bold mb-1">When you check out on {domain}:</div>
        <ol className="space-y-1 text-xs list-decimal list-inside">
          <li>Copy the delivery address and paste it as your delivery address.</li>
          <li>After payment, come back here so we can mark this gift as gifted.</li>
        </ol>
      </div>
      {!returned ? (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-brand-400 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Waiting for you to return from {domain}...</p>
        </div>
      ) : (
        <div>
          <h3 className="text-base font-extrabold text-gray-900 mb-4">Welcome back — did you complete your purchase?</h3>
          <div className="space-y-2">
            <button onClick={() => setStep('g4')}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-2xl text-sm font-bold transition-colors">
              ✓ Yes, I purchased it
            </button>
            <button onClick={onClose}
              className="w-full py-3 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
              Not yet — but I plan to
            </button>
            <button onClick={onClose}
              className="w-full py-3 text-sm text-gray-400 hover:text-gray-600 transition-colors">
              No — cancel my interest
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (step === 'g4') {
    if (purchaseStep === 'done') return (
      <div className="text-center py-4">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-xl font-extrabold text-gray-900 mb-2">Awesome — gift marked!</h3>
        <p className="text-gray-400 text-sm">The couple will receive a notification about your gift.</p>
      </div>
    );
    return (
      <div>
        <h3 className="text-lg font-extrabold text-gray-900 mb-1">Awesome — let's mark it as gifted</h3>
        <p className="text-xs text-gray-400 mb-5">Paste your order number so the couple knows it's been sent.</p>
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">Order number from {domain} <span className="text-red-400">*</span></label>
            <input value={orderNum} onChange={e => setOrderNum(e.target.value)} placeholder="e.g. JM-2024-0043821"
              className="w-full px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 bg-white" />
          </div>
        </div>
        <button onClick={handleMarkGifted} disabled={!orderNum}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3.5 rounded-2xl text-sm disabled:opacity-50 transition-colors">
          Mark as gifted
        </button>
      </div>
    );
  }
  return null;
}

// ─── Item Card ────────────────────────────────────────────────────────────────
function ItemCard({ item, onSendMoney, onReserve, onBuyNow }) {
  const disabled = ['gifted', 'funded', 'reserved'].includes(item.status);
  const pct = item.type === 'cash_gift' ? Math.min((item.raised / item.amount) * 100, 100) : 0;

  return (
    <div className={`bg-white rounded-3xl border overflow-hidden transition-all ${disabled ? 'border-gray-100 opacity-75' : 'border-gray-100 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-50'}`}>
      {item.type === 'gift_item' ? (
        <div className="relative h-44 overflow-hidden bg-gray-100">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          {disabled && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><StatusBadge item={item} /></div>}
          {!disabled && item.mostWanted && <div className="absolute top-3 left-3"><StatusBadge item={item} /></div>}
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-r from-ep-navy to-brand-700 flex items-center justify-center relative overflow-hidden">
          <div className="text-4xl">{item.status === 'funded' ? '✅' : '💸'}</div>
          {!disabled && item.mostWanted && <div className="absolute top-2 right-2"><StatusBadge item={item} /></div>}
        </div>
      )}

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-bold text-gray-900 text-sm leading-snug">{item.title || item.name}</h3>
          {disabled && item.type === 'gift_item' && <StatusBadge item={item} />}
        </div>

        {item.type === 'cash_gift' ? (
          <div className="mb-4">
            {item.crowdgifting ? (
              <>
                <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" />{item.contributors} contributors</span>
                  <span>{Math.round(pct)}% funded</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>₦{item.raised.toLocaleString()} raised</span>
                  <span>₦{item.amount.toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div className="text-sm font-extrabold text-gray-900">₦{item.amount.toLocaleString()}</div>
            )}
          </div>
        ) : (
          <div className="mb-4">
            <div className="text-sm font-extrabold text-gray-900">₦{item.price.toLocaleString()}</div>
            {item.notes && <div className="text-xs text-gray-400 mt-0.5">{item.notes}</div>}
            {item.remaining > 0 && <div className="text-xs text-gray-400 mt-0.5">{item.remaining} of {item.quantity} remaining</div>}
          </div>
        )}

        {!disabled && (
          <div className="flex gap-2">
            {item.type === 'cash_gift' && (
              <button onClick={() => onSendMoney(item)}
                className="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                Send money
              </button>
            )}
            {item.type === 'gift_item' && <>
              <button onClick={() => onReserve(item)}
                className="flex-1 border-2 border-brand-200 text-brand-700 hover:bg-brand-50 text-xs font-bold py-2.5 rounded-xl transition-colors">
                Reserve
              </button>
              <button onClick={() => onBuyNow(item)}
                className="flex-1 bg-ep-navy hover:bg-ep-navy-light text-white text-xs font-bold py-2.5 rounded-xl transition-colors">
                Buy now
              </button>
            </>}
          </div>
        )}
        {disabled && (
          <div className="text-center py-1">
            <StatusBadge item={item} />
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Public Wishlist Page ─────────────────────────────────────────────────────
export default function PublicWishlist() {
  const [filter, setFilter] = useState('all');
  const [modal, setModal] = useState(null); // { type: 'cash'|'reserve'|'buy', item }

  const filtered = WISHLIST.items.filter(item => {
    if (filter === 'cash') return item.type === 'cash_gift';
    if (filter === 'gift') return item.type === 'gift_item';
    return true;
  }).sort((a, b) => {
    if (a.mostWanted && !b.mostWanted) return -1;
    if (!a.mostWanted && b.mostWanted) return 1;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-br from-ep-navy via-brand-800 to-ep-navy relative overflow-hidden pt-16">
        <div className="absolute inset-0 dot-pattern-white opacity-20" />
        <div className="absolute right-0 top-0 w-96 h-96 bg-brand-500 rounded-full opacity-10 blur-3xl" />
        <div className="relative max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="flex items-center justify-center -space-x-3 mb-5">
            {WISHLIST.hosts.map(h => (
              <div key={h.name} className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 border-4 border-ep-navy flex items-center justify-center text-white font-extrabold">
                {h.initials}
              </div>
            ))}
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2">{WISHLIST.headline}</h1>
          <div className="text-white/50 text-sm mb-3">{WISHLIST.event.date} · {WISHLIST.event.daysLeft} days away</div>
          <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto mb-6">{WISHLIST.message}</p>
          <div className="flex items-center justify-center gap-6 text-xs text-white/40">
            <span>{WISHLIST.stats.items} items</span>
            <span>·</span>
            <span>{WISHLIST.stats.gifted} already gifted</span>
            <span>·</span>
            <span>{WISHLIST.stats.contributors} contributors</span>
          </div>
        </div>

        {/* Filter chips */}
        <div className="relative flex justify-center gap-2 pb-5 px-4">
          {[
            { key: 'all', label: 'All items' },
            { key: 'cash', label: '💸 Cash gifts' },
            { key: 'gift', label: '🎁 Gift items' },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${filter === f.key ? 'bg-white text-ep-navy' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onSendMoney={item => setModal({ type: 'cash', item })}
              onReserve={item => setModal({ type: 'reserve', item })}
              onBuyNow={item => setModal({ type: 'buy', item })}
            />
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-10 border-t border-gray-100">
        <p className="text-xs text-gray-400 mb-2">Powered by</p>
        <div className="flex items-center justify-center gap-2 text-gray-600 font-bold text-sm mb-4">
          <div className="w-6 h-6 bg-ep-navy rounded-md" />
          EventPark
        </div>
        <Link to="/signup" className="inline-flex items-center gap-1.5 text-xs text-brand-600 hover:underline font-semibold">
          Have a wishlist of your own? Get started free →
        </Link>
      </div>

      {/* Modals */}
      {modal?.type === 'cash' && (
        <Modal onClose={() => setModal(null)}>
          <CashGiftModal item={modal.item} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'reserve' && (
        <Modal onClose={() => setModal(null)}>
          <ReserveModal item={modal.item} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal?.type === 'buy' && (
        <Modal onClose={() => setModal(null)}>
          <BuyBridgeModal
            item={modal.item}
            onClose={() => setModal(null)}
            onReserveInstead={() => setModal({ type: 'reserve', item: modal.item })}
          />
        </Modal>
      )}
    </div>
  );
}
