import React from 'react';
import { useLocation } from 'react-router-dom';
import MarketingHeader from '../marketing/MarketingHeader';
import MarketingFooter from '../marketing/MarketingFooter';

const MarketingLayout = ({ children }) => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col selection:bg-primary/10 bg-background">
      <MarketingHeader />
      <main className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
};

export default MarketingLayout;
