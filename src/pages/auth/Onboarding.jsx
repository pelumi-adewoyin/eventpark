import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, User, Briefcase, Building2, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const roles = [
  {
    id: 'diy',
    icon: User,
    title: 'Myself',
    subtitle: 'Planning my own event',
    description: 'Weddings, birthdays, graduations, parties — plan your personal events from start to finish.',
    color: 'from-brand-500 to-brand-700',
    border: 'border-brand-400',
    bg: 'bg-brand-50',
    iconColor: 'text-brand-600',
  },
  {
    id: 'planner',
    icon: Briefcase,
    title: 'As a Planner',
    subtitle: 'I plan events for clients',
    description: 'Manage multiple clients, build a vendor rolodex, and run your event planning business.',
    color: 'from-purple-500 to-purple-700',
    border: 'border-purple-400',
    bg: 'bg-purple-50',
    iconColor: 'text-purple-600',
  },
  {
    id: 'corporate',
    icon: Building2,
    title: 'For My Company',
    subtitle: 'Corporate event management',
    description: 'Retreats, conferences, town halls — procurement-grade tools with approval workflows.',
    color: 'from-orange-500 to-orange-700',
    border: 'border-orange-400',
    bg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
];

const quizSteps = {
  diy: [
    {
      key: 'intent',
      question: 'What brings you here today?',
      options: [
        { value: 'planning', label: '🎉 Planning a specific event', sub: 'I have an event in mind' },
        { value: 'exploring', label: '👀 Just exploring', sub: 'Browsing vendors and events' },
        { value: 'attending', label: '🎟 Looking for events to attend', sub: 'Discover what\'s happening near me' },
      ],
    },
    {
      key: 'eventType',
      question: 'What type of event are you planning?',
      condition: (ans) => ans.intent === 'planning',
      options: [
        { value: 'wedding', label: '💍 Wedding / Traditional', sub: 'Ceremony, reception, all the details' },
        { value: 'birthday', label: '🎂 Birthday / Milestone', sub: 'Surprise, milestone, kids\' party' },
        { value: 'concert', label: '🎵 Concert / Show / Festival', sub: 'Ticketed public event' },
        { value: 'social', label: '🥂 Social / Gathering', sub: 'Dinner, reunion, housewarming' },
        { value: 'other', label: '✨ Something else', sub: 'I\'ll set it up later' },
      ],
    },
  ],
  planner: [
    {
      key: 'clientCount',
      question: 'How many active clients do you manage?',
      options: [
        { value: '1-3', label: '1–3 clients', sub: 'Getting started or boutique' },
        { value: '4-10', label: '4–10 clients', sub: 'Growing business' },
        { value: '10+', label: '10+ clients', sub: 'Established agency' },
      ],
    },
    {
      key: 'teamSize',
      question: 'Do you work with a team?',
      options: [
        { value: 'solo', label: '🙋 Solo planner', sub: 'Just me' },
        { value: 'small', label: '👥 Small team (2–5)', sub: 'Junior planners, assistants' },
        { value: 'agency', label: '🏢 Agency (6+)', sub: 'Full team' },
      ],
    },
  ],
  corporate: [
    {
      key: 'companySize',
      question: 'How large is your organisation?',
      options: [
        { value: 'small', label: '< 50 employees', sub: 'Startup or SME' },
        { value: 'mid', label: '50–250 employees', sub: 'Mid-size company' },
        { value: 'large', label: '250+ employees', sub: 'Large enterprise' },
      ],
    },
    {
      key: 'role',
      question: 'What is your role?',
      options: [
        { value: 'hr', label: '👩‍💼 HR / People Ops', sub: 'Managing team events' },
        { value: 'comms', label: '📢 Comms / Marketing', sub: 'External events & launches' },
        { value: 'exec', label: '🏛 Executive / EA', sub: 'Board / leadership events' },
        { value: 'finance', label: '💼 Finance / Procurement', sub: 'Budget management' },
      ],
    },
  ],
};

export default function Onboarding() {
  const [step, setStep] = useState('role'); // 'role' | 'quiz' | 'complete'
  const [selectedRole, setSelectedRole] = useState(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const currentQuiz = selectedRole ? quizSteps[selectedRole.id] : [];
  const filteredQuiz = currentQuiz.filter(q => !q.condition || q.condition(answers));

  const handleRoleSelect = (role) => setSelectedRole(role);

  const handleRoleContinue = () => {
    if (!selectedRole) return;
    if (currentQuiz.length === 0) {
      handleFinish();
    } else {
      setStep('quiz');
    }
  };

  const handleAnswer = (key, value) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    const updatedQuiz = currentQuiz.filter(q => !q.condition || q.condition(newAnswers));
    if (quizIndex < updatedQuiz.length - 1) {
      setTimeout(() => setQuizIndex(qi => qi + 1), 300);
    } else {
      setTimeout(() => handleFinish(), 300);
    }
  };

  const handleFinish = () => {
    // Use demo login for now; real flow goes through /login → OTP → onboarding API
    demoLogin(selectedRole.id);
    setStep('complete');
    setTimeout(() => {
      const routes = { diy: '/dashboard', planner: '/planner', corporate: '/corporate' };
      navigate(routes[selectedRole.id] || '/dashboard');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-brand-950 to-gray-900 flex items-center justify-center px-4 py-16">
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-brand-600/20 blur-3xl" />
        <div className="absolute bottom-0 -left-20 w-72 h-72 rounded-full bg-accent-400/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">EventPark</span>
          </div>
          {step !== 'complete' && (
            <div className="flex items-center justify-center gap-2 mt-4">
              {['role', 'quiz'].map((s, i) => (
                <div key={s} className={`h-1.5 rounded-full transition-all duration-500 ${
                  step === s ? 'w-8 bg-brand-400' : i < ['role', 'quiz'].indexOf(step) ? 'w-4 bg-brand-600' : 'w-4 bg-white/20'
                }`} />
              ))}
            </div>
          )}
        </div>

        {/* STEP: Role Selection */}
        {step === 'role' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h1 className="text-2xl font-extrabold text-white text-center mb-2">Who are you planning for?</h1>
            <p className="text-gray-400 text-center text-sm mb-8">Your answer shapes your entire EventPark experience.</p>

            <div className="space-y-3 mb-8">
              {roles.map((role) => {
                const selected = selectedRole?.id === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => handleRoleSelect(role)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      selected
                        ? `border-white/50 bg-white/10 scale-[1.01]`
                        : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-white/20' : 'bg-white/10'}`}>
                      <role.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-grow">
                      <div className="font-bold text-white">{role.title}</div>
                      <div className="text-sm text-gray-400">{role.subtitle}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selected ? 'border-brand-400 bg-brand-500' : 'border-white/30'
                    }`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedRole && (
              <div className={`rounded-2xl p-4 bg-white/5 border border-white/10 mb-6 text-sm text-gray-300`}>
                {selectedRole.description}
              </div>
            )}

            <button
              onClick={handleRoleContinue}
              disabled={!selectedRole}
              className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                selectedRole
                  ? 'bg-brand-600 hover:bg-brand-500 text-white hover:scale-[1.01]'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              Continue
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* STEP: Role-specific Quiz */}
        {step === 'quiz' && filteredQuiz[quizIndex] && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <button
              onClick={() => quizIndex === 0 ? setStep('role') : setQuizIndex(qi => qi - 1)}
              className="flex items-center gap-1.5 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-xs font-semibold text-brand-400 tracking-widest mb-2">
              {quizIndex + 1} of {filteredQuiz.length}
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-8">{filteredQuiz[quizIndex].question}</h1>

            <div className="space-y-3">
              {filteredQuiz[quizIndex].options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => handleAnswer(filteredQuiz[quizIndex].key, opt.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 transition-all text-left group ${
                    answers[filteredQuiz[quizIndex].key] === opt.value ? 'border-brand-400 bg-brand-500/20' : ''
                  }`}
                >
                  <div className="flex-grow">
                    <div className="font-semibold text-white">{opt.label}</div>
                    <div className="text-sm text-gray-400">{opt.sub}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/30 group-hover:text-white/70 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP: Complete */}
        {step === 'complete' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6 animate-bounce">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white mb-3">You're all set! 🎉</h1>
            <p className="text-gray-400 mb-2">Setting up your {selectedRole?.title} workspace...</p>
            <div className="flex justify-center gap-1 mt-6">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-gray-500 text-xs mt-6">
          No credit card required · Cancel anytime · Your data is encrypted
        </p>
      </div>
    </div>
  );
}
