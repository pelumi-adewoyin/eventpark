import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, ShoppingCart, Sparkles, Send, X } from 'lucide-react';
import { sampleProducts } from '../../data/sampleData';

const categories = ['All', 'Cakes & Desserts', 'Furniture & Decor', 'Flowers & Decor', 'Photography', 'Entertainment', 'Catering & Drinks', 'Fashion & Fabric'];

const BUDDY_INTRO = [
  { role: 'buddy', text: "Hi! I'm Event Buddy 🎉 Your AI assistant for finding the perfect event products. What are you shopping for today?" },
];

const buddyFlow = [
  { trigger: null, question: "What are you shopping for? (e.g. cakes, photography, decor, catering...)", key: 'what' },
  { trigger: 'what', question: "Got it! Where should we deliver this? (City or area)", key: 'where' },
  { trigger: 'where', question: "What's your budget range? (e.g. Under ₦50K, ₦50K–₦200K, Above ₦200K)", key: 'budget' },
  { trigger: 'budget', question: "Perfect! Let me find the best options for you. 🔍", key: 'done' },
];

export default function DiscoverProducts() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [messages, setMessages] = useState(BUDDY_INTRO);
  const [input, setInput] = useState('');
  const [flowStep, setFlowStep] = useState(0);
  const [showBuddy, setShowBuddy] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(prev => [...prev, { role: 'buddy', text: buddyFlow[0].question }]);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    const nextStep = flowStep + 1;
    setFlowStep(nextStep);

    setTimeout(() => {
      if (nextStep < buddyFlow.length) {
        setMessages(prev => [...prev, { role: 'buddy', text: buddyFlow[nextStep].question }]);
        if (buddyFlow[nextStep].key === 'done') {
          setTimeout(() => {
            setMessages(prev => [...prev, { role: 'buddy', text: "I've filtered products below based on your preferences! Browse away 🛍️" }]);
            setShowBuddy(false);
          }, 1000);
        }
      }
    }, 600);
  };

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p);
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const filtered = sampleProducts.filter(p => {
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const cartCount = cart.reduce((a, b) => a + b.qty, 0);

  return (
    <div className="min-h-screen bg-white pt-16">
      {/* Hero header */}
      <div className="bg-ep-navy relative overflow-hidden">
        <div className="absolute inset-0 dot-pattern-white opacity-30" />
        <div className="absolute right-0 bottom-0 w-96 h-96 bg-brand-600 rounded-full opacity-10 blur-3xl" />
        <div className="absolute left-20 top-0 w-64 h-64 bg-ep-orange rounded-full opacity-10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <span className="inline-block bg-white/10 text-white/70 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">Shop</span>
              <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">Discover Products</h1>
              <p className="text-white/50">Everything you need to make your event perfect.</p>
            </div>
            {cartCount > 0 && (
              <Link to="/signup"
                className="flex items-center gap-2 bg-ep-orange hover:bg-ep-orange-light text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors mt-8">
                <ShoppingCart className="w-4 h-4" />
                Cart ({cartCount})
              </Link>
            )}
          </div>

          <div className="relative max-w-xl mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input type="text" placeholder="Search products..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm" />
          </div>

          <div className="flex gap-2 mt-5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedCategory === cat ? 'bg-brand-600 text-white' : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-sm text-gray-400 font-medium mb-6">{filtered.length} products found</p>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Event Buddy Chat */}
          {showBuddy && (
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-2xl overflow-hidden border border-brand-100 shadow-xl shadow-brand-50">
                <div className="bg-ep-navy p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-lg">🎉</div>
                    <div>
                      <div className="text-white font-bold text-sm">Event Buddy</div>
                      <div className="text-white/40 text-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-ep-orange" />
                        AI Shopping Assistant
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setShowBuddy(false)}
                    className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                    <X className="w-3.5 h-3.5 text-white/50" />
                  </button>
                </div>

                <div className="h-64 overflow-y-auto p-4 space-y-3 bg-ep-blue-light">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-white text-ep-navy rounded-bl-sm shadow-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-gray-100 flex gap-2 bg-white">
                  <input type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type your answer..."
                    className="flex-grow text-xs px-3 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
                  />
                  <button onClick={handleSend}
                    className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 hover:bg-brand-500 transition-colors">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className={showBuddy ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(product => (
                <Link key={product.id} to={`/discover/products/${product.id}`}
                  className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-50 transition-all duration-300">
                  <div className="relative h-44 overflow-hidden bg-ep-blue-light">
                    <img src={product.image} alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-ep-navy font-bold text-xs px-3 py-1 rounded-full">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="text-xs text-brand-600 font-semibold mb-1">{product.vendor}</div>
                    <h3 className="font-bold text-ep-navy text-sm leading-snug mb-2 line-clamp-2">{product.name}</h3>

                    <div className="flex items-center gap-1 mb-4">
                      <Star className="w-3.5 h-3.5 fill-ep-orange text-ep-orange" />
                      <span className="text-xs font-bold text-ep-navy">{product.rating}</span>
                      <span className="text-xs text-gray-400">({product.reviews})</span>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="font-extrabold text-ep-navy text-sm">₦{product.price.toLocaleString()}</span>
                      <button
                        onClick={e => { e.preventDefault(); addToCart(product); }}
                        disabled={!product.inStock}
                        className={`text-xs font-bold px-4 py-1.5 rounded-xl transition-all ${
                          product.inStock
                            ? 'bg-brand-600 text-white hover:bg-brand-500'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-24">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                <p className="font-bold text-gray-400">No products found</p>
                <p className="text-sm text-gray-300 mt-1">Try a different category or search term</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
