import { useState, useRef, useEffect } from 'react';
import {
  MessageSquare, Send, Search, ArrowLeft, MoreVertical,
  Paperclip, Image, DollarSign, FileText, User, Clock,
  CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

// Simulated chat threads
const MOCK_THREADS = [];

function ThreadItem({ thread, active, onClick }) {
  return (
    <button type="button" onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors ${active ? 'bg-brand-50' : 'hover:bg-gray-50'}`}>
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
        {thread.customerName?.[0] || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between">
          <span className="text-sm font-semibold text-ep-navy truncate">{thread.customerName}</span>
          <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">{thread.lastTime}</span>
        </div>
        <p className="text-xs text-gray-400 truncate">{thread.lastMessage}</p>
      </div>
      {thread.unread > 0 && (
        <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
          {thread.unread}
        </span>
      )}
    </button>
  );
}

function ChatMessage({ msg, isVendor }) {
  const isMe = msg.sender === 'vendor';
  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-2.5 ${isMe ? 'bg-brand-600 text-white rounded-br-md' : 'bg-gray-100 text-ep-navy rounded-bl-md'}`}>
        {msg.type === 'offer' ? (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold opacity-80">
              <DollarSign className="w-3 h-3" /> Offer
            </div>
            <div className="text-lg font-extrabold">₦{msg.offerAmount?.toLocaleString()}</div>
            <p className="text-xs opacity-80">{msg.text}</p>
            {!isMe && msg.offerStatus === 'pending' && (
              <div className="flex gap-2 mt-2">
                <button className="flex-1 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-xs font-bold transition-colors">Decline</button>
                <button className="flex-1 py-1.5 rounded-lg bg-white text-brand-700 text-xs font-bold hover:bg-brand-50 transition-colors">Accept</button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm leading-relaxed">{msg.text}</p>
        )}
        <div className={`text-[10px] mt-1 ${isMe ? 'text-white/50' : 'text-gray-400'}`}>{msg.time}</div>
      </div>
    </div>
  );
}

export default function VendorWorkspace() {
  const [activeThread, setActiveThread] = useState(null);
  const [threads, setThreads] = useState(MOCK_THREADS);
  const [message, setMessage] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerNote, setOfferNote] = useState('');
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const messagesEndRef = useRef(null);

  const currentThread = threads.find(t => t.id === activeThread);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentThread?.messages?.length]);

  const sendMessage = () => {
    if (!message.trim() || !activeThread) return;
    const newMsg = { id: Date.now(), sender: 'vendor', text: message, time: 'Just now', type: 'text' };
    setThreads(prev => prev.map(t => t.id === activeThread
      ? { ...t, messages: [...(t.messages || []), newMsg], lastMessage: message, lastTime: 'Just now' }
      : t));
    setMessage('');
  };

  const sendOffer = () => {
    if (!offerAmount || !activeThread) return;
    const newMsg = {
      id: Date.now(), sender: 'vendor', type: 'offer',
      offerAmount: parseFloat(offerAmount),
      text: offerNote || `I'd like to offer ₦${parseFloat(offerAmount).toLocaleString()} for this service.`,
      time: 'Just now', offerStatus: 'pending',
    };
    setThreads(prev => prev.map(t => t.id === activeThread
      ? { ...t, messages: [...(t.messages || []), newMsg], lastMessage: `Offer: ₦${offerAmount}`, lastTime: 'Just now' }
      : t));
    setOfferAmount('');
    setOfferNote('');
    setShowOfferModal(false);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* Thread list */}
      <div className={`w-full sm:w-80 border-r border-gray-200 flex flex-col flex-shrink-0 ${mobileShowThread ? 'hidden sm:flex' : 'flex'}`}>
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-base font-extrabold text-ep-navy mb-3">Workspace</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search conversations…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {threads.length === 0 ? (
            <div className="p-8 text-center">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-sm text-gray-400 font-medium">No conversations yet</p>
              <p className="text-xs text-gray-300 mt-1">Chats will appear when customers contact you</p>
            </div>
          ) : (
            threads.map(t => (
              <ThreadItem key={t.id} thread={t} active={activeThread === t.id}
                onClick={() => { setActiveThread(t.id); setMobileShowThread(true); }} />
            ))
          )}
        </div>
      </div>

      {/* Chat panel */}
      <div className={`flex-1 flex flex-col ${mobileShowThread ? 'flex' : 'hidden sm:flex'}`}>
        {currentThread ? (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
              <button type="button" onClick={() => setMobileShowThread(false)}
                className="sm:hidden w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                <ArrowLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {currentThread.customerName?.[0]}
              </div>
              <div>
                <div className="text-sm font-bold text-ep-navy">{currentThread.customerName}</div>
                <div className="text-xs text-gray-400">{currentThread.context}</div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {(currentThread.messages || []).map(msg => (
                <ChatMessage key={msg.id} msg={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-200 px-4 py-3">
              <div className="flex items-end gap-2">
                <button type="button" onClick={() => setShowOfferModal(true)}
                  className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0 hover:bg-green-200 transition-colors">
                  <DollarSign className="w-4 h-4 text-green-700" />
                </button>
                <div className="flex-1 relative">
                  <input type="text" placeholder="Type a message…"
                    value={message} onChange={e => setMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
                </div>
                <button type="button" onClick={sendMessage}
                  disabled={!message.trim()}
                  className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0 hover:bg-brand-700 disabled:opacity-40 transition-colors">
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>
              <p className="text-[10px] text-gray-300 mt-1.5 px-1">
                Phone numbers are not permitted in chat — share them at booking confirmation.
              </p>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold text-gray-400">Select a conversation</p>
              <p className="text-xs text-gray-300 mt-1">Pick a chat from the left panel</p>
            </div>
          </div>
        )}
      </div>

      {/* Offer modal */}
      {showOfferModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <h3 className="text-base font-bold text-ep-navy mb-4">Send an offer</h3>
            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-xs font-semibold text-ep-navy mb-1.5">Amount (₦)</label>
                <input type="number" placeholder="50000" value={offerAmount}
                  onChange={e => setOfferAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-ep-navy mb-1.5">Note (optional)</label>
                <textarea placeholder="What does this offer include?" value={offerNote}
                  onChange={e => setOfferNote(e.target.value)} rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 resize-none" />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowOfferModal(false)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={sendOffer} disabled={!offerAmount}
                className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-xl text-sm font-bold transition-colors">
                Send offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
