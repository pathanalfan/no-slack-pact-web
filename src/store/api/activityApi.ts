import { baseApi } from './baseApi';
import { STORAGE_KEYS } from '@/constants';
import type { Activity, CreateActivityDto } from '@/types';

export const activityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivitiesByPact: builder.query<Activity[], string>({
      query: (pactId) => `/activity?pactId=${pactId}`,
      providesTags: (result, error, pactId) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Activity' as const, id: _id })),
              { type: 'Activity' as const, id: `LIST-${pactId}` },
            ]
          : [{ type: 'Activity' as const, id: `LIST-${pactId}` }],
    }),
    getUserActivitiesByPact: builder.query<Activity[], string>({
      query: (pactId) => {
        let userId = '';
        if (typeof window !== 'undefined') {
          userId = localStorage.getItem(STORAGE_KEYS.USER_ID) || '';
        }
        return `/activity?pactId=${pactId}&userId=${userId}`;
      },
      providesTags: (result, error, pactId) =>
        result
          ? [
              ...result.map(({ _id }) => ({ type: 'Activity' as const, id: _id })),
              { type: 'Activity' as const, id: `USER-${pactId}` },
            ]
          : [{ type: 'Activity' as const, id: `USER-${pactId}` }],
    }),
    createActivity: builder.mutation<Activity, CreateActivityDto>({
      query: (body) => ({
        url: '/activity',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Activity' as const, id: `LIST-${arg.pactId}` },
        { type: 'Activity' as const, id: `USER-${arg.pactId}` },
      ],
    }),
  }),
});

export const {
  useGetActivitiesByPactQuery,
  useGetUserActivitiesByPactQuery,
  useCreateActivityMutation,
} = activityApi;

