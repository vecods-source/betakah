import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationsApi } from '../../services/api/notifications';
import { Notification } from '../../types';
import { mockNotifications, mockNotificationsEN, mockNotificationsAR } from '../../utils/mockData';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  pagination: {
    hasMore: false,
    nextCursor: null,
  },
};

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async (params: { unreadOnly?: boolean; cursor?: string } | undefined, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.getNotifications(params || {});
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const response = await notificationsApi.getUnreadCount();
      return response.data.data.unread;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch count');
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await notificationsApi.markAsRead(notificationId);
      return notificationId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to mark as read');
    }
  }
);

export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await notificationsApi.markAllAsRead();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to mark all as read');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
    loadMockNotifications: (state) => {
      // Load mock notifications for testing UI (all languages - production)
      state.notifications = mockNotifications;
      state.unreadCount = mockNotifications.filter((n) => !n.isRead).length;
      state.isLoading = false;
      state.error = null;
    },
    loadMockNotificationsEN: (state) => {
      // Load English-only mock notifications for testing
      state.notifications = mockNotificationsEN;
      state.unreadCount = mockNotificationsEN.filter((n) => !n.isRead).length;
      state.isLoading = false;
      state.error = null;
    },
    loadMockNotificationsAR: (state) => {
      // Load Arabic-only mock notifications for testing
      state.notifications = mockNotificationsAR;
      state.unreadCount = mockNotificationsAR.filter((n) => !n.isRead).length;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload.data;
        state.pagination = {
          hasMore: action.payload.meta?.pagination?.hasMore || false,
          nextCursor: action.payload.meta?.pagination?.nextCursor || null,
        };
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch unread count
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      // Mark as read
      .addCase(markAsRead.fulfilled, (state, action) => {
        const notification = state.notifications.find((n) => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      // Mark all as read
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.isRead = true));
        state.unreadCount = 0;
      });
  },
});

export const { addNotification, clearNotifications, loadMockNotifications, loadMockNotificationsEN, loadMockNotificationsAR } = notificationsSlice.actions;
export default notificationsSlice.reducer;
