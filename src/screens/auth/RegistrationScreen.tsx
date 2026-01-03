import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  Image,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { AuthScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector, useLocalization } from '../../hooks';
import { register, clearError } from '../../store/slices/authSlice';
import { Colors } from '../../constants/colors';
import IDScannerCamera from '../../components/IDScannerCamera';

type Gender = 'MALE' | 'FEMALE';

export default function RegistrationScreen({
  navigation,
  route,
}: AuthScreenProps<'Registration'>) {
  const { phoneNumber, registrationToken } = route.params;
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { isArabic } = useLocalization();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Form data
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [birthday, setBirthday] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [idImage, setIdImage] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);

  // Refs
  const lastNameRef = useRef<TextInput>(null);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  const animateStepChange = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Validation per step
  const isStep1Valid = firstName.trim().length >= 2 && lastName.trim().length >= 2 && gender;
  const isStep2Valid = birthday !== null;
  const isStep3Valid = idImage !== null;

  const canProceed = () => {
    switch (currentStep) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      animateStepChange();
    } else {
      handleRegister();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      animateStepChange();
    } else {
      navigation.goBack();
    }
  };

  const handleRegister = async () => {
    if (!isStep1Valid || !isStep2Valid || !gender) return;

    Keyboard.dismiss();
    const result = await dispatch(
      register({
        registrationToken,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        gender,
      })
    );

    if (register.fulfilled.match(result)) {
      if (result.payload.user.verificationStatus === 'PENDING') {
        navigation.replace('VerificationPending');
      }
    }
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        isArabic ? 'الإذن مطلوب' : 'Permission Required',
        isArabic ? 'نحتاج إذن الوصول للصور لرفع هويتك' : 'We need photo library access to upload your ID'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setIdImage(result.assets[0].uri);
    }
  };

  const handleTakePhoto = () => {
    setShowCamera(true);
  };

  const handleCameraCapture = (uri: string) => {
    setIdImage(uri);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(isArabic ? 'ar-QA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getMaxDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18); // Must be 18+
    return date;
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((step) => (
        <View key={step} style={styles.stepRow}>
          <View
            style={[
              styles.stepDot,
              currentStep >= step && styles.stepDotActive,
            ]}
          >
            {currentStep > step ? (
              <Text style={styles.stepCheck}>✓</Text>
            ) : (
              <Text style={[styles.stepNumber, currentStep >= step && styles.stepNumberActive]}>
                {step}
              </Text>
            )}
          </View>
          {step < 3 && (
            <View style={[styles.stepLine, currentStep > step && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <Animated.View
      style={[
        styles.stepContent,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={[styles.stepTitle, isArabic && styles.textRTL]}>
        {isArabic ? 'المعلومات الشخصية' : 'Personal Information'}
      </Text>
      <Text style={[styles.stepSubtitle, isArabic && styles.textRTL]}>
        {isArabic ? 'أدخل اسمك واختر جنسك' : 'Enter your name and select your gender'}
      </Text>

      <View style={styles.formContainer}>
        {/* First Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isArabic && styles.textRTL]}>
            {isArabic ? 'الاسم الأول' : 'First Name'}
          </Text>
          <TextInput
            style={[styles.input, isArabic && styles.inputRTL]}
            placeholder={isArabic ? 'أدخل اسمك الأول' : 'Enter your first name'}
            placeholderTextColor={Colors.gray[400]}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => lastNameRef.current?.focus()}
          />
        </View>

        {/* Last Name */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isArabic && styles.textRTL]}>
            {isArabic ? 'اسم العائلة' : 'Last Name'}
          </Text>
          <TextInput
            ref={lastNameRef}
            style={[styles.input, isArabic && styles.inputRTL]}
            placeholder={isArabic ? 'أدخل اسم عائلتك' : 'Enter your last name'}
            placeholderTextColor={Colors.gray[400]}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            returnKeyType="done"
          />
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={[styles.label, isArabic && styles.textRTL]}>
            {isArabic ? 'الجنس' : 'Gender'}
          </Text>
          <View style={styles.genderButtons}>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'MALE' && styles.genderButtonSelected]}
              onPress={() => setGender('MALE')}
              activeOpacity={0.8}
            >
              <Text style={[styles.genderButtonText, gender === 'MALE' && styles.genderButtonTextSelected]}>
                {isArabic ? 'ذكر' : 'Male'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'FEMALE' && styles.genderButtonSelected]}
              onPress={() => setGender('FEMALE')}
              activeOpacity={0.8}
            >
              <Text style={[styles.genderButtonText, gender === 'FEMALE' && styles.genderButtonTextSelected]}>
                {isArabic ? 'أنثى' : 'Female'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View
      style={[
        styles.stepContent,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={[styles.stepTitle, isArabic && styles.textRTL]}>
        {isArabic ? 'تاريخ الميلاد' : 'Date of Birth'}
      </Text>
      <Text style={[styles.stepSubtitle, isArabic && styles.textRTL]}>
        {isArabic ? 'يجب أن يكون عمرك 18 سنة على الأقل' : 'You must be at least 18 years old'}
      </Text>

      <View style={styles.birthdayContainer}>
        <TouchableOpacity
          style={styles.birthdayButton}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.8}
        >
          <View style={styles.calendarIcon}>
            <View style={styles.calendarTop} />
            <View style={styles.calendarBody} />
          </View>
          <Text style={[styles.birthdayText, !birthday && styles.birthdayPlaceholder]}>
            {birthday ? formatDate(birthday) : (isArabic ? 'اختر تاريخ ميلادك' : 'Select your birthday')}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={birthday || getMaxDate()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={getMaxDate()}
            minimumDate={new Date(1920, 0, 1)}
            onChange={(event, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) setBirthday(date);
            }}
          />
        )}
      </View>
    </Animated.View>
  );

  const renderStep3 = () => (
    <Animated.View
      style={[
        styles.stepContent,
        { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
      ]}
    >
      <Text style={[styles.stepTitle, isArabic && styles.textRTL]}>
        {isArabic ? 'التحقق من الهوية' : 'Identity Verification'}
      </Text>
      <Text style={[styles.stepSubtitle, isArabic && styles.textRTL]}>
        {isArabic ? 'ارفع صورة من هويتك القطرية أو جواز السفر' : 'Upload a photo of your Qatar ID or passport'}
      </Text>

      <View style={styles.idUploadContainer}>
        {idImage ? (
          <View style={styles.idPreviewContainer}>
            <Image source={{ uri: idImage }} style={styles.idPreview} />
            <TouchableOpacity
              style={styles.removeImageButton}
              onPress={() => setIdImage(null)}
            >
              <Text style={styles.removeImageText}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.uploadOptions}>
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handleTakePhoto}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIcon}>
                <View style={styles.cameraIcon} />
              </View>
              <Text style={styles.uploadButtonText}>
                {isArabic ? 'التقط صورة' : 'Take Photo'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.uploadButton}
              onPress={handlePickImage}
              activeOpacity={0.8}
            >
              <View style={styles.uploadIcon}>
                <View style={styles.galleryIcon} />
              </View>
              <Text style={styles.uploadButtonText}>
                {isArabic ? 'اختر من المعرض' : 'Choose from Gallery'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={[styles.idNote, isArabic && styles.textRTL]}>
          {isArabic
            ? 'سيتم استخدام هويتك فقط للتحقق ولن تتم مشاركتها'
            : 'Your ID will only be used for verification and will not be shared'}
        </Text>
      </View>
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <View style={styles.backIcon}>
            <Text style={styles.backIconText}>{isArabic ? '→' : '←'}</Text>
          </View>
        </TouchableOpacity>

        {/* Step Indicator */}
        {renderStepIndicator()}

        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}

        {/* Error Message */}
        {error && (
          <Text style={[styles.errorText, isArabic && styles.textRTL]}>
            {error}
          </Text>
        )}

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Next/Submit Button */}
        <TouchableOpacity
          style={[styles.nextButton, !canProceed() && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!canProceed() || isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <View style={styles.loadingDots}>
              <View style={styles.loadingDot} />
              <View style={[styles.loadingDot, styles.loadingDotMiddle]} />
              <View style={styles.loadingDot} />
            </View>
          ) : (
            <Text style={styles.nextButtonText}>
              {currentStep === totalSteps
                ? (isArabic ? 'إنشاء الحساب' : 'Create Account')
                : (isArabic ? 'التالي' : 'Next')}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* ID Scanner Camera */}
      <IDScannerCamera
        visible={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
        isArabic={isArabic}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[500],
  },
  stepNumberActive: {
    color: Colors.white,
  },
  stepCheck: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: Colors.gray[200],
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: Colors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: Colors.gray[500],
    marginBottom: 32,
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  input: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.black,
  },
  inputRTL: {
    textAlign: 'right',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
  },
  genderButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: '#F9E8EF',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  genderButtonTextSelected: {
    color: Colors.primary,
  },
  birthdayContainer: {
    alignItems: 'center',
  },
  birthdayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 16,
    width: '100%',
  },
  calendarIcon: {
    width: 24,
    height: 24,
  },
  calendarTop: {
    width: 24,
    height: 6,
    backgroundColor: Colors.primary,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  calendarBody: {
    width: 24,
    height: 18,
    backgroundColor: Colors.gray[300],
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  birthdayText: {
    fontSize: 16,
    color: Colors.black,
    flex: 1,
  },
  birthdayPlaceholder: {
    color: Colors.gray[400],
  },
  idUploadContainer: {
    alignItems: 'center',
  },
  uploadOptions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  uploadButton: {
    flex: 1,
    backgroundColor: Colors.gray[50],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderStyle: 'dashed',
    paddingVertical: 32,
    alignItems: 'center',
    gap: 12,
  },
  uploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    width: 20,
    height: 16,
    backgroundColor: Colors.gray[400],
    borderRadius: 4,
  },
  galleryIcon: {
    width: 20,
    height: 20,
    backgroundColor: Colors.gray[400],
    borderRadius: 4,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[600],
    textAlign: 'center',
  },
  idPreviewContainer: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  idPreview: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  idNote: {
    fontSize: 12,
    color: Colors.gray[500],
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 14,
    color: Colors.error,
    textAlign: 'center',
    marginTop: 16,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: Colors.gray[300],
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
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
});
