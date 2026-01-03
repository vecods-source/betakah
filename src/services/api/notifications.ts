import apiClient from './client';

export const notificationsApi = {
  getNotifications: (params?: { unreadOnly?: boolean; type?: string; cursor?: string; limit?: number }) => {
    return apiClient.get('/notifications', { params });
  },

  getUnreadCount: () => {
    return apiClient.get('/notifications/count');
  },

  markAsRead: (notificationId: string) => {
    return apiClient.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: () => {
    return apiClient.post('/notifications/read-all');
  },
};
