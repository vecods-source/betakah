import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { AuthScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector, useLocalization } from '../../hooks';
import { verifyOtp, sendOtp, clearError } from '../../store/slices/authSlice';
import { Colors } from '../../constants/colors';

const OTP_LENGTH = 6;

export default function OTPVerificationScreen({
  navigation,
  route,
}: AuthScreenProps<'OTPVerification'>) {
  const { phoneNumber } = route.params;
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { isArabic } = useLocalization();

  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const boxFadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Simple fade for OTP boxes
    Animated.timing(boxFadeAnim, {
      toValue: 1,
      duration: 400,
      delay: 300,
      useNativeDriver: true,
    }).start();

    // Auto focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 500);
  }, []);

  // Loading animation
  useEffect(() => {
    if (isLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(loadingAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(loadingAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      loadingAnim.setValue(0);
    }
  }, [isLoading]);

  // Error shake animation
  useEffect(() => {
    if (error) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleOtpChange = (value: string, index: number) => {
    if (error) dispatch(clearError());

    const newOtp = [...otp];

    // Handle paste
    if (value.length > 1) {
      const pastedCode = value.replace(/[^0-9]/g, '').slice(0, OTP_LENGTH).split('');
      pastedCode.forEach((digit, i) => {
        if (i < OTP_LENGTH) newOtp[i] = digit;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(pastedCode.length, OTP_LENGTH - 1)]?.focus();
    } else {
      newOtp[index] = value.replace(/[^0-9]/g, '');
      setOtp(newOtp);

      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }

    const completeOtp = newOtp.join('');
    if (completeOtp.length === OTP_LENGTH) {
      handleVerify(completeOtp);
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length !== OTP_LENGTH) return;

    const result = await dispatch(verifyOtp({ phoneNumber, otpCode: code }));

    if (verifyOtp.fulfilled.match(result)) {
      if (result.payload.isNewUser) {
        navigation.replace('Registration', {
          phoneNumber,
          registrationToken: result.payload.registrationToken!,
        });
      }
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    await dispatch(sendOtp(phoneNumber));
    setResendTimer(60);
    setOtp(Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
  };

  const formatPhoneNumber = (phone: string) => {
    // Format +97450000000 to +974 5000 0000
    if (phone.startsWith('+974')) {
      const digits = phone.slice(4);
      return `+974 ${digits.slice(0, 4)} ${digits.slice(4)}`;
    }
    return phone;
  };

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <View style={styles.backIcon}>
          <Text style={styles.backIconText}>{isArabic ? '→' : '←'}</Text>
        </View>
      </TouchableOpacity>

      {/* Header */}
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={[styles.title, isArabic && styles.textRTL]}>
          {isArabic ? 'تحقق من رقمك' : 'Verify Your Number'}
        </Text>
        <Text style={[styles.subtitle, isArabic && styles.textRTL]}>
          {isArabic ? 'أدخل الرمز المكون من 6 أرقام المرسل إلى' : 'Enter the 6-digit code sent to'}
        </Text>
        <Text style={[styles.phoneNumber, isArabic && styles.textRTL]}>
          {formatPhoneNumber(phoneNumber)}
        </Text>
      </Animated.View>

      {/* OTP Input */}
      <Animated.View
        style={[
          styles.otpContainer,
          {
            opacity: boxFadeAnim,
            transform: [{ translateX: shakeAnim }],
          },
        ]}
      >
        {otp.map((digit, index) => (
          <View key={index} style={styles.otpInputWrapper}>
            <TextInput
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                error && styles.otpInputError,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={index === 0 ? OTP_LENGTH : 1}
              selectTextOnFocus
              editable={!isLoading}
            />
          </View>
        ))}
      </Animated.View>

      {/* Error Message */}
      {error && (
        <Text style={[styles.errorText, isArabic && styles.textRTL]}>
          {error}
        </Text>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <Animated.View
            style={[
              styles.loadingDot,
              {
                opacity: loadingAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0.3, 1, 0.3],
                }),
              },
            ]}
          />
          <Text style={styles.loadingText}>
            {isArabic ? 'جارٍ التحقق...' : 'Verifying...'}
          </Text>
        </View>
      )}

      {/* Resend Section */}
      <View style={styles.resendContainer}>
        <Text style={[styles.resendLabel, isArabic && styles.textRTL]}>
          {isArabic ? 'لم تستلم الرمز؟' : "Didn't receive the code?"}
        </Text>
        <TouchableOpacity
          onPress={handleResend}
          disabled={resendTimer > 0 || isLoading}
          style={styles.resendButton}
        >
          <Text
            style={[
              styles.resendButtonText,
              (resendTimer > 0 || isLoading) && styles.resendButtonTextDisabled,
            ]}
          >
            {resendTimer > 0
              ? isArabic ? `إعادة الإرسال خلال ${resendTimer}ث` : `Resend in ${resendTimer}s`
              : isArabic ? 'إعادة الإرسال' : 'Resend Code'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
  },
  backButton: {
    marginTop: 60,
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIconText: {
    fontSize: 20,
    color: Colors.black,
    fontWeight: '600',
  },
  headerContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.primary,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 20,
  },
  otpInputWrapper: {
    flex: 1,
  },
  otpInput: {
    height: 60,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: 14,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    color: Colors.black,
    backgroundColor: Colors.gray[50],
  },
  otpInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: '#F9E8EF',
  },
  otpInputError: {
    borderColor: Colors.error,
    backgroundColor: '#FEF2F2',
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 16,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.gray[600],
    fontWeight: '500',
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  resendLabel: {
    fontSize: 14,
    color: Colors.gray[500],
    marginBottom: 8,
  },
  resendButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  resendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  resendButtonTextDisabled: {
    color: Colors.gray[400],
  },
});
