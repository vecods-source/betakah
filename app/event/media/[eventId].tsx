import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Pressable,
  StatusBar,
  Animated,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme, useLocalization } from '../../../src/hooks';
import { Colors } from '../../../src/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const GRID_GAP = 2;
const NUM_COLUMNS = 3;
const ITEM_SIZE = (SCREEN_WIDTH - GRID_GAP * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

type FilterType = 'ALL' | 'PHOTOS' | 'VIDEOS';

// Mock media data
const MOCK_MEDIA = [
  {
    id: '1',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/gallery1/800/800',
    thumbnailUrl: 'https://picsum.photos/seed/gallery1/400/400',
    uploader: { firstName: 'Ahmed', firstNameAr: 'أحمد', lastName: 'Ali', lastNameAr: 'علي' },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    likes: 24,
  },
  {
    id: '2',
    type: 'VIDEO' as const,
    url: 'https://picsum.photos/seed/gallery2/800/800',
    thumbnailUrl: 'https://picsum.photos/seed/gallery2/400/400',
    uploader: { firstName: 'Mohammed', firstNameAr: 'محمد', lastName: 'Hassan', lastNameAr: 'حسن' },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    likes: 18,
  },
  {
    id: '3',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/gallery3/800/800',
    thumbnailUrl: 'https://picsum.photos/seed/gallery3/400/400',
    uploader: { firstName: 'Fatima', firstNameAr: 'فاطمة', lastName: 'Omar', lastNameAr: 'عمر' },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 42,
  },
  {
    id: '4',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/gallery4/800/800',
    thumbnailUrl: 'https://picsum.photos/seed/gallery4/400/400',
    uploader: { firstName: 'Sara', firstNameAr: 'سارة', lastName: 'Khalid', lastNameAr: 'خالد' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 31,
  },
  {
    id: '5',
    type: 'VIDEO' as const,
    url: 'https://picsum.photos/seed/gallery5/800/800',
    thumbnailUrl: 'https://picsum.photos/seed/gallery5/400/400',
    uploader: { firstName: 'Khalid', firstNameAr: 'خالد', lastName: 'Ibrahim', lastNameAr: 'إبراهيم' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 15,
  },
  {
    id: '6',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/gallery6/800/800',
    thumbnailUrl: 'https://picsum.photos/seed/gallery6/400/400',
    uploader: { firstName: 'Noura', firstNameAr: 'نورة', lastName: 'Salem', lastNameAr: 'سالم' },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 28,
  },
  {
    id: '7',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/gallery7/800/800',
    thumbnailUrl: 'https://picsum.photos/seed/gallery7/400/400',
    uploader: { firstName: 'Omar', firstNameAr: 'عمر', lastName: 'Nasser', lastNameAr: 'ناصر' },
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 19,
  },
  {
    id: '8',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/gallery8/800/800',
    thumbnailUrl: 'https://picsum.photos/seed/gallery8/400/400',
    uploader: { firstName: 'Layla', firstNameAr: 'ليلى', lastName: 'Ahmed', lastNameAr: 'أحمد' },
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 36,
  },
  {
    id: '9',
    type: 'VIDEO' as const,
    url: 'https://picsum.photos/seed/gallery9/800/800',
    thumbnailUrl: 'https://picsum.photos/seed/gallery9/400/400',
    uploader: { firstName: 'Hassan', firstNameAr: 'حسن', lastName: 'Ali', lastNameAr: 'علي' },
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    likes: 22,
  },
];

type MediaItem = typeof MOCK_MEDIA[0];

export default function MediaGalleryScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isArabic } = useLocalization();
  const { screenBackground, textPrimary, textSecondary, cardBackground, colors, isDark } = useTheme();

  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Filter media
  const filteredMedia = useMemo(() => {
    switch (activeFilter) {
      case 'PHOTOS':
        return MOCK_MEDIA.filter((m) => m.type === 'IMAGE');
      case 'VIDEOS':
        return MOCK_MEDIA.filter((m) => m.type === 'VIDEO');
      default:
        return MOCK_MEDIA;
    }
  }, [activeFilter]);

  const photoCount = MOCK_MEDIA.filter(m => m.type === 'IMAGE').length;
  const videoCount = MOCK_MEDIA.filter(m => m.type === 'VIDEO').length;

  const handleMediaPress = (item: MediaItem, index: number) => {
    setSelectedMedia(item);
    setSelectedIndex(index);
  };

  const closeViewer = () => {
    setSelectedMedia(null);
  };

  const goToCamera = () => {
    router.push({
      pathname: '/event/camera/[eventId]',
      params: { eventId },
    });
  };

  const getUploaderName = (item: MediaItem) => {
    const firstName = isArabic ? item.uploader.firstNameAr : item.uploader.firstName;
    return firstName;
  };

  const renderGridItem = ({ item, index }: { item: MediaItem; index: number }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handleMediaPress(item, index)}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: item.thumbnailUrl }}
        style={styles.gridImage}
      />
      {item.type === 'VIDEO' && (
        <View style={styles.videoIndicator}>
          <Ionicons name="play" size={16} color="#fff" />
        </View>
      )}
      {/* Subtle gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.3)']}
        style={styles.gridOverlay}
      />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}>
        <Feather name="image" size={40} color={textSecondary} />
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>
        {isArabic ? 'لا توجد صور بعد' : 'No photos yet'}
      </Text>
      <Text style={[styles.emptyText, { color: textSecondary }]}>
        {isArabic
          ? 'كن أول من يشارك لحظات من هذه المناسبة'
          : 'Be the first to share moments from this event'}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={goToCamera}>
        <Feather name="camera" size={20} color="#fff" />
        <Text style={styles.emptyButtonText}>
          {isArabic ? 'التقط صورة' : 'Take a Photo'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const filters: { key: FilterType; label: string; labelAr: string }[] = [
    { key: 'ALL', label: 'All', labelAr: 'الكل' },
    { key: 'PHOTOS', label: 'Photos', labelAr: 'صور' },
    { key: 'VIDEOS', label: 'Videos', labelAr: 'فيديو' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: isDark ? colors.gray[200] : colors.gray[100] }]}
          onPress={() => router.back()}
        >
          <Feather name={isArabic ? 'arrow-right' : 'arrow-left'} size={22} color={textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: textPrimary }]}>
            {isArabic ? 'المعرض' : 'Gallery'}
          </Text>
          <Text style={[styles.headerSubtitle, { color: textSecondary }]}>
            {photoCount} {isArabic ? 'صور' : 'photos'} • {videoCount} {isArabic ? 'فيديو' : 'videos'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: Colors.primary }]}
          onPress={goToCamera}
        >
          <Feather name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.key;
            return (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterTab,
                  isActive && styles.filterTabActive,
                  { backgroundColor: isActive ? Colors.primary : (isDark ? colors.gray[200] : colors.gray[100]) },
                ]}
                onPress={() => setActiveFilter(filter.key)}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: isActive ? '#fff' : textSecondary },
                  ]}
                >
                  {isArabic ? filter.labelAr : filter.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Media Grid */}
      <FlatList
        data={filteredMedia}
        keyExtractor={(item) => item.id}
        renderItem={renderGridItem}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={[
          styles.gridContent,
          filteredMedia.length === 0 && styles.gridContentEmpty,
        ]}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <View style={StyleSheet.absoluteFill}>
          <StatusBar barStyle="light-content" />
          <Pressable style={styles.viewerBackdrop} onPress={closeViewer}>
            <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
          </Pressable>

          {/* Full Screen Image */}
          <View style={styles.viewerContent}>
            <Image
              source={{ uri: selectedMedia.url }}
              style={styles.viewerImage}
              resizeMode="contain"
            />

            {selectedMedia.type === 'VIDEO' && (
              <View style={styles.playButton}>
                <Ionicons name="play" size={40} color="#fff" />
              </View>
            )}
          </View>

          {/* Header */}
          <View style={[styles.viewerHeader, { paddingTop: insets.top + 8 }]}>
            <TouchableOpacity style={styles.viewerButton} onPress={closeViewer}>
              <Feather name="x" size={24} color="#fff" />
            </TouchableOpacity>

            <View style={styles.viewerActions}>
              <TouchableOpacity style={styles.viewerButton}>
                <Feather name="heart" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewerButton}>
                <Feather name="download" size={22} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewerButton}>
                <Feather name="share" size={22} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={[styles.viewerFooter, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.uploaderRow}>
              <View style={styles.uploaderAvatar}>
                <Text style={styles.uploaderAvatarText}>
                  {selectedMedia.uploader.firstName[0]}
                </Text>
              </View>
              <View>
                <Text style={styles.uploaderName}>{getUploaderName(selectedMedia)}</Text>
                <Text style={styles.uploadTime}>
                  {new Date(selectedMedia.createdAt).toLocaleDateString(isArabic ? 'ar-QA' : 'en-QA', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
            <View style={styles.likesContainer}>
              <Feather name="heart" size={16} color="#fff" />
              <Text style={styles.likesText}>{selectedMedia.likes}</Text>
            </View>
          </View>

          {/* Navigation Indicators */}
          <View style={styles.navIndicators}>
            <Text style={styles.navIndicatorText}>
              {selectedIndex + 1} / {filteredMedia.length}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Filters
  filterContainer: {
    marginBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  filterTabActive: {},
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Grid
  gridContent: {
    paddingBottom: 100,
  },
  gridContentEmpty: {
    flex: 1,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginRight: GRID_GAP,
    marginBottom: GRID_GAP,
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  gridOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  videoIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
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
    borderRadius: 25,
    gap: 10,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },

  // Viewer
  viewerBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  viewerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.7,
  },
  playButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  viewerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  viewerFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  uploaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  uploaderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploaderAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  uploaderName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  uploadTime: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  navIndicators: {
    position: 'absolute',
    top: '50%',
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  navIndicatorText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
});
