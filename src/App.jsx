import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from './lib/supabase';
import { setSession, setLoading as setAuthLoading, setProfile } from './store/slices/authSlice';
import { setWorkspaces, setLoading as setWorkspaceLoading } from './store/slices/workspaceSlice';


import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import BoardPage from './pages/BoardPage';
import LandingPage from './pages/LandingPage';
import ClientPortal from './pages/ClientPortal';
import OnboardingPage from './pages/OnboardingPage';
import AcceptInvitationPage from './pages/AcceptInvitationPage';
import SettingsPage from './pages/SettingsPage';
import TeamPage from './pages/TeamPage';
import InboxPage from './pages/InboxPage';
import PlannerPage from './pages/PlannerPage';
import TemplatesPage from './pages/TemplatesPage';
import HistoryPage from './pages/HistoryPage';
import ScrollToTop from './components/utils/ScrollToTop';

// Marketing Pages
import FeaturesPage from './pages/marketing/FeaturesPage';
import IntegrationsPage from './pages/marketing/IntegrationsPage';
import HelpCenterPage from './pages/marketing/HelpCenterPage';
import CommunityPage from './pages/marketing/CommunityPage';
import AboutPage from './pages/marketing/AboutPage';
import ContactPage from './pages/marketing/ContactPage';
import BlogPage from './pages/marketing/BlogPage';
import BlogPostPage from './pages/marketing/BlogPostPage';
import PrivacyPage from './pages/marketing/PrivacyPage';
import TermsPage from './pages/marketing/TermsPage';
import SecurityPage from './pages/marketing/SecurityPage';

// Modals
import CreateWorkspaceModal from './components/modals/CreateWorkspaceModal';
import CreateBoardModal from './components/modals/CreateBoardModal';
import InviteWorkspaceMemberModal from './components/modals/InviteWorkspaceMemberModal';
import AutomationsModal from './components/modals/AutomationsModal';
import CommandPalette from './components/CommandPalette';



function App() {
  const dispatch = useDispatch();
  const { user, profile, loading, profileLoaded } = useSelector((state) => state.auth);
  const { modals, theme } = useSelector((state) => state.ui);

  // Handle Dark Mode
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const fetchProfile = async (userId) => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (data) {
        dispatch(setProfile(data));
      } else if (error) {
        console.error('Error fetching profile:', error);
      }
    };

    const fetchWorkspaces = async () => {
      dispatch(setWorkspaceLoading(true));
      const { data } = await supabase
        .from('workspaces')
        .select(`
          *,
          boards (*),
          workspace_members (
            user_id,
            role,
            profiles (id, full_name, email, avatar_url)
          )
        `)
        .order('name');
      
      if (data) {
        dispatch(setWorkspaces(data));
      }
      dispatch(setWorkspaceLoading(false));
    };

    const handleSession = async (session) => {
      dispatch(setSession(session));
      if (session?.user) {
        fetchProfile(session.user.id);
        fetchWorkspaces();


      }
    };

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  if (loading || (user && !profileLoaded)) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-primary">
        <div className="w-12 h-12 rounded-2xl border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Helper for protected routes that check onboarding
  const ProtectedRoute = ({ children }) => {
    if (!user) return <Navigate to="/login" />;
    if (profile && !profile.onboarding_completed) return <Navigate to="/onboarding" />;
    return children;
  };

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={!user ? <AuthPage type="login" /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <AuthPage type="signup" /> : <Navigate to="/dashboard" />} />

        {/* Protected Routes (Require Onboarding) */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/w/:workspaceSlug" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/w/:workspaceSlug/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
        <Route path="/w/:workspaceSlug/b/:boardId" element={<BoardPage />} />
        <Route path="/inbox" element={<ProtectedRoute><InboxPage /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
        <Route path="/automations" element={<Navigate to="/dashboard" />} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />

        {/* Onboarding (Doesn't require onboarding_completed) */}
        <Route path="/onboarding" element={user ? (profile?.onboarding_completed ? <Navigate to="/dashboard" /> : <OnboardingPage />) : <Navigate to="/login" />} />
        
        {/* Invitations */}
        <Route path="/invite/:token" element={<AcceptInvitationPage />} />

        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/community" element={<CommunityPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/p/:portalSlug" element={<ClientPortal />} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {/* Global Modals */}
      {modals.createWorkspace && <CreateWorkspaceModal />}
      {modals.createBoard && <CreateBoardModal />}
      {modals.memberInvite && <InviteWorkspaceMemberModal />}
      {modals.automations && <AutomationsModal />}

      {/* AI Assistant & Search */}
      <CommandPalette />
    </Router>
  );
}

export default App;
