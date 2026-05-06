import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { EventParkLogo } from '../../components/Logo';
import { Calendar, MapPin, Clock, CheckCircle2, XCircle, HelpCircle, Download, Share2, ChevronRight } from 'lucide-react';

const MOCK_GUESTS = {
  'abc123': {
    firstName: 'Ngozi',
    lastName: 'Okonkwo',
    email: 'ngozi@email.com',
    method: 'manual',
    plusOneAllowed: true,
    event: {
      name: "Tunde & Bola's Wedding",
      date: 'December 14, 2026',
      time: '12:00 PM',
      venue: 'Eko Hotel & Suites',
      city: 'Lagos',
      hostFirstName: 'Tunde',
      ivTemplate: 'Royal Gold',
    },
  },
  'def456': {
    firstName: null,
    lastName: null,
    email: 'emeka@email.com',
    method: 'email_invite',
    plusOneAllowed: false,
    event: {
      name: "Mum's 60th Birthday",
      date: 'August 3, 2026',
      time: '3:00 PM',
      venue: 'Sheraton Hotel',
      city: 'Lagos',
      hostFirstName: 'Amaka',
      ivTemplate: 'Confetti Pop',
    },
  },
  'ghi789': {
    firstName: 'Bisi',
    lastName: 'Williams',
    email: 'bisi@email.com',
    method: 'csv',
    plusOneAllowed: false,
    event: {
      name: "Tunde & Bola's Wedding",
      date: 'December 14, 2026',
      time: '12:00 PM',
      venue: 'Eko Hotel & Suites',
      city: 'Lagos',
      hostFirstName: 'Tunde',
      ivTemplate: 'Royal Gold',
    },
  },
  'jkl012': {
    firstName: 'Kemi',
    lastName: 'Johnson',
    email: 'kemi@email.com',
    method: 'manual',
    plusOneAllowed: false,
    event: {
      name: "Tunde & Bola's Wedding",
      date: 'December 14, 2026',
      time: '12:00 PM',
      venue: 'Eko Hotel & Suites',
      city: 'Lagos',
      hostFirstName: 'Tunde',
      ivTemplate: 'Royal Gold',
    },
  },
  'mno345': {
    firstName: 'Grace',
    lastName: '',
    email: 'grace@email.com',
    method: 'manual',
    plusOneAllowed: true,
    event: {
      name: "Tunde & Bola's Wedding",
      date: 'December 14, 2026',
      time: '12:00 PM',
      venue: 'Eko Hotel & Suites',
      city: 'Lagos',
      hostFirstName: 'Tunde',
      ivTemplate: 'Royal Gold',
    },
  },
  'pqr678': {
    firstName: 'Tolu',
    lastName: 'Okafor',
    email: 'tolu@email.com',
    method: 'manual',
    plusOneAllowed: false,
    event: {
      name: "Tunde & Bola's Wedding",
      date: 'December 14, 2026',
      time: '12:00 PM',
      venue: 'Eko Hotel & Suites',
      city: 'Lagos',
      hostFirstName: 'Tunde',
      ivTemplate: 'Lagos Sunset',
    },
  },
  'stu901': {
    firstName: 'Chukwuemeka',
    lastName: 'F.',
    email: 'chuks@email.com',
    method: 'manual',
    plusOneAllowed: true,
    event: {
      name: "Tunde & Bola's Wedding",
      date: 'December 14, 2026',
      time: '12:00 PM',
      venue: 'Eko Hotel & Suites',
      city: 'Lagos',
      hostFirstName: 'Tunde',
      ivTemplate: 'Royal Gold',
    },
  },
  'vwx234': {
    firstName: 'Fatima',
    lastName: 'Al-Rashid',
    email: 'fatima@email.com',
    method: 'manual',
    plusOneAllowed: false,
    event: {
      name: "Tunde & Bola's Wedding",
      date: 'December 14, 2026',
      time: '12:00 PM',
      venue: 'Eko Hotel & Suites',
      city: 'Lagos',
      hostFirstName: 'Tunde',
      ivTemplate: 'Modern Minimal',
    },
  },
};

// ── Template styles ─────────────────────────────────────────────────────────
function getTemplateStyles(ivTemplate) {
  if (ivTemplate === 'Royal Gold') {
    return {
      cardBg: '#FDF8F0',
      headerBg: 'linear-gradient(135deg, #2c1f0e 0%, #5a3a1a 50%, #7a4f1e 100%)',
      border: '2px solid #C9A84C',
      headerTextColor: '#F5E6C8',
      invitedTextColor: '#C9A84C',
      eventNameColor: '#2c1f0e',
      bodyTextColor: '#5a3a1a',
      accentColor: '#C9A84C',
    };
  }
  if (ivTemplate === 'Confetti Pop') {
    return {
      cardBg: '#ffffff',
      headerBg: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 40%, #3b82f6 100%)',
      border: '2px solid #e5e7eb',
      headerTextColor: '#ffffff',
      invitedTextColor: '#fde68a',
      eventNameColor: '#1e1b4b',
      bodyTextColor: '#374151',
      accentColor: '#a855f7',
    };
  }
  return {
    cardBg: '#ffffff',
    headerBg: 'linear-gradient(135deg, #0A0D3B 0%, #1a237e 100%)',
    border: '2px solid #e5e7eb',
    headerTextColor: '#ffffff',
    invitedTextColor: '#a5b4fc',
    eventNameColor: '#0A0D3B',
    bodyTextColor: '#374151',
    accentColor: '#4f46e5',
  };
}

// ── Invitation Card ──────────────────────────────────────────────────────────
function InvitationCard({ event }) {
  const tpl = getTemplateStyles(event.ivTemplate);

  return (
    <div
      className="rounded-3xl overflow-hidden shadow-2xl w-full max-w-sm mx-auto"
      style={{ background: tpl.cardBg, border: tpl.border }}
    >
      {/* Header */}
      <div
        className="relative px-6 py-8 flex flex-col items-center gap-2"
        style={{ background: tpl.headerBg, minHeight: '140px' }}
      >
        {/* EP logo small */}
        <div className="flex items-center gap-1.5 mb-1">
          <svg width="18" height="18" viewBox="0 0 100 100" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M50 44C50 44 50 20 28 20C14 20 6 30 6 40C6 52 16 60 28 60C16 60 6 68 6 80C6 90 14 100 28 100C40 100 50 90 50 78C50 90 60 100 72 100C86 100 94 90 94 80C94 68 84 60 72 60C84 60 94 52 94 40C94 30 86 20 72 20C50 20 50 44 50 44ZM50 56C50 56 50 80 28 80C19 80 18 72 18 70C18 64 22 60 28 60C34 60 38 56 38 50C38 44 34 40 28 40C22 40 18 36 18 30C18 28 19 20 28 20C50 20 50 44 50 44C50 44 50 20 72 20C81 20 82 28 82 30C82 36 78 40 72 40C66 40 62 44 62 50C62 56 66 60 72 60C78 60 82 64 82 70C82 72 81 80 72 80C50 80 50 56 50 56Z"
              fill="white"
              opacity="0.8"
            />
          </svg>
          <span className="text-white/80 text-xs font-bold tracking-widest uppercase">EventPark</span>
        </div>
        <p
          className="text-sm italic font-light tracking-wide"
          style={{ color: tpl.invitedTextColor }}
        >
          You're invited
        </p>
        <h2
          className="text-xl font-extrabold text-center leading-tight"
          style={{ color: tpl.headerTextColor }}
        >
          {event.name}
        </h2>
      </div>

      {/* Card body */}
      <div className="px-6 py-5 flex flex-col gap-3">
        <div className="flex items-center gap-2.5" style={{ color: tpl.bodyTextColor }}>
          <Calendar className="w-4 h-4 flex-shrink-0" style={{ color: tpl.accentColor }} />
          <span className="text-sm font-semibold">{event.date}</span>
        </div>
        <div className="flex items-center gap-2.5" style={{ color: tpl.bodyTextColor }}>
          <Clock className="w-4 h-4 flex-shrink-0" style={{ color: tpl.accentColor }} />
          <span className="text-sm">{event.time}</span>
        </div>
        <div className="flex items-center gap-2.5" style={{ color: tpl.bodyTextColor }}>
          <MapPin className="w-4 h-4 flex-shrink-0" style={{ color: tpl.accentColor }} />
          <span className="text-sm">
            {event.venue}, {event.city}
          </span>
        </div>
        <div
          className="mt-1 pt-3 border-t text-xs text-center font-medium"
          style={{ borderColor: tpl.accentColor + '33', color: tpl.bodyTextColor }}
        >
          Hosted by {event.hostFirstName}
        </div>
      </div>
    </div>
  );
}

// ── ICS download helper ──────────────────────────────────────────────────────
function downloadICS(event) {
  // Rough date parse — works for "December 14, 2026" + "12:00 PM"
  const dtStart = new Date(`${event.date} ${event.time}`);
  const dtEnd = new Date(dtStart.getTime() + 3 * 60 * 60 * 1000); // +3 h

  const pad = (n) => String(n).padStart(2, '0');
  const fmt = (d) =>
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EventPark//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(dtStart)}`,
    `DTEND:${fmt(dtEnd)}`,
    `SUMMARY:${event.name}`,
    `LOCATION:${event.venue}, ${event.city}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'event.ics';
  a.click();
  URL.revokeObjectURL(url);
}

// ── Main component ───────────────────────────────────────────────────────────
export default function RSVPAccept() {
  const { token } = useParams();
  const guest = MOCK_GUESTS[token] || null;
  const storageKey = `rsvp_response_${token}`;

  const [existingResponse, setExistingResponse] = useState(null);
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'done'
  const [whoAreYou, setWhoAreYou] = useState({ firstName: '', lastName: '', phone: '' });
  const [whoErrors, setWhoErrors] = useState({});
  const [rsvpStatus, setRsvpStatus] = useState(null); // 'accepted' | 'declined' | 'tentative'
  const [plusOneChoice, setPlusOneChoice] = useState(null); // null | 'yes' | 'no'
  const [plusOneName, setPlusOneName] = useState({ firstName: '', lastName: '' });
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [declineOther, setDeclineOther] = useState('');
  const [showPlusOneModal, setShowPlusOneModal] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        setExistingResponse(JSON.parse(stored));
      } catch {}
    }
  }, [storageKey]);

  if (!guest) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Link not found</h2>
          <p className="text-gray-500 text-sm">
            This invitation link is invalid or has expired. Contact your host for a new link.
          </p>
        </div>
      </div>
    );
  }

  const { event } = guest;
  const resolvedFirstName =
    guest.method === 'email_invite' ? whoAreYou.firstName : guest.firstName;

  // ── Already responded screen ─────────────────────────────────────────────
  if (existingResponse) {
    const statusLabel = {
      accepted: "you're going",
      declined: "you're not going",
      tentative: "you're thinking about it",
    }[existingResponse.status] || '';

    const statusIcon = {
      accepted: <CheckCircle2 className="w-10 h-10 text-green-500" />,
      declined: <XCircle className="w-10 h-10 text-red-400" />,
      tentative: <HelpCircle className="w-10 h-10 text-amber-400" />,
    }[existingResponse.status];

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center mb-2">
            <EventParkLogo size="sm" />
          </div>
          <InvitationCard event={event} />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-3">
            <div className="flex justify-center">{statusIcon}</div>
            <p className="text-gray-700 font-semibold text-sm">
              You already responded — {statusLabel}.
            </p>
            <p className="text-gray-400 text-xs">
              Responded {new Date(existingResponse.respondedAt).toLocaleDateString()}
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => {
                  localStorage.removeItem(storageKey);
                  setExistingResponse(null);
                  setRsvpStatus(null);
                  setStep('form');
                }}
                className="w-full py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-400 transition"
              >
                Change my answer
              </button>
              <Link
                to="/discover/events"
                className="w-full py-3 rounded-xl bg-ep-navy text-white font-semibold text-sm text-center hover:opacity-90 transition"
              >
                See event details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Confirmation (done) screen ───────────────────────────────────────────
  if (step === 'done') {
    const messages = {
      accepted: `🎉 ${event.hostFirstName} will be thrilled! See you at ${event.name}.`,
      declined: "Thanks for letting us know. We'll miss you!",
      tentative: "No worries — we've noted your maybe. We'll remind you closer to the date.",
    };
    const waText = encodeURIComponent(`Check out ${event.name} on ${event.date} at ${event.venue}!`);

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="max-w-sm w-full space-y-6">
          <div className="text-center mb-2">
            <EventParkLogo size="sm" />
          </div>
          <InvitationCard event={event} />
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center space-y-4">
            <div className="text-3xl">
              {rsvpStatus === 'accepted' ? '🎉' : rsvpStatus === 'declined' ? '😢' : '🤔'}
            </div>
            <p className="text-gray-800 font-semibold text-base leading-relaxed">
              {messages[rsvpStatus]}
            </p>
            <div className="flex gap-3 pt-2">
              {rsvpStatus === 'accepted' && (
                <button
                  onClick={() => downloadICS(event)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:border-gray-400 transition"
                >
                  <Download className="w-4 h-4" />
                  Add to calendar
                </button>
              )}
              <a
                href={`https://wa.me/?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition"
              >
                <Share2 className="w-4 h-4" />
                Share event
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  const validateWhoAreYou = () => {
    const errs = {};
    if (!whoAreYou.firstName.trim()) errs.firstName = 'Required';
    if (!whoAreYou.lastName.trim()) errs.lastName = 'Required';
    if (!whoAreYou.phone.trim()) errs.phone = 'Required';
    setWhoErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRSVPClick = (status) => {
    if (guest.method === 'email_invite' && !validateWhoAreYou()) return;
    setRsvpStatus(status);
    if (status === 'accepted' && guest.plusOneAllowed) {
      setShowPlusOneModal(true);
    } else {
      setStep('confirm');
    }
  };

  const handlePlusOneChoice = (choice) => {
    setPlusOneChoice(choice);
    setShowPlusOneModal(false);
    setStep('confirm');
  };

  const handleConfirm = () => {
    const response = { status: rsvpStatus, respondedAt: new Date().toISOString() };
    localStorage.setItem(storageKey, JSON.stringify(response));
    setStep('done');
  };

  // ── Main form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-sm mx-auto space-y-6">
        {/* Logo */}
        <div className="text-center">
          <EventParkLogo size="sm" />
        </div>

        {/* IV Card */}
        <InvitationCard event={event} />

        {/* "Who are you?" form — email_invite only */}
        {guest.method === 'email_invite' && step === 'form' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <h3 className="font-bold text-gray-800 text-sm">Who are you?</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="First name *"
                  value={whoAreYou.firstName}
                  onChange={(e) => setWhoAreYou((p) => ({ ...p, firstName: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30 ${whoErrors.firstName ? 'border-red-400' : 'border-gray-200'}`}
                />
                {whoErrors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{whoErrors.firstName}</p>
                )}
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last name *"
                  value={whoAreYou.lastName}
                  onChange={(e) => setWhoAreYou((p) => ({ ...p, lastName: e.target.value }))}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30 ${whoErrors.lastName ? 'border-red-400' : 'border-gray-200'}`}
                />
                {whoErrors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{whoErrors.lastName}</p>
                )}
              </div>
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone number *"
                value={whoAreYou.phone}
                onChange={(e) => setWhoAreYou((p) => ({ ...p, phone: e.target.value }))}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30 ${whoErrors.phone ? 'border-red-400' : 'border-gray-200'}`}
              />
              {whoErrors.phone && (
                <p className="text-red-500 text-xs mt-1">{whoErrors.phone}</p>
              )}
            </div>
          </div>
        )}

        {/* Greeting — manual / csv */}
        {(guest.method === 'manual' || guest.method === 'csv') && step === 'form' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
            <p className="text-gray-700 text-sm leading-relaxed">
              Hi <span className="font-bold">{guest.firstName}</span> 👋,{' '}
              <span className="font-semibold">{event.hostFirstName}</span> invited you to{' '}
              <span className="font-bold">{event.name}</span> on{' '}
              <span className="font-semibold">{event.date}</span> at{' '}
              <span className="font-semibold">{event.venue}</span>.
            </p>
          </div>
        )}

        {/* RSVP buttons — shown in form step */}
        {step === 'form' && (
          <div className="space-y-3">
            <p className="text-center text-gray-500 text-xs font-semibold uppercase tracking-widest">
              Will you be there?
            </p>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => handleRSVPClick('accepted')}
                className="w-full py-4 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-bold text-base flex items-center justify-center gap-2 transition shadow-sm"
              >
                ✅ Yes, I'll be there
              </button>
              <button
                onClick={() => handleRSVPClick('declined')}
                className="w-full py-4 rounded-2xl bg-red-50 hover:bg-red-100 border-2 border-red-200 text-red-600 font-bold text-base flex items-center justify-center gap-2 transition"
              >
                ❌ Sorry, can't make it
              </button>
              <button
                onClick={() => handleRSVPClick('tentative')}
                className="w-full py-4 rounded-2xl bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-600 font-bold text-base flex items-center justify-center gap-2 transition"
              >
                🤔 Maybe — let you know
              </button>
            </div>
          </div>
        )}

        {/* Confirm step — accepted */}
        {step === 'confirm' && rsvpStatus === 'accepted' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h3 className="font-bold text-gray-800">Almost done!</h3>
            </div>

            {/* Plus one result */}
            {plusOneChoice === 'yes' && (
              <div className="space-y-3 p-4 rounded-xl bg-green-50 border border-green-200">
                <p className="text-sm font-semibold text-green-800">Plus one details</p>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="First name"
                    value={plusOneName.firstName}
                    onChange={(e) => setPlusOneName((p) => ({ ...p, firstName: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                  <input
                    type="text"
                    placeholder="Last name"
                    value={plusOneName.lastName}
                    onChange={(e) => setPlusOneName((p) => ({ ...p, lastName: e.target.value }))}
                    className="px-3 py-2 rounded-xl border border-green-200 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  />
                </div>
              </div>
            )}
            {plusOneChoice === 'no' && (
              <p className="text-sm text-gray-500">Just you — perfect.</p>
            )}

            {/* Dietary */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Any dietary requirements?{' '}
                <span className="font-normal text-gray-400">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. vegetarian, nut allergy..."
                value={dietaryNotes}
                onChange={(e) => setDietaryNotes(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30 resize-none"
              />
            </div>

            <button
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-xl bg-ep-navy text-white font-bold text-sm hover:opacity-90 transition"
            >
              Confirm RSVP ✓
            </button>
          </div>
        )}

        {/* Confirm step — declined */}
        {step === 'confirm' && rsvpStatus === 'declined' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              <h3 className="font-bold text-gray-800">What's stopping you?</h3>
            </div>
            <div className="space-y-2">
              {['Schedule conflict', 'Travel or distance'].map((reason) => (
                <label key={reason} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="declineReason"
                    value={reason}
                    checked={declineReason === reason}
                    onChange={() => setDeclineReason(reason)}
                    className="accent-ep-navy"
                  />
                  <span className="text-sm text-gray-700">{reason}</span>
                </label>
              ))}
              <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="declineReason"
                  value="Other"
                  checked={declineReason === 'Other'}
                  onChange={() => setDeclineReason('Other')}
                  className="accent-ep-navy"
                />
                <span className="text-sm text-gray-700">Other</span>
              </label>
              {declineReason === 'Other' && (
                <textarea
                  rows={2}
                  placeholder="Tell us more..."
                  value={declineOther}
                  onChange={(e) => setDeclineOther(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-ep-navy/30 resize-none"
                />
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleConfirm}
                className="flex-1 py-3.5 rounded-xl bg-ep-navy text-white font-bold text-sm hover:opacity-90 transition"
              >
                Confirm
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-3.5 rounded-xl border-2 border-gray-200 text-gray-500 font-semibold text-sm hover:border-gray-400 transition"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Confirm step — tentative */}
        {step === 'confirm' && rsvpStatus === 'tentative' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-gray-800">No problem!</h3>
            </div>
            <p className="text-sm text-gray-500">
              We'll note your maybe and remind you closer to the event date.
            </p>
            <button
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-xl bg-ep-navy text-white font-bold text-sm hover:opacity-90 transition"
            >
              Got it — save my maybe
            </button>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Powered by <span className="font-semibold text-gray-500">EventPark</span>
        </p>
      </div>

      {/* Plus one modal */}
      {showPlusOneModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-base">Bringing a plus one?</h3>
            <p className="text-sm text-gray-500">
              {event.hostFirstName} has allowed you to bring a guest.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handlePlusOneChoice('yes')}
                className="w-full py-3.5 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition"
              >
                Yes — add their name
              </button>
              <button
                onClick={() => handlePlusOneChoice('no')}
                className="w-full py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-bold text-sm hover:border-gray-400 transition"
              >
                No, just me
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
