import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  workspaces: [],
  activeWorkspace: null,
  members: [],
  loading: false,
  error: null,
};

const workspaceSlice = createSlice({
  name: 'workspaces',
  initialState,
  reducers: {
    setWorkspaces: (state, action) => {
      state.workspaces = action.payload;
      state.loading = false;
    },
    setActiveWorkspace: (state, action) => {
      state.activeWorkspace = action.payload;
    },
    setWorkspaceMembers: (state, action) => {
      state.members = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addWorkspace: (state, action) => {
      state.workspaces.unshift(action.payload);
    },
    updateWorkspace: (state, action) => {
      const index = state.workspaces.findIndex(w => w.id === action.payload.id);
      if (index !== -1) {
        state.workspaces[index] = action.payload;
      }
      if (state.activeWorkspace?.id === action.payload.id) {
        state.activeWorkspace = action.payload;
      }
    },
    deleteWorkspace: (state, action) => {
      state.workspaces = state.workspaces.filter(w => w.id !== action.payload);
      if (state.activeWorkspace?.id === action.payload) {
        state.activeWorkspace = null;
      }
    },
    addBoardToWorkspace: (state, action) => {
      const { workspaceId, board } = action.payload;
      const workspace = state.workspaces.find(w => w.id === workspaceId);
      if (workspace) {
        if (!workspace.boards) workspace.boards = [];
        workspace.boards.push(board);
      }
      if (state.activeWorkspace?.id === workspaceId) {
        if (!state.activeWorkspace.boards) state.activeWorkspace.boards = [];
        state.activeWorkspace.boards.push(board);
      }
    },
  },
});

export const { 
  setWorkspaces, 
  setActiveWorkspace, 
  setWorkspaceMembers, 
  setLoading, 
  setError,
  addWorkspace,
  updateWorkspace,
  deleteWorkspace,
  addBoardToWorkspace
} = workspaceSlice.actions;

export default workspaceSlice.reducer;
