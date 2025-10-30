import baseApi from "../baseApi";

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createCheckoutSession: builder.mutation({
      query: ({ items, shippingFee = 0 }) => ({
        url: "/orders/checkout/create",
        method: "POST",
        body: { items, shippingFee },
      }),
      invalidatesTags: ["Cart"],
    }),
    updateShippingInfo: builder.mutation({
      query: ({ orderId, shippingInfo }) => ({
        url: `/orders/checkout/${orderId}/shipping`,
        method: "PATCH",
        body: shippingInfo,
      }),
    }),
    updatePaymentInfo: builder.mutation({
      query: ({ orderId, paymentInfo }) => ({
        url: `/orders/checkout/${orderId}/payment`,
        method: "PATCH",
        body: paymentInfo,
      }),
    }),
    placeOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/checkout/${orderId}/place`,
        method: "POST",
      }),
      invalidatesTags: ["Orders", "Cart"],
    }),
    getOrder: builder.query({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),
    downloadInvoice: builder.query({
  query: (orderId) => ({
    url: `/orders/${orderId}/invoice`,
    method: "GET",
    responseHandler: (response) => response.blob(), // 👈 parse as blob instead of JSON
  }),
}),
    getOrderAdmin: builder.query({
      query: (orderId) => `/orders/admin/${orderId}`,
      providesTags: (result, error, id) => [{ type: "Orders", id }],
    }),
    listOrders: builder.query({
      query: ({ page = 1, limit = 10, status } = {}) =>
        `/orders?page=${page}&limit=${limit}${
          status ? `&status=${status}` : ""
        }`,
      providesTags: ["Orders"],
    }),
    listOrdersAdmin: builder.query({
      query: ({ page = 1, limit = 10, status, search } = {}) =>
        `/orders/admin/orders?page=${page}&limit=${limit}${
          status ? `&status=${status}` : ""
        }${search ? `&search=${search}` : ""}`,
      providesTags: ["Orders"],
    }),
    updateOrderStatus: builder.mutation({
      query: ({ orderId, status }) => ({
        url: `/orders/admin/orders/${orderId}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Orders"],
    }),
  }),
});

export const {
  useCreateCheckoutSessionMutation,
  useUpdateShippingInfoMutation,
  useUpdatePaymentInfoMutation,
  usePlaceOrderMutation,
  useGetOrderQuery,
  useLazyDownloadInvoiceQuery,
  useGetOrderAdminQuery,
  useListOrdersQuery,
  useListOrdersAdminQuery,
  useUpdateOrderStatusMutation,
} = ordersApi;

// export const ordersApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({
//     // Create new order
//     createOrder: builder.mutation({
//       query: (body) => ({
//         url: "/orders",
//         method: "POST",
//         body,
//       }),
//       invalidatesTags: ["Orders", "Cart"],
//     }),

//     // Get all orders for logged-in user
//     listOrders: builder.query({
//       query: () => "/orders",
//       providesTags: ["Orders"],
//     }),

//     // Get single order
//     getOrder: builder.query({
//       query: (id) => `/orders/${id}`,
//       providesTags: (result, error, id) => [{ type: "Orders", id }],
//     }),

//     // Update order status (admin or user)
//     updateOrderStatus: builder.mutation({
//       query: ({ id, status }) => ({
//         url: `/orders/${id}/status`,
//         method: "PATCH",
//         body: { status },
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: "Orders", id },
//         "Orders",
//       ],
//     }),
//   }),
// });

// export const {
//   useCreateOrderMutation,
//   useListOrdersQuery,
//   useGetOrderQuery,
//   useUpdateOrderStatusMutation,
// } = ordersApi;
