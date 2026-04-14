import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Shield, User, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { getInvitationData, acceptWorkspaceInvitation } from '../lib/invitationService';

const AcceptInvitationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [status, setStatus] = useState('FETCHING'); // FETCHING, INVALID, READY, EXPIRED, SUCCESS
  const [invitation, setInvitation] = useState(null);

  useEffect(() => {
    const fetchInvite = async () => {
      const result = await getInvitationData(token);
      if (result.success) {
        setInvitation(result.invitation);
        if (result.isAccepted) setStatus('SUCCESS');
        else if (result.isExpired) setStatus('EXPIRED');
        else setStatus('READY');
      } else {
        setStatus('INVALID');
      }
      setLoading(false);
    };

    if (token) fetchInvite();
  }, [token]);

  const handleAccept = async () => {
    if (!user) {
      // Redirect to signup with token as ref
      navigate(`/signup?inviteToken=${token}`);
      return;
    }

    setAccepting(true);
    const result = await acceptWorkspaceInvitation(token);

    if (result.success) {
      setStatus('SUCCESS');
      setTimeout(() => navigate('/dashboard'), 2000);
    } else {
      alert('Acceptance failed: ' + result.error);
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-6">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
          <p className="text-sm font-black uppercase tracking-[0.3em] text-text-tertiary">Accessing Nexus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex flex-col items-center justify-center p-6 selection:bg-brand-primary/10">
      <div className="max-w-xl w-full">
        {/* Logo/Brand */}
        <div className="flex justify-center mb-12">
            <Link to="/" className="flex items-center gap-3">
               <div className="w-12 h-12 bg-white flex items-center justify-center text-brand-primary rounded-2xl shadow-xl border border-border-light">
                  <Sparkles size={24} />
               </div>
               <span className="text-2xl font-black text-text-primary tracking-tighter">FlowBoard</span>
            </Link>
        </div>

        <AnimatePresence mode="wait">
          {status === 'READY' && (
            <motion.div 
              key="ready"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[48px] p-12 shadow-3xl border border-border-light text-center space-y-10"
            >
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600 border border-indigo-100">
                  <Shield size={12} /> Authorization Pending
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter leading-none">
                  Collaborate on <br /> <span className="text-brand-primary italic">{invitation?.workspaces?.name}</span>
                </h1>
                <p className="text-text-secondary font-medium leading-relaxed italic">
                  <strong>{invitation?.profiles?.full_name || 'A teammate'}</strong> has invited you to join their project nexus. Collaborate in real-time with kinetic boards and protocol-driven workflows.
                </p>
              </div>

              <div className="pt-6 border-t border-border-light flex flex-col gap-4">
                <button 
                  onClick={handleAccept}
                  disabled={accepting}
                  className="w-full h-16 bg-text-primary text-white rounded-[28px] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-4 group disabled:opacity-50"
                >
                  {accepting ? 'Synchronizing...' : (
                    <>
                      <span>{user ? 'Initialize Access' : 'Establish Credentials'}</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <button 
                  onClick={() => navigate('/')}
                  disabled={accepting}
                  className="w-full h-14 bg-transparent border-2 border-border-light text-text-tertiary rounded-[24px] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-bg-secondary transition-all disabled:opacity-50"
                >
                  Decline Invitation
                </button>
                <p className="text-[9px] font-black uppercase tracking-widest text-text-tertiary">
                  {user ? `Accepting as ${user.email}` : 'Sign up required to join workspace'}
                </p>
              </div>
            </motion.div>
          )}

          {status === 'SUCCESS' && (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[48px] p-20 shadow-3xl border border-border-light text-center space-y-8"
            >
              <div className="w-24 h-24 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={48} strokeWidth={3} />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-text-primary tracking-tighter">Connection Established.</h2>
                <p className="text-text-secondary font-bold italic">Redirecting to project dashboard...</p>
              </div>
            </motion.div>
          )}

          {(status === 'EXPIRED' || status === 'INVALID') && (
            <motion.div 
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[48px] p-12 shadow-3xl border border-border-light text-center space-y-8"
            >
              <div className="w-20 h-20 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={40} />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-text-primary tracking-tighter">Invalid Protocol.</h2>
                <p className="text-text-secondary font-medium italic">
                  {status === 'EXPIRED' 
                    ? 'This invitation has expired for security reasons. Please ask your admin to re-issue the token.' 
                    : 'The provided link is invalid or has already been consumed.'}
                </p>
              </div>
              <Link to="/" className="inline-block pt-6 text-brand-primary font-black uppercase tracking-widest text-xs hover:underline decoration-2 underline-offset-8">Return to FlowBoard</Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AcceptInvitationPage;
