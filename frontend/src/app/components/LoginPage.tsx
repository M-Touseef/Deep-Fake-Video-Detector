import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User, Eye, EyeOff, Cpu, Activity, ChevronRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(loginEmail, loginPassword);
      toast.success('Welcome back!');
      navigate(user?.role === 'admin' ? '/admin' : '/home');
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(signupEmail, signupPassword, signupName);
      toast.success('Account created!');
      navigate('/home');
    } catch (err: any) {
      toast.error(err.message || 'Email already exists');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-slate-800/60 border border-slate-600/60 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex">

      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-col justify-center items-center w-1/2 p-16 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-600/10 rounded-full -top-20 -left-20 blur-3xl" />
          <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full -bottom-20 -right-20 blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mb-8 shadow-2xl shadow-blue-500/30">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight">ProofOfReality</h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            AI-powered deepfake detection using EfficientNet-B0 and Grad-CAM explainability.
          </p>
          <div className="space-y-4 text-left">
            {[
              { icon: <Cpu className="h-5 w-5 text-blue-400" />, title: 'EfficientNet-B0 + Transformer', desc: 'Spatial feature extraction from 16 sampled frames' },
              { icon: <Activity className="h-5 w-5 text-green-400" />, title: 'Grad-CAM Heatmaps', desc: 'See exactly which regions were flagged' },
              { icon: <Shield className="h-5 w-5 text-orange-400" />, title: 'Segment Analysis', desc: 'Per-window deepfake scoring with timestamps' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3 bg-slate-800/40 rounded-xl p-3 border border-slate-700/40">
                <div className="mt-0.5 w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center shrink-0">{f.icon}</div>
                <div>
                  <p className="text-white text-sm font-semibold">{f.title}</p>
                  <p className="text-slate-400 text-xs">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl mb-3">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">ProofOfReality</h1>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-slate-800/60 border border-slate-700/60 rounded-xl p-1 mb-6">
            {(['login', 'signup'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all capitalize ${tab === t
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                  }`}
              >
                {t === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 shadow-2xl">
            {tab === 'login' ? (
              <>
                <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
                <p className="text-slate-400 text-sm mb-6">Sign in to your account to continue</p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wide mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type="email" placeholder="you@example.com" className={`${inputCls} pl-10`}
                        value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wide mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type={showPass ? 'text' : 'password'} placeholder="••••••••" className={`${inputCls} pl-10 pr-10`}
                        value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                    {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Sign In <ChevronRight className="h-4 w-4" /></>}
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-white mb-1">Create account</h2>
                <p className="text-slate-400 text-sm mb-6">Start detecting deepfakes in seconds</p>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wide mb-1.5 block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type="text" placeholder="John Doe" className={`${inputCls} pl-10`}
                        value={signupName} onChange={e => setSignupName(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wide mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type="email" placeholder="you@example.com" className={`${inputCls} pl-10`}
                        value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 uppercase tracking-wide mb-1.5 block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input type={showPass ? 'text' : 'password'} placeholder="••••••••" className={`${inputCls} pl-10 pr-10`}
                        value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required />
                      <button type="button" onClick={() => setShowPass(p => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50">
                    {loading ? <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <>Create Account <ChevronRight className="h-4 w-4" /></>}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
