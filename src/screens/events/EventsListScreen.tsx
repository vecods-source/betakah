import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchHostedEvents, fetchInvitedEvents } from '../../store/slices/eventsSlice';
import { EventsStackScreenProps } from '../../navigation/types';
import { Event } from '../../types';
import {
  UIStack,
  UISpacer,
  UIText,
  UIButton,
  UIBadge,
  UIEmptyState,
} from '../../components/ui';

type TabType = 'hosting' | 'invited';

export default function EventsListScreen({ navigation }: EventsStackScreenProps<'EventsList'>) {
  const dispatch = useAppDispatch();
  const { hostedEvents, invitedEvents, isLoading } = useAppSelector((state) => state.events);
  const [activeTab, setActiveTab] = useState<TabType>('hosting');

  const loadEvents = useCallback(() => {
    if (activeTab === 'hosting') {
      dispatch(fetchHostedEvents());
    } else {
      dispatch(fetchInvitedEvents());
    }
  }, [dispatch, activeTab]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const events = activeTab === 'hosting' ? hostedEvents : invitedEvents;

  const renderEventCard = (item: Event) => (
    <TouchableOpacity
      key={item.id}
      style={styles.eventCard}
      onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
    >
      <View style={styles.cardContent}>
        <UIStack direction="horizontal" spacing={16}>
          {/* Date Box */}
          <View style={styles.dateBox}>
            <UIText size={12} weight="semibold" color="#2c5282" align="center">
              {new Date(item.startDate).toLocaleDateString('en-QA', { month: 'short' }).toUpperCase()}
            </UIText>
            <UIText size={20} weight="bold" color="#2c5282" align="center">
              {new Date(item.startDate).getDate()}
            </UIText>
          </View>

          {/* Event Info */}
          <UIStack direction="vertical" spacing={4}>
            <UIText size={11} weight="semibold" color="#718096">
              {item.type.replace('_', ' ')}
            </UIText>
            <UIText size={16} weight="semibold" color="#1a202c">
              {item.title}
            </UIText>
            {item.location && (
              <UIText size={13} color="#718096">
                {item.location}
              </UIText>
            )}
            <UIStack direction="horizontal" spacing={8} alignItems="center">
              <UIBadge variant="success">{item.status}</UIBadge>
              <UIText size={12} color="#718096">
                {item.guestCount || 0} guests
              </UIText>
            </UIStack>
          </UIStack>
        </UIStack>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <UIEmptyState
        icon={activeTab === 'hosting' ? 'party.popper' : 'envelope'}
        title={activeTab === 'hosting' ? 'No events yet' : 'No invitations yet'}
        message={
          activeTab === 'hosting'
            ? 'Start by creating your first event'
            : "You haven't been invited to any events yet"
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UIText size={28} weight="bold" color="#1a202c">
          My Events
        </UIText>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <UIStack direction="horizontal" spacing={0}>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('hosting')}>
            <UIText
              weight={activeTab === 'hosting' ? 'semibold' : 'regular'}
              color={activeTab === 'hosting' ? '#2c5282' : '#718096'}
            >
              Hosting
            </UIText>
            {activeTab === 'hosting' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab('invited')}>
            <UIText
              weight={activeTab === 'invited' ? 'semibold' : 'regular'}
              color={activeTab === 'invited' ? '#2c5282' : '#718096'}
            >
              Invited
            </UIText>
            {activeTab === 'invited' && <View style={styles.activeIndicator} />}
          </TouchableOpacity>
        </UIStack>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadEvents}
            tintColor="#2c5282"
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {events.length > 0 ? (
          events.map(renderEventCard)
        ) : (
          !isLoading && renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
  },
  tabsContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeIndicator: {
    height: 2,
    width: '100%',
    backgroundColor: '#2c5282',
    borderRadius: 1,
    marginTop: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  eventCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  dateBox: {
    width: 56,
    height: 56,
    backgroundColor: '#ebf8ff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
