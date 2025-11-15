import { baseApi } from './baseApi';
import type { Pact, CreatePactDto } from '@/types';

export const pactApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActivePacts: builder.query<Pact[], void>({
      query: () => '/pact/active',
      providesTags: (result) =>
        result
          ? [...result.map(({ _id }) => ({ type: 'Pact' as const, id: _id })), 'Pact']
          : ['Pact'],
      keepUnusedDataFor: 30,
    }),
    getPactById: builder.query<Pact, string>({
      query: (id) => `/pact/${id}`,
      providesTags: (result, error, id) => [{ type: 'Pact' as const, id }],
    }),
    createPact: builder.mutation<Pact, CreatePactDto>({
      query: (body) => ({
        url: '/pact',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Pact'],
    }),
  }),
});

export const { useGetActivePactsQuery, useGetPactByIdQuery, useCreatePactMutation } = pactApi;

