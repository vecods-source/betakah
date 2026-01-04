import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Image, ImageSourcePropType } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchUpcomingEvents } from '../../store/slices/eventsSlice';
import { HomeStackScreenProps } from '../../navigation/types';
import { Event } from '../../types';
import {
  UIStack,
  UISpacer,
  UIText,
  UIIcon,
  UIBadge,
  UIEmptyState,
} from '../../components/ui';

export default function HomeScreen({ navigation }: HomeStackScreenProps<'HomeScreen'>) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { upcomingEvents, isLoading } = useAppSelector((state) => state.events);

  const loadEvents = useCallback(() => {
    dispatch(fetchUpcomingEvents());
  }, [dispatch]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const getImageSource = (event: Event): ImageSourcePropType | undefined => {
    if (event.coverImage) {
      // Local asset (number) or URL string
      return typeof event.coverImage === 'number'
        ? event.coverImage
        : { uri: event.coverImage };
    }
    if (event.coverImageUrl) {
      return { uri: event.coverImageUrl };
    }
    return undefined;
  };

  const renderEventCard = (item: Event) => {
    const imageSource = getImageSource(item);

    return (
      <TouchableOpacity
        key={item.id}
        style={styles.eventCard}
        onPress={() => navigation.navigate('EventDetails', { eventId: item.id })}
      >
        {imageSource && (
          <Image source={imageSource} style={styles.cardImage} resizeMode="cover" />
        )}
        <View style={styles.cardContent}>
          <UIStack direction="vertical" spacing={12}>
            <UIStack direction="horizontal" alignItems="center">
              <UIBadge variant="info">{item.type.replace('_', ' ')}</UIBadge>
              <UISpacer />
              <UIText size={14} color="#718096">
                {new Date(item.startDate).toLocaleDateString('en-QA', {
                  month: 'short',
                  day: 'numeric',
                })}
              </UIText>
            </UIStack>

            <UIText size={20} weight="semibold" color="#1a202c">
              {item.title}
            </UIText>

            {item.titleAr && (
              <UIText size={18} color="#4a5568">
                {item.titleAr}
              </UIText>
            )}

            <UIStack direction="horizontal" spacing={16}>
              <UIStack direction="horizontal" spacing={4} alignItems="center">
                <UIIcon name="mappin" color="#718096" size={14} />
                <UIText size={14} color="#718096">
                  {item.location || 'Location TBD'}
                </UIText>
              </UIStack>
              <UISpacer />
              <UIStack direction="horizontal" spacing={4} alignItems="center">
                <UIIcon name="person.2.fill" color="#718096" size={14} />
                <UIText size={14} color="#718096">
                  {item.guestCount || 0} guests
                </UIText>
              </UIStack>
            </UIStack>
          </UIStack>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <UIEmptyState
        icon="calendar"
        title="No upcoming events"
        message="You don't have any events coming up. Check your invitations or create a new event."
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UIStack direction="vertical" spacing={4}>
          <UIStack direction="horizontal" spacing={4}>
            <UIText size={16} color="#718096">Welcome back,</UIText>
            <UIText size={16} weight="semibold" color="#1a202c">
              {user?.firstName || 'Guest'}
            </UIText>
          </UIStack>
          <UIText size={24} weight="bold" color="#1a202c">
            Your upcoming events
          </UIText>
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
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map(renderEventCard)
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
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
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
