import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [] },
  reducers: {
    setCart: (state, action) => { state.items = action.payload; },
    addItem: (state, action) => { state.items.push(action.payload); },
    removeItem: (state, action) => { state.items = state.items.filter(i => i.id !== action.payload); },
    clearCart: (state) => { state.items = []; },
  },
});

export const { setCart, addItem, removeItem, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
