import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Alert,
  Animated,
  Platform,
  ScrollView,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalization } from '../../../src/hooks';
import { Colors } from '../../../src/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const LONG_PRESS_DELAY = 300;

// Lenses/Filters
const LENSES = [
  { id: 'none', name: 'Normal', nameAr: 'عادي', icon: 'circle-outline' },
  { id: 'vivid', name: 'Vivid', nameAr: 'زاهي', icon: 'sunny-outline' },
  { id: 'warm', name: 'Warm', nameAr: 'دافئ', icon: 'flame-outline' },
  { id: 'cool', name: 'Cool', nameAr: 'بارد', icon: 'snow-outline' },
  { id: 'bw', name: 'B&W', nameAr: 'أبيض وأسود', icon: 'contrast-outline' },
  { id: 'vintage', name: 'Vintage', nameAr: 'كلاسيكي', icon: 'film-outline' },
  { id: 'blur', name: 'Portrait', nameAr: 'بورتريه', icon: 'person-outline' },
];

export default function CameraScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isArabic } = useLocalization();

  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [flash, setFlash] = useState<'off' | 'on' | 'auto'>('off');
  const [selectedLens, setSelectedLens] = useState('none');
  const [showLenses, setShowLenses] = useState(true);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const didLongPress = useRef(false);

  // Recording animation
  useEffect(() => {
    if (isRecording) {
      // Progress ring animation
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 60000, // 60 seconds max
        useNativeDriver: false,
      }).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();

      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      pulseAnim.setValue(1);
      progressAnim.setValue(0);
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
        recordingTimer.current = null;
      }
      setRecordingDuration(0);
    }

    return () => {
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted) {
        await requestCameraPermission();
      }
      if (!micPermission?.granted) {
        await requestMicPermission();
      }
    })();
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const cycleFlash = () => {
    setFlash((current) => {
      if (current === 'off') return 'on';
      if (current === 'on') return 'auto';
      return 'off';
    });
  };

  const getFlashIcon = () => {
    if (flash === 'on') return 'flash';
    if (flash === 'auto') return 'flash-outline';
    return 'flash-off-outline';
  };

  const handlePressIn = () => {
    didLongPress.current = false;
    setShowLenses(false);

    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();

    longPressTimer.current = setTimeout(() => {
      didLongPress.current = true;
      startVideoRecording();
    }, LONG_PRESS_DELAY);
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (isRecording) {
      stopVideoRecording();
    } else if (!didLongPress.current) {
      takePhoto();
    }

    setTimeout(() => setShowLenses(true), 300);
  };

  const takePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.9,
        skipProcessing: Platform.OS === 'android',
      });
      if (photo) {
        router.push({
          pathname: '/event/camera/preview',
          params: {
            eventId,
            uri: photo.uri,
            type: 'photo',
            lens: selectedLens,
          },
        });
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert(
        isArabic ? 'خطأ' : 'Error',
        isArabic ? 'فشل في التقاط الصورة' : 'Failed to capture photo'
      );
    }
  };

  const startVideoRecording = async () => {
    if (!cameraRef.current) return;

    setIsRecording(true);
    try {
      const video = await cameraRef.current.recordAsync({
        maxDuration: 60,
      });
      if (video) {
        router.push({
          pathname: '/event/camera/preview',
          params: {
            eventId,
            uri: video.uri,
            type: 'video',
            lens: selectedLens,
          },
        });
      }
    } catch (error) {
      console.error('Failed to record video:', error);
      setIsRecording(false);
    }
  };

  const stopVideoRecording = () => {
    if (!cameraRef.current) return;
    setIsRecording(false);
    cameraRef.current.stopRecording();
  };

  // Permission screen
  if (!cameraPermission?.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#1a1a2e', '#16213e', '#0f3460']}
          style={styles.permissionGradient}
        >
          <View style={styles.permissionContent}>
            <View style={styles.permissionIconContainer}>
              <Ionicons name="camera" size={56} color="#fff" />
            </View>
            <Text style={styles.permissionTitle}>
              {isArabic ? 'الوصول للكاميرا' : 'Camera Access'}
            </Text>
            <Text style={styles.permissionText}>
              {isArabic
                ? 'نحتاج إذن الكاميرا لالتقاط صور وفيديوهات للمناسبة'
                : 'We need camera permission to capture photos and videos for the event'}
            </Text>
            <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
              <LinearGradient
                colors={[Colors.primary, Colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.permissionButtonGradient}
              >
                <Text style={styles.permissionButtonText}>
                  {isArabic ? 'السماح' : 'Allow Access'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={[styles.closeButtonTop, { top: insets.top + 12 }]}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera */}
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        flash={flash === 'auto' ? 'auto' : flash}
        mode="video"
      />

      {/* Top Bar */}
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.topButton} onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={32} color="#fff" />
        </TouchableOpacity>

        {isRecording ? (
          <View style={styles.recordingBadge}>
            <View style={styles.recordingDotLive} />
            <Text style={styles.recordingTimeText}>{formatDuration(recordingDuration)}</Text>
          </View>
        ) : (
          <View style={styles.topCenter}>
            <Text style={styles.eventLabel}>
              {isArabic ? 'قصة المناسبة' : 'Event Story'}
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.topButton} onPress={cycleFlash}>
          <Ionicons name={getFlashIcon()} size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Right Side Controls */}
      <View style={styles.sideControls}>
        <TouchableOpacity style={styles.sideButton} onPress={toggleCameraFacing}>
          <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Lenses */}
      {showLenses && !isRecording && (
        <View style={styles.lensesContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.lensesScroll}
          >
            {LENSES.map((lens) => (
              <TouchableOpacity
                key={lens.id}
                style={[
                  styles.lensItem,
                  selectedLens === lens.id && styles.lensItemActive,
                ]}
                onPress={() => setSelectedLens(lens.id)}
              >
                <View style={[
                  styles.lensIcon,
                  selectedLens === lens.id && styles.lensIconActive,
                ]}>
                  <Ionicons
                    name={lens.icon as any}
                    size={22}
                    color={selectedLens === lens.id ? Colors.primary : '#fff'}
                  />
                </View>
                <Text style={[
                  styles.lensName,
                  selectedLens === lens.id && styles.lensNameActive,
                ]}>
                  {isArabic ? lens.nameAr : lens.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Bottom Controls */}
      <View style={[styles.bottomContainer, { paddingBottom: insets.bottom }]}>
        <View style={styles.bottomBar}>
          {/* Hint */}
          {!isRecording && (
            <Text style={styles.hintText}>
              {isArabic ? 'اضغط للصورة • اضغط مطولاً للفيديو' : 'Tap for photo • Hold for video'}
            </Text>
          )}

          {/* Capture Button */}
          <View style={styles.captureContainer}>
            <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
              <Animated.View
                style={[
                  styles.captureOuter,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                {isRecording && (
                  <Animated.View
                    style={[
                      styles.progressRing,
                      {
                        borderColor: '#E53935',
                        borderRightColor: 'transparent',
                        transform: [
                          {
                            rotate: progressAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg'],
                            }),
                          },
                        ],
                      },
                    ]}
                  />
                )}
                <Animated.View
                  style={[
                    styles.captureInner,
                    isRecording && styles.captureInnerRecording,
                    isRecording && { transform: [{ scale: pulseAnim }] },
                  ]}
                >
                  {isRecording && <View style={styles.stopIcon} />}
                </Animated.View>
              </Animated.View>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  // Permission styles
  permissionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  permissionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  permissionButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  permissionButtonGradient: {
    paddingHorizontal: 48,
    paddingVertical: 16,
  },
  permissionButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  closeButtonTop: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Top bar
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
  topButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
  },
  eventLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
  },
  recordingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(229, 57, 53, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
  },
  recordingDotLive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  recordingTimeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },
  // Side controls
  sideControls: {
    position: 'absolute',
    right: 16,
    top: '45%',
    gap: 16,
  },
  sideButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Lenses
  lensesContainer: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
  },
  lensesScroll: {
    paddingHorizontal: 20,
    gap: 12,
  },
  lensItem: {
    alignItems: 'center',
    gap: 6,
  },
  lensItemActive: {},
  lensIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  lensIconActive: {
    backgroundColor: '#fff',
    borderColor: Colors.primary,
  },
  lensName: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  lensNameActive: {
    color: '#fff',
    fontWeight: '600',
  },
  // Bottom
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomBar: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  hintText: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  captureContainer: {
    alignItems: 'center',
  },
  captureOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#e0e0e0',
  },
  progressRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#E53935',
  },
  captureInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureInnerRecording: {
    backgroundColor: '#E53935',
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
});
