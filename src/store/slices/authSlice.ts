import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '../../services/api/auth';
import { User } from '../../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  registrationToken: string | null;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isNewUser: false,
  registrationToken: null,
  error: null,
};

// Test credentials - accept zeros OTP for any phone
const TEST_OTP = '000000';

// Async thunks
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (phone: string, { rejectWithValue }) => {
    try {
      // For testing: bypass API and always succeed
      return { success: true };

      // TODO: Uncomment for production
      // const response = await authApi.sendOtp(phone);
      // return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to send OTP');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (
    payload: { phoneNumber: string; otpCode: string; fcmToken?: string; deviceType?: string; deviceName?: string },
    { rejectWithValue }
  ) => {
    try {
      // For testing: accept zeros OTP for any phone
      if (payload.otpCode === TEST_OTP) {
        return {
          isNewUser: true,
          registrationToken: 'test-registration-token',
        };
      }

      // TODO: Uncomment for production
      // const response = await authApi.verifyOtp({
      //   phone: payload.phoneNumber,
      //   code: payload.otpCode,
      //   fcmToken: payload.fcmToken,
      //   deviceType: payload.deviceType,
      //   deviceName: payload.deviceName,
      // });
      // const data = response.data.data;

      // if (!data.isNewUser && data.accessToken) {
      //   await SecureStore.setItemAsync('accessToken', data.accessToken);
      //   await SecureStore.setItemAsync('refreshToken', data.refreshToken);
      // }

      // return data;

      return rejectWithValue('Invalid OTP');
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Invalid OTP');
    }
  }
);

interface RegisterPayload {
  registrationToken: string;
  firstName: string;
  lastName: string;
  gender: 'MALE' | 'FEMALE';
  birthday: string;
  idPhotoUri: string | null;
}

const createFileFromUri = (uri: string, fieldName: string) => {
  const filename = uri.split('/').pop() || `${fieldName}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';
  return {
    uri,
    name: filename,
    type,
  } as any;
};

export const register = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      // For testing: bypass API and return mock data
      if (payload.registrationToken === 'test-registration-token') {
        const mockUser = {
          id: 'test-user-id',
          phone: '+97455600224',
          firstName: payload.firstName,
          lastName: payload.lastName,
          gender: payload.gender,
          dateOfBirth: payload.birthday,
          verificationStatus: 'PENDING',
        };
        await SecureStore.setItemAsync('accessToken', 'test-access-token');
        await SecureStore.setItemAsync('refreshToken', 'test-refresh-token');
        return {
          accessToken: 'test-access-token',
          refreshToken: 'test-refresh-token',
          user: mockUser,
        };
      }

      // Production: Create FormData with ID photo
      const formData = new FormData();
      formData.append('registrationToken', payload.registrationToken);
      formData.append('firstName', payload.firstName);
      formData.append('lastName', payload.lastName);
      formData.append('gender', payload.gender);
      formData.append('birthday', payload.birthday);

      if (payload.idPhotoUri) {
        formData.append('idPhoto', createFileFromUri(payload.idPhotoUri, 'idPhoto'));
      }

      const response = await authApi.register(formData);
      const data = response.data.data;

      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('refreshToken', data.refreshToken);

      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Registration failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');

      const response = await authApi.refreshToken(refreshToken);
      const data = response.data.data;

      await SecureStore.setItemAsync('accessToken', data.accessToken);

      return data;
    } catch (error: any) {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      return rejectWithValue('Session expired');
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } catch (error) {
    // Ignore errors on logout
  }
  await SecureStore.deleteItemAsync('accessToken');
  await SecureStore.deleteItemAsync('refreshToken');
});

export const loadStoredAuth = createAsyncThunk('auth/loadStored', async (_, { rejectWithValue }) => {
  try {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');

    if (!accessToken || !refreshToken) {
      return null;
    }

    return { accessToken, refreshToken };
  } catch (error) {
    return rejectWithValue('Failed to load stored auth');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    updateVerificationStatus: (state, action: PayloadAction<{ status: string; rejectedReason?: string }>) => {
      if (state.user) {
        state.user.verificationStatus = action.payload.status as any;
        if (action.payload.rejectedReason) {
          state.user.verificationRejectedReason = action.payload.rejectedReason;
        }
      }
    },
    loadMockAuth: (state) => {
      // Mock authentication for testing UI (Arabic by default)
      state.isAuthenticated = true;
      state.accessToken = 'mock-access-token';
      state.refreshToken = 'mock-refresh-token';
      state.user = {
        id: 'user-1',
        phone: '+97455600224',
        firstName: 'محمد',
        lastName: 'آل ثاني',
        gender: 'MALE',
        dateOfBirth: '1990-01-15',
        verificationStatus: 'VERIFIED',
      };
    },
    loadMockAuthEN: (state) => {
      // Mock authentication for testing UI (English)
      state.isAuthenticated = true;
      state.accessToken = 'mock-access-token';
      state.refreshToken = 'mock-refresh-token';
      state.user = {
        id: 'user-1',
        phone: '+97455600224',
        firstName: 'Mohammed',
        lastName: 'Al-Thani',
        gender: 'MALE',
        dateOfBirth: '1990-01-15',
        verificationStatus: 'VERIFIED',
      };
    },
    loadMockAuthAR: (state) => {
      // Mock authentication for testing UI (Arabic)
      state.isAuthenticated = true;
      state.accessToken = 'mock-access-token';
      state.refreshToken = 'mock-refresh-token';
      state.user = {
        id: 'user-1',
        phone: '+97455600224',
        firstName: 'محمد',
        lastName: 'آل ثاني',
        gender: 'MALE',
        dateOfBirth: '1990-01-15',
        verificationStatus: 'VERIFIED',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.isNewUser) {
          state.isNewUser = true;
          state.registrationToken = action.payload.registrationToken;
        } else {
          state.isAuthenticated = true;
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.user = action.payload.user;
        }
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.isNewUser = false;
        state.registrationToken = null;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Refresh token
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isNewUser = false;
        state.registrationToken = null;
      })
      // Load stored auth
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        if (action.payload) {
          state.accessToken = action.payload.accessToken;
          state.refreshToken = action.payload.refreshToken;
          state.isAuthenticated = true;
        }
      });
  },
});

export const { clearError, setUser, updateVerificationStatus, loadMockAuth, loadMockAuthEN, loadMockAuthAR } = authSlice.actions;
export default authSlice.reducer;
