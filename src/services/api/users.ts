import apiClient from './client';

export const usersApi = {
  // Profile
  getMe: () => {
    return apiClient.get('/users/me');
  },

  updateMe: (formData: FormData) => {
    return apiClient.patch('/users/me', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteMe: () => {
    return apiClient.delete('/users/me');
  },

  // Preferences
  getPreferences: () => {
    return apiClient.get('/users/me/preferences');
  },

  updatePreferences: (data: Partial<{
    notifyNewInvitation: boolean;
    notifyRsvpResponse: boolean;
    notifyEventReminder: boolean;
    notifyImportantDates: boolean;
    calendarSyncEnabled: boolean;
  }>) => {
    return apiClient.patch('/users/me/preferences', data);
  },

  // Sessions
  getSessions: () => {
    return apiClient.get('/users/me/sessions');
  },

  revokeSession: (sessionId: string) => {
    return apiClient.delete(`/users/me/sessions/${sessionId}`);
  },

  // Blocks
  getBlocks: () => {
    return apiClient.get('/users/me/blocks');
  },

  blockUser: (userId: string) => {
    return apiClient.post(`/users/${userId}/block`);
  },

  unblockUser: (userId: string) => {
    return apiClient.delete(`/users/${userId}/block`);
  },
};
