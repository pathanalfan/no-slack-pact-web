import { baseApi } from './baseApi';
import { STORAGE_KEYS } from '@/constants';
import type {
  Activity,
  CreateActivityDto,
  ActivityLog,
  CreateActivityLogDto,
  UserProgressResponse,
  UserLogsByPactResponse,
  ActivityLogDetail,
} from '@/types';

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
    createActivityLog: builder.mutation<ActivityLog, CreateActivityLogDto>({
      query: (body) => ({
        url: '/activity/log',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: 'Activity' as const, id: `LIST-${arg.pactId}` },
        { type: 'Activity' as const, id: `USER-${arg.pactId}` },
      ],
    }),
    getProgressByUser: builder.query<UserProgressResponse, string>({
      query: (userId) => `activity-logs/progress/by-user?userId=${userId}`,
      providesTags: (result, error, userId) => [{ type: 'Activity' as const, id: `PROGRESS-${userId}` }],
    }),
    getUserLogsByPact: builder.query<UserLogsByPactResponse, { pactId: string; userId: string }>({
      query: ({ pactId, userId }) => `activity-logs/user-logs?pactId=${pactId}&userId=${userId}`,
      providesTags: (result, error, arg) => [{ type: 'Activity' as const, id: `LOGS-${arg.pactId}-${arg.userId}` }],
    }),
    getActivityLog: builder.query<ActivityLogDetail, string>({
      query: (logId) => `activity-logs/${logId}`,
      providesTags: (result, error, logId) => [{ type: 'Activity' as const, id: `LOG-${logId}` }],
    }),
  }),
});

export const {
  useGetActivitiesByPactQuery,
  useGetUserActivitiesByPactQuery,
  useCreateActivityMutation,
  useCreateActivityLogMutation,
  useGetProgressByUserQuery,
  useGetUserLogsByPactQuery,
  useGetActivityLogQuery,
} = activityApi;

