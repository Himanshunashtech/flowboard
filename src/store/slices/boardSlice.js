import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  activeBoard: null,
  lists: [],
  cards: [],
  sprints: [],
  members: [],
  labels: [],
  dependencies: [],
  loading: false,
  error: null,
};

const boardSlice = createSlice({
  name: 'board',
  initialState,
  reducers: {
    setActiveBoard: (state, action) => {
      state.activeBoard = action.payload;
    },
    updateBoard: (state, action) => {
      if (state.activeBoard && state.activeBoard.id === action.payload.id) {
        state.activeBoard = { ...state.activeBoard, ...action.payload };
      }
    },
    setLists: (state, action) => {
      state.lists = action.payload.sort((a, b) => a.position - b.position);
    },
    setCards: (state, action) => {
      state.cards = action.payload.sort((a, b) => a.position - b.position);
    },
    setBoardMembers: (state, action) => {
      state.members = action.payload;
    },
    setLabels: (state, action) => {
      state.labels = action.payload;
    },
    setDependencies: (state, action) => {
      state.dependencies = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    // Optimistic / Real-time updates
    addList: (state, action) => {
      state.lists.push(action.payload);
      state.lists.sort((a, b) => a.position - b.position);
    },
    updateList: (state, action) => {
      const index = state.lists.findIndex(l => l.id === action.payload.id);
      if (index !== -1) {
        state.lists[index] = { ...state.lists[index], ...action.payload };
      }
      state.lists.sort((a, b) => a.position - b.position);
    },
    deleteList: (state, action) => {
      state.lists = state.lists.filter(l => l.id !== action.payload);
    },
    
    addCard: (state, action) => {
      state.cards.push(action.payload);
      state.cards.sort((a, b) => a.position - b.position);
    },
    updateCard: (state, action) => {
      const index = state.cards.findIndex(c => c.id === action.payload.id);
      if (index !== -1) {
        state.cards[index] = { ...state.cards[index], ...action.payload };
      }
      state.cards.sort((a, b) => a.position - b.position);
    },
    deleteCard: (state, action) => {
      state.cards = state.cards.filter(c => c.id !== action.payload);
    },
    moveCard: (state, action) => {
      const { cardId, newListId, newPosition } = action.payload;
      const card = state.cards.find(c => c.id === cardId);
      if (card) {
        card.list_id = newListId;
        card.position = newPosition;
      }
      state.cards.sort((a, b) => a.position - b.position);
    },

    // Sprint Management
    setSprints: (state, action) => {
      state.sprints = action.payload;
    },
    addSprint: (state, action) => {
      state.sprints.push(action.payload);
    },
    updateSprint: (state, action) => {
      const index = state.sprints.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.sprints[index] = { ...state.sprints[index], ...action.payload };
      }
    },
    deleteSprint: (state, action) => {
      state.sprints = state.sprints.filter(s => s.id !== action.payload);
    }
  },
});

export const {
  setActiveBoard,
  setLists,
  setCards,
  setBoardMembers,
  setLabels,
  setDependencies,
  setLoading,
  setError,
  updateBoard,
  addList,
  updateList,
  deleteList,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
  setSprints,
  addSprint,
  updateSprint,
  deleteSprint
} = boardSlice.actions;

export default boardSlice.reducer;
