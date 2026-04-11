import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  profile: null,
  session: null,
  loading: true,
  profileLoaded: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.session = action.payload;
      state.user = action.payload?.user ?? null;
      state.loading = false;
      if (!action.payload) {
        state.profileLoaded = true; // No profile to load if no session
      }
    },
    setProfile: (state, action) => {
      state.profile = action.payload;
      state.profileLoaded = true;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.profileLoaded = true;
    },
    signOut: (state) => {
      state.user = null;
      state.profile = null;
      state.session = null;
      state.loading = false;
      state.profileLoaded = false;
    },
  },
});

export const { setSession, setProfile, setLoading, setError, signOut } = authSlice.actions;
export default authSlice.reducer;
