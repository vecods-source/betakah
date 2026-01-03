import apiClient from './client';

export const eventsApi = {
  // Events
  getEvents: (params?: { role?: string; status?: string; type?: string; upcoming?: boolean; cursor?: string; limit?: number }) => {
    return apiClient.get('/events', { params });
  },

  getEventById: (eventId: string) => {
    return apiClient.get(`/events/${eventId}`);
  },

  createEvent: (formData: FormData) => {
    return apiClient.post('/events', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateEvent: (eventId: string, formData: FormData) => {
    return apiClient.patch(`/events/${eventId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateEventStatus: (eventId: string, status: string) => {
    return apiClient.patch(`/events/${eventId}/status`, { status });
  },

  deleteEvent: (eventId: string) => {
    return apiClient.delete(`/events/${eventId}`);
  },

  getEventStats: (eventId: string) => {
    return apiClient.get(`/events/${eventId}/stats`);
  },

  // Sessions
  addSession: (eventId: string, data: any) => {
    return apiClient.post(`/events/${eventId}/sessions`, data);
  },

  updateSession: (eventId: string, sessionId: string, data: any) => {
    return apiClient.patch(`/events/${eventId}/sessions/${sessionId}`, data);
  },

  deleteSession: (eventId: string, sessionId: string) => {
    return apiClient.delete(`/events/${eventId}/sessions/${sessionId}`);
  },

  // Co-hosts
  addCoHost: (eventId: string, userId: string) => {
    return apiClient.post(`/events/${eventId}/co-hosts`, { userId });
  },

  removeCoHost: (eventId: string, userId: string) => {
    return apiClient.delete(`/events/${eventId}/co-hosts/${userId}`);
  },

  // Invitations
  getEventInvitations: (
    eventId: string,
    params?: { rsvpStatus?: string; sessionId?: string; gender?: string; cursor?: string }
  ) => {
    return apiClient.get(`/events/${eventId}/invitations`, { params });
  },

  sendInvitations: (eventId: string, invitations: any[]) => {
    return apiClient.post(`/events/${eventId}/invitations`, { invitations });
  },

  revokeInvitation: (eventId: string, invitationId: string) => {
    return apiClient.delete(`/events/${eventId}/invitations/${invitationId}`);
  },

  // My Invitations
  getMyInvitations: (params?: { rsvpStatus?: string; upcoming?: boolean; cursor?: string }) => {
    return apiClient.get('/invitations', { params });
  },

  updateRsvp: (invitationId: string, status: string, plusOnes?: number) => {
    return apiClient.patch(`/invitations/${invitationId}/rsvp`, { status, plusOnes });
  },

  getInvitationByToken: (token: string) => {
    return apiClient.get(`/invitations/token/${token}`);
  },

  // Media
  getEventMedia: (eventId: string, params?: { type?: string; genderSection?: string; cursor?: string }) => {
    return apiClient.get(`/events/${eventId}/media`, { params });
  },

  uploadMedia: (eventId: string, formData: FormData) => {
    return apiClient.post(`/events/${eventId}/media`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteMedia: (eventId: string, mediaId: string) => {
    return apiClient.delete(`/events/${eventId}/media/${mediaId}`);
  },

  // Cards
  getEventCards: (eventId: string, params?: { cursor?: string }) => {
    return apiClient.get(`/events/${eventId}/cards`, { params });
  },

  sendCard: (eventId: string, data: { cardType: string; templateId?: string; message?: string }) => {
    return apiClient.post(`/events/${eventId}/cards`, data);
  },

  markCardAsRead: (eventId: string, cardId: string) => {
    return apiClient.patch(`/events/${eventId}/cards/${cardId}/read`);
  },
};
