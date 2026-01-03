import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppDispatch, useAppSelector, useLocalization } from '../../src/hooks';
import { verifyOtp, clearError } from '../../src/store/slices/authSlice';
import { Colors } from '../../src/constants/colors';
import { UIBackButton } from '../../src/components/ui';

export default function OTPVerificationScreen() {
  const router = useRouter();
  const { phoneNumber } = useLocalSearchParams<{ phoneNumber: string }>();
  const dispatch = useAppDispatch();
  const { isLoading, error, isNewUser } = useAppSelector((state) => state.auth);
  const { t, isRTL } = useLocalization();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (isNewUser) {
      router.replace('/(auth)/registration');
    }
  }, [isNewUser]);

  const handleOtpChange = (value: string, index: number) => {
    if (error) dispatch(clearError());
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every((digit) => digit !== '')) {
      Keyboard.dismiss();
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code: string) => {
    const result = await dispatch(verifyOtp({ phoneNumber: phoneNumber || '', otpCode: code }));
    if (verifyOtp.fulfilled.match(result) && !result.payload.isNewUser) {
      router.replace('/(tabs)');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <UIBackButton style={styles.backButton} />

          <View style={styles.headerContainer}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{t('auth.otp.title')}</Text>
            <Text style={[styles.subtitle, isRTL && styles.textRTL]}>
              {t('auth.otp.subtitle', { phoneNumber })}
            </Text>
          </View>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[styles.otpInput, error && styles.otpInputError, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={(value) => handleOtpChange(value.slice(-1), index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                keyboardAppearance="light"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Text style={[styles.helperText, isRTL && styles.textRTL]}>{t('auth.otp.testHint')}</Text>

          <View style={styles.spacer} />

          <TouchableOpacity style={styles.resendButton}>
            <Text style={styles.resendText}>{t('auth.otp.resend')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  inner: { flex: 1, paddingHorizontal: 24 },
  backButton: { marginTop: 60, marginBottom: 20 },
  headerContainer: { marginBottom: 40 },
  title: { fontSize: 32, fontWeight: '700', color: Colors.black, marginBottom: 12 },
  subtitle: { fontSize: 16, color: Colors.gray[600], lineHeight: 24 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  otpInput: { flex: 1, height: 64, backgroundColor: Colors.gray[50], borderRadius: 12, borderWidth: 2, borderColor: Colors.gray[200], textAlign: 'center', fontSize: 24, fontWeight: '700', color: Colors.black },
  otpInputError: { borderColor: Colors.error, backgroundColor: '#FEF2F2' },
  otpInputFilled: { borderColor: Colors.primary, backgroundColor: Colors.white },
  errorText: { fontSize: 14, color: Colors.error, textAlign: 'center', marginTop: 16 },
  helperText: { fontSize: 14, color: Colors.gray[500], textAlign: 'center', marginTop: 16 },
  spacer: { flex: 1 },
  resendButton: { paddingVertical: 16, alignItems: 'center', marginBottom: 40 },
  resendText: { fontSize: 16, color: Colors.primary, fontWeight: '600' },
});
