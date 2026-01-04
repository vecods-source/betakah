import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  StatusBar,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalization } from '../../hooks';
import { Colors } from '../../constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoryUser {
  firstName: string;
  firstNameAr?: string;
  lastName: string;
  lastNameAr?: string;
  profilePhotoUrl?: string | null;
}

interface Story {
  id: string;
  type: 'IMAGE' | 'VIDEO';
  url: string;
  caption?: string;
  user: StoryUser;
  createdAt: string;
  duration?: number; // Video duration in seconds
}

interface StoriesViewerProps {
  stories: Story[];
  initialIndex?: number;
  onClose: () => void;
  onStoryChange?: (index: number) => void;
}

const STORY_DURATION = 5000; // 5 seconds for images
const VIDEO_DURATION = 15000; // 15 seconds max for videos (for mockup)
const PROGRESS_BAR_HEIGHT = 3;

export function StoriesViewer({
  stories,
  initialIndex = 0,
  onClose,
  onStoryChange,
}: StoriesViewerProps) {
  const insets = useSafeAreaInsets();
  const { isArabic } = useLocalization();

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);

  const currentStory = stories[currentIndex];
  const isVideo = currentStory?.type === 'VIDEO';

  // Video player for current story (only if it's a video)
  const player = useVideoPlayer(isVideo ? currentStory.url : null, (player) => {
    if (isVideo) {
      player.loop = false;
      player.play();
    }
  });

  // Get user name
  const getUserName = (user: StoryUser) => {
    const firstName = isArabic ? user.firstNameAr || user.firstName : user.firstName;
    const lastName = isArabic ? user.lastNameAr || user.lastName : user.lastName;
    return `${firstName} ${lastName}`;
  };

  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return isArabic ? 'الآن' : 'Just now';
    if (diffMins < 60) return isArabic ? `منذ ${diffMins} د` : `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return isArabic ? `منذ ${diffHours} س` : `${diffHours}h ago`;
    return isArabic ? 'أمس' : 'Yesterday';
  };

  // Navigate to next story
  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      onStoryChange?.(currentIndex + 1);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose, onStoryChange]);

  // Navigate to previous story
  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      onStoryChange?.(currentIndex - 1);
    }
  }, [currentIndex, onStoryChange]);

  // Start progress animation
  const startProgress = useCallback(
    (duration: number = STORY_DURATION) => {
      progressAnim.setValue(0);
      progressAnimation.current = Animated.timing(progressAnim, {
        toValue: 1,
        duration,
        useNativeDriver: false,
      });
      progressAnimation.current.start(({ finished }) => {
        if (finished) {
          goToNext();
        }
      });
    },
    [progressAnim, goToNext]
  );

  // Pause/resume progress
  const pauseProgress = useCallback(() => {
    progressAnimation.current?.stop();
    setIsPaused(true);
    if (isVideo && player) {
      player.pause();
    }
  }, [isVideo, player]);

  const resumeProgress = useCallback(() => {
    setIsPaused(false);
    if (isVideo && player) {
      player.play();
    }
    // For simplicity in mockup, restart the animation
    startProgress(isVideo ? VIDEO_DURATION : STORY_DURATION);
  }, [isVideo, player, startProgress]);

  // Reset and start progress when story changes
  useEffect(() => {
    progressAnim.setValue(0);
    startProgress(isVideo ? VIDEO_DURATION : STORY_DURATION);

    return () => {
      progressAnimation.current?.stop();
    };
  }, [currentIndex, isVideo]);

  // Tap handler
  const handleTap = (event: any) => {
    const { locationX } = event.nativeEvent;
    const screenThird = SCREEN_WIDTH / 3;

    if (locationX < screenThird) {
      // Left third - go back
      goToPrevious();
    } else if (locationX > screenThird * 2) {
      // Right third - go forward
      goToNext();
    }
    // Middle third - do nothing (could show more info)
  };

  // Long press handlers
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pauseProgress();
      },
      onPanResponderRelease: (_, gestureState) => {
        if (Math.abs(gestureState.dy) > 100) {
          // Swipe down to close
          onClose();
        } else {
          resumeProgress();
        }
      },
      onPanResponderTerminate: () => {
        resumeProgress();
      },
    })
  ).current;

  if (!currentStory) return null;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="light-content" />

      {/* Story Content */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.storyContent}
        onPress={handleTap}
      >
        {isVideo && player ? (
          <VideoView
            player={player}
            style={styles.media}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: currentStory.url }}
            style={styles.media}
            resizeMode="cover"
          />
        )}
      </TouchableOpacity>

      {/* Progress Bars */}
      <View style={[styles.progressContainer, { top: insets.top + 8 }]}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width:
                    index < currentIndex
                      ? '100%'
                      : index === currentIndex
                      ? progressAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%'],
                        })
                      : '0%',
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={[styles.header, { top: insets.top + 20 }]}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            {currentStory.user.profilePhotoUrl ? (
              <Image
                source={{ uri: currentStory.user.profilePhotoUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {currentStory.user.firstName?.[0]}
                {currentStory.user.lastName?.[0]}
              </Text>
            )}
          </View>
          <View style={styles.userText}>
            <Text style={styles.userName}>{getUserName(currentStory.user)}</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(currentStory.createdAt)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Feather name="x" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Caption */}
      {currentStory.caption && (
        <View style={[styles.captionContainer, { bottom: insets.bottom + 24 }]}>
          <Text style={styles.caption}>{currentStory.caption}</Text>
        </View>
      )}

      {/* Paused Indicator */}
      {isPaused && (
        <View style={styles.pausedOverlay}>
          <Text style={styles.pausedText}>
            {isArabic ? 'متوقف مؤقتاً' : 'Paused'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyContent: {
    flex: 1,
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  progressContainer: {
    position: 'absolute',
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: 4,
    zIndex: 10,
  },
  progressBarBg: {
    flex: 1,
    height: PROGRESS_BAR_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: PROGRESS_BAR_HEIGHT / 2,
  },
  header: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  userText: {
    gap: 2,
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  timeAgo: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captionContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 10,
  },
  caption: {
    fontSize: 15,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  pausedOverlay: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pausedText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
});
