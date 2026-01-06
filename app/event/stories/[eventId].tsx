import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Animated,
  PanResponder,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLocalization } from '../../../src/hooks';
import { Colors } from '../../../src/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 5000; // 5 seconds per story

// Mock stories data - all stories belong to ONE event story
const MOCK_EVENT_STORIES = [
  {
    id: 's1',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/story1/800/1200',
    caption: 'Getting ready for the big day!',
    contributor: {
      id: 'u1',
      firstName: 'Ahmed',
      firstNameAr: 'أحمد',
      lastName: 'Ali',
      lastNameAr: 'علي',
      profilePhotoUrl: null
    },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 's2',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/story2/800/1200',
    caption: 'Beautiful decorations',
    contributor: {
      id: 'u1',
      firstName: 'Ahmed',
      firstNameAr: 'أحمد',
      lastName: 'Ali',
      lastNameAr: 'علي',
      profilePhotoUrl: null
    },
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 's3',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/story3/800/1200',
    caption: '',
    contributor: {
      id: 'u2',
      firstName: 'Sara',
      firstNameAr: 'سارة',
      lastName: 'Hassan',
      lastNameAr: 'حسن',
      profilePhotoUrl: null
    },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's4',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/story4/800/1200',
    caption: 'Mabrook! 🎉',
    contributor: {
      id: 'u3',
      firstName: 'Mohammed',
      firstNameAr: 'محمد',
      lastName: 'Khalid',
      lastNameAr: 'خالد',
      profilePhotoUrl: null
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's5',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/story5/800/1200',
    caption: 'Food looks amazing',
    contributor: {
      id: 'u4',
      firstName: 'Fatima',
      firstNameAr: 'فاطمة',
      lastName: 'Omar',
      lastNameAr: 'عمر',
      profilePhotoUrl: null
    },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's6',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/story6/800/1200',
    caption: '',
    contributor: {
      id: 'u5',
      firstName: 'Khalid',
      firstNameAr: 'خالد',
      lastName: 'Ibrahim',
      lastNameAr: 'إبراهيم',
      profilePhotoUrl: null
    },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

type Story = typeof MOCK_EVENT_STORIES[0];

export default function EventStoriesScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isArabic } = useLocalization();
  const { colors } = useTheme();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const stories = MOCK_EVENT_STORIES;
  const currentStory = stories[currentIndex];

  // Get unique contributors for the avatars display
  const uniqueContributors = stories.reduce((acc, story) => {
    if (!acc.find(c => c.id === story.contributor.id)) {
      acc.push(story.contributor);
    }
    return acc;
  }, [] as typeof MOCK_EVENT_STORIES[0]['contributor'][]);

  const getContributorName = (contributor: Story['contributor']) => {
    const firstName = isArabic ? contributor.firstNameAr || contributor.firstName : contributor.firstName;
    const lastName = isArabic ? contributor.lastNameAr || contributor.lastName : contributor.lastName;
    return `${firstName} ${lastName}`;
  };

  const getInitials = (contributor: Story['contributor']) => {
    return `${contributor.firstName?.[0] || ''}${contributor.lastName?.[0] || ''}`.toUpperCase();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return isArabic ? 'الآن' : 'Just now';
    if (diffMins < 60) return isArabic ? `منذ ${diffMins} د` : `${diffMins}m ago`;
    return isArabic ? `منذ ${diffHours} س` : `${diffHours}h ago`;
  };

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev < stories.length - 1) {
        return prev + 1;
      } else {
        router.back();
        return prev;
      }
    });
  }, [stories.length, router]);

  const goToPrev = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev > 0) {
        return prev - 1;
      }
      return prev;
    });
  }, []);

  const startProgress = useCallback(() => {
    progressAnim.setValue(0);
    animationRef.current = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      useNativeDriver: false,
    });
    animationRef.current.start(({ finished }) => {
      if (finished) {
        goToNext();
      }
    });
  }, [goToNext]);

  useEffect(() => {
    if (!isPaused) {
      startProgress();
    }
    return () => {
      animationRef.current?.stop();
    };
  }, [currentIndex, isPaused, startProgress]);

  // Use refs to store current functions so panResponder always has latest
  const goToNextRef = useRef(goToNext);
  const goToPrevRef = useRef(goToPrev);
  const isArabicRef = useRef(isArabic);

  useEffect(() => {
    goToNextRef.current = goToNext;
    goToPrevRef.current = goToPrev;
    isArabicRef.current = isArabic;
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsPaused(true);
        animationRef.current?.stop();
      },
      onPanResponderRelease: (evt, gestureState) => {
        setIsPaused(false);

        // Tap to navigate (left half = prev, right half = next)
        if (Math.abs(gestureState.dx) < 10 && Math.abs(gestureState.dy) < 10) {
          const x = evt.nativeEvent.pageX;
          const isRightHalf = x > SCREEN_WIDTH / 2;

          // Instagram-style: right half = next, left half = previous
          // RTL: flipped - left half = next, right half = previous
          if (isArabicRef.current) {
            if (isRightHalf) {
              goToPrevRef.current();
            } else {
              goToNextRef.current();
            }
          } else {
            if (isRightHalf) {
              goToNextRef.current();
            } else {
              goToPrevRef.current();
            }
          }
        }

        // Swipe down to close
        if (gestureState.dy > 100) {
          router.back();
        }
      },
    })
  ).current;

  const handleAddStory = () => {
    router.push({
      pathname: '/event/camera/[eventId]',
      params: { eventId },
    });
  };

  if (stories.length === 0) {
    // Empty state - no stories yet
    return (
      <View style={[styles.container, { backgroundColor: '#000' }]}>
        <StatusBar barStyle="light-content" />
        <View style={[styles.emptyHeader, { paddingTop: insets.top + 8 }, isArabic && styles.emptyHeaderRTL]}>
          <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Feather name="camera" size={48} color="rgba(255,255,255,0.5)" />
          </View>
          <Text style={[styles.emptyTitle, isArabic && styles.textRTL]}>
            {isArabic ? 'لا توجد قصص بعد' : 'No Stories Yet'}
          </Text>
          <Text style={[styles.emptyText, isArabic && styles.textRTL]}>
            {isArabic
              ? 'كن أول من يشارك لحظات من هذه المناسبة'
              : 'Be the first to share moments from this event'}
          </Text>
          <TouchableOpacity style={[styles.addButton, isArabic && styles.addButtonRTL]} onPress={handleAddStory}>
            <Feather name="plus" size={20} color="#fff" />
            <Text style={styles.addButtonText}>
              {isArabic ? 'إضافة قصة' : 'Add Story'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <StatusBar barStyle="light-content" />

      {/* Story Image */}
      <Image
        source={{ uri: currentStory.url }}
        style={styles.storyImage}
        resizeMode="cover"
      />

      {/* Gradients */}
      <LinearGradient
        colors={['rgba(0,0,0,0.6)', 'transparent']}
        style={styles.topGradient}
      />
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)']}
        style={styles.bottomGradient}
      />

      {/* Progress Bars */}
      <View style={[styles.progressContainer, { paddingTop: insets.top + 8 }]}>
        {stories.map((_, index) => (
          <View key={index} style={styles.progressBarBg}>
            <Animated.View
              style={[
                styles.progressBarFill,
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
      <View style={[styles.header, { top: insets.top + 20 }, isArabic && styles.headerRTL]}>
        {/* Contributor Info */}
        <View style={[styles.contributorInfo, isArabic && styles.contributorInfoRTL]}>
          <View style={styles.contributorAvatar}>
            {currentStory.contributor.profilePhotoUrl ? (
              <Image
                source={{ uri: currentStory.contributor.profilePhotoUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>
                {getInitials(currentStory.contributor)}
              </Text>
            )}
          </View>
          <View style={[styles.contributorDetails, isArabic && styles.contributorDetailsRTL]}>
            <Text style={[styles.contributorName, isArabic && styles.textRTL]}>
              {getContributorName(currentStory.contributor)}
            </Text>
            <Text style={[styles.storyTime, isArabic && styles.textRTL]}>
              {getTimeAgo(currentStory.createdAt)}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={[styles.headerActions, isArabic && styles.headerActionsRTL]}>
          <TouchableOpacity style={styles.headerButton} onPress={handleAddStory}>
            <Feather name="camera" size={22} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
            <Feather name="x" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Caption */}
      {currentStory.caption && (
        <View style={[styles.captionContainer, { bottom: insets.bottom + 80 }]}>
          <Text style={styles.caption}>{currentStory.caption}</Text>
        </View>
      )}

      {/* Contributors Row */}
      <View style={[
        styles.contributorsRow,
        { bottom: insets.bottom + 20 },
        isArabic ? { right: 20, left: undefined } : { left: 20 },
        isArabic && styles.contributorsRowRTL
      ]}>
        <View style={[styles.contributorAvatars, isArabic && styles.contributorAvatarsRTL]}>
          {uniqueContributors.slice(0, 5).map((contributor, index) => (
            <View
              key={contributor.id}
              style={[
                styles.miniAvatar,
                {
                  marginLeft: isArabic ? 0 : (index === 0 ? 0 : -8),
                  marginRight: isArabic ? (index === 0 ? 0 : -8) : 0,
                  zIndex: 5 - index
                },
              ]}
            >
              <Text style={styles.miniAvatarText}>
                {contributor.firstName?.[0]}
              </Text>
            </View>
          ))}
          {uniqueContributors.length > 5 && (
            <View style={[styles.miniAvatar, isArabic ? { marginRight: -8 } : { marginLeft: -8 }]}>
              <Text style={styles.miniAvatarText}>+{uniqueContributors.length - 5}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.contributorsText, isArabic && styles.textRTL]}>
          {isArabic
            ? `${uniqueContributors.length} مشاركين`
            : `${uniqueContributors.length} contributors`}
        </Text>
      </View>

      {/* Story Counter */}
      <View style={[
        styles.storyCounter,
        { bottom: insets.bottom + 24 },
        isArabic ? { left: 20 } : { right: 20 }
      ]}>
        <Text style={styles.storyCounterText}>
          {currentIndex + 1}/{stories.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  storyImage: {
    ...StyleSheet.absoluteFillObject,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 8,
    gap: 4,
  },
  progressBarBg: {
    flex: 1,
    height: 2.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  headerRTL: {
    flexDirection: 'row-reverse',
  },
  contributorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  contributorInfoRTL: {
    flexDirection: 'row-reverse',
  },
  contributorAvatar: {
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
  contributorDetails: {
    gap: 2,
  },
  contributorDetailsRTL: {
    alignItems: 'flex-end',
  },
  textRTL: {
    textAlign: 'right',
  },
  contributorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  storyTime: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerActionsRTL: {
    flexDirection: 'row-reverse',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
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
    left: 16,
    right: 16,
  },
  caption: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  contributorsRow: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contributorsRowRTL: {
    flexDirection: 'row-reverse',
  },
  contributorAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contributorAvatarsRTL: {
    flexDirection: 'row-reverse',
  },
  miniAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  miniAvatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  contributorsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  storyCounter: {
    position: 'absolute',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  storyCounterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  // Empty State
  emptyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: 12,
    zIndex: 10,
  },
  emptyHeaderRTL: {
    flexDirection: 'row-reverse',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 25,
    gap: 8,
  },
  addButtonRTL: {
    flexDirection: 'row-reverse',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
