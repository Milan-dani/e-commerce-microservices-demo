import { createSlice } from '@reduxjs/toolkit';

const productsSlice = createSlice({
  name: 'products',
  initialState: { list: [], current: null },
  reducers: {
    setProducts: (state, action) => { state.list = action.payload; },
    setCurrentProduct: (state, action) => { state.current = action.payload; },
    clearProducts: (state) => { state.list = []; state.current = null; },
  },
});

export const { setProducts, setCurrentProduct, clearProducts } = productsSlice.actions;
export default productsSlice.reducer;
