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
  Alert,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Sharing from 'expo-sharing';
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

  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCaptionInput, setShowCaptionInput] = useState(false);

  const isVideo = type === 'video';

  // Video player for preview
  const player = useVideoPlayer(isVideo ? uri : null, (player) => {
    if (isVideo) {
      player.loop = true;
      player.play();
    }
  });

  const handleShare = async () => {
    Keyboard.dismiss();
    setIsUploading(true);

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      Alert.alert(
        isArabic ? 'تم!' : 'Sent!',
        isArabic
          ? 'تمت إضافة الوسائط إلى قصة المناسبة'
          : 'Added to event story',
        [
          {
            text: isArabic ? 'حسناً' : 'OK',
            onPress: () => {
              router.replace({
                pathname: '/event/[id]',
                params: { id: eventId },
              });
            },
          },
        ]
      );
    }, 1500);
  };

  const handleDiscard = () => {
    router.back();
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert(
          isArabic ? 'غير متاح' : 'Not Available',
          isArabic
            ? 'المشاركة غير متاحة على هذا الجهاز'
            : 'Sharing is not available on this device',
        );
        setIsDownloading(false);
        return;
      }

      // Share the file (allows saving to gallery via share sheet)
      if (uri) {
        await Sharing.shareAsync(uri, {
          mimeType: isVideo ? 'video/mp4' : 'image/jpeg',
          dialogTitle: isArabic ? 'حفظ الملف' : 'Save File',
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'فشل حفظ الملف' : 'Failed to save file',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCaptionToggle = () => {
    setShowCaptionInput(!showCaptionInput);
    if (!showCaptionInput) {
      // Focus will happen automatically
    } else {
      Keyboard.dismiss();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Full Screen Media */}
      <View style={styles.mediaContainer}>
        {isVideo && player ? (
          <VideoView
            player={player}
            style={styles.media}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: uri || '' }}
            style={styles.media}
            resizeMode="cover"
          />
        )}
      </View>

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handleDiscard}
        >
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="download-outline" size={26} color="#fff" />
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleCaptionToggle}
          >
            <Ionicons name="text" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Caption Input Overlay */}
      {showCaptionInput && (
        <View style={styles.captionOverlay}>
          <TextInput
            style={[
              styles.captionInput,
              { textAlign: isArabic ? 'right' : 'left' },
            ]}
            placeholder={isArabic ? 'أضف تعليقاً...' : 'Add a caption...'}
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={caption}
            onChangeText={setCaption}
            multiline
            maxLength={150}
            autoFocus
            onBlur={() => !caption && setShowCaptionInput(false)}
          />
        </View>
      )}

      {/* Caption Display (when not editing) */}
      {caption && !showCaptionInput && (
        <TouchableOpacity
          style={styles.captionDisplay}
          onPress={handleCaptionToggle}
        >
          <Text style={[styles.captionText, { textAlign: isArabic ? 'right' : 'left' }]}>
            {caption}
          </Text>
        </TouchableOpacity>
      )}

      {/* Bottom Actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom + 20 }]}>
        {/* Send Button */}
        <TouchableOpacity
          style={[styles.sendButton, isUploading && styles.sendButtonDisabled]}
          onPress={handleShare}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.sendButtonText}>
                {isArabic ? 'قصتي' : 'My Story'}
              </Text>
              <Ionicons name="send" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  mediaContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  media: {
    flex: 1,
  },

  // Top Bar
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // Caption
  captionOverlay: {
    position: 'absolute',
    top: '40%',
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    padding: 16,
  },
  captionInput: {
    fontSize: 18,
    color: '#fff',
    minHeight: 50,
    lineHeight: 26,
  },
  captionDisplay: {
    position: 'absolute',
    bottom: 140,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    padding: 12,
  },
  captionText: {
    fontSize: 16,
    color: '#fff',
    lineHeight: 22,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 10,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
