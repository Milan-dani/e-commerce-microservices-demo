import baseApi from "../baseApi";

export const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createProduct: builder.mutation({
      // query: (body) => ({ url: "/products/products", method: "POST", body }),
      query: (formData) => {        
        return {
          url: "/products/products",
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Products"],
    }),
    listProducts: builder.query({
      query: (params) => {
        if (!params) return "/products/products";

        // Remove keys with null/undefined/empty string
        const filteredParams = Object.fromEntries(
          Object.entries(params).filter(
            ([_, value]) =>
              value !== undefined && value !== null && value !== ""
          )
        );

        const query = Object.keys(filteredParams).length
          ? `?${new URLSearchParams(filteredParams).toString()}`
          : "";

        return `/products/products${query}`;
        // const query = params
        //   ? `?${new URLSearchParams(params).toString()}`
        //   : '';
        // return `/products/products${query}`;
      },
      providesTags: ["Products"],
    }),
    getProduct: builder.query({
      query: (id) => `/products/products/${id}`,
      providesTags: (result, error, id) => [{ type: "Products", id }],
    }),
    updateProduct: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/products/products/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Products", id },
        "Products",
      ],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({ url: `/products/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Products"],
    }),
    getCategories: builder.query({
      query: () => "/products/categories",
      transformResponse: (response) => response.categories || [],
      providesTags: ["Categories"],
    }),
  }),
});

export const {
  useCreateProductMutation,
  useListProductsQuery,
  useGetProductQuery,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
} = productsApi;
