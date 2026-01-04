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

// Images for important dates
const dateImages = {
  birthday: [
    require('../../../assets/birthdays/freepik__fancy-clear-minimal-birthday-party-delicate-string__20556.png'),
    require('../../../assets/birthdays/freepik__fancy-clear-minimal-birthday-party-pale-blush-and-__20557.png'),
    require('../../../assets/birthdays/freepik__fancy-clear-minimal-birthday-party-pale-blush-and-__20558.jpeg'),
    require('../../../assets/birthdays/freepik__fancy-clear-minimal-birthday-party-streamlined-des__20559.jpeg'),
  ],
  anniversary: [
    require('../../../assets/marriage anniversery/freepik__fancy-clear-minimal-marriage-anniversary-simple-fo__20572.png'),
    require('../../../assets/marriage anniversery/freepik__fancy-clear-minimal-marriage-anniversary-clean-ivo__20573.jpeg'),
  ],
};

// Mock data for testing - English
const mockDatesEN: ImportantDate[] = [
  {
    id: '1',
    type: 'BIRTHDAY',
    title: 'My Birthday',
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    reminderEnabled: true,
    coverImage: dateImages.birthday[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'ANNIVERSARY',
    title: 'Wedding Anniversary',
    date: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(),
    reminderEnabled: true,
    coverImage: dateImages.anniversary[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'BIRTHDAY',
    title: "Ahmed's Birthday",
    date: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
    notes: 'Get a gift!',
    reminderEnabled: true,
    coverImage: dateImages.birthday[1],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    type: 'ANNIVERSARY',
    title: 'Parents Anniversary',
    date: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(),
    reminderEnabled: true,
    coverImage: dateImages.anniversary[1],
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    type: 'BIRTHDAY',
    title: "Sara's Birthday",
    date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    reminderEnabled: true,
    coverImage: dateImages.birthday[2],
    createdAt: new Date().toISOString(),
  },
];

// Mock data for testing - Arabic
const mockDatesAR: ImportantDate[] = [
  {
    id: '1',
    type: 'BIRTHDAY',
    title: 'عيد ميلادي',
    date: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
    reminderEnabled: true,
    coverImage: dateImages.birthday[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'ANNIVERSARY',
    title: 'ذكرى الزواج',
    date: new Date(new Date().setDate(new Date().getDate() + 12)).toISOString(),
    reminderEnabled: true,
    coverImage: dateImages.anniversary[0],
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'BIRTHDAY',
    title: 'عيد ميلاد أحمد',
    date: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString(),
    notes: 'شراء هدية!',
    reminderEnabled: true,
    coverImage: dateImages.birthday[1],
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    type: 'ANNIVERSARY',
    title: 'ذكرى زواج الوالدين',
    date: new Date(new Date().setDate(new Date().getDate() + 25)).toISOString(),
    reminderEnabled: true,
    coverImage: dateImages.anniversary[1],
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    type: 'BIRTHDAY',
    title: 'عيد ميلاد سارة',
    date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
    reminderEnabled: true,
    coverImage: dateImages.birthday[2],
    createdAt: new Date().toISOString(),
  },
];

// Get mock dates based on language
const getMockDates = (language: string = 'en'): ImportantDate[] => {
  return language === 'ar' ? mockDatesAR : mockDatesEN;
};

export const fetchImportantDates = createAsyncThunk(
  'importantDates/fetchAll',
  async (language: string = 'en', { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await importantDatesApi.getAll();
      // return response.data.data;

      // For now, return mock data based on language
      return getMockDates(language);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch important dates');
    }
  }
);

export const fetchUpcomingDates = createAsyncThunk(
  'importantDates/fetchUpcoming',
  async ({ days = 30, language = 'en' }: { days?: number; language?: string }, { rejectWithValue }) => {
    try {
      // TODO: Replace with actual API call
      // const response = await importantDatesApi.getUpcoming(days);
      // return response.data.data;

      // For now, filter mock data to next X days
      const now = new Date();
      const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
      const mockDates = getMockDates(language);

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
