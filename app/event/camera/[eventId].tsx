import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Animated,
  Platform,
  PanResponder,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions, useMicrophonePermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalization } from '../../../src/hooks';
import { Colors } from '../../../src/constants/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CAPTURE_SIZE = 80;
const CAPTURE_OUTER_SIZE = CAPTURE_SIZE + 12;
const LONG_PRESS_DELAY = 200;
const MAX_VIDEO_DURATION = 60; // seconds
const LOCK_THRESHOLD = -100; // How far up to slide to lock

export default function CameraScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isArabic } = useLocalization();

  const cameraRef = useRef<CameraView>(null);
  const [facing, setFacing] = useState<CameraType>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [flash, setFlash] = useState<'off' | 'on'>('off');

  // Refs to track current state for PanResponder (avoids stale closures)
  const isRecordingRef = useRef(false);
  const isLockedRef = useRef(false);

  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [micPermission, requestMicPermission] = useMicrophonePermissions();

  // Animations
  const captureScale = useRef(new Animated.Value(1)).current;
  const innerScale = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const ringOpacity = useRef(new Animated.Value(1)).current;
  const lockSlideY = useRef(new Animated.Value(0)).current;
  const lockOpacity = useRef(new Animated.Value(0)).current;
  const lockScale = useRef(new Animated.Value(1)).current;

  const recordingTimer = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const didLongPress = useRef(false);
  const progressAnimation = useRef<Animated.CompositeAnimation | null>(null);
  const isSliding = useRef(false);

  // Keep refs in sync with state for PanResponder
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  useEffect(() => {
    isLockedRef.current = isLocked;
  }, [isLocked]);

  // Pan responder for capture button with lock gesture
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        // Press down - start recording detection
        didLongPress.current = false;

        // Press down animation
        Animated.parallel([
          Animated.spring(captureScale, {
            toValue: 0.92,
            useNativeDriver: true,
            friction: 6,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.7,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();

        // Long press detection for video
        longPressTimer.current = setTimeout(() => {
          didLongPress.current = true;
          startVideoRecording();
        }, LONG_PRESS_DELAY);
      },
      onPanResponderMove: (_, gestureState) => {
        if (isRecordingRef.current && !isLockedRef.current && gestureState.dy < 0) {
          isSliding.current = true;
          // Clamp the slide value (only allow upward movement, between LOCK_THRESHOLD and 0)
          const slideValue = Math.max(gestureState.dy, LOCK_THRESHOLD);
          lockSlideY.setValue(slideValue);

          // Scale lock icon when close to threshold
          const progress = Math.min(Math.abs(gestureState.dy) / Math.abs(LOCK_THRESHOLD), 1);
          lockScale.setValue(1 + progress * 0.3);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        // Release animation
        Animated.parallel([
          Animated.spring(captureScale, {
            toValue: 1,
            useNativeDriver: true,
            friction: 6,
          }),
          Animated.timing(ringOpacity, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();

        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }

        // Check if should lock
        if (gestureState.dy < LOCK_THRESHOLD && isRecordingRef.current) {
          // Lock the recording
          setIsLocked(true);
          isLockedRef.current = true;
          isSliding.current = false;
          Animated.parallel([
            Animated.spring(lockSlideY, {
              toValue: LOCK_THRESHOLD,
              useNativeDriver: true,
            }),
            Animated.timing(lockOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        } else if (isRecordingRef.current && !isLockedRef.current) {
          // Stop recording if not locked
          isSliding.current = false;
          stopVideoRecording();
          // Reset position
          Animated.spring(lockSlideY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          lockScale.setValue(1);
        } else if (!didLongPress.current && !isRecordingRef.current) {
          // Take photo on tap
          takePhoto();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (isRecording) {
      // Show lock icon
      Animated.timing(lockOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Animate inner circle to small square
      Animated.spring(innerScale, {
        toValue: 0.5,
        useNativeDriver: true,
        friction: 6,
      }).start();

      // Start progress ring animation
      progressAnimation.current = Animated.timing(progressAnim, {
        toValue: 1,
        duration: MAX_VIDEO_DURATION * 1000,
        useNativeDriver: false,
      });
      progressAnimation.current.start();

      // Recording timer
      recordingTimer.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= MAX_VIDEO_DURATION - 1) {
            stopVideoRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      // Hide lock icon
      Animated.timing(lockOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // Reset animations
      Animated.spring(innerScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
      }).start();

      progressAnim.setValue(0);
      lockSlideY.setValue(0);
      lockScale.setValue(1);
      setIsLocked(false);

      if (progressAnimation.current) {
        progressAnimation.current.stop();
      }

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

  const toggleFlash = () => {
    setFlash((current) => (current === 'off' ? 'on' : 'off'));
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
        maxDuration: MAX_VIDEO_DURATION,
      });
      if (video) {
        router.push({
          pathname: '/event/camera/preview',
          params: {
            eventId,
            uri: video.uri,
            type: 'video',
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

  // Progress ring calculation
  const progressRotation = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Permission screen
  if (!cameraPermission?.granted) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={['#000', '#1a1a1a']}
          style={styles.permissionContainer}
        >
          <View style={styles.permissionContent}>
            <View style={styles.permissionIconWrapper}>
              <Ionicons name="camera" size={48} color="#fff" />
            </View>
            <Text style={styles.permissionTitle}>
              {isArabic ? 'الوصول للكاميرا' : 'Camera Access'}
            </Text>
            <Text style={styles.permissionText}>
              {isArabic
                ? 'نحتاج إذن الكاميرا لالتقاط صور وفيديوهات'
                : 'We need camera access to capture photos and videos'}
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={requestCameraPermission}
            >
              <Text style={styles.permissionButtonText}>
                {isArabic ? 'السماح' : 'Allow'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.closeButton, { top: insets.top + 16 }]}
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
      {/* Full Screen Camera */}
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        facing={facing}
        flash={flash}
        mode="video"
      />

      {/* Top Controls */}
      <View style={[styles.topControls, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={30} color="#fff" />
        </TouchableOpacity>

        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.recordingTime}>{formatDuration(recordingDuration)}</Text>
          </View>
        )}

        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleFlash}
        >
          <Ionicons
            name={flash === 'on' ? 'flash' : 'flash-off'}
            size={26}
            color="#fff"
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View
        style={[styles.bottomControls, { paddingBottom: insets.bottom + 32 }]}
      >
        {/* Flip Camera Button - Left */}
        <TouchableOpacity
          style={styles.sideButton}
          onPress={toggleCameraFacing}
          disabled={isRecording}
        >
          <Ionicons name="camera-reverse" size={30} color={isRecording ? 'rgba(255,255,255,0.3)' : '#fff'} />
        </TouchableOpacity>

        {/* Capture Button with Lock - Center */}
        <View style={styles.captureWrapper}>
          {/* Lock Icon - Slides up */}
          <Animated.View
            style={[
              styles.lockContainer,
              {
                opacity: lockOpacity,
                transform: [{ translateY: lockSlideY }, { scale: lockScale }],
              }
            ]}
          >
            <View style={[styles.lockIcon, isLocked && styles.lockIconLocked]}>
              <Ionicons name={isLocked ? 'lock-closed' : 'lock-open'} size={20} color="#fff" />
            </View>
            {!isLocked && (
              <Text style={styles.lockHint}>
                {isArabic ? 'اسحب للقفل' : 'Slide to lock'}
              </Text>
            )}
          </Animated.View>

          {/* Main Capture Button - Hidden when locked */}
          {!isLocked && (
            <Animated.View
              style={[
                styles.captureOuter,
                {
                  transform: [{ scale: captureScale }],
                  opacity: ringOpacity,
                },
              ]}
              {...panResponder.panHandlers}
            >
              <View style={styles.captureTouch}>
                {/* Progress Ring */}
                {isRecording && (
                  <Animated.View
                    style={[
                      styles.progressRing,
                      { transform: [{ rotate: progressRotation }] },
                    ]}
                  />
                )}

                {/* Inner Circle */}
                <Animated.View
                  style={[
                    styles.captureInner,
                    isRecording && styles.captureInnerRecording,
                    { transform: [{ scale: innerScale }] },
                  ]}
                />
              </View>
            </Animated.View>
          )}

          {/* Stop Button when Locked */}
          {isLocked && (
            <TouchableOpacity
              style={styles.stopButtonLocked}
              onPress={stopVideoRecording}
            >
              {/* Progress Ring around stop button */}
              <Animated.View
                style={[
                  styles.progressRingLocked,
                  { transform: [{ rotate: progressRotation }] },
                ]}
              />
              <View style={styles.stopButtonInner} />
            </TouchableOpacity>
          )}

          {/* Hint Text */}
          {!isRecording && (
            <Text style={styles.hintText}>
              {isArabic ? 'اضغط مطولاً للفيديو' : 'Hold for video'}
            </Text>
          )}
        </View>

        {/* Placeholder for symmetry - Right */}
        <View style={styles.sideButton} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Permission Screen
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  permissionContent: {
    alignItems: 'center',
    paddingHorizontal: 48,
  },
  permissionIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 48,
    paddingVertical: 14,
    borderRadius: 30,
  },
  permissionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    position: 'absolute',
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Top Controls
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  recordingTime: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    fontVariant: ['tabular-nums'],
  },

  // Bottom Controls
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  sideButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureWrapper: {
    alignItems: 'center',
  },
  captureOuter: {
    width: CAPTURE_OUTER_SIZE,
    height: CAPTURE_OUTER_SIZE,
    borderRadius: CAPTURE_OUTER_SIZE / 2,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureTouch: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRing: {
    position: 'absolute',
    width: CAPTURE_OUTER_SIZE + 8,
    height: CAPTURE_OUTER_SIZE + 8,
    borderRadius: (CAPTURE_OUTER_SIZE + 8) / 2,
    borderWidth: 4,
    borderColor: Colors.primary,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  captureInner: {
    width: CAPTURE_SIZE - 8,
    height: CAPTURE_SIZE - 8,
    borderRadius: (CAPTURE_SIZE - 8) / 2,
    backgroundColor: '#fff',
  },
  captureInnerRecording: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  hintText: {
    marginTop: 16,
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },

  // Lock feature
  lockContainer: {
    position: 'absolute',
    bottom: CAPTURE_OUTER_SIZE + 20,
    alignItems: 'center',
  },
  lockIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  lockIconLocked: {
    backgroundColor: Colors.primary,
  },
  lockHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '500',
  },

  // Stop button (when locked)
  stopButtonLocked: {
    width: CAPTURE_OUTER_SIZE,
    height: CAPTURE_OUTER_SIZE,
    borderRadius: CAPTURE_OUTER_SIZE / 2,
    borderWidth: 4,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressRingLocked: {
    position: 'absolute',
    width: CAPTURE_OUTER_SIZE + 8,
    height: CAPTURE_OUTER_SIZE + 8,
    borderRadius: (CAPTURE_OUTER_SIZE + 8) / 2,
    borderWidth: 4,
    borderColor: Colors.primary,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  stopButtonInner: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
});
