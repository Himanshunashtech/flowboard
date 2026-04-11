import React from 'react';
import MarketingHeader from '../marketing/MarketingHeader';
import MarketingFooter from '../marketing/MarketingFooter';

const MarketingLayout = ({ children }) => {
  return (
    <div className="bg-white min-h-screen flex flex-col selection:bg-brand-primary/10">
      <MarketingHeader />
      <main className="flex-1">
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
};

export default MarketingLayout;
