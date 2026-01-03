import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { CreateStackScreenProps } from '../../navigation/types';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { createEvent } from '../../store/slices/eventsSlice';
import {
  UIStack,
  UIText,
  UIButton,
  UIIcon,
} from '../../components/ui';

type Props = CreateStackScreenProps<'CreateEvent'>;

type EventType = 'WEDDING' | 'ENGAGEMENT' | 'BIRTHDAY' | 'GRADUATION' | 'BABY_SHOWER' | 'EID_GATHERING' | 'PRIVATE_PARTY' | 'OTHER';

const EVENT_TYPES: { value: EventType; label: string; icon: string }[] = [
  { value: 'WEDDING', label: 'Wedding', icon: 'heart.fill' },
  { value: 'ENGAGEMENT', label: 'Engagement', icon: 'ring' },
  { value: 'BIRTHDAY', label: 'Birthday', icon: 'gift.fill' },
  { value: 'GRADUATION', label: 'Graduation', icon: 'graduationcap.fill' },
  { value: 'BABY_SHOWER', label: 'Baby Shower', icon: 'figure.and.child.holdinghands' },
  { value: 'EID_GATHERING', label: 'Eid Gathering', icon: 'moon.stars.fill' },
  { value: 'PRIVATE_PARTY', label: 'Private Party', icon: 'party.popper.fill' },
  { value: 'OTHER', label: 'Other', icon: 'sparkles' },
];

export default function CreateEventScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.events);

  const [eventType, setEventType] = useState<EventType | null>(null);
  const [title, setTitle] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const isValid = eventType && title.trim().length >= 3 && startDate;

  const handleCreate = async () => {
    if (!isValid || !eventType) return;

    const result = await dispatch(
      createEvent({
        type: eventType,
        title: title.trim(),
        titleAr: titleAr.trim() || undefined,
        description: description.trim() || undefined,
        location: location.trim() || undefined,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
      })
    );

    if (createEvent.fulfilled.match(result)) {
      navigation.navigate('AddSession', { eventId: result.payload.id });
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UIStack direction="vertical" spacing={4}>
          <UIText size={28} weight="bold" color="#1a202c">
            Create Event
          </UIText>
          <UIText size={14} color="#718096">
            Set up your private event
          </UIText>
        </UIStack>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Event Type Section */}
        <View style={styles.section}>
          <UIText size={16} weight="semibold" color="#1a202c">
            Event Type
          </UIText>
          <View style={styles.typesGrid}>
            {EVENT_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  eventType === type.value && styles.typeCardSelected,
                ]}
                onPress={() => setEventType(type.value)}
              >
                <UIStack direction="vertical" spacing={8} alignItems="center">
                  <UIIcon
                    name={type.icon}
                    color={eventType === type.value ? '#2c5282' : '#718096'}
                    size={28}
                  />
                  <UIText
                    size={10}
                    color={eventType === type.value ? '#2c5282' : '#4a5568'}
                    weight={eventType === type.value ? 'semibold' : 'regular'}
                    align="center"
                  >
                    {type.label}
                  </UIText>
                </UIStack>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Event Details Section */}
        <View style={styles.section}>
          <UIText size={16} weight="semibold" color="#1a202c">
            Event Details
          </UIText>

          <View style={styles.inputGroup}>
            <UIText size={14} weight="medium" color="#4a5568">
              Event Title *
            </UIText>
            <TextInput
              style={styles.input}
              placeholder="Enter event title"
              placeholderTextColor="#a0aec0"
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <UIText size={14} weight="medium" color="#4a5568">
              Arabic Title (Optional)
            </UIText>
            <TextInput
              style={[styles.input, styles.inputArabic]}
              placeholder="أدخل عنوان الحدث"
              placeholderTextColor="#a0aec0"
              value={titleAr}
              onChangeText={setTitleAr}
              textAlign="right"
            />
          </View>

          <View style={styles.inputGroup}>
            <UIText size={14} weight="medium" color="#4a5568">
              Description (Optional)
            </UIText>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Add event description..."
              placeholderTextColor="#a0aec0"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.inputGroup}>
            <UIStack direction="horizontal" spacing={8} alignItems="center">
              <UIIcon name="mappin.circle.fill" color="#2c5282" size={16} />
              <UIText size={14} weight="medium" color="#4a5568">
                Location (Optional)
              </UIText>
            </UIStack>
            <TextInput
              style={styles.input}
              placeholder="Enter venue or address"
              placeholderTextColor="#a0aec0"
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.dateRow}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <UIStack direction="horizontal" spacing={8} alignItems="center">
                <UIIcon name="calendar" color="#2c5282" size={16} />
                <UIText size={14} weight="medium" color="#4a5568">
                  Start Date *
                </UIText>
              </UIStack>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#a0aec0"
                value={startDate}
                onChangeText={setStartDate}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
              <UIText size={14} weight="medium" color="#4a5568">
                End Date
              </UIText>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#a0aec0"
                value={endDate}
                onChangeText={setEndDate}
              />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <UIButton
          variant="primary"
          disabled={!isValid}
          loading={isLoading}
          onPress={handleCreate}
          fullWidth
          icon="arrow.right"
        >
          Continue
        </UIButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
  },
  typesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  typeCard: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardSelected: {
    borderColor: '#2c5282',
    backgroundColor: '#ebf8ff',
  },
  inputGroup: {
    marginTop: 20,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a202c',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 8,
  },
  inputArabic: {
    fontFamily: undefined,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 14,
  },
  dateRow: {
    flexDirection: 'row',
  },
  footer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
});
