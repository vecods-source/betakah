import apiClient from './client';

export const authApi = {
  sendOtp: (phone: string) => {
    return apiClient.post('/auth/otp/send', { phone });
  },

  verifyOtp: (payload: {
    phone: string;
    code: string;
    fcmToken?: string;
    deviceType?: string;
    deviceName?: string;
  }) => {
    return apiClient.post('/auth/otp/verify', payload);
  },

  register: (formData: FormData) => {
    return apiClient.post('/auth/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  refreshToken: (refreshToken: string) => {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  logout: () => {
    return apiClient.post('/auth/logout');
  },

  logoutAll: () => {
    return apiClient.post('/auth/logout-all');
  },
};
