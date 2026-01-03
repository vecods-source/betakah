import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { EventsStackScreenProps } from '../../navigation/types';
import { useAppSelector } from '../../hooks';
import {
  UIStack,
  UISpacer,
  UIText,
  UIButton,
  UIIcon,
  UIEmptyState,
} from '../../components/ui';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 48 - 8) / 3;

type Props = EventsStackScreenProps<'EventStory'>;

export default function EventStoryScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { currentEvent } = useAppSelector((state) => state.events);
  const { user } = useAppSelector((state) => state.auth);

  const [media] = useState<Array<{ id: string; type: 'IMAGE' | 'VIDEO'; url: string }>>([]);

  const isHost = currentEvent?.hostId === user?.id;

  const renderMediaItem = ({ item }: { item: { id: string; type: string; url: string } }) => (
    <TouchableOpacity style={styles.mediaItem}>
      <View style={styles.mediaPlaceholder}>
        <UIIcon
          name={item.type === 'VIDEO' ? 'video.fill' : 'photo.fill'}
          color="#718096"
          size={32}
        />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <UIEmptyState
        icon="camera.fill"
        title="No stories yet"
        message={
          isHost
            ? 'Share photos and videos from your event'
            : "The host hasn't shared any stories yet"
        }
        action={
          isHost
            ? {
                label: 'Add Media',
                onPress: () => {},
              }
            : undefined
        }
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UIStack direction="horizontal" alignItems="center">
          <UIButton variant="plain" onPress={() => navigation.goBack()} icon="chevron.left">
            Back
          </UIButton>
          <UISpacer />
          <UIText size={18} weight="semibold" color="#1a202c">
            Event Story
          </UIText>
          <UISpacer />
          {isHost && media.length > 0 && (
            <UIButton variant="primary" icon="plus">
              {''}
            </UIButton>
          )}
          {(!isHost || media.length === 0) && <View style={{ width: 50 }} />}
        </UIStack>
      </View>

      {/* Event Info */}
      {currentEvent && (
        <View style={styles.eventInfo}>
          <UIStack direction="vertical" spacing={4}>
            <UIText size={16} weight="semibold" color="#1a202c">
              {currentEvent.title}
            </UIText>
            <UIText size={14} color="#718096">
              {new Date(currentEvent.startDate).toLocaleDateString('en-QA', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </UIText>
          </UIStack>
        </View>
      )}

      <FlatList
        data={media}
        keyExtractor={(item) => item.id}
        renderItem={renderMediaItem}
        numColumns={3}
        contentContainerStyle={styles.gridContent}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  eventInfo: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  gridContent: {
    padding: 16,
    flexGrow: 1,
  },
  gridRow: {
    gap: 4,
  },
  mediaItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginBottom: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  mediaPlaceholder: {
    flex: 1,
    backgroundColor: '#f7fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
});
