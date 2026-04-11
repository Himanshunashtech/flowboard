import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Sparkles, Zap, Fingerprint, Target, Users, Shield, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AuthPage = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = type === 'login'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ 
            email, 
            password,
            options: {
              emailRedirectTo: `${window.location.origin}/dashboard`
            }
          });

      if (error) throw error;
      
      if (type === 'login' && data?.user) {
        navigate('/dashboard');
      } else if (type === 'signup') {
        alert('Check your email for the confirmation link!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-white overflow-hidden selection:bg-brand-primary/10">
      {/* Wing 1: Panoramic Visual (60%) */}
      <div className="relative hidden lg:block lg:w-[60%] h-full bg-black overflow-hidden group">
         {/* Background Image with Parallax-ready containment */}
         <motion.div 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
         >
            <img 
               src="/auth_visual.png" 
               alt="Auth Visual" 
               className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-[10s] ease-linear"
            />
         </motion.div>

         {/* Gradient Overlays */}
         <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent" />
         <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />

         {/* Cinematic Content overlay */}
         <div className="absolute inset-0 flex flex-col justify-between p-24 z-10">
            <Link to="/" className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center text-white shadow-2xl">
                  <Sparkles size={24} />
               </div>
               <span className="text-3xl font-black text-white tracking-tighter">FlowBoard</span>
            </Link>

            <motion.div 
               initial={{ opacity: 0, y: 40 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.5, duration: 0.8 }}
               className="max-w-xl space-y-8"
            >
               <h2 className="text-6xl font-black text-white leading-[0.95] tracking-tighter">
                  The architecture of <span className="text-brand-primary">deep work</span> is built on flow.
               </h2>
               <div className="flex items-center gap-10">
                  <div className="h-0.5 w-24 bg-brand-primary" />
                  <p className="text-xl font-medium text-white/60 tracking-tight">
                     Kinetic. Decentralized. Infinite.
                  </p>
               </div>
               
               <div className="grid grid-cols-2 gap-10 pt-10 border-t border-white/10">
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-primary">Efficiency</p>
                     <p className="text-white/80 font-bold tracking-tight">Zero-latency planning for modern engineering teams.</p>
                  </div>
                  <div className="space-y-2">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Security</p>
                     <p className="text-white/80 font-bold tracking-tight">Biometric-inspired interface for deep focus.</p>
                  </div>
               </div>
            </motion.div>
         </div>
      </div>

      {/* Wing 2: Authentication Console (40%) */}
      <div className="w-full lg:w-[40%] flex flex-col justify-center items-center p-8 md:p-24 relative">
         {/* Mobile Logo Only */}
         <div className="lg:hidden absolute top-12 flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white">
               <Sparkles size={20} />
            </div>
            <span className="text-2xl font-black text-text-primary tracking-tighter">FlowBoard</span>
         </div>

         <div className="w-full max-w-sm space-y-12">
            <header className="space-y-4">
               <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-bg-secondary rounded-full text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                  <Zap size={12} className="text-brand-primary" />
                  <span>Protocol Initialize</span>
               </div>
               <h1 className="text-4xl font-black text-text-primary tracking-tighter leading-none">
                  {type === 'login' ? 'Welcome Back' : 'Join the Nexus'}
               </h1>
               <p className="text-text-tertiary font-medium">
                  {type === 'login' 
                    ? 'Authenticate your credentials to resume flow.' 
                    : 'Initialize your free environment in seconds.'}
               </p>
            </header>

            {error && (
               <motion.div 
                 initial={{ opacity: 0, x: -10 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="p-5 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 text-xs font-black text-red-600 leading-tight"
               >
                  <Shield size={16} />
                  {error}
               </motion.div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
               <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Authentication Hash (Email)</label>
                  <div className="relative group">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors">
                        <Users size={18} />
                     </div>
                     <input
                        id="email"
                        type="email"
                        placeholder="name@nexus.pro"
                        className="w-full h-16 pl-16 pr-8 bg-bg-secondary border-none rounded-[28px] text-base font-black text-text-primary focus:bg-white focus:ring-8 focus:ring-brand-primary/5 transition-all outline-none shadow-inner placeholder:text-text-tertiary/30"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                     />
                  </div>
               </div>

               <div className="space-y-3">
                  <div className="flex items-center justify-between ml-1">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary">Security Vector (Password)</label>
                     {type === 'login' && <Link to="#" className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">Reset?</Link>}
                  </div>
                  <div className="relative group">
                     <div className="absolute left-6 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-brand-primary transition-colors">
                        <Fingerprint size={18} />
                     </div>
                     <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="w-full h-16 pl-16 pr-14 bg-bg-secondary border-none rounded-[28px] text-base font-black text-text-primary focus:bg-white focus:ring-8 focus:ring-brand-primary/5 transition-all outline-none shadow-inner placeholder:text-text-tertiary/30"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors p-1"
                     >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                     </button>
                  </div>
               </div>

               <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-16 bg-brand-primary text-white rounded-[32px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-brand-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none mt-4 flex items-center justify-center gap-4 group"
               >
                  <span>{loading ? 'Authenticating...' : (type === 'login' ? 'Establish Session' : 'Enlist in FlowBoard')}</span>
                  {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
               </button>
            </form>

            <footer className="pt-12 text-center">
               {type === 'login' ? (
                 <p className="text-sm font-bold text-text-tertiary">
                   First time in the nexus? <Link to="/signup" className="text-brand-primary font-black hover:underline decoration-2 underline-offset-4">Initialize Account</Link>
                 </p>
               ) : (
                 <p className="text-sm font-bold text-text-tertiary">
                   Already enlisted? <Link to="/login" className="text-brand-primary font-black hover:underline decoration-2 underline-offset-4">Authenticate Instead</Link>
                 </p>
               )}
            </footer>
         </div>
      </div>
    </div>
  );
};

export default AuthPage;
