import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  ScrollView,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalization, useTheme } from '../../../src/hooks';
import { UIHeader } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/colors';

type DateType = 'BIRTHDAY' | 'ANNIVERSARY' | 'OTHER';

const DATE_TYPES: { type: DateType; labelKey: string; icon: string; color: string }[] = [
  { type: 'BIRTHDAY', labelKey: 'profile.dates.types.birthday', icon: 'gift', color: '#E53935' },
  { type: 'ANNIVERSARY', labelKey: 'profile.dates.types.anniversary', icon: 'heart', color: '#D81B60' },
  { type: 'OTHER', labelKey: 'profile.dates.types.other', icon: 'calendar', color: '#1E88E5' },
];

export default function AddImportantDateScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { isArabic } = useLocalization();
  const { colors, cardBackground, screenBackground, textPrimary, textSecondary } = useTheme();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<DateType>('BIRTHDAY');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  // Animation refs
  const dateSlideAnim = useRef(new Animated.Value(300)).current;
  const typeSlideAnim = useRef(new Animated.Value(300)).current;

  // Date picker animation
  useEffect(() => {
    if (showDatePicker) {
      Animated.spring(dateSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      dateSlideAnim.setValue(300);
    }
  }, [showDatePicker]);

  // Type picker animation
  useEffect(() => {
    if (showTypePicker) {
      Animated.spring(typeSlideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      typeSlideAnim.setValue(300);
    }
  }, [showTypePicker]);

  const getTypeConfig = (t: DateType) => DATE_TYPES.find((dt) => dt.type === t) || DATE_TYPES[0];

  const handleSave = () => {
    if (!title.trim()) return;

    // TODO: Save to store/API
    const newDate = {
      id: Date.now().toString(),
      title: title.trim(),
      date: date.toISOString(),
      type,
    };

    console.log('Saving date:', newDate);
    router.back();
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const renderSaveButton = () => (
    <TouchableOpacity
      style={[styles.saveHeaderButton, !title.trim() && styles.saveHeaderButtonDisabled]}
      onPress={handleSave}
      disabled={!title.trim()}
    >
      <Text style={[styles.saveHeaderText, !title.trim() && styles.saveHeaderTextDisabled]}>
        {t('common.save')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      <UIHeader
        title={t('profile.dates.add')}
        rightAction={renderSaveButton()}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: textSecondary }]}>
            {isArabic ? 'العنوان' : 'Title'}
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: cardBackground, color: textPrimary }]}
            placeholder={isArabic ? 'مثال: عيد ميلاد أمي' : "e.g., Mom's Birthday"}
            placeholderTextColor={colors.gray[400]}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Date Picker */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: textSecondary }]}>
            {isArabic ? 'التاريخ' : 'Date'}
          </Text>
          <TouchableOpacity
            style={[styles.datePickerButton, { backgroundColor: cardBackground }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather name="calendar" size={20} color={Colors.primary} />
            <Text style={[styles.datePickerText, { color: textPrimary }]}>
              {date.toLocaleDateString(isArabic ? 'ar-QA' : 'en-QA', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
            <Feather name={isArabic ? 'chevron-left' : 'chevron-right'} size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Type Selector */}
        <View style={styles.inputGroup}>
          <Text style={[styles.inputLabel, { color: textSecondary }]}>
            {isArabic ? 'النوع' : 'Type'}
          </Text>
          <TouchableOpacity
            style={[styles.typePickerButton, { backgroundColor: cardBackground }]}
            onPress={() => setShowTypePicker(true)}
          >
            <View style={[styles.typeIconSmall, { backgroundColor: `${getTypeConfig(type).color}15` }]}>
              <Feather name={getTypeConfig(type).icon as any} size={18} color={getTypeConfig(type).color} />
            </View>
            <Text style={[styles.typePickerText, { color: textPrimary }]}>
              {t(getTypeConfig(type).labelKey)}
            </Text>
            <Feather name={isArabic ? 'chevron-left' : 'chevron-right'} size={20} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Save Button */}
      <View style={[styles.bottomContainer, { backgroundColor: screenBackground }]}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: Colors.primary },
            !title.trim() && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={!title.trim()}
        >
          <Text style={styles.saveButtonText}>
            {t('common.save')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Slide Sheet */}
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowDatePicker(false)}>
          <Animated.View
            style={[
              styles.sheetContainer,
              { backgroundColor: cardBackground, transform: [{ translateY: dateSlideAnim }] },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: textPrimary }]}>
                  {isArabic ? 'اختر التاريخ' : 'Select Date'}
                </Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={[styles.sheetDone, { color: Colors.primary }]}>
                    {t('common.done')}
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={date}
                mode="date"
                display="spinner"
                onChange={onDateChange}
                style={styles.datePickerSpinner}
                textColor={textPrimary}
              />
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

      {/* Type Picker Slide Sheet */}
      <Modal
        visible={showTypePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowTypePicker(false)}>
          <Animated.View
            style={[
              styles.sheetContainer,
              { backgroundColor: cardBackground, transform: [{ translateY: typeSlideAnim }] },
            ]}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={styles.sheetHandle} />
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: textPrimary }]}>
                  {isArabic ? 'اختر النوع' : 'Select Type'}
                </Text>
                <TouchableOpacity onPress={() => setShowTypePicker(false)}>
                  <Text style={[styles.sheetDone, { color: Colors.primary }]}>
                    {t('common.done')}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.typeOptionsSheet}>
                {DATE_TYPES.map((typeConfig) => {
                  const isSelected = type === typeConfig.type;
                  return (
                    <TouchableOpacity
                      key={typeConfig.type}
                      style={[
                        styles.typeOptionSheet,
                        isSelected && { backgroundColor: `${typeConfig.color}10` },
                      ]}
                      onPress={() => {
                        setType(typeConfig.type);
                        setShowTypePicker(false);
                      }}
                    >
                      <View style={[styles.typeIconContainer, { backgroundColor: `${typeConfig.color}15` }]}>
                        <Feather name={typeConfig.icon as any} size={22} color={typeConfig.color} />
                      </View>
                      <Text style={[styles.typeOptionLabel, { color: textPrimary }]}>
                        {t(typeConfig.labelKey)}
                      </Text>
                      {isSelected && (
                        <View style={[styles.checkmark, { backgroundColor: typeConfig.color }]}>
                          <Feather name="check" size={14} color="#fff" />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  datePickerText: {
    flex: 1,
    fontSize: 16,
  },
  typePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    gap: 12,
  },
  typePickerText: {
    flex: 1,
    fontSize: 16,
  },
  typeIconSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomContainer: {
    padding: 20,
    paddingBottom: 36,
  },
  saveButton: {
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  saveHeaderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: Colors.primary,
  },
  saveHeaderButtonDisabled: {
    backgroundColor: Colors.gray[200],
  },
  saveHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  saveHeaderTextDisabled: {
    color: Colors.gray[400],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sheetDone: {
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerSpinner: {
    height: 200,
  },
  typeOptionsSheet: {
    paddingVertical: 8,
  },
  typeOptionSheet: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  typeIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeOptionLabel: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
  },
  checkmark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
