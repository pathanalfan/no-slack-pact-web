'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGetPactByIdQuery } from '@/store/api/pactApi';
import { useGetUserLogsByPactQuery } from '@/store/api/activityApi';
import { Button } from '@/components/common/Button';
import { formatDate } from '@/utils/format';
import { STORAGE_KEYS } from '@/constants';

function formatLocalYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0-6, Sun-Sat
  const diff = (day + 6) % 7; // Mon=0
  d.setDate(d.getDate() - diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export default function PactWeekViewPage() {
  const router = useRouter();
  const params = useParams();
  const pactId = params?.id as string;

  const { data: pact, isLoading } = useGetPactByIdQuery(pactId || '', {
    skip: !pactId,
  });

  const userId = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.USER_ID)) || '';
  const {
    data: userLogs,
    isLoading: isLoadingLogs,
    isFetching: isFetchingLogs,
  } = useGetUserLogsByPactQuery(
    { pactId: pactId || '', userId: userId || '' },
    {
      skip: !pactId || !userId,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const allDays = useMemo(() => {
    // Start from the earlier of (pact start week) and (today's week)
    const pactStartBase = pact?.startDate ? new Date(pact.startDate) : today;
    pactStartBase.setHours(0, 0, 0, 0);
    const startOfPactWeek = getStartOfWeek(pactStartBase);
    const startOfTodayWeek = getStartOfWeek(today);
    const rangeStart =
      startOfPactWeek.getTime() <= startOfTodayWeek.getTime()
        ? startOfPactWeek
        : startOfTodayWeek;

    // Always include current week so we can center today
    const endOfThisWeek = addDays(getStartOfWeek(today), 6);

    const diffMs = endOfThisWeek.getTime() - rangeStart.getTime();
    const daysCount = Math.max(7, Math.floor(diffMs / (24 * 60 * 60 * 1000)) + 1);

    return Array.from({ length: daysCount }, (_, i) => addDays(rangeStart, i));
  }, [today, pact?.startDate]);

  const currentDayIndex = allDays.findIndex((d) => d.getTime() === today.getTime());

  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    // Prefer today if present, else center first day
    const indexToCenter = currentDayIndex >= 0 ? currentDayIndex : 0;
    const el = dayRefs.current[indexToCenter];
    if (!el) return;

    // Horizontal (desktop)
    if (window.innerWidth >= 1024) {
      const offset = el.offsetLeft - list.clientWidth / 2 + el.clientWidth / 2;
      list.scrollTo({ left: offset, behavior: 'smooth' });
    } else {
      // Vertical (mobile)
      const offset = el.offsetTop - list.clientHeight / 2 + el.clientHeight / 2;
      list.scrollTo({ top: offset, behavior: 'smooth' });
    }
  }, [currentDayIndex, allDays.length]);

  if (isLoading || !pact || (isLoadingLogs && !userLogs)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Loading week view...</p>
        </div>
      </div>
    );
  }

  const weekRangeLabel = `${formatDate(allDays[0].toISOString())} – ${formatDate(
    allDays[Math.max(0, allDays.length - 1)].toISOString()
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
      <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-100">
              {pact.title}
            </h1>
            <p className="text-zinc-500 text-sm sm:text-base mt-1">{weekRangeLabel}</p>
            {isFetchingLogs && (
              <div className="ml-2 w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => router.push('/pacts')}>
              Explore Pacts
            </Button>
          </div>
        </div>

        {/* Week list */}
        <div
          ref={listRef}
          className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl backdrop-blur-xl p-4 sm:p-6
                     lg:flex lg:space-x-4 lg:overflow-x-auto lg:overflow-y-hidden
                     space-y-4 lg:space-y-0
                     max-h-[70vh] lg:max-h-none"
          style={{ scrollBehavior: 'smooth' }}
        >
          {allDays.map((d, idx) => {
            const isToday = idx === currentDayIndex;
            // Build YYYY-MM-DD in local time to match API payload
            const dayKey = formatLocalYMD(d);
            const dayLogs =
              userLogs?.days?.find((day) => day.date === dayKey)?.logs || [];
            return (
              <div
                key={idx}
                ref={(el) => {
                  dayRefs.current[idx] = el;
                }}
                className={`flex-shrink-0 rounded-xl border p-5 bg-zinc-900/70 backdrop-blur
                            ${isToday ? 'border-blue-500/40 shadow-lg shadow-blue-500/10' : 'border-zinc-800/60'}
                            w-full lg:w-64`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="text-zinc-300 font-semibold">
                    {d.toLocaleDateString('en-US', { weekday: 'long' })}
                  </div>
                  {isToday && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      Today
                    </span>
                  )}
                </div>
                <div className="text-zinc-400 text-sm mb-4">
                  {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>

                {/* Day content */}
                {isToday && isFetchingLogs ? (
                  <div className="mb-4 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                  </div>
                ) : dayLogs.length > 0 ? (
                  <div className="space-y-2 mb-4">
                    {dayLogs.map((log) => (
                      <button
                        key={log.id}
                        onClick={() => router.push(`/pact/${pactId}/log/${log.id}`)}
                        className="w-full text-left text-sm px-3 py-2 rounded-lg border border-zinc-700/60 bg-zinc-900/60 hover:bg-zinc-800/60 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-zinc-300">View activity log</span>
                          {log.verified && (
                            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                              Verified
                            </span>
                          )}
                        </div>
                        {log.notes && (
                          <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{log.notes}</div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : isToday ? (
                  <div className="mb-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(`/pact/${pactId}/log/create`)}
                    >
                      + Add Activity Log
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-lg p-4 border border-zinc-800/60 bg-zinc-900/60 text-zinc-500 text-sm mb-4">
                    No activity logged.
                  </div>
                )}

                {/* Placeholder for future summary content */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}


