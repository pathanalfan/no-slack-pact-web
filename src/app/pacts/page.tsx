'use client';

import { useRouter } from 'next/navigation';
import { useGetActivePactsQuery } from '@/store/api/pactApi';
import { PactCard } from '@/components/pact/PactCard';
import { PactCardSkeleton } from '@/components/common/LoadingSkeleton';
import { Button } from '@/components/common/Button';
import type { Pact } from '@/types';
import { STORAGE_KEYS } from '@/constants';
import { useGetProgressByUserQuery } from '@/store/api/activityApi';

function YourPactsGrid({
  allPacts,
  progressMap,
}: {
  allPacts: Pact[];
  progressMap: Record<string, { targetDays: number; activityDays: number }>;
}) {
  let userId = '';
  if (typeof window !== 'undefined') {
    userId = localStorage.getItem(STORAGE_KEYS.USER_ID) || '';
  }
  const yourPacts = allPacts.filter((p) =>
    Array.isArray(p.participants) && p.participants.some((u) => u._id === userId)
  );

  if (yourPacts.length === 0) {
    return (
      <div className="text-zinc-500 text-sm border border-zinc-800/50 rounded-xl p-6 bg-zinc-900/50">
        You have not joined any pacts yet.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-wrap justify-between gap-8">
      {yourPacts.map((pact) => (
        <div key={pact._id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)]">
          <PactCard
            pact={pact}
            hrefOverride={`/pact/${pact._id}/week`}
            progress={progressMap[pact._id] || null}
          />
        </div>
      ))}
    </div>
  );
}

export default function PactsPage() {
  const router = useRouter();
  const { data: pacts, isLoading, error, isError } = useGetActivePactsQuery();

  const handleCreatePact = () => {
    router.push('/pacts/create');
  };

  let userId = '';
  if (typeof window !== 'undefined') {
    userId = localStorage.getItem(STORAGE_KEYS.USER_ID) || '';
  }

  const { data: progressResp, isFetching: isFetchingProgress } = useGetProgressByUserQuery(
    userId || '',
    {
      skip: !userId,
    }
  );
  const progressMap: Record<string, { targetDays: number; activityDays: number }> = {};
  if (progressResp?.results) {
    for (const r of progressResp.results) {
      progressMap[r.pactId] = { targetDays: r.targetDays, activityDays: r.activityDays };
    }
  }

  const explorePacts = (pacts || []).filter(
    (p) => !(Array.isArray(p.participants) && p.participants.some((u) => u._id === userId))
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
      {/* Header Section */}
      
  <div className="container mx-auto max-w-7xl pt-16 sm:pt-20 lg:pt-24 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-100">
          Explore Pacts
        </h1>
      </div>

      {/* Content Section */}
      
      {!isLoading && !isError && pacts && pacts.length === 0 ? (
        <div className="flex justify-center items-center min-h-[calc(100vh-200px)] w-full px-4 sm:px-6 lg:px-8 mt-16">


          <div className="rounded-2xl border-2 border-dashed border-zinc-700/50 bg-zinc-900/30 p-12 sm:p-16 lg:p-20 max-w-2xl w-full">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-800/50 mb-8">
                <svg
                  className="w-10 h-10 sm:w-12 sm:h-12 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-300 mb-4 sm:mb-6 text-center">
                No Pacts Found
              </h3>
              <p className="text-zinc-400 text-base sm:text-lg mb-8 sm:mb-10 max-w-lg mx-auto leading-relaxed text-center">
                There are currently no active pacts. Please create new!
              </p>
              <Button variant="primary" size="lg" onClick={handleCreatePact} className="min-w-[200px] sm:min-w-[240px]">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create a Pact
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 sm:pb-20 lg:pb-24 mt-16">

          {/* Loading State */}
          {isLoading && (
            <div className="w-full flex flex-wrap justify-between gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)]">
                  <PactCardSkeleton />
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-10 backdrop-blur-sm max-w-2xl mx-auto">
              <div className="flex items-start gap-5">
                <div className="flex-shrink-0">
                  <svg
                    className="h-7 w-7 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-2">Error Loading Pacts</h3>
                  <p className="text-base text-red-300/80">
                    {error && 'data' in error
                      ? (error.data as { message?: string })?.message || 'Failed to load pacts'
                      : 'Failed to load pacts. Please try again later.'}
                  </p>
                </div>
              </div>
            </div>
          )}

            {/* Your Pacts Section */}
            {!isLoading && !isError && pacts && pacts.length > 0 && (
            <div className="mt-16">
              <div className="mb-6 flex items-center gap-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">Your Pacts</h2>
                {isFetchingProgress && (
                  <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                )}
              </div>
              <YourPactsGrid allPacts={pacts} progressMap={progressMap} />
            </div>
          )}
          {/* Pacts Grid - Explore Active Pacts */}
          {!isLoading && !isError && explorePacts && explorePacts.length > 0 && (
            <>
              <div className="flex items-center gap-2 mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">Active Pacts</h2>
                {isFetchingProgress && (
                  <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                )}
              </div>
              <div className="w-full flex flex-wrap justify-between gap-8">
                {explorePacts.map((pact) => (
                  <div key={pact._id} className="w-full md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)]">
                    <PactCard pact={pact} progress={progressMap[pact._id] || null} />
                  </div>
                ))}
              </div>
            </>
          )}

        
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleCreatePact}
        className="fixed bottom-8 right-8 sm:bottom-10 sm:right-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-110 transition-all duration-200 flex items-center justify-center z-50"
        aria-label="Create new pact"
      >
        <svg
          className="w-7 h-7 sm:w-8 sm:h-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </button>
    </div>
  );
}
