import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  modals: {
    createBoard: false,
    createWorkspace: false,
    cardDetails: false,
    workspaceSettings: false,
    boardSettings: false,
    memberInvite: false,
  },
  modalData: {},
  activeCardId: null,
  sidebarOpen: true,
  notifications: [],
  theme: 'light',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleModal: (state, action) => {
      const { modalName, isOpen, data } = action.payload;
      state.modals[modalName] = isOpen !== undefined ? isOpen : !state.modals[modalName];
      if (data) state.modalData[modalName] = data;
    },
    setActiveCardId: (state, action) => {
      state.activeCardId = action.payload;
      if (action.payload) {
        state.modals.cardDetails = true;
      }
    },
    toggleSidebar: (state, action) => {
      state.sidebarOpen = action.payload !== undefined ? action.payload : !state.sidebarOpen;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'info',
        read: false,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
  },
});

export const {
  toggleModal,
  setActiveCardId,
  toggleSidebar,
  addNotification,
  removeNotification,
  setTheme
} = uiSlice.actions;

export default uiSlice.reducer;
