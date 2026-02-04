'use client';

export default function SearchSkeleton() {
  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm h-full flex flex-col animate-pulse min-h-[400px]">
      {/* Header Skeleton */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-100 rounded-full shrink-0 mb-4" />
        <div className="w-full space-y-3 flex flex-col items-center">
          <div className="h-7 bg-slate-100 rounded w-3/4" />
          <div className="h-5 bg-slate-50 rounded w-1/4" />
          <div className="h-6 bg-slate-100 rounded w-1/2" />
        </div>
      </div>

      {/* Body Skeleton */}
      <div className="space-y-3 mb-8 flex-grow">
        <div className="h-4 bg-slate-50 rounded w-full" />
        <div className="h-4 bg-slate-50 rounded w-full" />
        <div className="h-4 bg-slate-50 rounded w-full" />
        <div className="h-4 bg-slate-50 rounded w-5/6" />
      </div>

      {/* Footer Skeleton */}
      <div className="flex flex-wrap gap-2 mt-auto">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-6 bg-slate-50 rounded-lg w-16" />
        ))}
      </div>
    </div>
  );
}
