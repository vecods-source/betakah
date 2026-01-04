import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { eventsApi } from '../../services/api/events';
import { Event, EventSession, Invitation } from '../../types';
import {
  mockHostedEvents,
  mockInvitedEvents,
  mockInvitations,
  mockAllEvents,
  mockUpcomingEvents,
  // Language-specific exports for testing
  mockHostedEventsEN,
  mockInvitedEventsEN,
  mockInvitationsEN,
  mockAllEventsEN,
  mockUpcomingEventsEN,
  mockHostedEventsAR,
  mockInvitedEventsAR,
  mockInvitationsAR,
  mockAllEventsAR,
  mockUpcomingEventsAR,
} from '../../utils/mockData';

interface EventsState {
  events: Event[];
  allEvents: Event[];
  upcomingEvents: Event[];
  hostedEvents: Event[];
  invitedEvents: Event[];
  currentEvent: Event | null;
  invitations: Invitation[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingInvitations: boolean;
  isLoadingAllEvents: boolean;
  isLoadingUpcoming: boolean;
  hasFetchedInvitations: boolean;
  hasFetchedAllEvents: boolean;
  hasFetchedUpcoming: boolean;
  error: string | null;
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
}

const initialState: EventsState = {
  events: [],
  allEvents: [],
  upcomingEvents: [],
  hostedEvents: [],
  invitedEvents: [],
  currentEvent: null,
  invitations: [],
  isLoading: false,
  isRefreshing: false,
  isLoadingInvitations: false,
  isLoadingAllEvents: false,
  isLoadingUpcoming: false,
  hasFetchedInvitations: false,
  hasFetchedAllEvents: false,
  hasFetchedUpcoming: false,
  error: null,
  pagination: {
    hasMore: false,
    nextCursor: null,
  },
};

// Async thunks
export const fetchEvents = createAsyncThunk(
  'events/fetchEvents',
  async (
    params: { role?: string; status?: string; type?: string; cursor?: string } = {},
    { rejectWithValue }
  ) => {
    try {
      const response = await eventsApi.getEvents(params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch events');
    }
  }
);

export const fetchEventById = createAsyncThunk(
  'events/fetchEventById',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getEventById(eventId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch event');
    }
  }
);

export const fetchEventDetails = createAsyncThunk(
  'events/fetchEventDetails',
  async (eventId: string, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getEventById(eventId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch event details');
    }
  }
);

export const fetchUpcomingEvents = createAsyncThunk(
  'events/fetchUpcomingEvents',
  async (language: string = 'en', { rejectWithValue, getState }) => {
    try {
      const response = await eventsApi.getEvents({ status: 'PUBLISHED', upcoming: true });
      return response.data.data || [];
    } catch (error: any) {
      // Return mock data based on language when API fails
      return language === 'ar' ? mockUpcomingEventsAR : mockUpcomingEventsEN;
    }
  }
);

export const fetchAllEvents = createAsyncThunk(
  'events/fetchAllEvents',
  async (language: string = 'en', { rejectWithValue }) => {
    try {
      const response = await eventsApi.getEvents({});
      return response.data.data || [];
    } catch (error: any) {
      // Return mock data based on language when API fails
      return language === 'ar' ? mockAllEventsAR : mockAllEventsEN;
    }
  }
);

export const fetchHostedEvents = createAsyncThunk(
  'events/fetchHostedEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getEvents({ role: 'host' });
      return response.data.data || [];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch hosted events');
    }
  }
);

export const fetchInvitedEvents = createAsyncThunk(
  'events/fetchInvitedEvents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getMyInvitations({ upcoming: true });
      // Extract events from invitations
      const events = response.data.data?.map((inv: Invitation) => inv.event).filter(Boolean) || [];
      return events;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch invited events');
    }
  }
);

interface CreateEventPayload {
  type: string;
  title: string;
  titleAr?: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  coverImage?: any;
}

export const createEvent = createAsyncThunk(
  'events/createEvent',
  async (payload: CreateEventPayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('type', payload.type);
      formData.append('title', payload.title);
      if (payload.titleAr) formData.append('titleAr', payload.titleAr);
      if (payload.description) formData.append('description', payload.description);
      if (payload.location) formData.append('location', payload.location);
      formData.append('startDate', payload.startDate);
      if (payload.endDate) formData.append('endDate', payload.endDate);
      if (payload.coverImage) formData.append('coverImage', payload.coverImage);

      const response = await eventsApi.createEvent(formData);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create event');
    }
  }
);

export const updateEvent = createAsyncThunk(
  'events/updateEvent',
  async ({ eventId, data }: { eventId: string; data: FormData }, { rejectWithValue }) => {
    try {
      const response = await eventsApi.updateEvent(eventId, data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update event');
    }
  }
);

export const updateEventStatus = createAsyncThunk(
  'events/updateEventStatus',
  async ({ eventId, status }: { eventId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await eventsApi.updateEventStatus(eventId, status);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update status');
    }
  }
);

export const deleteEvent = createAsyncThunk(
  'events/deleteEvent',
  async (eventId: string, { rejectWithValue }) => {
    try {
      await eventsApi.deleteEvent(eventId);
      return eventId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete event');
    }
  }
);

export const fetchMyInvitations = createAsyncThunk(
  'events/fetchMyInvitations',
  async (params: { rsvpStatus?: string; upcoming?: boolean; language?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await eventsApi.getMyInvitations(params);
      return response.data;
    } catch (error: any) {
      // Return mock data based on language when API fails
      const mockData = params.language === 'ar' ? mockInvitationsAR : mockInvitationsEN;
      return { data: mockData };
    }
  }
);

export const updateRsvp = createAsyncThunk(
  'events/updateRsvp',
  async (
    { invitationId, status, plusOnes }: { invitationId: string; status: string; plusOnes?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await eventsApi.updateRsvp(invitationId, status, plusOnes);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update RSVP');
    }
  }
);

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null;
    },
    updateEventInList: (state, action: PayloadAction<Event>) => {
      const index = state.events.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    addRsvpUpdate: (state, action: PayloadAction<{ eventId: string; rsvpStatus: string }>) => {
      // Update invitation RSVP status in real-time
      const invitation = state.invitations.find((i) => i.eventId === action.payload.eventId);
      if (invitation) {
        invitation.rsvpStatus = action.payload.rsvpStatus as any;
      }
    },
    loadMockData: (state) => {
      // Load mock data for testing UI (all languages - production)
      state.hostedEvents = mockHostedEvents;
      state.invitedEvents = mockInvitedEvents;
      state.allEvents = mockAllEvents;
      state.upcomingEvents = mockUpcomingEvents;
      state.invitations = mockInvitations;
      state.events = mockAllEvents;
      state.isLoading = false;
      state.isLoadingInvitations = false;
      state.isLoadingAllEvents = false;
      state.isLoadingUpcoming = false;
      state.hasFetchedInvitations = true;
      state.hasFetchedAllEvents = true;
      state.hasFetchedUpcoming = true;
      state.error = null;
    },
    loadMockDataEN: (state) => {
      // Load English-only mock data for testing
      state.hostedEvents = mockHostedEventsEN;
      state.invitedEvents = mockInvitedEventsEN;
      state.allEvents = mockAllEventsEN;
      state.upcomingEvents = mockUpcomingEventsEN;
      state.invitations = mockInvitationsEN;
      state.events = mockAllEventsEN;
      state.isLoading = false;
      state.isLoadingInvitations = false;
      state.isLoadingAllEvents = false;
      state.isLoadingUpcoming = false;
      state.hasFetchedInvitations = true;
      state.hasFetchedAllEvents = true;
      state.hasFetchedUpcoming = true;
      state.error = null;
    },
    loadMockDataAR: (state) => {
      // Load Arabic-only mock data for testing
      state.hostedEvents = mockHostedEventsAR;
      state.invitedEvents = mockInvitedEventsAR;
      state.allEvents = mockAllEventsAR;
      state.upcomingEvents = mockUpcomingEventsAR;
      state.invitations = mockInvitationsAR;
      state.events = mockAllEventsAR;
      state.isLoading = false;
      state.isLoadingInvitations = false;
      state.isLoadingAllEvents = false;
      state.isLoadingUpcoming = false;
      state.hasFetchedInvitations = true;
      state.hasFetchedAllEvents = true;
      state.hasFetchedUpcoming = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch events
      .addCase(fetchEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events = action.payload.data;
        state.pagination = {
          hasMore: action.payload.meta?.pagination?.hasMore || false,
          nextCursor: action.payload.meta?.pagination?.nextCursor || null,
        };
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch event by ID
      .addCase(fetchEventById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch event details
      .addCase(fetchEventDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEventDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentEvent = action.payload;
      })
      .addCase(fetchEventDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch upcoming events
      .addCase(fetchUpcomingEvents.pending, (state) => {
        // Only show loading if we haven't fetched before (first load)
        if (!state.hasFetchedUpcoming) {
          state.isLoadingUpcoming = true;
        }
        state.error = null;
      })
      .addCase(fetchUpcomingEvents.fulfilled, (state, action) => {
        state.isLoadingUpcoming = false;
        state.hasFetchedUpcoming = true;
        state.upcomingEvents = action.payload;
      })
      .addCase(fetchUpcomingEvents.rejected, (state, action) => {
        state.isLoadingUpcoming = false;
        state.hasFetchedUpcoming = true;
        state.error = action.payload as string;
      })
      // Fetch all events
      .addCase(fetchAllEvents.pending, (state) => {
        if (!state.hasFetchedAllEvents) {
          state.isLoadingAllEvents = true;
        }
        state.error = null;
      })
      .addCase(fetchAllEvents.fulfilled, (state, action) => {
        state.isLoadingAllEvents = false;
        state.hasFetchedAllEvents = true;
        state.allEvents = action.payload;
      })
      .addCase(fetchAllEvents.rejected, (state, action) => {
        state.isLoadingAllEvents = false;
        state.hasFetchedAllEvents = true;
        state.error = action.payload as string;
      })
      // Fetch hosted events
      .addCase(fetchHostedEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHostedEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.hostedEvents = action.payload;
      })
      .addCase(fetchHostedEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch invited events
      .addCase(fetchInvitedEvents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvitedEvents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invitedEvents = action.payload;
      })
      .addCase(fetchInvitedEvents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create event
      .addCase(createEvent.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.isLoading = false;
        state.events.unshift(action.payload);
        state.currentEvent = action.payload;
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update event
      .addCase(updateEvent.fulfilled, (state, action) => {
        const index = state.events.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        if (state.currentEvent?.id === action.payload.id) {
          state.currentEvent = action.payload;
        }
      })
      // Update event status
      .addCase(updateEventStatus.fulfilled, (state, action) => {
        const index = state.events.findIndex((e) => e.id === action.payload.id);
        if (index !== -1) {
          state.events[index] = action.payload;
        }
        if (state.currentEvent?.id === action.payload.id) {
          state.currentEvent = action.payload;
        }
      })
      // Delete event
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.events = state.events.filter((e) => e.id !== action.payload);
        if (state.currentEvent?.id === action.payload) {
          state.currentEvent = null;
        }
      })
      // Fetch invitations
      .addCase(fetchMyInvitations.pending, (state) => {
        if (!state.hasFetchedInvitations) {
          state.isLoadingInvitations = true;
        }
        state.error = null;
      })
      .addCase(fetchMyInvitations.fulfilled, (state, action) => {
        state.isLoadingInvitations = false;
        state.hasFetchedInvitations = true;
        // Sort invitations by event date (soonest first)
        const invitations = action.payload.data || [];
        state.invitations = [...invitations].sort((a, b) => {
          const dateA = a.event?.startDate ? new Date(a.event.startDate).getTime() : Infinity;
          const dateB = b.event?.startDate ? new Date(b.event.startDate).getTime() : Infinity;
          return dateA - dateB;
        });
      })
      .addCase(fetchMyInvitations.rejected, (state, action) => {
        state.isLoadingInvitations = false;
        state.hasFetchedInvitations = true;
        state.error = action.payload as string;
      })
      // Update RSVP
      .addCase(updateRsvp.fulfilled, (state, action) => {
        const index = state.invitations.findIndex((i) => i.id === action.payload.id);
        if (index !== -1) {
          state.invitations[index] = action.payload;
        }
      });
  },
});

export const { clearError, clearCurrentEvent, updateEventInList, addRsvpUpdate, loadMockData, loadMockDataEN, loadMockDataAR } = eventsSlice.actions;
export default eventsSlice.reducer;
