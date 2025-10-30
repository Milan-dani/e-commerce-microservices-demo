import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import baseApi from '../api/baseApi';

import authReducer from './slices/authSlice';
// import uiReducer from './slices/uiSlice';
import productsReducer from './slices/productsSlice';
import cartReducer from './slices/cartSlice';
// import ordersReducer from './slices/ordersSlice';
// import paymentsReducer from './slices/paymentsSlice';
// import inventoryReducer from './slices/inventorySlice';
// import recommendationsReducer from './slices/recommendationsSlice';
// import analyticsReducer from './slices/analyticsSlice';

const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    // ui: uiReducer,
    products: productsReducer,
    cart: cartReducer,
    // orders: ordersReducer,
    // payments: paymentsReducer,
    // inventory: inventoryReducer,
    // recommendations: recommendationsReducer,
    // analytics: analyticsReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export default store;
