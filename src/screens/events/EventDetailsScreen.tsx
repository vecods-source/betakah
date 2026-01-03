import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { fetchEventDetails } from '../../store/slices/eventsSlice';
import { EventsStackScreenProps } from '../../navigation/types';
import {
  UIStack,
  UISpacer,
  UIText,
  UIButton,
  UIIcon,
  UIBadge,
} from '../../components/ui';

type Props = EventsStackScreenProps<'EventDetails'>;

export default function EventDetailsScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const dispatch = useAppDispatch();
  const { currentEvent, isLoading } = useAppSelector((state) => state.events);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchEventDetails(eventId));
  }, [dispatch, eventId]);

  const isHost = currentEvent?.hostId === user?.id;

  if (isLoading || !currentEvent) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c5282" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UIStack direction="horizontal" alignItems="center">
          <UIButton variant="plain" onPress={() => navigation.goBack()} icon="chevron.left">
            Back
          </UIButton>
          <UISpacer />
          {isHost && (
            <UIButton variant="plain">
              Edit
            </UIButton>
          )}
        </UIStack>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <UIStack direction="vertical" spacing={24}>
          {/* Event Type Badge */}
          <UIBadge variant="info">{currentEvent.type.replace('_', ' ')}</UIBadge>

          {/* Title */}
          <UIStack direction="vertical" spacing={4}>
            <UIText size={28} weight="bold" color="#1a202c">
              {currentEvent.title}
            </UIText>
            {currentEvent.titleAr && (
              <UIText size={24} color="#4a5568">
                {currentEvent.titleAr}
              </UIText>
            )}
          </UIStack>

          {/* Info Section */}
          <UIStack direction="vertical" spacing={16}>
            <UIStack direction="horizontal" spacing={12} alignItems="start">
              <UIIcon name="calendar" color="#2c5282" size={20} />
              <UIStack direction="vertical" spacing={2}>
                <UIText size={12} color="#718096">DATE</UIText>
                <UIText size={16} color="#1a202c">
                  {new Date(currentEvent.startDate).toLocaleDateString('en-QA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </UIText>
              </UIStack>
            </UIStack>

            {currentEvent.location && (
              <UIStack direction="horizontal" spacing={12} alignItems="start">
                <UIIcon name="mappin.circle.fill" color="#2c5282" size={20} />
                <UIStack direction="vertical" spacing={2}>
                  <UIText size={12} color="#718096">LOCATION</UIText>
                  <UIText size={16} color="#1a202c">
                    {currentEvent.location}
                  </UIText>
                </UIStack>
              </UIStack>
            )}

            <UIStack direction="horizontal" spacing={12} alignItems="start">
              <UIIcon name="person.2.fill" color="#2c5282" size={20} />
              <UIStack direction="vertical" spacing={2}>
                <UIText size={12} color="#718096">GUESTS</UIText>
                <UIText size={16} color="#1a202c">
                  {currentEvent.guestCount || 0} invited
                </UIText>
              </UIStack>
            </UIStack>
          </UIStack>

          {/* Description */}
          {currentEvent.description && (
            <UIStack direction="vertical" spacing={8}>
              <UIText size={18} weight="semibold" color="#1a202c">
                About
              </UIText>
              <UIText size={16} color="#4a5568">
                {currentEvent.description}
              </UIText>
            </UIStack>
          )}

          {/* Sessions */}
          {currentEvent.sessions && currentEvent.sessions.length > 0 && (
            <UIStack direction="vertical" spacing={12}>
              <UIText size={18} weight="semibold" color="#1a202c">
                Sessions
              </UIText>
              {currentEvent.sessions.map((session, index) => (
                <View key={session.id || index} style={styles.sessionCard}>
                  <UIStack direction="vertical" spacing={8}>
                    <UIStack direction="horizontal" alignItems="center">
                      <UIText size={16} weight="semibold" color="#1a202c">
                        {session.name}
                      </UIText>
                      <UISpacer />
                      {session.genderRestriction !== 'MIXED' && (
                        <UIBadge variant="default">{session.genderRestriction}</UIBadge>
                      )}
                    </UIStack>
                    <UIText size={14} color="#718096">
                      {new Date(session.startTime).toLocaleTimeString('en-QA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' - '}
                      {new Date(session.endTime).toLocaleTimeString('en-QA', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </UIText>
                    {session.location && (
                      <UIText size={14} color="#718096">
                        {session.location}
                      </UIText>
                    )}
                  </UIStack>
                </View>
              ))}
            </UIStack>
          )}

          {/* Action Buttons */}
          <UIStack direction="horizontal" spacing={12}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('GuestList', { eventId })}
            >
              <UIStack direction="vertical" spacing={8} alignItems="center">
                <UIIcon name="person.2.fill" color="#4a5568" size={24} />
                <UIText size={13} weight="medium" color="#4a5568">
                  Guest List
                </UIText>
              </UIStack>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('EventStory', { eventId })}
            >
              <UIStack direction="vertical" spacing={8} alignItems="center">
                <UIIcon name="camera.fill" color="#4a5568" size={24} />
                <UIText size={13} weight="medium" color="#4a5568">
                  Story
                </UIText>
              </UIStack>
            </TouchableOpacity>

            {isHost && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('SendCard', { eventId })}
              >
                <UIStack direction="vertical" spacing={8} alignItems="center">
                  <UIIcon name="envelope.fill" color="#4a5568" size={24} />
                  <UIText size={13} weight="medium" color="#4a5568">
                    Send Cards
                  </UIText>
                </UIStack>
              </TouchableOpacity>
            )}
          </UIStack>
        </UIStack>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  sessionCard: {
    padding: 16,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#f7fafc',
    borderRadius: 12,
  },
});
