'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useGetPactByIdQuery } from '@/store/api/pactApi';
import { useGetUserActivitiesByPactQuery } from '@/store/api/activityApi';
import { Button } from '@/components/common/Button';
import { formatCurrency, formatDate } from '@/utils/format';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';

export default function PactDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pactId = params?.id as string;
  
  const { data: pact, isLoading: isLoadingPact, error: pactError } = useGetPactByIdQuery(pactId || '', {
    skip: !pactId,
  });
  const { data: userActivities = [], isLoading: isLoadingActivities, refetch: refetchActivities } = useGetUserActivitiesByPactQuery(pactId || '', {
    skip: !pactId,
    refetchOnMountOrArgChange: true,
  });

  // Refetch activities when component mounts or when returning from create page
  useEffect(() => {
    if (!pactId) return;

    // Refetch on mount
    refetchActivities();

    // Refetch when window regains focus (user navigates back)
    const handleFocus = () => {
      refetchActivities();
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [pactId, refetchActivities]);

  const handleAddActivity = () => {
    if (!pactId) return;
    router.push(`/pact/${pactId}/activity/create`);
  };

  const [isJoining, setIsJoining] = useState(false);

  const handleConfirmJoin = async () => {
    if (!pact) return;

    try {
      setIsJoining(true);
      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        router.push('/login');
        return;
      }

      // Get activity IDs from user activities
      const activityIds = userActivities.map((activity) => activity._id);

      const response = await fetch(`${API_BASE_URL}/user/join-pact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({
          userId: userId,
          pactId: pact._id,
          activityIds: activityIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to join pact');
      }

      // Persist current pact for default routing
      try {
        localStorage.setItem(STORAGE_KEYS.CURRENT_PACT_ID, pact._id);
      } catch {}

      // Go to the pacts page after joining
      router.push('/pacts');
    } catch (error) {
      console.error('Error joining pact:', error);
      alert('Failed to join pact. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoadingPact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Loading pact details...</p>
        </div>
      </div>
    );
  }

  if (pactError || !pact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 mb-6">
            <svg
              className="w-8 h-8 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Pact Not Found</h2>
          <p className="text-zinc-400 mb-6">The pact you're looking for doesn't exist or has been removed.</p>
          <Button variant="primary" onClick={() => router.push('/pacts')}>
            Back to Pacts
          </Button>
        </div>
      </div>
    );
  }

  const userActivityCount = userActivities.length;
  const canAddMoreActivities = userActivityCount < pact.maxActivitiesPerUser;
  const showConfirmJoin = userActivityCount === pact.maxActivitiesPerUser;
  const buttonText = showConfirmJoin
    ? 'Confirm Join'
    : pact.maxActivitiesPerUser > 1
    ? 'Add Activities'
    : 'Add Activity';

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 mb-8 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back</span>
        </button>

        {/* Pact Details Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-2xl p-8 sm:p-10 mb-8">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-zinc-100 mb-4">
            {pact.title}
          </h1>

          {/* Description */}
          {pact.description && (
            <p className="text-zinc-400 text-base sm:text-lg mb-8 leading-relaxed">
              {pact.description}
            </p>
          )}

          {/* Fines Section - Prominently Displayed */}
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span className="font-semibold text-orange-400 text-base">Financial Penalties</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <div className="text-orange-300 font-medium text-sm mb-2">Skip Fine</div>
                <div className="text-orange-200 font-bold text-2xl">{formatCurrency(pact.skipFine)}</div>
              </div>
              <div>
                <div className="text-orange-300 font-medium text-sm mb-2">Leave Fine</div>
                <div className="text-orange-200 font-bold text-2xl">{formatCurrency(pact.leaveFine)}</div>
              </div>
            </div>
          </div>

          {/* Pact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div className="bg-zinc-800/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span className="text-zinc-400 text-sm font-medium">Participants</span>
              </div>
              <p className="text-zinc-100 text-xl font-bold">{pact.participants?.length || 0}</p>
            </div>

            <div className="bg-zinc-800/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-zinc-400 text-sm font-medium">Min Days/Week</span>
              </div>
              <p className="text-zinc-100 text-xl font-bold">{pact.minDaysPerWeek}</p>
            </div>

            <div className="bg-zinc-800/50 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"
                  />
                </svg>
                <span className="text-zinc-400 text-sm font-medium">Max Activities</span>
              </div>
              <p className="text-zinc-100 text-xl font-bold">{pact.maxActivitiesPerUser}</p>
            </div>

            {pact.startDate && (
              <div className="bg-zinc-800/50 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="h-5 w-5 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="text-zinc-400 text-sm font-medium">Start Date</span>
                </div>
                <p className="text-zinc-100 text-lg font-semibold">{formatDate(pact.startDate)}</p>
              </div>
            )}
          </div>

          {/* User Activities Section */}
          {userActivityCount > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-bold text-zinc-100 mb-4">Your Activities ({userActivityCount}/{pact.maxActivitiesPerUser})</h3>
              <div className="space-y-3">
                {userActivities.map((activity) => (
                  <div
                    key={activity._id}
                    className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700/50"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-zinc-100 font-semibold mb-1">{activity.name}</h4>
                        {activity.description && (
                          <p className="text-zinc-400 text-sm">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button - Always Visible */}
        <div className="sticky bottom-6 z-10">
          <div className="flex items-center justify-between mb-3">
            <span className="text-zinc-500 text-sm">
              {showConfirmJoin
                ? 'You have added the maximum number of activities.'
                : `You can add ${pact.maxActivitiesPerUser - userActivityCount} more ${pact.maxActivitiesPerUser - userActivityCount === 1 ? 'activity' : 'activities'}.`}
            </span>
            <button
              onClick={() => router.push('/pacts')}
              className="text-sm text-zinc-400 hover:text-zinc-200 underline underline-offset-4 transition-colors"
            >
              View other pacts
            </button>
          </div>
          <Button
            variant="primary"
            size="lg"
            onClick={showConfirmJoin ? handleConfirmJoin : handleAddActivity}
            className="w-full"
            disabled={isLoadingActivities || isJoining}
            isLoading={isJoining}
          >
            {isLoadingActivities ? (
              'Loading...'
            ) : (
              <>
                {showConfirmJoin ? (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Confirm Join
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    {buttonText}
                  </>
                )}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

