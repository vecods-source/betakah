import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
  Animated,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalization, useTheme } from '../../hooks';
import { Colors } from '../../constants/colors';

interface DatePickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  value: Date;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
  title?: string;
}

export function DatePickerSheet({
  visible,
  onClose,
  onConfirm,
  value,
  mode = 'date',
  minimumDate,
  maximumDate,
  title,
}: DatePickerSheetProps) {
  const { isArabic } = useLocalization();
  const { cardBackground, textPrimary } = useTheme();
  const [tempDate, setTempDate] = useState(value);
  const slideAnim = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      setTempDate(value);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      slideAnim.setValue(300);
    }
  }, [visible, value]);

  const handleConfirm = () => {
    onConfirm(tempDate);
    onClose();
  };

  const getTitle = () => {
    if (title) return title;
    if (mode === 'time') {
      return isArabic ? 'اختر الوقت' : 'Select Time';
    }
    return isArabic ? 'اختر التاريخ' : 'Select Date';
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.sheet,
            { backgroundColor: cardBackground, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.handle} />
            <Text style={[styles.title, { color: textPrimary }]}>
              {getTitle()}
            </Text>
            <View style={styles.pickerContainer}>
              <DateTimePicker
                value={tempDate}
                mode={mode === 'datetime' ? 'date' : mode}
                display="spinner"
                onChange={(_, date) => date && setTempDate(date)}
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                locale={isArabic ? 'ar' : 'en'}
                textColor={textPrimary}
              />
            </View>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Text style={styles.confirmButtonText}>
                {isArabic ? 'تأكيد' : 'Confirm'}
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  pickerContainer: {
    alignItems: 'center',
  },
  confirmButton: {
    marginHorizontal: 24,
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
