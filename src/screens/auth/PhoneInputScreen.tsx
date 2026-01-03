import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { AuthScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector, useLocalization } from '../../hooks';
import { sendOtp, clearError } from '../../store/slices/authSlice';
import { Colors } from '../../constants/colors';

// Track if animation has already played
let hasAnimated = false;

export default function PhoneInputScreen({ navigation }: AuthScreenProps<'PhoneInput'>) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { isArabic } = useLocalization();
  const [phoneNumber, setPhoneNumber] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Animations - start at final values if already animated
  const fadeAnim = useRef(new Animated.Value(hasAnimated ? 1 : 0)).current;
  const slideAnim = useRef(new Animated.Value(hasAnimated ? 0 : 30)).current;
  const inputFadeAnim = useRef(new Animated.Value(hasAnimated ? 1 : 0)).current;
  const inputSlideAnim = useRef(new Animated.Value(hasAnimated ? 0 : 20)).current;
  const buttonFadeAnim = useRef(new Animated.Value(hasAnimated ? 1 : 0)).current;
  const keyboardHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!hasAnimated) {
      Animated.sequence([
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
        ]),
        Animated.parallel([
          Animated.timing(inputFadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(inputSlideAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(buttonFadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      hasAnimated = true;
      // Auto focus input after animation
      setTimeout(() => inputRef.current?.focus(), 600);
    } else {
      // Focus immediately if already animated
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, []);

  // Keyboard listeners for smooth animation
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const keyboardShowListener = Keyboard.addListener(showEvent, (e) => {
      Animated.spring(keyboardHeight, {
        toValue: e.endCoordinates.height,
        speed: 20,
        bounciness: 0,
        useNativeDriver: false,
      }).start();
    });

    const keyboardHideListener = Keyboard.addListener(hideEvent, () => {
      Animated.spring(keyboardHeight, {
        toValue: 0,
        speed: 20,
        bounciness: 0,
        useNativeDriver: false,
      }).start();
    });

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, []);

  const handleContinue = async () => {
    if (phoneNumber.length < 8) return;

    Keyboard.dismiss();
    const fullPhone = `+974${phoneNumber}`;
    const result = await dispatch(sendOtp(fullPhone));

    if (sendOtp.fulfilled.match(result)) {
      navigation.navigate('OTPVerification', { phoneNumber: fullPhone });
    }
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 8) {
      setPhoneNumber(cleaned);
      if (error) dispatch(clearError());
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    if (phone.length <= 4) return phone;
    return `${phone.slice(0, 4)} ${phone.slice(4)}`;
  };

  const isValid = phoneNumber.length === 8;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
          {isArabic ? 'رقم الهاتف' : 'Phone Number'}
        </Text>
        <Text style={[styles.subtitle, isArabic && styles.textRTL]}>
          {isArabic
            ? 'سنرسل لك رمز التحقق عبر الرسائل القصيرة'
            : "We'll send you a verification code via SMS"}
        </Text>
      </Animated.View>

      {/* Phone Input */}
      <Animated.View
        style={[
          styles.inputSection,
          {
            opacity: inputFadeAnim,
            transform: [{ translateY: inputSlideAnim }],
          },
        ]}
      >
        <View style={[styles.inputContainer, error && styles.inputContainerError]}>
          <View style={styles.countryCode}>
            <Text style={styles.code}>+974</Text>
          </View>
          <View style={styles.divider} />
          <TextInput
            ref={inputRef}
            style={[styles.input, isArabic && styles.inputRTL]}
            placeholder={isArabic ? '٥٠٠٠ ٠٠٠٠' : '5000 0000'}
            placeholderTextColor={Colors.gray[400]}
            keyboardType="phone-pad"
            value={formatPhoneDisplay(phoneNumber)}
            onChangeText={(text) => handlePhoneChange(text.replace(/\s/g, ''))}
            maxLength={9}
          />
        </View>

        {error && (
          <Animated.Text style={[styles.errorText, isArabic && styles.textRTL]}>
            {error}
          </Animated.Text>
        )}

        <Text style={[styles.helperText, isArabic && styles.textRTL]}>
          {isArabic
            ? 'أدخل رقم هاتفك القطري المكون من 8 أرقام'
            : 'Enter your 8-digit Qatar phone number'}
        </Text>
      </Animated.View>

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Bottom Section - moves with keyboard */}
      <Animated.View style={[styles.bottomSection, { marginBottom: keyboardHeight }]}>
        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            !isValid && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={!isValid || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <View style={styles.loadingDots}>
              <View style={styles.loadingDot} />
              <View style={[styles.loadingDot, styles.loadingDotMiddle]} />
              <View style={styles.loadingDot} />
            </View>
          ) : (
            <>
              <Text style={styles.continueButtonText}>
                {isArabic ? 'متابعة' : 'Continue'}
              </Text>
              <View style={styles.continueIcon}>
                <View style={styles.continueIconInner} />
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* Terms */}
        <Text style={[styles.termsText, isArabic && styles.textRTL]}>
          {isArabic
            ? 'بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية'
            : 'By continuing, you agree to our Terms and Privacy Policy'}
        </Text>
      </Animated.View>
      </View>
    </TouchableWithoutFeedback>
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
    lineHeight: 24,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  inputSection: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gray[200],
    paddingHorizontal: 16,
    height: 64,
  },
  inputContainerError: {
    borderColor: Colors.error,
    backgroundColor: '#FEF2F2',
  },
  countryCode: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  code: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.gray[300],
    marginHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 20,
    fontWeight: '500',
    color: Colors.black,
    letterSpacing: 1,
  },
  inputRTL: {
    textAlign: 'right',
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: Colors.gray[500],
  },
  spacer: {
    flex: 1,
  },
  bottomSection: {
    paddingBottom: 40,
    gap: 16,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 32,
    gap: 12,
  },
  continueButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  continueButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  continueIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueIconInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.white,
  },
  loadingDots: {
    flexDirection: 'row',
    gap: 6,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    opacity: 0.6,
  },
  loadingDotMiddle: {
    opacity: 1,
  },
  termsText: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    lineHeight: 18,
  },
});
