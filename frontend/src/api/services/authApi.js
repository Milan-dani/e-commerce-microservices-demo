import baseApi from '../baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (body) => ({
        url: '/auth/signup',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth', 'Users'],
    }),
    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Auth'],
    }),
    validate: builder.query({
      query: () => ({ url: '/auth/validate' }),
      providesTags: ['Auth'],
    }),
  }),
});

export const { useSignupMutation, useLoginMutation, useValidateQuery } = authApi;

