'use client';

import Link from 'next/link';
import type { Pact } from '@/types';
import { formatCurrency, formatDateRange } from '@/utils/format';

interface PactCardProps {
  pact: Pact;
}

export function PactCard({ pact }: PactCardProps) {
  const participantCount = pact.participants?.length || 0;
  const description = pact.description || 'No description available';

  return (
    <Link href={`/pact/${pact._id}`} className="block h-full">
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-xl hover:shadow-2xl hover:border-zinc-700/50 transition-all duration-200 overflow-hidden h-full flex flex-col cursor-pointer group">
        {/* Image Placeholder */}
        <div className="w-full h-48 bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
          <div className="w-16 h-16 rounded-xl bg-zinc-800/50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-zinc-100 mb-2 line-clamp-2 group-hover:text-white transition-colors">
            {pact.title}
          </h3>
          
          <p className="text-zinc-400 text-sm mb-4 line-clamp-2 leading-relaxed flex-grow">
            {description}
          </p>

          {/* Details */}
          <div className="flex flex-wrap gap-4 text-sm text-zinc-400 mb-4">
            <div className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <span>{participantCount} Participant{participantCount !== 1 ? 's' : ''}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg
                className="h-4 w-4 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>{pact.minDaysPerWeek} days/week</span>
            </div>
            {(pact.startDate || pact.endDate) && (
              <div className="flex items-center gap-1.5">
                <svg
                  className="h-4 w-4 text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs">{formatDateRange(pact.startDate, pact.endDate)}</span>
              </div>
            )}
          </div>

          {/* Fines */}
          <div className="pt-4 border-t border-zinc-800/50">
            <div className="flex gap-4 text-sm">
              <div>
                <span className="text-orange-400 font-medium">Skip Fine: </span>
                <span className="text-orange-300 font-bold">{formatCurrency(pact.skipFine)}</span>
              </div>
              <div>
                <span className="text-orange-400 font-medium">Leave Fine: </span>
                <span className="text-orange-300 font-bold">{formatCurrency(pact.leaveFine)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

