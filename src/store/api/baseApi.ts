import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL, STORAGE_KEYS } from '@/constants';

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers) => {
      if (typeof window !== 'undefined') {
        const userId = localStorage.getItem(STORAGE_KEYS.USER_ID);
        if (userId) {
          headers.set('X-User-Id', userId);
        }
      }
      return headers;
    },
  }),
  tagTypes: ['Pact', 'Activity', 'User'],
  endpoints: () => ({}),
});

