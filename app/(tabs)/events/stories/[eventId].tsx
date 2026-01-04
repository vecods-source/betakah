import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLocalization } from '../../../../src/hooks';
import { UIHeader } from '../../../../src/components/ui';
import { StoriesViewer } from '../../../../src/components/media';
import { Colors } from '../../../../src/constants/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STORY_ITEM_SIZE = (SCREEN_WIDTH - 48 - 16) / 3;

// Mock stories data grouped by user
const MOCK_STORIES = [
  {
    id: 's1',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/story1/800/1200',
    caption: 'Getting ready for the big day!',
    user: { firstName: 'Ahmed', firstNameAr: 'أحمد', lastName: 'Ali', lastNameAr: 'علي', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 's2',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/story2/800/1200',
    caption: 'Beautiful decorations',
    user: { firstName: 'Ahmed', firstNameAr: 'أحمد', lastName: 'Ali', lastNameAr: 'علي', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 's3',
    type: 'VIDEO' as const,
    url: 'https://picsum.photos/seed/story3/800/1200',
    caption: '',
    user: { firstName: 'Sara', firstNameAr: 'سارة', lastName: 'Hassan', lastNameAr: 'حسن', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's4',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/story4/800/1200',
    caption: 'Mabrook! 🎉',
    user: { firstName: 'Mohammed', firstNameAr: 'محمد', lastName: 'Khalid', lastNameAr: 'خالد', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's5',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/story5/800/1200',
    caption: 'Food looks amazing',
    user: { firstName: 'Fatima', firstNameAr: 'فاطمة', lastName: 'Omar', lastNameAr: 'عمر', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 's6',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/story6/800/1200',
    caption: '',
    user: { firstName: 'Khalid', firstNameAr: 'خالد', lastName: 'Ibrahim', lastNameAr: 'إبراهيم', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
];

interface StoryGroup {
  id: string;
  user: typeof MOCK_STORIES[0]['user'];
  stories: typeof MOCK_STORIES;
  latestAt: string;
  hasUnviewed: boolean;
}

export default function EventStoriesScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isArabic } = useLocalization();
  const { screenBackground, cardBackground, textPrimary, textSecondary, colors, isDark } = useTheme();

  const [viewingStories, setViewingStories] = useState<typeof MOCK_STORIES | null>(null);
  const [viewingIndex, setViewingIndex] = useState(0);

  // Group stories by user
  const storyGroups = useMemo(() => {
    const groups: Record<string, StoryGroup> = {};

    MOCK_STORIES.forEach((story) => {
      const key = `${story.user.firstName}-${story.user.lastName}`;
      if (!groups[key]) {
        groups[key] = {
          id: key,
          user: story.user,
          stories: [],
          latestAt: story.createdAt,
          hasUnviewed: true, // For mock, all are unviewed
        };
      }
      groups[key].stories.push(story);
      if (new Date(story.createdAt) > new Date(groups[key].latestAt)) {
        groups[key].latestAt = story.createdAt;
      }
    });

    // Sort by latest story time
    return Object.values(groups).sort(
      (a, b) => new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime()
    );
  }, []);

  const getUserName = (user: typeof MOCK_STORIES[0]['user']) => {
    const firstName = isArabic ? user.firstNameAr || user.firstName : user.firstName;
    return firstName;
  };

  const getInitials = (user: typeof MOCK_STORIES[0]['user']) => {
    const firstName = isArabic ? user.firstNameAr || user.firstName : user.firstName;
    const lastName = isArabic ? user.lastNameAr || user.lastName : user.lastName;
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const handleStoryPress = (group: StoryGroup) => {
    setViewingStories(group.stories);
    setViewingIndex(0);
  };

  const handleAddStory = () => {
    router.push({
      pathname: '/event/camera/[eventId]',
      params: { eventId },
    });
  };

  const renderStoryGroup = ({ item, index }: { item: StoryGroup; index: number }) => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={() => handleStoryPress(item)}
      activeOpacity={0.8}
    >
      {/* Thumbnail with gradient ring */}
      <View style={styles.storyRingContainer}>
        <LinearGradient
          colors={item.hasUnviewed ? [Colors.primary, Colors.primaryDark] : [colors.gray[300], colors.gray[300]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.storyRing}
        >
          <View style={[styles.storyThumbContainer, { backgroundColor: cardBackground }]}>
            <Image
              source={{ uri: item.stories[0].url }}
              style={styles.storyThumb}
            />
            {item.stories.length > 1 && (
              <View style={styles.storyCount}>
                <Text style={styles.storyCountText}>{item.stories.length}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>

      {/* User name */}
      <Text
        style={[styles.storyUserName, { color: textPrimary }]}
        numberOfLines={1}
      >
        {getUserName(item.user)}
      </Text>
    </TouchableOpacity>
  );

  const renderAddStory = () => (
    <TouchableOpacity
      style={styles.storyItem}
      onPress={handleAddStory}
      activeOpacity={0.8}
    >
      <View style={styles.addStoryContainer}>
        <View style={[styles.addStoryCircle, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}>
          <Feather name="plus" size={28} color={Colors.primary} />
        </View>
      </View>
      <Text style={[styles.storyUserName, { color: textPrimary }]}>
        {isArabic ? 'أضف قصة' : 'Add Story'}
      </Text>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${Colors.primary}15` }]}>
        <MaterialCommunityIcons name="movie-open-outline" size={48} color={Colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>
        {isArabic ? 'لا توجد قصص' : 'No Stories Yet'}
      </Text>
      <Text style={[styles.emptyText, { color: textSecondary }]}>
        {isArabic
          ? 'كن أول من يشارك لحظات من هذه المناسبة'
          : 'Be the first to share moments from this event'}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddStory}>
        <Feather name="camera" size={18} color="#fff" />
        <Text style={styles.emptyButtonText}>
          {isArabic ? 'إضافة قصة' : 'Add Story'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      <UIHeader
        title={isArabic ? 'القصص' : 'Stories'}
        rightAction={
          <TouchableOpacity style={styles.cameraButton} onPress={handleAddStory}>
            <Feather name="camera" size={22} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      {/* Info Banner */}
      <View style={[styles.infoBanner, { backgroundColor: isDark ? colors.gray[200] : `${Colors.primary}10` }]}>
        <Feather name="clock" size={16} color={Colors.primary} />
        <Text style={[styles.infoBannerText, { color: textSecondary }]}>
          {isArabic
            ? 'القصص تختفي بعد انتهاء المناسبة بـ 8 ساعات'
            : 'Stories disappear 8 hours after the event ends'}
        </Text>
      </View>

      {storyGroups.length > 0 ? (
        <FlatList
          data={storyGroups}
          keyExtractor={(item) => item.id}
          renderItem={renderStoryGroup}
          numColumns={3}
          contentContainerStyle={styles.gridContent}
          columnWrapperStyle={styles.gridRow}
          ListHeaderComponent={renderAddStory}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyWrapper}>
          {renderAddStory()}
          {renderEmptyState()}
        </View>
      )}

      {/* Stories Viewer Modal */}
      <Modal
        visible={!!viewingStories}
        transparent
        animationType="fade"
        onRequestClose={() => setViewingStories(null)}
      >
        {viewingStories && (
          <StoriesViewer
            stories={viewingStories}
            initialIndex={viewingIndex}
            onClose={() => setViewingStories(null)}
            onStoryChange={setViewingIndex}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cameraButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    gap: 10,
  },
  infoBannerText: {
    fontSize: 13,
    flex: 1,
  },
  gridContent: {
    padding: 16,
    paddingBottom: 100,
  },
  gridRow: {
    gap: 8,
    marginBottom: 16,
  },
  storyItem: {
    width: STORY_ITEM_SIZE,
    alignItems: 'center',
  },
  storyRingContainer: {
    marginBottom: 8,
  },
  storyRing: {
    width: STORY_ITEM_SIZE - 8,
    height: STORY_ITEM_SIZE - 8,
    borderRadius: (STORY_ITEM_SIZE - 8) / 2,
    padding: 3,
  },
  storyThumbContainer: {
    flex: 1,
    borderRadius: (STORY_ITEM_SIZE - 14) / 2,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#fff',
  },
  storyThumb: {
    width: '100%',
    height: '100%',
  },
  storyCount: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  storyCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  storyUserName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  addStoryContainer: {
    width: STORY_ITEM_SIZE - 8,
    height: STORY_ITEM_SIZE - 8,
    marginBottom: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addStoryCircle: {
    width: STORY_ITEM_SIZE - 14,
    height: STORY_ITEM_SIZE - 14,
    borderRadius: (STORY_ITEM_SIZE - 14) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  emptyWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -60,
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
