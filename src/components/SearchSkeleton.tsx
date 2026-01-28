'use client';

export default function SearchSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm h-full flex flex-col animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center gap-5 mb-6">
        <div className="w-16 h-16 bg-slate-100 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-6 bg-slate-100 rounded w-3/4" />
          <div className="h-5 bg-slate-50 rounded w-1/2" />
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
