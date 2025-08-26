import {createApi, fetchBaseQuery} from "@reduxjs/toolkit/query/react";
const baseUrl = import.meta.env.VITE_API_URL;

export const bannerApi = createApi({
  reducerPath: "bannerApi",
  baseQuery: fetchBaseQuery({
    baseUrl: `${baseUrl}/api`,
    credentials: "include",
    prepareHeaders: (headers) => {
      headers.set("Content-Type", "application/json");
      return headers;
    },
  }),
  tagTypes: ["Banner"],
  endpoints: (builder) => ({
    getActiveBanners: builder.query({
      query: (limit = 10) => `/shop/hero-banner?limit=${limit}`,
      providesTags: [{type: "Banner", id: "LIST", result: "activeBanners"}],
      keepUnusedDataFor: Infinity,
    }),
    getBannerById: builder.query({
      query: (id) => `/admin/hero-banner/${id}`,
      providesTags: (result, error, id) => [{type: "Banner", id}],
    }),
    getAllBanners: builder.query({
      query: (params) => ({
        url: `/admin/hero-banner`,
        params,
      }),
      providesTags: () => [{type: "Banner", id: "LIST"}],
    }),
    createBanner: builder.mutation({
      query: (data) => ({
        url: `/admin/hero-banner`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{type: "Banner", id: "LIST"}],
    }),
    updateBanner: builder.mutation({
      query: ({id, data}) => ({
        url: `/admin/hero-banner/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, {id}) => [
        {type: "Banner", id},
        {type: "Banner", id: "LIST"},
      ],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `/admin/hero-banner/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{type: "Banner", id: "LIST"}],
    }),
    toggleBannerStatus: builder.mutation({
      query: (id) => ({
        url: `/admin/hero-banner/${id}/toggle-status`,
        method: "PATCH",
      }),
    }),
    reorderBanners: builder.mutation({
      query: (orderData) => ({
        url: `/admin/hero-banner/reorder`,
        method: "PATCH",
        body: orderData,
      }),
      invalidatesTags: [{type: "Banner", id: "LIST"}],
    }),
  }),
});

export const {
  useGetActiveBannersQuery,
  useGetBannerByIdQuery,
  useGetAllBannersQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useToggleBannerStatusMutation,
  useReorderBannersMutation,
} = bannerApi;
