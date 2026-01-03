import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ImportantDate } from '../../types';

interface ImportantDatesState {
  dates: ImportantDate[];
  upcomingDates: ImportantDate[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ImportantDatesState = {
  dates: [],
  upcomingDates: [],
  isLoading: false,
  error: null,
};

// Mock data for testing - will be replaced with API calls
const mockDates: ImportantDate[] = [
  {
    id: '1',
    type: 'BIRTHDAY',
    title: 'My Birthday',
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    reminderEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'ANNIVERSARY',
    title: 'Wedding Anniversary',
    date: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(),
    reminderEnabled: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'BIRTHDAY',
    title: "Ahmed's Birthday",
    date: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
    notes: 'Get a gift!',
    reminderEnabled: true,
    createdAt: new Date().toISOString(),
  },
];

export const fetchImportantDates = createAsyncThunk(
  'importantDates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await importantDatesApi.getAll();
      // return response.data.data;

      // For now, return mock data
      return mockDates;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch important dates');
    }
  }
);

export const fetchUpcomingDates = createAsyncThunk(
  'importantDates/fetchUpcoming',
  async (days: number = 30, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await importantDatesApi.getUpcoming(days);
      // return response.data.data;

      // For now, filter mock data to next 30 days
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

      return mockDates.filter(date => {
        const dateObj = new Date(date.date);
        return dateObj >= now && dateObj <= futureDate;
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch upcoming dates');
    }
  }
);

export const addImportantDate = createAsyncThunk(
  'importantDates/add',
  async (date: Omit<ImportantDate, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      const newDate: ImportantDate = {
        ...date,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      return newDate;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to add date');
    }
  }
);

export const deleteImportantDate = createAsyncThunk(
  'importantDates/delete',
  async (dateId: string, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      return dateId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete date');
    }
  }
);

const importantDatesSlice = createSlice({
  name: 'importantDates',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all dates
      .addCase(fetchImportantDates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchImportantDates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dates = action.payload;
      })
      .addCase(fetchImportantDates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch upcoming dates
      .addCase(fetchUpcomingDates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingDates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.upcomingDates = action.payload;
      })
      .addCase(fetchUpcomingDates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Add date
      .addCase(addImportantDate.fulfilled, (state, action) => {
        state.dates.push(action.payload);
      })
      // Delete date
      .addCase(deleteImportantDate.fulfilled, (state, action) => {
        state.dates = state.dates.filter(d => d.id !== action.payload);
        state.upcomingDates = state.upcomingDates.filter(d => d.id !== action.payload);
      });
  },
});

export const { clearError } = importantDatesSlice.actions;
export default importantDatesSlice.reducer;
