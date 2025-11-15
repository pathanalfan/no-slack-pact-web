'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch } from '@/store/hooks';
import { setUser } from '@/store/slices/userSlice';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { API_BASE_URL } from '@/constants';
import type { User, CreateUserDto } from '@/types';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
});

type SignupFormData = z.infer<typeof signupSchema>;

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Create user via API
      const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data as CreateUserDto),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create account');
      }

      const user: User = await response.json();

      // Store user in Redux and localStorage
      dispatch(setUser(user));

      // Redirect to pacts page
      router.push('/pacts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-md w-full relative z-10 flex flex-col">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '3rem' }}>
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25" style={{ marginBottom: '1.5rem' }}>
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-zinc-100 to-zinc-300 bg-clip-text text-transparent" style={{ marginBottom: '0.75rem' }}>
              Create Your Account
            </h2>
            <p className="text-zinc-400 text-sm font-medium">
              Sign up to join pacts and commit to your goals
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-zinc-900/80 backdrop-blur-xl rounded-2xl border border-zinc-800/50 shadow-2xl" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-5 backdrop-blur-sm" style={{ marginBottom: '1.5rem' }}>
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

            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  error={errors.name?.message}
                  autoComplete="name"
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  {...register('email')}
                  error={errors.email?.message}
                  autoComplete="email"
                />
              </div>

              <div>
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+1234567890"
                  {...register('phone')}
                  error={errors.phone?.message}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div style={{ paddingTop: '1rem' }}>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                disabled={!isValid || isLoading}
                className="w-full"
              >
                Create Account
              </Button>
            </div>
          </form>
        </div>

        {/* Footer text */}
        <p className="text-center text-xs text-zinc-500">
          By creating an account, you agree to our terms of service
        </p>
      </div>
    </div>
  );
}

