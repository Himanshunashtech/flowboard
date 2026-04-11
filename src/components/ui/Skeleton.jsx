import React from 'react';

const Skeleton = ({ className, variant = 'rect' }) => {
  const baseClasses = 'animate-pulse bg-bg-secondary/80';
  const variantClasses = {
    rect: 'rounded-2xl',
    circle: 'rounded-full',
    text: 'rounded-lg h-4 w-full'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} />
  );
};

export const BoardSkeleton = () => (
  <div className="flex gap-8 p-10 overflow-hidden">
    {[1, 2, 3].map(i => (
      <div key={i} className="w-[320px] shrink-0 bg-white/40 backdrop-blur-md rounded-[32px] p-6 border border-border-light flex flex-col gap-6 shadow-sm">
        <Skeleton variant="text" className="w-24 h-5" />
        <div className="space-y-4">
          {[1, 2].map(j => (
            <div key={j} className="bg-white rounded-[24px] border border-border-light shadow-sm p-6 space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex items-center gap-2 pt-2">
                <Skeleton variant="circle" className="h-6 w-6" />
                <Skeleton variant="circle" className="h-6 w-6" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="p-8 max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500">
    <div className="flex justify-between items-center">
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-12 w-32" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
       <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-2 gap-4">
             {[1, 2].map(i => <Skeleton key={i} className="h-24" />)}
          </div>
          <div className="space-y-6">
             {[1, 2].map(i => <Skeleton key={i} className="h-48" />)}
          </div>
       </div>
       <div className="space-y-8">
          <Skeleton className="h-[500px]" />
       </div>
    </div>
  </div>
);

export default Skeleton;
