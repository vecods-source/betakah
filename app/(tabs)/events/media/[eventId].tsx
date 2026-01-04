import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  Image,
  Dimensions,
  Modal,
  TouchableOpacity,
  Pressable,
  StatusBar,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, useLocalization } from '../../../../src/hooks';
import { UIHeader } from '../../../../src/components/ui';
import {
  MediaGridItem,
  MediaFilterChips,
  MediaUploadFAB,
  CommentsPanel,
  GRID_ITEM_SIZE,
} from '../../../../src/components/media';
import type { FilterType } from '../../../../src/components/media';
import { Colors } from '../../../../src/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Mock media data
const MOCK_MEDIA = [
  {
    id: '1',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/event1/800/600',
    thumbnailUrl: 'https://picsum.photos/seed/event1/200/200',
    genderSection: 'ALL' as const,
    caption: 'Beautiful ceremony',
    uploader: { firstName: 'Ahmed', firstNameAr: 'أحمد', lastName: 'Ali', lastNameAr: 'علي', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    commentsCount: 5,
  },
  {
    id: '2',
    type: 'VIDEO' as const,
    url: 'https://picsum.photos/seed/event2/800/600',
    thumbnailUrl: 'https://picsum.photos/seed/event2/200/200',
    genderSection: 'MALE' as const,
    caption: 'Celebration dance',
    uploader: { firstName: 'Mohammed', firstNameAr: 'محمد', lastName: 'Hassan', lastNameAr: 'حسن', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    commentsCount: 3,
  },
  {
    id: '3',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/event3/800/600',
    thumbnailUrl: 'https://picsum.photos/seed/event3/200/200',
    genderSection: 'FEMALE' as const,
    caption: '',
    uploader: { firstName: 'Fatima', firstNameAr: 'فاطمة', lastName: 'Al-Thani', lastNameAr: 'الثاني', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    commentsCount: 8,
  },
  {
    id: '4',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/event4/800/600',
    thumbnailUrl: 'https://picsum.photos/seed/event4/200/200',
    genderSection: 'ALL' as const,
    caption: 'Group photo',
    uploader: { firstName: 'Sara', firstNameAr: 'سارة', lastName: 'Mohammed', lastNameAr: 'محمد', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    commentsCount: 12,
  },
  {
    id: '5',
    type: 'VIDEO' as const,
    url: 'https://picsum.photos/seed/event5/800/600',
    thumbnailUrl: 'https://picsum.photos/seed/event5/200/200',
    genderSection: 'ALL' as const,
    caption: 'Entrance',
    uploader: { firstName: 'Khalid', firstNameAr: 'خالد', lastName: 'Ibrahim', lastNameAr: 'إبراهيم', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    commentsCount: 2,
  },
  {
    id: '6',
    type: 'IMAGE' as const,
    url: 'https://picsum.photos/seed/event6/800/600',
    thumbnailUrl: 'https://picsum.photos/seed/event6/200/200',
    genderSection: 'MALE' as const,
    caption: '',
    uploader: { firstName: 'Omar', firstNameAr: 'عمر', lastName: 'Nasser', lastNameAr: 'ناصر', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    commentsCount: 0,
  },
];

// Mock comments
const MOCK_COMMENTS = [
  {
    id: 'c1',
    text: 'Amazing photo! The decorations look beautiful',
    user: { firstName: 'Sara', firstNameAr: 'سارة', lastName: 'Al-Thani', lastNameAr: 'الثاني', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'c2',
    text: 'Mabrook! 🎉',
    user: { firstName: 'Ahmed', firstNameAr: 'أحمد', lastName: 'Hassan', lastNameAr: 'حسن', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c3',
    text: 'Love the colors!',
    user: { firstName: 'Layla', firstNameAr: 'ليلى', lastName: 'Mahmoud', lastNameAr: 'محمود', profilePhotoUrl: null },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

export default function MediaGalleryScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isArabic } = useLocalization();
  const { screenBackground, textPrimary, textSecondary, cardBackground, colors, isDark } = useTheme();

  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [selectedMedia, setSelectedMedia] = useState<typeof MOCK_MEDIA[0] | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(MOCK_COMMENTS);
  const [showControls, setShowControls] = useState(true);

  // Filter media
  const filteredMedia = useMemo(() => {
    switch (activeFilter) {
      case 'PHOTOS':
        return MOCK_MEDIA.filter((m) => m.type === 'IMAGE');
      case 'VIDEOS':
        return MOCK_MEDIA.filter((m) => m.type === 'VIDEO');
      case 'MY_SECTION':
        // For mock, just show MALE section
        return MOCK_MEDIA.filter((m) => m.genderSection === 'MALE' || m.genderSection === 'ALL');
      default:
        return MOCK_MEDIA;
    }
  }, [activeFilter]);

  const handleMediaPress = (id: string) => {
    const media = MOCK_MEDIA.find((m) => m.id === id);
    if (media) {
      setSelectedMedia(media);
      setShowControls(true);
    }
  };

  const handleUploadPress = () => {
    Alert.alert(
      isArabic ? 'إضافة وسائط' : 'Add Media',
      isArabic ? 'اختر مصدر الوسائط' : 'Choose media source',
      [
        { text: isArabic ? 'الكاميرا' : 'Camera', onPress: () => {} },
        { text: isArabic ? 'المعرض' : 'Gallery', onPress: () => {} },
        { text: isArabic ? 'إلغاء' : 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleSendComment = (text: string) => {
    const newComment = {
      id: `c${Date.now()}`,
      text,
      user: { firstName: 'Me', firstNameAr: 'أنا', lastName: '', lastNameAr: '', profilePhotoUrl: null },
      createdAt: new Date().toISOString(),
    };
    setComments([newComment, ...comments]);
  };

  const handleDeleteComment = (commentId: string) => {
    setComments(comments.filter((c) => c.id !== commentId));
  };

  const closeViewer = () => {
    setSelectedMedia(null);
    setShowComments(false);
  };

  const toggleControls = () => {
    if (!showComments) {
      setShowControls(!showControls);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${Colors.primary}15` }]}>
        <Feather name="camera" size={40} color={Colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>
        {isArabic ? 'لا توجد وسائط' : 'No media yet'}
      </Text>
      <Text style={[styles.emptyText, { color: textSecondary }]}>
        {isArabic
          ? 'شارك صورك وفيديوهاتك من هذه المناسبة'
          : 'Share photos and videos from this event'}
      </Text>
    </View>
  );

  const getUploaderName = (media: typeof MOCK_MEDIA[0]) => {
    const firstName = isArabic ? media.uploader.firstNameAr : media.uploader.firstName;
    const lastName = isArabic ? media.uploader.lastNameAr : media.uploader.lastName;
    return `${firstName} ${lastName}`;
  };

  const formatViewerDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isArabic ? 'ar-QA' : 'en-QA', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      <UIHeader title={isArabic ? 'معرض الصور' : 'Event Media'} />

      {/* Filter Chips */}
      <MediaFilterChips activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Media Grid */}
      <FlatList
        data={filteredMedia}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MediaGridItem item={item} onPress={handleMediaPress} />}
        numColumns={3}
        contentContainerStyle={[
          styles.gridContent,
          filteredMedia.length === 0 && styles.gridContentEmpty,
        ]}
        columnWrapperStyle={styles.gridRow}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* Upload FAB */}
      <MediaUploadFAB onPress={handleUploadPress} />

      {/* Media Viewer Modal */}
      <Modal visible={!!selectedMedia} transparent animationType="fade" onRequestClose={closeViewer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.viewerContainer}>
          {/* Media */}
          <Pressable style={styles.viewerMedia} onPress={toggleControls}>
            {selectedMedia && (
              <Image
                source={{ uri: selectedMedia.url }}
                style={styles.viewerImage}
                resizeMode="contain"
              />
            )}
            {selectedMedia?.type === 'VIDEO' && (
              <View style={styles.playOverlay}>
                <Feather name="play-circle" size={64} color="rgba(255,255,255,0.9)" />
              </View>
            )}
          </Pressable>

          {/* Header Controls */}
          {showControls && !showComments && (
            <View style={[styles.viewerHeader, { paddingTop: insets.top + 8 }]}>
              <TouchableOpacity style={styles.viewerButton} onPress={closeViewer}>
                <Feather name="x" size={22} color="#fff" />
              </TouchableOpacity>
              <View style={styles.viewerHeaderRight}>
                <TouchableOpacity style={styles.viewerButton} onPress={() => setShowComments(true)}>
                  <Feather name="message-circle" size={20} color="#fff" />
                  {selectedMedia && selectedMedia.commentsCount > 0 && (
                    <View style={styles.commentBadge}>
                      <Text style={styles.commentBadgeText}>{selectedMedia.commentsCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity style={styles.viewerButton}>
                  <Feather name="download" size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.viewerButton}>
                  <Feather name="share" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Footer Info */}
          {showControls && !showComments && selectedMedia && (
            <View style={[styles.viewerFooter, { paddingBottom: insets.bottom + 16 }]}>
              <Text style={styles.viewerUploaderName}>{getUploaderName(selectedMedia)}</Text>
              <Text style={styles.viewerDate}>{formatViewerDate(selectedMedia.createdAt)}</Text>
              {selectedMedia.caption ? (
                <Text style={styles.viewerCaption}>{selectedMedia.caption}</Text>
              ) : null}
            </View>
          )}

          {/* Comments Panel */}
          <CommentsPanel
            visible={showComments}
            comments={comments}
            onClose={() => setShowComments(false)}
            onSendComment={handleSendComment}
            onDeleteComment={handleDeleteComment}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gridContent: {
    padding: 16,
    paddingBottom: 120,
  },
  gridContentEmpty: {
    flex: 1,
  },
  gridRow: {
    gap: 4,
    marginBottom: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  // Viewer styles
  viewerContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  viewerMedia: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerImage: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT * 0.6,
  },
  playOverlay: {
    position: 'absolute',
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
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  viewerHeaderRight: {
    flexDirection: 'row',
    gap: 8,
  },
  viewerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  commentBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  viewerFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  viewerUploaderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  viewerDate: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  viewerCaption: {
    fontSize: 14,
    color: '#fff',
    marginTop: 10,
    lineHeight: 20,
  },
});
