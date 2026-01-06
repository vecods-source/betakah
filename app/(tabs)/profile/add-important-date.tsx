import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalization, useTheme } from '../../../src/hooks';
import { DatePickerSheet, UIInput } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/colors';

type DateType = 'BIRTHDAY' | 'ANNIVERSARY' | 'OTHER';

const DATE_TYPES: { type: DateType; labelKey: string; icon: keyof typeof Feather.glyphMap; color: string }[] = [
  { type: 'BIRTHDAY', labelKey: 'profile.dates.types.birthday', icon: 'gift', color: '#E53935' },
  { type: 'ANNIVERSARY', labelKey: 'profile.dates.types.anniversary', icon: 'heart', color: '#D81B60' },
  { type: 'OTHER', labelKey: 'profile.dates.types.other', icon: 'calendar', color: '#1E88E5' },
];

export default function AddImportantDateScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { isArabic } = useLocalization();
  const { colors, cardBackground, screenBackground, textPrimary, textSecondary, isDark } = useTheme();

  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date());
  const [type, setType] = useState<DateType>('BIRTHDAY');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);

  const getTypeConfig = (dateType: DateType) => DATE_TYPES.find((dt) => dt.type === dateType) || DATE_TYPES[0];

  const handleSave = () => {
    if (!title.trim()) return;

    const newDate = {
      id: Date.now().toString(),
      title: title.trim(),
      date: date.toISOString(),
      type,
    };

    console.log('Saving date:', newDate);
    router.back();
  };

  const formatDate = (d: Date) => {
    return d.toLocaleDateString(isArabic ? 'ar-QA' : 'en-QA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const canSave = title.trim().length > 0;
  const currentTypeConfig = getTypeConfig(type);

  return (
    <View style={[styles.container, { backgroundColor: screenBackground }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: isDark ? colors.gray[800] : colors.gray[100] }]}
          onPress={() => router.back()}
        >
          <Feather name={isArabic ? 'arrow-right' : 'arrow-left'} size={20} color={textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: textPrimary }]}>
          {isArabic ? 'إضافة تاريخ مهم' : 'Add Important Date'}
        </Text>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: canSave ? Colors.primary : (isDark ? colors.gray[800] : colors.gray[200]) }
          ]}
          onPress={handleSave}
          disabled={!canSave}
        >
          <Text style={[styles.saveButtonText, { color: canSave ? '#fff' : colors.gray[400] }]}>
            {isArabic ? 'حفظ' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <UIInput
          label={isArabic ? 'العنوان' : 'Title'}
          placeholder={isArabic ? 'مثال: عيد ميلاد أمي' : "e.g., Mom's Birthday"}
          value={title}
          onChangeText={setTitle}
        />

        {/* Date Picker Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: textSecondary, textAlign: 'left' }]}>
            {isArabic ? 'التاريخ' : 'Date'}
          </Text>
          <TouchableOpacity
            style={[styles.dateField, { borderBottomColor: isDark ? colors.gray[600] : Colors.gray[300] }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Feather name="calendar" size={18} color={Colors.primary} />
            <Text style={[styles.dateText, { color: textPrimary, textAlign: 'left' }]}>
              {formatDate(date)}
            </Text>
            <Feather name="chevron-down" size={18} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>

        {/* Type Selector Field */}
        <View style={styles.fieldGroup}>
          <Text style={[styles.fieldLabel, { color: textSecondary, textAlign: 'left' }]}>
            {isArabic ? 'النوع' : 'Type'}
          </Text>
          <TouchableOpacity
            style={[styles.typeField, { backgroundColor: cardBackground }]}
            onPress={() => setShowTypePicker(true)}
          >
            <View style={[styles.typeIconWrapper, { backgroundColor: `${currentTypeConfig.color}15` }]}>
              <Feather name={currentTypeConfig.icon} size={20} color={currentTypeConfig.color} />
            </View>
            <Text style={[styles.typeText, { color: textPrimary, textAlign: 'left' }]}>
              {t(currentTypeConfig.labelKey)}
            </Text>
            <Feather name="chevron-down" size={18} color={colors.gray[400]} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Date Picker Sheet */}
      <DatePickerSheet
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onConfirm={(selectedDate) => setDate(selectedDate)}
        value={date}
        mode="date"
        title={isArabic ? 'اختر التاريخ' : 'Select Date'}
      />

      {/* Type Picker Bottom Sheet */}
      <Modal
        visible={showTypePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTypePicker(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setShowTypePicker(false)}>
          <Pressable
            style={[styles.bottomSheet, { backgroundColor: cardBackground }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.sheetHandle, { backgroundColor: colors.gray[300] }]} />
            <Text style={[styles.sheetTitle, { color: textPrimary }]}>
              {isArabic ? 'اختر النوع' : 'Select Type'}
            </Text>

            <View style={styles.typeList}>
              {DATE_TYPES.map((typeConfig) => {
                const isSelected = type === typeConfig.type;
                return (
                  <TouchableOpacity
                    key={typeConfig.type}
                    style={[
                      styles.typeOption,
                      isSelected && { backgroundColor: `${typeConfig.color}10` },
                    ]}
                    onPress={() => {
                      setType(typeConfig.type);
                      setShowTypePicker(false);
                    }}
                  >
                    <View style={[styles.typeOptionIcon, { backgroundColor: `${typeConfig.color}15` }]}>
                      <Feather name={typeConfig.icon} size={22} color={typeConfig.color} />
                    </View>
                    <Text style={[styles.typeOptionText, { color: textPrimary, textAlign: 'left' }]}>
                      {t(typeConfig.labelKey)}
                    </Text>
                    {isSelected && (
                      <View style={[styles.checkCircle, { backgroundColor: typeConfig.color }]}>
                        <Feather name="check" size={14} color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  fieldGroup: {
    marginBottom: 24,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    gap: 10,
  },
  dateText: {
    flex: 1,
    fontSize: 17,
  },
  typeField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  typeIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  typeList: {
    paddingVertical: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 14,
  },
  typeOptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeOptionText: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
