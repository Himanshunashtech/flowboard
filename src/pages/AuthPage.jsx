import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthPage = ({ type }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-bg-secondary flex flex-col justify-center py-12 px-6 lg:px-8 selection:bg-brand-primary/10">
      <div className="max-w-md w-full mx-auto bg-white p-10 md:p-12 rounded-[40px] shadow-2xl shadow-black/5 space-y-10 border border-border-light animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center">
          <Link to="/" className="text-3xl font-bold text-brand-primary tracking-tight inline-block mb-10 hover:scale-105 transition-transform">FlowBoard</Link>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-3">
            {type === 'login' ? 'Sign in to account' : 'Start your free trial'}
          </h1>
          <p className="text-sm font-medium text-text-tertiary">
            {type === 'login' 
              ? 'Enter your details to access your dashboard' 
              : 'Join 10k+ teams managing work with FlowBoard'}
          </p>
        </div>

        {error && (
          <div className="p-4 bg-danger/5 border border-danger/10 rounded-2xl flex items-center gap-3 text-xs font-bold text-danger animate-shake">
            <span className="w-1.5 h-1.5 rounded-full bg-danger"></span>
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleAuth}>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest ml-1" htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="name@company.com"
              className="w-full h-12 bg-bg-secondary border-none rounded-2xl px-5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest" htmlFor="password">Password</label>
              {type === 'login' && <Link to="#" className="text-[10px] font-bold text-brand-primary hover:underline">Forgot?</Link>}
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full h-12 bg-bg-secondary border-none rounded-2xl px-5 text-sm font-medium focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button 
            type="submit" 
            className="w-full h-12 bg-brand-primary text-white rounded-2xl font-bold text-sm hover:bg-brand-primary-hover shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none mt-4"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (type === 'login' ? 'Sign in' : 'Create Free Account')}
          </button>
        </form>

        <div className="pt-8 border-t border-border-light text-center">
          {type === 'login' ? (
            <p className="text-sm font-medium text-text-tertiary">
              Don't have an account? <Link to="/signup" className="text-brand-primary font-bold hover:underline">Sign up for free</Link>
            </p>
          ) : (
            <p className="text-sm font-medium text-text-tertiary">
              Already have an account? <Link to="/login" className="text-brand-primary font-bold hover:underline">Sign in instead</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
