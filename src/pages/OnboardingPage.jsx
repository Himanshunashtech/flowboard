import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Box, User, Globe, Shield } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { setProfile } from '../store/slices/authSlice';
import { addWorkspace } from '../store/slices/workspaceSlice';

const OnboardingPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1 State: Profile
  const [fullName, setFullName] = useState('');
  
  // Step 2 State: Workspace
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceDescription, setWorkspaceDescription] = useState('');

  const generateSlug = (val) => {
    return val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNextStep = () => {
    if (step === 1 && fullName) setStep(2);
  };

  const handleComplete = async () => {
    if (!workspaceName || loading) return;
    setLoading(true);

    try {
      // 1. Update Profile (Name and Onboarding Completed)
      const { data: updatedProfile, error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          onboarding_completed: true
        })
        .eq('id', user.id)
        .select()
        .single();
      
      if (profileError) throw profileError;

      // 2. Create Workspace
      const slug = generateSlug(workspaceName);
      const { data: ws, error: wsError } = await supabase
        .from('workspaces')
        .insert({
          name: workspaceName,
          description: workspaceDescription,
          slug,
          owner_id: user.id
        })
        .select()
        .single();

      if (wsError) throw wsError;

      // Update Redux Store
      dispatch(setProfile(updatedProfile));
      dispatch(addWorkspace(ws));

      // Redirect to Dashboard
      navigate('/dashboard');
    } catch (error) {
      console.error('Onboarding error:', error);
      alert(error.message || 'Something went wrong during onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-secondary/5 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-2xl relative">
        {/* Step Indicator */}
        <div className="flex justify-center mb-12 gap-3">
          {[1, 2].map((i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-500 ${step === i ? 'w-12 bg-brand-primary' : 'w-3 bg-border-medium'}`}
            ></div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white border border-border-light rounded-[40px] shadow-2xl p-12 md:p-16 animate-in fade-in zoom-in-95 duration-700">
          
          {step === 1 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-4">
                <div className="inline-flex p-4 bg-brand-primary/10 rounded-2xl text-brand-primary mb-2">
                  <User size={32} />
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Welcome to FlowBoard</h1>
                <p className="text-text-secondary text-lg">First, how should we call you?</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Your Full Name</label>
                  <input 
                    autoFocus
                    placeholder="e.g. Alex Rivera"
                    className="w-full h-16 bg-bg-secondary border-none rounded-2xl px-8 text-xl font-bold focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                  />
                </div>
                
                <button 
                  onClick={handleNextStep}
                  disabled={!fullName}
                  className="w-full h-16 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                >
                  <span>Continue</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-10 animate-in slide-in-from-right-10 duration-500">
              <div className="space-y-4">
                <div className="inline-flex p-4 bg-brand-secondary/10 rounded-2xl text-brand-secondary mb-2">
                  <Box size={32} />
                </div>
                <h1 className="text-4xl font-black text-text-primary tracking-tighter">Set up your workspace</h1>
                <p className="text-text-secondary text-lg">A workspace is where your team and boards live.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">Workspace Name</label>
                  <input 
                    autoFocus
                    placeholder="e.g. Product Team"
                    className="w-full h-16 bg-bg-secondary border-none rounded-2xl px-8 text-xl font-bold focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-tertiary ml-1">What does this team do? (Optional)</label>
                  <textarea 
                    placeholder="e.g. We design and build flowboards."
                    className="w-full h-32 bg-bg-secondary border-none rounded-2xl p-8 text-lg font-medium focus:bg-white focus:ring-4 focus:ring-brand-primary/5 transition-all outline-none resize-none"
                    value={workspaceDescription}
                    onChange={(e) => setWorkspaceDescription(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-bold text-text-tertiary">
                  <div className="flex items-center gap-3 p-4 bg-bg-secondary/50 rounded-xl">
                    <Globe size={16} />
                    <span>Unique URL</span>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-bg-secondary/50 rounded-xl">
                    <Shield size={16} />
                    <span>Private</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex-1 h-16 bg-bg-secondary text-text-primary rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-bg-tertiary transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleComplete}
                    disabled={!workspaceName || loading}
                    className="flex-[2] h-16 bg-brand-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {loading ? 'Setting up...' : (
                      <>
                        <Sparkles size={18} className="fill-current" />
                        <span>Launch FlowBoard</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-text-tertiary text-sm">
          Joined as <span className="font-bold text-text-secondary">{user?.email}</span>
        </p>
      </div>
    </div>
  );
};

export default OnboardingPage;
