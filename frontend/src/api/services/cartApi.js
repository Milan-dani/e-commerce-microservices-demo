// cartApi.js
import baseApi from "../baseApi";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query({
      query: () => "/cart",
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ productId }) => ({
                type: "Cart",
                id: productId,
              })),
              { type: "Cart", id: "LIST" },
            ]
          : [{ type: "Cart", id: "LIST" }],
    }),

    addToCart: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: "/cart/add",
        method: "POST",
        body: { productId, quantity },
      }),
      invalidatesTags: [{ type: "Cart", id: "LIST" }],
    }),

    updateCartItem: builder.mutation({
      query: ({ productId, quantity }) => ({
        url: "/cart/update",
        method: "POST",
        body: { productId, quantity },
      }),
      invalidatesTags: [{ type: "Cart", id: "LIST" }],
    }),

    removeFromCart: builder.mutation({
      query: ({ productId }) => ({
        url: "/cart/remove",
        method: "POST",
        body: { productId },
      }),
      invalidatesTags: [{ type: "Cart", id: "LIST" }],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
} = cartApi;
