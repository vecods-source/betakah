import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalization, useTheme } from '../../../src/hooks';
import { Colors } from '../../../src/constants/colors';

export default function MediaPreviewScreen() {
  const { eventId, uri, type } = useLocalSearchParams<{
    eventId: string;
    uri: string;
    type: 'photo' | 'video';
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isArabic } = useLocalization();
  const { cardBackground, textPrimary, textSecondary, colors } = useTheme();

  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const isVideo = type === 'video';

  // Video player for preview (only if it's a video)
  const player = useVideoPlayer(isVideo ? uri : null, (player) => {
    if (isVideo) {
      player.loop = true;
      player.play();
    }
  });

  const handleShare = async () => {
    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      setIsUploading(false);
      Alert.alert(
        isArabic ? 'تم المشاركة!' : 'Shared!',
        isArabic
          ? 'تمت إضافة الوسائط إلى قصة المناسبة'
          : 'Your media has been added to the event story',
        [
          {
            text: isArabic ? 'حسناً' : 'OK',
            onPress: () => {
              // Navigate back to event media
              router.replace({
                pathname: '/(tabs)/events/media/[eventId]',
                params: { eventId },
              });
            },
          },
        ]
      );
    }, 1500);
  };

  const handleDiscard = () => {
    Alert.alert(
      isArabic ? 'تجاهل الوسائط؟' : 'Discard Media?',
      isArabic
        ? 'سيتم حذف هذه الوسائط ولا يمكن استردادها'
        : 'This media will be deleted and cannot be recovered',
      [
        { text: isArabic ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isArabic ? 'تجاهل' : 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleDiscard}>
          <Feather name="x" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isArabic ? 'معاينة' : 'Preview'}
        </Text>
        <View style={styles.headerButton} />
      </View>

      {/* Media Preview */}
      <View style={styles.mediaContainer}>
        {isVideo && player ? (
          <VideoView
            player={player}
            style={styles.media}
            contentFit="contain"
            nativeControls
          />
        ) : (
          <Image
            source={{ uri: uri || '' }}
            style={styles.media}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Caption Input */}
      <View style={[styles.captionContainer, { backgroundColor: cardBackground }]}>
        <ScrollView
          contentContainerStyle={styles.captionContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={[
              styles.captionInput,
              { color: textPrimary, textAlign: isArabic ? 'right' : 'left' },
            ]}
            placeholder={isArabic ? 'أضف تعليقاً...' : 'Add a caption...'}
            placeholderTextColor={colors.gray[400]}
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={200}
          />

          {/* Character count */}
          <Text style={[styles.charCount, { color: textSecondary }]}>
            {caption.length}/200
          </Text>

          {/* Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Feather name="eye" size={16} color={textSecondary} />
              <Text style={[styles.infoText, { color: textSecondary }]}>
                {isArabic
                  ? 'سيتم عرض الوسائط في قسمك تلقائياً'
                  : 'Media will be shown in your section automatically'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Feather name="clock" size={16} color={textSecondary} />
              <Text style={[styles.infoText, { color: textSecondary }]}>
                {isArabic
                  ? 'ستظهر في القصة حتى انتهاء المناسبة + 8 ساعات'
                  : 'Will appear in story until event ends + 8 hours'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Share Button */}
        <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[styles.shareButton, isUploading && styles.shareButtonDisabled]}
            onPress={handleShare}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather name="send" size={20} color="#fff" />
                <Text style={styles.shareButtonText}>
                  {isArabic ? 'مشاركة في القصة' : 'Share to Story'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  mediaContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  captionContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '40%',
  },
  captionContent: {
    padding: 20,
  },
  captionInput: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 60,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
  },
  infoSection: {
    marginTop: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
  },
  shareButtonDisabled: {
    opacity: 0.7,
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
