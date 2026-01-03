import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getStoredLanguage, changeLanguage as i18nChangeLanguage } from '../../i18n';

interface LanguageState {
  currentLanguage: string;
  isRTL: boolean;
  isLoading: boolean;
  needsRestart: boolean;
}

const initialState: LanguageState = {
  currentLanguage: 'en',
  isRTL: false,
  isLoading: true,
  needsRestart: false,
};

// Initialize language from storage
export const initializeLanguage = createAsyncThunk(
  'language/initialize',
  async () => {
    const language = await getStoredLanguage();
    return {
      language,
      isRTL: language === 'ar',
    };
  }
);

// Change language
export const changeLanguage = createAsyncThunk(
  'language/change',
  async (language: string) => {
    const needsRestart = await i18nChangeLanguage(language);
    return {
      language,
      isRTL: language === 'ar',
      needsRestart,
    };
  }
);

const languageSlice = createSlice({
  name: 'language',
  initialState,
  reducers: {
    clearRestartFlag: (state) => {
      state.needsRestart = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeLanguage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeLanguage.fulfilled, (state, action) => {
        state.currentLanguage = action.payload.language;
        state.isRTL = action.payload.isRTL;
        state.isLoading = false;
      })
      .addCase(initializeLanguage.rejected, (state) => {
        state.isLoading = false;
      })
      // Change language
      .addCase(changeLanguage.fulfilled, (state, action) => {
        state.currentLanguage = action.payload.language;
        state.isRTL = action.payload.isRTL;
        state.needsRestart = action.payload.needsRestart;
      });
  },
});

export const { clearRestartFlag } = languageSlice.actions;
export default languageSlice.reducer;
