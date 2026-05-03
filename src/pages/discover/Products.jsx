import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, ShoppingCart, Sparkles, Send, ArrowRight } from 'lucide-react';
import { sampleProducts } from '../../data/sampleData';

const categories = ['All', 'Cakes & Desserts', 'Furniture & Decor', 'Flowers & Decor', 'Photography', 'Entertainment', 'Catering & Drinks', 'Fashion & Fabric'];

const BUDDY_INTRO = [
  { role: 'buddy', text: "Hi! I'm Event Buddy 🎉 Your AI assistant for finding the perfect event products. What are you shopping for today?" },
];

const buddyFlow = [
  { trigger: null, question: "What are you shopping for? (e.g. cakes, photography, decor, catering...)", key: 'what' },
  { trigger: 'what', question: "Got it! Where should we deliver this? (City or area)", key: 'where' },
  { trigger: 'where', question: "What's your budget range? (e.g. Under ₦50K, ₦50K-₦200K, Above ₦200K)", key: 'budget' },
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

  // Send first prompt from buddy after intro
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

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Discover Products</h1>
              <p className="text-gray-500">Everything you need to make your event perfect.</p>
            </div>
            {cart.length > 0 && (
              <Link to="/signup" className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2.5 rounded-xl font-semibold text-sm">
                <ShoppingCart className="w-4 h-4" />
                Cart ({cart.reduce((a, b) => a + b.qty, 0)})
              </Link>
            )}
          </div>

          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Event Buddy Chat */}
          {showBuddy && (
            <div className="lg:col-span-1">
              <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-xl">🎉</div>
                  <div>
                    <div className="text-white font-bold text-sm">Event Buddy</div>
                    <div className="text-brand-200 text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Shopping Assistant
                    </div>
                  </div>
                </div>

                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-brand-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-3 border-t border-gray-100 flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type your answer..."
                    className="flex-grow text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-400"
                  />
                  <button
                    onClick={handleSend}
                    className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center text-white flex-shrink-0 hover:bg-brand-700 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Products Grid */}
          <div className={showBuddy ? 'lg:col-span-3' : 'lg:col-span-4'}>
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map(product => (
                <Link
                  key={product.id}
                  to={`/discover/products/${product.id}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow group"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {!product.inStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-white text-gray-700 font-semibold text-xs px-3 py-1 rounded-full">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="text-xs text-gray-400 font-medium mb-1">{product.vendor}</div>
                    <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 line-clamp-2">{product.name}</h3>

                    <div className="flex items-center gap-1 mb-3">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-semibold text-gray-700">{product.rating}</span>
                      <span className="text-xs text-gray-400">({product.reviews})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-brand-600">₦{product.price.toLocaleString()}</span>
                      <button
                        onClick={e => { e.preventDefault(); addToCart(product); }}
                        disabled={!product.inStock}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ${
                          product.inStock
                            ? 'bg-brand-600 text-white hover:bg-brand-700'
                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-24 text-gray-400">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
