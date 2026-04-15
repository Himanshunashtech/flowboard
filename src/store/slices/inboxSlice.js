import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

export const fetchInbox = createAsyncThunk(
  'inbox/fetchInbox',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('inbox_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const addInboxItem = createAsyncThunk(
  'inbox/addInboxItem',
  async (item, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('inbox_items')
        .insert(item)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const convertToCard = createAsyncThunk(
  'inbox/convertToCard',
  async ({ inboxId, boardId, listId, position, assigneeId }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .rpc('convert_inbox_to_card', {
          p_inbox_id: inboxId,
          p_board_id: boardId,
          p_list_id: listId,
          p_position: position,
          p_assignee_id: assigneeId
        });
      
      if (error) throw error;
      return { inboxId, cardId: data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteInboxItem = createAsyncThunk(
  'inbox/deleteInboxItem',
  async (itemId, { rejectWithValue }) => {
    try {
      const { error } = await supabase
        .from('inbox_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return itemId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const inboxSlice = createSlice({
  name: 'inbox',
  initialState: {
    items: [],
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInbox.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchInbox.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchInbox.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addInboxItem.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(convertToCard.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload.inboxId);
      })
      .addCase(deleteInboxItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  }
});

export default inboxSlice.reducer;
