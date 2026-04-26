import React from 'react';

const Skeleton = ({ className, variant = 'rect' }) => {
  const variantClasses = {
    rect: 'rounded-2xl',
    circle: 'rounded-full',
    text: 'rounded-lg h-4 w-full'
  };

  return (
    <div className={`shimmer ${variantClasses[variant]} ${className}`} />
  );
};

export const BoardSkeleton = () => (
  <div className="flex flex-col h-full bg-bg-primary overflow-hidden">
    {/* Header Skeleton */}
    <div className="h-18 border-b border-border-light flex items-center justify-between px-8 bg-white/80 backdrop-blur-xl shrink-0">
      <div className="flex items-center gap-6">
        <div className="space-y-2">
          <Skeleton className="h-2 w-24 bg-primary/20" />
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-10 rounded-xl" />)}
        <Skeleton className="h-10 w-32 rounded-xl" />
      </div>
    </div>

    {/* Canvas Skeleton */}
    <div className="flex-1 flex gap-8 p-10 overflow-hidden bg-bg-secondary/30">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="w-[320px] shrink-0 flex flex-col gap-6">
          <div className="flex items-center justify-between px-2">
            <Skeleton variant="text" className="w-24 h-6" />
            <Skeleton variant="circle" className="h-5 w-5 opacity-40" />
          </div>
          
          <div className="space-y-6">
            {[1, 2, 3].map(j => (
              <div key={j} className="bg-white/80 backdrop-blur-md rounded-[28px] border border-border-light shadow-sm p-6 space-y-5">
                <div className="flex gap-2">
                   <Skeleton className="h-4 w-12 rounded-full opacity-20 bg-primary" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border-light/50">
                  <div className="flex -space-x-2">
                    {[1, 2].map(k => <Skeleton key={k} variant="circle" className="h-7 w-7 border-2 border-white shadow-sm" />)}
                  </div>
                  <Skeleton className="h-2 w-16 opacity-30" />
                </div>
              </div>
            ))}
          </div>

          <button className="h-12 border-2 border-dashed border-border-light/60 rounded-2xl flex items-center justify-center gap-3 opacity-40">
            <Skeleton variant="circle" className="h-4 w-4" />
            <Skeleton className="h-2 w-20" />
          </button>
        </div>
      ))}
    </div>
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
