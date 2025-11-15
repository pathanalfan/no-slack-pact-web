'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGetPactByIdQuery } from '@/store/api/pactApi';
import { useGetUserActivitiesByPactQuery, useCreateActivityMutation } from '@/store/api/activityApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { STORAGE_KEYS } from '@/constants';
import type { CreateActivityDto } from '@/types';

const createActivitySchema = z.object({
  name: z.string().min(1, 'Activity name is required'),
  description: z.string().optional(),
  numberOfDays: z.number().min(1, 'Number of days must be at least 1').max(7, 'Number of days cannot exceed 7'),
  isPrimary: z.boolean(),
});

type CreateActivityFormData = z.infer<typeof createActivitySchema>;

export default function CreateActivityPage() {
  const router = useRouter();
  const params = useParams();
  const pactId = params?.id as string;
  
  const { data: pact, isLoading: isLoadingPact } = useGetPactByIdQuery(pactId || '', {
    skip: !pactId,
  });
  const { data: userActivities = [] } = useGetUserActivitiesByPactQuery(pactId || '', {
    skip: !pactId,
  });
  const [createActivity, { isLoading }] = useCreateActivityMutation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
  } = useForm<CreateActivityFormData>({
    resolver: zodResolver(createActivitySchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      description: '',
      numberOfDays: 1,
      isPrimary: false,
    },
  });

  const isPrimary = watch('isPrimary');

  const userActivityCount = userActivities.length;
  const canAddMore = pact ? userActivityCount < pact.maxActivitiesPerUser : true;

  const onSubmit = async (data: CreateActivityFormData) => {
    if (!pact || !canAddMore) return;

    setError(null);

    try {
      if (!pactId) {
        throw new Error('Pact ID is missing');
      }

      const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
      if (!userId) {
        router.push('/login');
        return;
      }

      const activityData: CreateActivityDto = {
        pactId: pactId,
        userId: userId,
        name: data.name,
        description: data.description || undefined,
        numberOfDays: data.numberOfDays,
        isPrimary: data.isPrimary,
      };

      await createActivity(activityData).unwrap();
      router.push(`/pact/${pactId}`);
    } catch (err: any) {
      setError(
        err?.data?.message || err?.message || 'Failed to create activity. Please try again.'
      );
    }
  };

  if (isLoadingPact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-zinc-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!pact) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Pact Not Found</h2>
          <p className="text-zinc-400 mb-6">The pact you're looking for doesn't exist.</p>
          <Button variant="primary" onClick={() => router.push('/pacts')}>
            Back to Pacts
          </Button>
        </div>
      </div>
    );
  }

  if (!canAddMore) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-zinc-100 mb-2">Maximum Activities Reached</h2>
          <p className="text-zinc-400 mb-6">
            You've reached the maximum number of activities ({pact.maxActivitiesPerUser}) for this pact.
          </p>
          <Button variant="primary" onClick={() => pactId && router.push(`/pact/${pactId}`)}>
            Back to Pact
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <button
            onClick={() => pactId && router.push(`/pact/${pactId}`)}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-300 mb-8 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="text-sm font-medium">Back to Pact</span>
          </button>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-100 mb-4">
            Add Activity
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg">
            Add an activity to the pact: <span className="text-zinc-300 font-semibold">{pact.title}</span>
          </p>
          {pact.maxActivitiesPerUser > 1 && (
            <p className="text-zinc-500 text-sm mt-2">
              You can add {pact.maxActivitiesPerUser - userActivityCount} more {pact.maxActivitiesPerUser - userActivityCount === 1 ? 'activity' : 'activities'} ({userActivityCount}/{pact.maxActivitiesPerUser})
            </p>
          )}
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-2xl p-8 sm:p-10">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
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
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              <Input
                label="Activity Name"
                type="text"
                placeholder="e.g., Morning Run, Gym Session, Meditation"
                {...register('name')}
                error={errors.name?.message}
                autoComplete="off"
              />

              <Textarea
                label="Description (Optional)"
                placeholder="Describe this activity..."
                rows={4}
                {...register('description')}
                error={errors.description?.message}
              />

              <Input
                label="Number of Days"
                type="number"
                placeholder="1"
                min={1}
                max={7}
                {...register('numberOfDays', { valueAsNumber: true })}
                error={errors.numberOfDays?.message}
              />

              <div className="flex items-center gap-4 p-5 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                <input
                  type="checkbox"
                  id="isPrimary"
                  {...register('isPrimary')}
                  className="w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-blue-600 focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 cursor-pointer"
                />
                <label
                  htmlFor="isPrimary"
                  className="text-zinc-300 font-medium cursor-pointer flex-1"
                >
                  Mark as Primary Activity
                </label>
                {isPrimary && (
                  <span className="text-xs text-blue-400 font-medium bg-blue-500/10 px-2 py-1 rounded">
                    Primary
                  </span>
                )}
              </div>
              {errors.isPrimary && (
                <p className="text-sm text-red-400 font-medium">{errors.isPrimary.message}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => pactId && router.push(`/pact/${pactId}`)}
                className="w-full sm:w-auto"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={!isValid || isLoading}
                className="w-full sm:flex-1"
              >
                Add Activity
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

