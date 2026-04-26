import React, { useState, useEffect } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import UniversalSearch from '../ui/UniversalSearch';
import ToastContainer from '../ui/ToastContainer';
import AIFocusMode from '../ai/AIFocusMode';
import '../../styles/index.css';

const AppLayout = ({ children, scrollable = true }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header onOpenSearch={() => setIsSearchOpen(true)} />
        <main className={`flex-1 relative ${scrollable ? 'overflow-y-auto overflow-x-hidden scroll-smooth' : 'overflow-hidden'}`}>
          {children}
        </main>
      </div>
      <UniversalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <AIFocusMode />
      <ToastContainer />
    </div>
  );
};

export default AppLayout;
