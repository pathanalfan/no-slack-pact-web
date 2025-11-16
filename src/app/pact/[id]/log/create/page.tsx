'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetUserActivitiesByPactQuery } from '@/store/api/activityApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';

const logSchema = z.object({
  activityId: z.string().min(1, 'Select an activity'),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().optional(),
});

type LogForm = z.infer<typeof logSchema>;

export default function CreateActivityLogPage() {
  const router = useRouter();
  const params = useParams();
  const pactId = params?.id as string;

  const { data: activities = [], isLoading } = useGetUserActivitiesByPactQuery(pactId || '', {
    skip: !pactId,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const allowedTypes = useMemo(
    () => [
      'image/jpeg',
      'image/png',
      'image/webp',
      'video/mp4',
      'video/quicktime',
    ],
    []
  );

  const validateFiles = (selected: File[]): string | null => {
    for (const f of selected) {
      if (!allowedTypes.includes(f.type)) {
        return 'Unsupported file type. Allowed: jpeg, png, webp, mp4, mov.';
      }
      const sizeMB = f.size / (1024 * 1024);
      const isImage = f.type.startsWith('image/');
      const max = isImage ? 10 : 100;
      if (sizeMB > max) {
        return `File ${f.name} is too large. Max ${max} MB.`;
      }
    }
    return null;
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LogForm>({
    resolver: zodResolver(logSchema),
    mode: 'onChange',
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
    },
  });

  const onSubmit = async (data: LogForm) => {
    const userId = (typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEYS.USER_ID)) || '';
    if (!userId) {
      router.push('/login');
      return;
    }

    // Validate file selection
    const err = validateFiles(files);
    if (err) {
      setFileError(err);
      return;
    }

    try {
      setIsUploading(true);
      // First create the activity log metadata (if backend requires multipart only, skip this and send everything to /activity-logs)
      // For the given requirement, the endpoint for uploads is POST /activity-logs (multipart/form-data)
      const form = new FormData();
      for (const f of files) {
        form.append('files', f);
      }
      form.append('pactId', pactId);
      form.append('activityId', data.activityId);
      form.append('userId', userId);
      if (data.notes) form.append('notes', data.notes);

      const res = await fetch(`${API_BASE_URL}/activity-logs`, {
        method: 'POST',
        body: form,
        // don't set Content-Type; browser will set correct multipart boundary
        headers: {
          // keep X-User-Id in case backend uses header too
          'X-User-Id': userId,
        },
      });

      if (!res.ok) {
        const errText = await res.text().catch(() => '');
        throw new Error(errText || 'Failed to upload activity log');
      }

      router.push(`/pact/${pactId}/week`);
    } catch (e) {
      // Silently fail for now; add proper toast later
      alert('Failed to save activity log.');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Loading activities...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="mb-10">
          <button
            onClick={() => router.push(`/pact/${pactId}/week`)}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 mb-6 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Week</span>
          </button>
          <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100">Add Activity Log</h1>
          <p className="text-zinc-400 mt-2">Log your progress for a specific day.</p>
        </div>

        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-2xl p-8 sm:p-10">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">Activity</label>
                <select
                  {...register('activityId')}
                  className="w-full h-14 rounded-xl border border-zinc-700 bg-zinc-900/50 px-5 text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                >
                  <option value="">Select activity...</option>
                  {activities.map((a) => (
                    <option key={a._id} value={a._id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {errors.activityId && (
                  <p className="mt-2 text-sm text-red-400">{errors.activityId.message}</p>
                )}
              </div>

              <Input
                type="date"
                label="Date"
                {...register('date')}
                error={errors.date?.message}
              />

              <Textarea
                label="Notes (Optional)"
                placeholder="Any notes for today..."
                rows={4}
                {...register('notes')}
                error={errors.notes?.message}
              />

              {/* Files */}
              <div>
                <label className="block text-sm font-semibold text-zinc-300 mb-3">
                  Attach Images/Videos
                </label>
                <input
                  type="file"
                  // Broader accept to allow native camera UI selection on phones
                  accept="image/*,video/*"
                  // Hint to open camera; support varies by device/browser
                  capture
                  multiple
                  onChange={(e) => {
                    const list = Array.from(e.target.files || []);
                    setFileError(null);
                    const errMsg = validateFiles(list);
                    if (errMsg) {
                      setFiles([]);
                      setFileError(errMsg);
                    } else {
                      setFiles(list);
                    }
                  }}
                  className="block w-full text-sm text-zinc-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700"
                />
                {fileError && (
                  <p className="mt-2 text-sm text-red-400">{fileError}</p>
                )}
                {files.length > 0 && (
                  <p className="mt-2 text-xs text-zinc-500">
                    {files.length} file{files.length !== 1 ? 's' : ''} selected.
                  </p>
                )}
                <p className="mt-2 text-xs text-zinc-500">
                  Allowed: jpeg, png, webp (≤10MB each), mp4, mov (≤100MB each). On phones, this picker supports taking a photo or recording a video.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" type="button" onClick={() => router.push(`/pact/${pactId}/week`)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isUploading} disabled={!isValid || isUploading}>
                Save Log
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


