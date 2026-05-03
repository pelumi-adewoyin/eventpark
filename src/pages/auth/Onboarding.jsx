import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Briefcase, Building2, ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { EventParkLogo } from '../../components/Logo';

const roles = [
  {
    id: 'diy',
    icon: User,
    title: 'Myself',
    subtitle: 'Planning my own event',
    description: 'Weddings, birthdays, graduations — plan personal events from start to finish with smart tools.',
    accent: 'border-brand-500 bg-brand-500/10',
    dot: 'bg-brand-500',
  },
  {
    id: 'planner',
    icon: Briefcase,
    title: 'As a Planner',
    subtitle: 'I plan events for clients',
    description: 'Manage multiple clients, build a vendor rolodex, and run your planning business.',
    accent: 'border-purple-500 bg-purple-500/10',
    dot: 'bg-purple-500',
  },
  {
    id: 'corporate',
    icon: Building2,
    title: 'For My Company',
    subtitle: 'Corporate event management',
    description: 'Retreats, town halls, conferences — with budget approvals and audit trails built in.',
    accent: 'border-ep-orange bg-ep-orange/10',
    dot: 'bg-ep-orange',
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
        { value: 'vendor', label: '🛒 Shopping for event needs', sub: 'Looking for vendors or products' },
      ],
    },
    {
      key: 'event_type',
      question: 'What kind of event?',
      condition: (a) => a.intent === 'planning',
      options: [
        { value: 'wedding', label: '💍 Wedding', sub: 'The big day' },
        { value: 'birthday', label: '🎂 Birthday', sub: 'Milestone celebration' },
        { value: 'graduation', label: '🎓 Graduation', sub: 'Academic achievement' },
        { value: 'other', label: '🎊 Something else', sub: 'Another type of event' },
      ],
    },
  ],
  planner: [
    {
      key: 'clients',
      question: 'How many clients do you typically manage?',
      options: [
        { value: '1-3', label: '1–3 clients', sub: 'Just getting started' },
        { value: '4-10', label: '4–10 clients', sub: 'Growing business' },
        { value: '10+', label: '10+ clients', sub: 'Full-scale operation' },
      ],
    },
    {
      key: 'team',
      question: 'Do you work alone or with a team?',
      options: [
        { value: 'solo', label: '🧍 Solo', sub: 'Just me' },
        { value: 'small', label: '👥 Small team', sub: '2–5 people' },
        { value: 'large', label: '🏢 Larger team', sub: '6+ people' },
      ],
    },
  ],
  corporate: [
    {
      key: 'size',
      question: 'How large is your company?',
      options: [
        { value: 'startup', label: '🚀 Startup', sub: 'Under 50 employees' },
        { value: 'mid', label: '🏢 Mid-size', sub: '50–500 employees' },
        { value: 'enterprise', label: '🌍 Enterprise', sub: '500+ employees' },
      ],
    },
    {
      key: 'role',
      question: 'What\'s your role?',
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
  const [step, setStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [quizIndex, setQuizIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const currentQuiz = selectedRole ? quizSteps[selectedRole.id] : [];
  const filteredQuiz = currentQuiz.filter(q => !q.condition || q.condition(answers));

  const handleAnswer = (key, value) => {
    const newAnswers = { ...answers, [key]: value };
    setAnswers(newAnswers);
    const updatedQuiz = currentQuiz.filter(q => !q.condition || q.condition(newAnswers));
    if (quizIndex < updatedQuiz.length - 1) {
      setTimeout(() => setQuizIndex(qi => qi + 1), 250);
    } else {
      setTimeout(() => handleFinish(), 250);
    }
  };

  const handleFinish = () => {
    demoLogin(selectedRole.id);
    setStep('complete');
    setTimeout(() => {
      const routes = { diy: '/dashboard', planner: '/planner', corporate: '/corporate' };
      navigate(routes[selectedRole.id] || '/dashboard');
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-ep-navy flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 dot-pattern-white opacity-30" />
      <div className="absolute -top-40 right-0 w-[500px] h-[500px] bg-brand-600 rounded-full opacity-10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-40 w-[400px] h-[400px] bg-ep-orange rounded-full opacity-10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg">
        {/* Logo + progress */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <EventParkLogo light size="md" />
          </div>
          {step !== 'complete' && (
            <div className="flex items-center justify-center gap-2">
              {['role', 'quiz'].map((s, i) => (
                <div key={s} className={`h-1 rounded-full transition-all duration-500 ${
                  step === s ? 'w-10 bg-ep-orange' :
                  i < ['role','quiz'].indexOf(step) ? 'w-5 bg-brand-400' : 'w-5 bg-white/20'
                }`} />
              ))}
            </div>
          )}
        </div>

        {/* Role Selection */}
        {step === 'role' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <h1 className="text-2xl font-extrabold text-white text-center mb-1">Who are you planning for?</h1>
            <p className="text-white/40 text-center text-sm mb-8">Your answer shapes your entire experience.</p>

            <div className="space-y-3 mb-8">
              {roles.map((role) => {
                const selected = selectedRole?.id === role.id;
                return (
                  <button key={role.id} onClick={() => setSelectedRole(role)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                      selected ? role.accent : 'border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/20'
                    }`}>
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${selected ? 'bg-white/20' : 'bg-white/10'}`}>
                      <role.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-grow text-left">
                      <div className="font-bold text-white text-sm">{role.title}</div>
                      <div className="text-xs text-white/40 mt-0.5">{role.subtitle}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      selected ? `border-white ${role.dot}` : 'border-white/20'
                    }`}>
                      {selected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedRole && (
              <p className="text-white/50 text-xs text-center mb-5 px-4">{selectedRole.description}</p>
            )}

            <button onClick={() => selectedRole && (filteredQuiz.length > 0 ? setStep('quiz') : handleFinish())}
              disabled={!selectedRole}
              className={`w-full py-3.5 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${
                selectedRole ? 'bg-brand-600 hover:bg-brand-500 text-white' : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}>
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quiz */}
        {step === 'quiz' && filteredQuiz[quizIndex] && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <button onClick={() => quizIndex === 0 ? setStep('role') : setQuizIndex(qi => qi - 1)}
              className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mb-6 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="text-xs font-bold text-ep-orange tracking-widest uppercase mb-3">
              Question {quizIndex + 1} of {filteredQuiz.length}
            </div>
            <h1 className="text-xl font-extrabold text-white mb-6">{filteredQuiz[quizIndex].question}</h1>

            <div className="space-y-2.5">
              {filteredQuiz[quizIndex].options.map((opt) => (
                <button key={opt.value}
                  onClick={() => handleAnswer(filteredQuiz[quizIndex].key, opt.value)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                    answers[filteredQuiz[quizIndex].key] === opt.value
                      ? 'border-brand-400 bg-brand-500/20'
                      : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25'
                  }`}>
                  <div className="flex-grow">
                    <div className="font-semibold text-white text-sm">{opt.label}</div>
                    <div className="text-xs text-white/40 mt-0.5">{opt.sub}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Complete */}
        {step === 'complete' && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-10 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h1 className="text-2xl font-extrabold text-white mb-2">You're all set!</h1>
            <p className="text-white/40 text-sm mb-6">Setting up your {selectedRole?.title} workspace...</p>
            <div className="flex justify-center gap-1.5">
              {[0,1,2].map(i => (
                <div key={i} className="w-2 h-2 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        <p className="text-center text-white/20 text-xs mt-6">
          Free to start · No credit card required · Cancel anytime
        </p>
      </div>
    </div>
  );
}
