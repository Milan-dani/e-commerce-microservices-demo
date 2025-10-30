import { createSlice } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';

const userFromCookie = Cookies.get("user")
  ? JSON.parse(Cookies.get("user"))
  : null;

const initialState = {
  user: typeof window !== 'undefined' ? userFromCookie : null,
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => { state.user = action.payload; try { localStorage.setItem('user', JSON.stringify( action.payload));  Cookies.set("user", JSON.stringify(action.payload), { expires: 7 }); } catch (e) {}},
    setToken: (state, action) => { state.token = action.payload; try { localStorage.setItem('token', action.payload); Cookies.set("token", action.payload, { expires: 7 });} catch (e) {} },
    logout: (state) => {
      state.user = null;
      state.token = null;
      try { localStorage.removeItem('token'); Cookies.remove("token");} catch (e) {}
      try { localStorage.removeItem('user'); Cookies.remove("user");} catch (e) {}
    },
  },
});

export const { setUser, setToken, logout } = authSlice.actions;
export default authSlice.reducer;
