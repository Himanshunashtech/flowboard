import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import workspaceReducer from './slices/workspaceSlice';
import boardReducer from './slices/boardSlice';
import uiReducer from './slices/uiSlice';
import inboxReducer from './slices/inboxSlice';
import plannerReducer from './slices/plannerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspaces: workspaceReducer,
    board: boardReducer,
    ui: uiReducer,
    inbox: inboxReducer,
    planner: plannerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore non-serializable supabase session/user if necessary
        ignoredActions: ['auth/setSession'],
        ignoredPaths: ['auth.session', 'auth.user'],
      },
    }),
});

export default store;
