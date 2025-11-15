'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePactMutation } from '@/store/api/pactApi';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import type { CreatePactDto } from '@/types';

const createPactSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().optional(),
  minDaysPerWeek: z.number().min(1, 'Minimum days per week must be at least 1').max(7, 'Minimum days per week cannot exceed 7'),
  maxActivitiesPerUser: z.number().min(1, 'Max activities per user must be at least 1'),
  skipFine: z.number().min(0, 'Skip fine must be 0 or greater'),
  leaveFine: z.number().min(0, 'Leave fine must be 0 or greater'),
});

type CreatePactFormData = z.infer<typeof createPactSchema>;

export default function CreatePactPage() {
  const router = useRouter();
  const [createPact, { isLoading }] = useCreatePactMutation();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreatePactFormData>({
    resolver: zodResolver(createPactSchema),
    mode: 'onChange',
    defaultValues: {
      minDaysPerWeek: 1,
      maxActivitiesPerUser: 1,
      skipFine: 0,
      leaveFine: 0,
    },
  });

  const onSubmit = async (data: CreatePactFormData) => {
    setError(null);

    try {
      const pactData: CreatePactDto = {
        title: data.title,
        description: data.description || undefined,
        minDaysPerWeek: data.minDaysPerWeek,
        maxActivitiesPerUser: data.maxActivitiesPerUser,
        skipFine: data.skipFine,
        leaveFine: data.leaveFine,
      };

      await createPact(pactData).unwrap();
      router.push('/pacts');
    } catch (err: any) {
      setError(
        err?.data?.message || err?.message || 'Failed to create pact. Please try again.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        {/* Header */}
        <div className="mb-12 sm:mb-16">
          <button
            onClick={() => router.back()}
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
            <span className="text-sm font-medium">Back</span>
          </button>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-zinc-100 mb-4">
            Create New Pact
          </h1>
          <p className="text-zinc-400 text-base sm:text-lg">
            Set up a new pact with rules and fines to help participants stay committed.
          </p>
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
                label="Pact Title"
                type="text"
                placeholder="e.g., Daily Exercise Challenge"
                {...register('title')}
                error={errors.title?.message}
                autoComplete="off"
              />

              <Textarea
                label="Description (Optional)"
                placeholder="Describe what this pact is about..."
                rows={4}
                {...register('description')}
                error={errors.description?.message}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Min Days Per Week"
                  type="number"
                  placeholder="1"
                  min={1}
                  max={7}
                  {...register('minDaysPerWeek', { valueAsNumber: true })}
                  error={errors.minDaysPerWeek?.message}
                />

                <Input
                  label="Max Activities Per User"
                  type="number"
                  placeholder="1"
                  min={1}
                  {...register('maxActivitiesPerUser', { valueAsNumber: true })}
                  error={errors.maxActivitiesPerUser?.message}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Skip Fine ($)"
                  type="number"
                  placeholder="0.00"
                  min={0}
                  step="0.01"
                  {...register('skipFine', { valueAsNumber: true })}
                  error={errors.skipFine?.message}
                />

                <Input
                  label="Leave Fine ($)"
                  type="number"
                  placeholder="0.00"
                  min={0}
                  step="0.01"
                  {...register('leaveFine', { valueAsNumber: true })}
                  error={errors.leaveFine?.message}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
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
                Create Pact
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

