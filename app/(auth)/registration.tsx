import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image, Modal, Pressable, Animated } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, useLocalization } from '../../src/hooks';
import { register } from '../../src/store/slices/authSlice';
import { Colors } from '../../src/constants/colors';
import { UIBackButton } from '../../src/components/ui';
import IDScannerCamera from '../../src/components/IDScannerCamera';

export default function RegistrationScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isLoading, registrationToken: storeToken } = useAppSelector((state) => state.auth);
  // Use test token if no token from store (for development)
  const registrationToken = storeToken || 'test-registration-token';
  const { t, isRTL, isArabic } = useLocalization();

  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | null>(null);
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<string>('birthday');
  const [tempDate, setTempDate] = useState<Date>(new Date());
  const [marriageDate, setMarriageDate] = useState<Date | null>(null);
  const [partnerBirthday, setPartnerBirthday] = useState<Date | null>(null);
  const [kidsBirthdays, setKidsBirthdays] = useState<Date[]>([]);
  const [idPhotoUri, setIdPhotoUri] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (showDatePicker) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [showDatePicker]);

  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() - 13); // Minimum 13 years old

  const isStep1Valid = firstName.trim() && lastName.trim() && gender;
  const isStep2Valid = !!birthday;
  const isStep3Valid = !!idPhotoUri;

  const handleNext = () => {
    if (step === 1 && isStep1Valid) {
      setStep(2);
    } else if (step === 2 && isStep2Valid) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleRegister = async () => {
    console.log('handleRegister called', {
      isStep1Valid,
      isStep2Valid,
      isStep3Valid,
      registrationToken,
      birthday,
      gender,
      idPhotoUri
    });

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid || !registrationToken || !birthday || !gender) {
      console.log('Validation failed');
      return;
    }

    try {
      const result = await dispatch(register({
        registrationToken,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
        birthday: birthday.toISOString().split('T')[0],
        idPhotoUri
      }));

      console.log('Register result:', result);

      if (register.fulfilled.match(result)) {
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Register error:', error);
    }
  };

  const handleDateChange = (_: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        confirmDateSelection(selectedDate);
      }
    } else if (selectedDate) {
      setTempDate(selectedDate);
    }
  };

  const confirmDateSelection = (dateToSave?: Date) => {
    const selectedDate = dateToSave || tempDate;
    if (activeDateField === 'birthday') {
      setBirthday(selectedDate);
    } else if (activeDateField === 'marriage') {
      setMarriageDate(selectedDate);
    } else if (activeDateField === 'partner') {
      setPartnerBirthday(selectedDate);
    } else if (activeDateField.startsWith('kid-')) {
      const index = parseInt(activeDateField.split('-')[1]);
      const newKids = [...kidsBirthdays];
      newKids[index] = selectedDate;
      setKidsBirthdays(newKids);
    }
    setShowDatePicker(false);
  };

  const openDatePicker = (field: string) => {
    setActiveDateField(field);
    // Set initial temp date based on existing value or default
    if (field === 'birthday') {
      setTempDate(birthday || maxDate);
    } else if (field === 'marriage') {
      setTempDate(marriageDate || new Date());
    } else if (field === 'partner') {
      setTempDate(partnerBirthday || new Date());
    } else if (field.startsWith('kid-')) {
      const index = parseInt(field.split('-')[1]);
      setTempDate(kidsBirthdays[index] || new Date());
    }
    setShowDatePicker(true);
  };

  const addKidBirthday = () => {
    const newIndex = kidsBirthdays.length;
    setKidsBirthdays([...kidsBirthdays, new Date()]);
    setActiveDateField(`kid-${newIndex}`);
    setTempDate(new Date());
    setShowDatePicker(true);
  };

  const removeKidBirthday = (index: number) => {
    setKidsBirthdays(kidsBirthdays.filter((_, i) => i !== index));
  };

  const getDatePickerTitle = () => {
    if (activeDateField === 'birthday') return t('auth.registration.dates.birthday');
    if (activeDateField === 'marriage') return t('auth.registration.dates.marriage');
    if (activeDateField === 'partner') return t('auth.registration.dates.partnerBirthday');
    if (activeDateField.startsWith('kid-')) {
      const index = parseInt(activeDateField.split('-')[1]);
      return t('auth.registration.dates.kidBirthday', { number: index + 1 });
    }
    return '';
  };

  const getMaxDateForField = () => {
    if (activeDateField === 'birthday') return maxDate;
    return new Date();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isArabic ? 'ar-QA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleIdCapture = (uri: string) => {
    setIdPhotoUri(uri);
  };

  const renderStep1 = () => (
    <>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>{t('auth.registration.title')}</Text>
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{t('auth.registration.subtitle')}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>{t('auth.registration.firstName')}</Text>
          <TextInput
            style={[styles.input, isRTL && styles.inputRTL]}
            value={firstName}
            onChangeText={setFirstName}
            placeholder={t('auth.registration.firstNamePlaceholder')}
            placeholderTextColor={Colors.gray[400]}
            keyboardAppearance="light"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>{t('auth.registration.lastName')}</Text>
          <TextInput
            style={[styles.input, isRTL && styles.inputRTL]}
            value={lastName}
            onChangeText={setLastName}
            placeholder={t('auth.registration.lastNamePlaceholder')}
            placeholderTextColor={Colors.gray[400]}
            keyboardAppearance="light"
            textAlign={isRTL ? 'right' : 'left'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, isRTL && styles.textRTL]}>{t('auth.registration.gender')}</Text>
          <View style={styles.genderContainer}>
            <TouchableOpacity
              style={[styles.genderOption, gender === 'MALE' && styles.genderOptionSelected]}
              onPress={() => setGender('MALE')}
            >
              <Text style={[styles.genderText, gender === 'MALE' && styles.genderTextSelected]}>
                {t('auth.registration.male')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderOption, gender === 'FEMALE' && styles.genderOptionSelected]}
              onPress={() => setGender('FEMALE')}
            >
              <Text style={[styles.genderText, gender === 'FEMALE' && styles.genderTextSelected]}>
                {t('auth.registration.female')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.spacer} />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
          <Text style={styles.secondaryButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, styles.buttonFlex, !isStep1Valid && styles.primaryButtonDisabled]}
          onPress={handleNext}
          disabled={!isStep1Valid}
        >
          <Text style={styles.primaryButtonText}>{t('auth.registration.next')}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep2 = () => (
    <>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>{t('auth.registration.birthdayStep.title')}</Text>
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{t('auth.registration.birthdayStep.subtitle')}</Text>
      </View>

      <View style={styles.datesSection}>
        {/* Birthday - Required */}
        <TouchableOpacity style={styles.dateRow} onPress={() => openDatePicker('birthday')}>
          <View style={styles.dateRowLeft}>
            <View style={[styles.dateIconCircle, birthday && styles.dateIconCircleFilled]}>
              <Feather name="gift" size={18} color={birthday ? Colors.primary : Colors.gray[400]} />
            </View>
            <View>
              <Text style={styles.dateRowLabel}>{t('auth.registration.dates.birthday')}</Text>
              <Text style={[styles.dateRowValue, !birthday && styles.dateRowPlaceholder]}>
                {birthday ? formatDate(birthday) : t('auth.registration.dates.selectDate')}
              </Text>
            </View>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.gray[400]} />
        </TouchableOpacity>

        {/* Optional Dates Header */}
        <View style={styles.optionalHeader}>
          <Text style={[styles.optionalHeaderText, isRTL && styles.textRTL]}>{t('auth.registration.dates.optionalTitle')}</Text>
        </View>

        {/* Marriage Anniversary - Optional */}
        <TouchableOpacity style={styles.dateRow} onPress={() => openDatePicker('marriage')}>
          <View style={styles.dateRowLeft}>
            <View style={[styles.dateIconCircle, marriageDate && styles.dateIconCircleFilled]}>
              <Feather name="heart" size={18} color={marriageDate ? Colors.primary : Colors.gray[400]} />
            </View>
            <View>
              <Text style={styles.dateRowLabel}>{t('auth.registration.dates.marriage')}</Text>
              <Text style={[styles.dateRowValue, !marriageDate && styles.dateRowPlaceholder]}>
                {marriageDate ? formatDate(marriageDate) : t('auth.registration.dates.addDate')}
              </Text>
            </View>
          </View>
          {marriageDate ? (
            <TouchableOpacity onPress={() => setMarriageDate(null)}>
              <Feather name="x" size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          ) : (
            <Feather name="plus" size={20} color={Colors.gray[400]} />
          )}
        </TouchableOpacity>

        {/* Partner's Birthday - Optional */}
        <TouchableOpacity style={styles.dateRow} onPress={() => openDatePicker('partner')}>
          <View style={styles.dateRowLeft}>
            <View style={[styles.dateIconCircle, partnerBirthday && styles.dateIconCircleFilled]}>
              <Feather name="user-plus" size={18} color={partnerBirthday ? Colors.primary : Colors.gray[400]} />
            </View>
            <View>
              <Text style={styles.dateRowLabel}>{t('auth.registration.dates.partnerBirthday')}</Text>
              <Text style={[styles.dateRowValue, !partnerBirthday && styles.dateRowPlaceholder]}>
                {partnerBirthday ? formatDate(partnerBirthday) : t('auth.registration.dates.addDate')}
              </Text>
            </View>
          </View>
          {partnerBirthday ? (
            <TouchableOpacity onPress={() => setPartnerBirthday(null)}>
              <Feather name="x" size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          ) : (
            <Feather name="plus" size={20} color={Colors.gray[400]} />
          )}
        </TouchableOpacity>

        {/* Kids' Birthdays - Optional, Multiple */}
        {kidsBirthdays.map((kidDate, index) => (
          <TouchableOpacity key={index} style={styles.dateRow} onPress={() => openDatePicker(`kid-${index}`)}>
            <View style={styles.dateRowLeft}>
              <View style={[styles.dateIconCircle, styles.dateIconCircleFilled]}>
                <Feather name="smile" size={18} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.dateRowLabel}>{t('auth.registration.dates.kidBirthday', { number: index + 1 })}</Text>
                <Text style={styles.dateRowValue}>{formatDate(kidDate)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => removeKidBirthday(index)}>
              <Feather name="x" size={20} color={Colors.gray[400]} />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {/* Add Kid Button */}
        <TouchableOpacity style={styles.addDateButton} onPress={addKidBirthday}>
          <Feather name="plus-circle" size={20} color={Colors.primary} />
          <Text style={styles.addDateButtonText}>{t('auth.registration.dates.addKid')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.spacer} />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
          <Text style={styles.secondaryButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, styles.buttonFlex, !isStep2Valid && styles.primaryButtonDisabled]}
          onPress={handleNext}
          disabled={!isStep2Valid}
        >
          <Text style={styles.primaryButtonText}>{t('auth.registration.next')}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep3 = () => (
    <>
      <View style={styles.headerContainer}>
        <Text style={[styles.title, isRTL && styles.textRTL]}>{t('auth.registration.idVerification.title')}</Text>
        <Text style={[styles.subtitle, isRTL && styles.textRTL]}>{t('auth.registration.idVerification.subtitle')}</Text>
      </View>

      <View style={styles.idSection}>
        {idPhotoUri ? (
          <View style={styles.idPreviewContainer}>
            <Image source={{ uri: idPhotoUri }} style={styles.idPreview} resizeMode="cover" />
            <View style={styles.idCapturedBadge}>
              <Text style={styles.idCapturedText}>{t('auth.registration.idVerification.idCaptured')}</Text>
            </View>
            <TouchableOpacity style={styles.retakeButton} onPress={() => setShowCamera(true)}>
              <Text style={styles.retakeButtonText}>{t('auth.registration.idVerification.retake')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.captureButton} onPress={() => setShowCamera(true)}>
            <View style={styles.cameraIconContainer}>
              <View style={styles.cameraIcon}>
                <View style={styles.cameraLens} />
              </View>
            </View>
            <Text style={styles.captureButtonText}>{t('auth.registration.idVerification.takePhoto')}</Text>
          </TouchableOpacity>
        )}

        <Text style={[styles.privacyNote, isRTL && styles.textRTL]}>
          {t('auth.registration.idVerification.privacyNote')}
        </Text>
      </View>

      <View style={styles.spacer} />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleBack}>
          <Text style={styles.secondaryButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.primaryButton, styles.buttonFlex, !isStep3Valid && styles.primaryButtonDisabled]}
          onPress={handleRegister}
          disabled={!isStep3Valid || isLoading}
        >
          <Text style={styles.primaryButtonText}>{t('auth.registration.createAccount')}</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <UIBackButton style={styles.backButton} onPress={handleBack} />

        <View style={styles.stepIndicator}>
          <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
            <Feather name="user" size={20} color={step >= 1 ? Colors.primary : Colors.gray[400]} />
          </View>
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
            <Feather name="calendar" size={20} color={step >= 2 ? Colors.primary : Colors.gray[400]} />
          </View>
          <View style={[styles.stepLine, step >= 3 && styles.stepLineActive]} />
          <View style={[styles.stepCircle, step >= 3 && styles.stepCircleActive]}>
            <Feather name="credit-card" size={20} color={step >= 3 ? Colors.primary : Colors.gray[400]} />
          </View>
        </View>

        {renderStep()}
      </ScrollView>

      <IDScannerCamera
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleIdCapture}
        isArabic={isArabic}
      />

      {/* Date Picker Bottom Sheet */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: slideAnim }] }
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.bottomSheetHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.bottomSheetCancel}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <Text style={styles.bottomSheetTitle}>{getDatePickerTitle()}</Text>
                <TouchableOpacity onPress={() => confirmDateSelection()}>
                  <Text style={styles.bottomSheetDone}>{t('common.done')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.datePickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={getMaxDateForField()}
                  style={styles.datePicker}
                />
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },
  backButton: { marginTop: 60 },
  stepIndicator: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, marginBottom: 28 },
  stepCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.gray[100], justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.gray[200] },
  stepCircleActive: { backgroundColor: 'rgba(120, 16, 74, 0.1)', borderColor: Colors.primary },
  stepLine: { width: 32, height: 2, backgroundColor: Colors.gray[200] },
  stepLineActive: { backgroundColor: Colors.primary },
  headerContainer: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.black, marginBottom: 12 },
  subtitle: { fontSize: 16, color: Colors.gray[600], lineHeight: 24 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  form: { gap: 28 },
  inputGroup: { gap: 4 },
  label: { fontSize: 13, fontWeight: '500', color: Colors.gray[500], marginBottom: 4 },
  input: { borderBottomWidth: 1, borderBottomColor: Colors.gray[300], paddingVertical: 12, paddingHorizontal: 0, fontSize: 17, color: Colors.black },
  inputFocused: { borderBottomColor: Colors.primary, borderBottomWidth: 2 },
  inputRTL: { textAlign: 'right' },
  genderContainer: { flexDirection: 'row', gap: 16, marginTop: 8 },
  genderOption: { flex: 1, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray[300], alignItems: 'center' },
  genderOptionSelected: { borderBottomColor: Colors.primary, borderBottomWidth: 2 },
  genderText: { fontSize: 16, fontWeight: '500', color: Colors.gray[500] },
  genderTextSelected: { color: Colors.primary, fontWeight: '600' },
  datesSection: { gap: 0 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  dateRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  dateIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.gray[100], justifyContent: 'center', alignItems: 'center' },
  dateIconCircleFilled: { backgroundColor: 'rgba(120, 16, 74, 0.1)' },
  dateRowLabel: { fontSize: 15, fontWeight: '600', color: Colors.black, marginBottom: 2 },
  dateRowValue: { fontSize: 14, color: Colors.gray[600] },
  dateRowPlaceholder: { color: Colors.gray[400] },
  optionalHeader: { paddingTop: 24, paddingBottom: 8 },
  optionalHeaderText: { fontSize: 13, fontWeight: '500', color: Colors.gray[500], textTransform: 'uppercase', letterSpacing: 0.5 },
  addDateButton: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 16 },
  addDateButtonText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: Colors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40, width: '100%' },
  bottomSheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: Colors.gray[100] },
  bottomSheetTitle: { fontSize: 17, fontWeight: '600', color: Colors.black },
  bottomSheetCancel: { fontSize: 16, color: Colors.gray[500] },
  bottomSheetDone: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  datePickerContainer: { alignItems: 'center', paddingVertical: 10 },
  datePicker: { height: 200 },
  spacer: { flex: 1, minHeight: 40 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  buttonFlex: { flex: 1 },
  primaryButton: { backgroundColor: Colors.primary, borderRadius: 16, paddingVertical: 18, alignItems: 'center' },
  primaryButtonDisabled: { backgroundColor: Colors.gray[300] },
  primaryButtonText: { fontSize: 18, fontWeight: '600', color: Colors.white },
  secondaryButton: { backgroundColor: Colors.gray[100], borderRadius: 16, paddingVertical: 18, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  secondaryButtonText: { fontSize: 16, fontWeight: '600', color: Colors.gray[700] },
  idSection: { alignItems: 'center', gap: 24 },
  captureButton: {
    width: '100%',
    aspectRatio: 1.6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.gray[300],
    borderStyle: 'dashed',
    backgroundColor: Colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  cameraIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 40,
    height: 32,
    borderRadius: 6,
    backgroundColor: Colors.gray[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraLens: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.gray[300],
  },
  captureButtonText: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  idPreviewContainer: { width: '100%', alignItems: 'center', gap: 16 },
  idPreview: { width: '100%', aspectRatio: 1.6, borderRadius: 16 },
  idCapturedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  idCapturedText: { fontSize: 14, fontWeight: '600', color: '#22C55E' },
  retakeButton: { paddingVertical: 12 },
  retakeButtonText: { fontSize: 16, fontWeight: '600', color: Colors.primary },
  privacyNote: { fontSize: 13, color: Colors.gray[500], textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
});
