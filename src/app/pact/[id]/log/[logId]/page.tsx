'use client';

import { useParams, useRouter } from 'next/navigation';
import { useGetActivityLogQuery } from '@/store/api/activityApi';
import { Button } from '@/components/common/Button';

export default function ActivityLogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pactId = params?.id as string;
  const logId = params?.logId as string;

  const { data: log, isLoading, error } = useGetActivityLogQuery(logId || '', {
    skip: !logId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Loading log...</p>
        </div>
      </div>
    );
  }

  if (error || !log) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Log Not Found</h2>
          <p className="text-zinc-400 mb-6">We couldn't load this log.</p>
          <Button variant="primary" onClick={() => router.push(`/pact/${pactId}/week`)}>
            Back to Week
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-100">Activity Log</h1>
          <Button variant="outline" onClick={() => router.push(`/pact/${pactId}/week`)}>
            Back to Week
          </Button>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-2xl p-8 sm:p-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-zinc-400 text-sm">Date</div>
              <div className="text-zinc-100 font-semibold">{log.date}</div>
            </div>
            <div>
              <div className="text-zinc-400 text-sm">Occurred At</div>
              <div className="text-zinc-100 font-semibold">{new Date(log.occurredAt).toLocaleString()}</div>
            </div>
          </div>

          {log.notes && (
            <div className="mb-6">
              <div className="text-zinc-400 text-sm mb-1">Notes</div>
              <div className="text-zinc-100">{log.notes}</div>
            </div>
          )}

          <div>
            <div className="text-zinc-400 text-sm mb-3">Attachments</div>
            {log.images && log.images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {log.images.map((img, idx) => (
                  <div key={idx} className="rounded-xl border border-zinc-800/60 p-3 bg-zinc-900/50">
                    {img.mimeType.startsWith('image/') ? (
                      <a href={img.webViewLink} target="_blank" rel="noreferrer">
                        <img
                          src={img.webContentLink}
                          alt={img.name}
                          className="w-full h-40 object-cover rounded-lg border border-zinc-800/60"
                        />
                      </a>
                    ) : (
                      <a
                        href={img.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline"
                      >
                        {img.name}
                      </a>
                    )}
                    <div className="text-xs text-zinc-500 mt-2">{img.mimeType}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-500 text-sm">No attachments.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


