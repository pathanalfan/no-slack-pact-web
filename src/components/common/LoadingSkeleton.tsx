'use client';

export function PactCardSkeleton() {
  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-xl overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-zinc-800" />
      <div className="p-6 space-y-4">
        <div className="h-6 bg-zinc-800 rounded w-3/4" />
        <div className="h-4 bg-zinc-800 rounded w-full" />
        <div className="h-4 bg-zinc-800 rounded w-5/6" />
        <div className="flex gap-4">
          <div className="h-4 bg-zinc-800 rounded w-24" />
          <div className="h-4 bg-zinc-800 rounded w-24" />
        </div>
        <div className="h-px bg-zinc-800" />
        <div className="h-4 bg-zinc-800 rounded w-32" />
      </div>
    </div>
  );
}

