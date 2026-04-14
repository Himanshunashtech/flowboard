import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

// 1. Fetch all assigned cards (Unified View)
export const fetchAllAssignedCards = createAsyncThunk(
  'planner/fetchAllCards',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('card_assignments')
        .select(`
          card_id,
          cards (
            *,
            boards (title, workspace_id)
          )
        `)
        .eq('user_id', userId);
      
      if (error) throw error;
      return data.map(item => item.cards);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 2. Fetch external calendar events
export const fetchExternalEvents = createAsyncThunk(
  'planner/fetchExternalEvents',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('planner_external_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 3. Fetch time blocks
export const fetchTimeBlocks = createAsyncThunk(
  'planner/fetchTimeBlocks',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('planner_time_blocks')
        .select(`
          *,
          cards (title, priority)
        `)
        .eq('user_id', userId)
        .order('start_time', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// 4. Fetch daily priorities
export const fetchDailyPriorities = createAsyncThunk(
  'planner/fetchDailyPriorities',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('planner_daily_priorities')
        .select(`
          *,
          cards (*)
        `)
        .eq('user_id', userId)
        .eq('priority_date', new Date().toISOString().split('T')[0])
        .order('position', { ascending: true });
      
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const plannerSlice = createSlice({
  name: 'planner',
  initialState: {
    cards: [],
    externalEvents: [],
    timeBlocks: [],
    dailyPriorities: [],
    loading: false,
    error: null,
    viewMode: 'WEEK' // 'WEEK' | 'MONTH'
  },
  reducers: {
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllAssignedCards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllAssignedCards.fulfilled, (state, action) => {
        state.loading = false;
        state.cards = action.payload;
      })
      .addCase(fetchAllAssignedCards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // External Events
      .addCase(fetchExternalEvents.fulfilled, (state, action) => {
        state.externalEvents = action.payload;
      })
      // Time Blocks
      .addCase(fetchTimeBlocks.fulfilled, (state, action) => {
        state.timeBlocks = action.payload;
      })
      // Daily Priorities
      .addCase(fetchDailyPriorities.fulfilled, (state, action) => {
        state.dailyPriorities = action.payload;
      });
  }
});

export const { setViewMode } = plannerSlice.actions;
export default plannerSlice.reducer;
