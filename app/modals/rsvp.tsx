import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useLocalization } from '../../src/hooks';
import { Colors } from '../../src/constants/colors';

export default function RSVPModal() {
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const { isArabic } = useLocalization();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const options = [
    { id: 'ACCEPTED', labelEn: 'Accept', labelAr: 'قبول', icon: '✓' },
    { id: 'MAYBE', labelEn: 'Maybe', labelAr: 'ربما', icon: '?' },
    { id: 'DECLINED', labelEn: 'Decline', labelAr: 'رفض', icon: '✗' },
  ];

  const handleSubmit = () => {
    // TODO: Submit RSVP
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <Text style={[styles.title, isArabic && styles.textRTL]}>{isArabic ? 'تأكيد الحضور' : 'RSVP'}</Text>

      <View style={styles.options}>
        {options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[styles.option, selectedStatus === option.id && styles.optionSelected]}
            onPress={() => setSelectedStatus(option.id)}
          >
            <Text style={styles.optionIcon}>{option.icon}</Text>
            <Text style={[styles.optionLabel, selectedStatus === option.id && styles.optionLabelSelected]}>
              {isArabic ? option.labelAr : option.labelEn}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.submitButton, !selectedStatus && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!selectedStatus}
      >
        <Text style={styles.submitButtonText}>{isArabic ? 'تأكيد' : 'Confirm'}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
        <Text style={styles.cancelButtonText}>{isArabic ? 'إلغاء' : 'Cancel'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white, paddingHorizontal: 24, paddingTop: 12 },
  handle: { width: 40, height: 4, backgroundColor: Colors.gray[300], borderRadius: 2, alignSelf: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: '700', color: Colors.black, marginBottom: 24, textAlign: 'center' },
  textRTL: { writingDirection: 'rtl' },
  options: { gap: 12, marginBottom: 32 },
  option: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: Colors.gray[50], borderRadius: 12, borderWidth: 2, borderColor: Colors.gray[200] },
  optionSelected: { borderColor: Colors.primary, backgroundColor: 'rgba(120, 16, 74, 0.05)' },
  optionIcon: { fontSize: 20, marginRight: 12 },
  optionLabel: { fontSize: 16, fontWeight: '600', color: Colors.gray[600] },
  optionLabelSelected: { color: Colors.primary },
  submitButton: { backgroundColor: Colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: Colors.gray[300] },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: Colors.white },
  cancelButton: { paddingVertical: 16, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, color: Colors.gray[500] },
});
