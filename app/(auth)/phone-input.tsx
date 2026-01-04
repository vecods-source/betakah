import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, useLocalization } from '../../src/hooks';
import { sendOtp, clearError } from '../../src/store/slices/authSlice';
import { Colors } from '../../src/constants/colors';
import { UIBackButton } from '../../src/components/ui';

export default function PhoneInputScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { t, isRTL } = useLocalization();
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleContinue = async () => {
    if (phoneNumber.length < 8) return;
    Keyboard.dismiss();
    const fullPhone = `+974${phoneNumber}`;
    const result = await dispatch(sendOtp(fullPhone));
    if (sendOtp.fulfilled.match(result)) {
      router.push({ pathname: '/(auth)/otp-verification', params: { phoneNumber: fullPhone } });
    }
  };

  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length <= 8) {
      setPhoneNumber(cleaned);
      if (error) dispatch(clearError());
    }
  };

  const formatPhoneDisplay = (phone: string) => phone.length <= 4 ? phone : `${phone.slice(0, 4)} ${phone.slice(4)}`;
  const isValid = phoneNumber.length === 8;

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
            <Text style={styles.title}>{t('auth.phone.title')}</Text>
            <Text style={styles.subtitle}>{t('auth.phone.subtitle')}</Text>
          </View>

          <View style={styles.inputSection}>
            <View style={[styles.inputContainer, error && styles.inputContainerError]}>
              <View style={styles.countryCode}><Text style={styles.code}>{t('auth.phone.countryCode')}</Text></View>
              <View style={styles.divider} />
              <TextInput
                style={styles.input}
                placeholder={t('auth.phone.placeholder')}
                placeholderTextColor={Colors.gray[400]}
                keyboardType="phone-pad"
                keyboardAppearance="light"
                value={formatPhoneDisplay(phoneNumber)}
                onChangeText={(text) => handlePhoneChange(text.replace(/\s/g, ''))}
                maxLength={9}
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Text style={styles.helperText}>{t('auth.phone.helperText')}</Text>
          </View>

          <View style={styles.spacer} />

          <View style={styles.bottomSection}>
            <TouchableOpacity
              style={[styles.continueButton, !isValid && styles.continueButtonDisabled]}
              onPress={handleContinue}
              disabled={!isValid || isLoading}
            >
              <Text style={styles.continueButtonText}>{t('auth.phone.continue')}</Text>
            </TouchableOpacity>
            <Text style={styles.termsText}>{t('auth.phone.terms')}</Text>
          </View>
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
  title: { fontSize: 32, fontWeight: '700', color: Colors.black, marginBottom: 12, textAlign: 'left' },
  subtitle: { fontSize: 16, color: Colors.gray[600], lineHeight: 24, textAlign: 'left' },
  inputSection: { gap: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray[50], borderRadius: 16, borderWidth: 2, borderColor: Colors.gray[200], paddingHorizontal: 16, height: 64 },
  inputContainerError: { borderColor: Colors.error, backgroundColor: '#FEF2F2' },
  countryCode: { flexDirection: 'row', alignItems: 'center' },
  code: { fontSize: 18, fontWeight: '600', color: Colors.black },
  divider: { width: 1, height: 32, backgroundColor: Colors.gray[300], marginHorizontal: 16 },
  input: { flex: 1, fontSize: 20, fontWeight: '500', color: Colors.black, letterSpacing: 1 },
  errorText: { fontSize: 14, color: Colors.error, marginTop: 4 },
  helperText: { fontSize: 14, color: Colors.gray[500], textAlign: 'left' },
  spacer: { flex: 1 },
  bottomSection: { paddingBottom: 40, gap: 16 },
  continueButton: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18 },
  continueButtonDisabled: { backgroundColor: Colors.gray[300] },
  continueButtonText: { fontSize: 18, fontWeight: '600', color: Colors.white },
  termsText: { fontSize: 12, color: Colors.gray[500], textAlign: 'center', lineHeight: 18 },
});
