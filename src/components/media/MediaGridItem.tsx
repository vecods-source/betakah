import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const GRID_ITEM_SIZE = (SCREEN_WIDTH - 48 - 8) / 3; // padding 16*2 + gaps 4*2

type MediaType = 'IMAGE' | 'VIDEO';
type GenderSection = 'MALE' | 'FEMALE' | 'ALL';
type MediaStatus = 'PROCESSING' | 'READY' | 'FAILED';

interface MediaItem {
  id: string;
  type: MediaType;
  url: string;
  thumbnailUrl?: string;
  genderSection: GenderSection;
  status?: MediaStatus;
}

interface MediaGridItemProps {
  item: MediaItem;
  onPress: (id: string) => void;
}

export function MediaGridItem({ item, onPress }: MediaGridItemProps) {
  const isProcessing = item.status === 'PROCESSING';
  const isFailed = item.status === 'FAILED';
  const isVideo = item.type === 'VIDEO';
  const showGenderBadge = item.genderSection !== 'ALL';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item.id)}
      activeOpacity={0.9}
      disabled={isProcessing || isFailed}
    >
      {isProcessing ? (
        <View style={styles.processingContainer}>
          <ActivityIndicator size="small" color="#2c5282" />
          <Text style={styles.processingText}>Processing</Text>
        </View>
      ) : isFailed ? (
        <View style={styles.failedContainer}>
          <Feather name="alert-circle" size={24} color="#E53935" />
          <Text style={styles.failedText}>Failed</Text>
        </View>
      ) : (
        <>
          <Image
            source={{ uri: item.thumbnailUrl || item.url }}
            style={styles.image}
            resizeMode="cover"
          />

          {/* Video indicator */}
          {isVideo && (
            <View style={styles.videoIndicator}>
              <Feather name="play" size={14} color="#fff" />
            </View>
          )}

          {/* Gender section badge */}
          {showGenderBadge && (
            <LinearGradient
              colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)']}
              style={styles.genderBadge}
            >
              <Text style={styles.genderText}>
                {item.genderSection === 'MALE' ? 'M' : 'F'}
              </Text>
            </LinearGradient>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: GRID_ITEM_SIZE,
    height: GRID_ITEM_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  processingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    gap: 8,
  },
  processingText: {
    fontSize: 11,
    color: '#718096',
    fontWeight: '500',
  },
  failedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    gap: 8,
  },
  failedText: {
    fontSize: 11,
    color: '#E53935',
    fontWeight: '500',
  },
  videoIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genderBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  genderText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
});
