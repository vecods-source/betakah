import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { CreateStackScreenProps } from '../../navigation/types';
import {
  UIStack,
  UISpacer,
  UIText,
  UIButton,
  UIIcon,
  UIBadge,
} from '../../components/ui';

type Props = CreateStackScreenProps<'AddSession'>;

type GenderRestriction = 'MIXED' | 'MALE_ONLY' | 'FEMALE_ONLY';

interface Session {
  id: string;
  name: string;
  nameAr?: string;
  startTime: string;
  endTime: string;
  location?: string;
  genderRestriction: GenderRestriction;
}

export default function AddSessionScreen({ navigation, route }: Props) {
  const { eventId } = route.params;

  const [sessions, setSessions] = useState<Session[]>([]);
  const [showForm, setShowForm] = useState(true);

  // Form state
  const [name, setName] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [genderRestriction, setGenderRestriction] = useState<GenderRestriction>('MIXED');

  const resetForm = () => {
    setName('');
    setNameAr('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    setGenderRestriction('MIXED');
  };

  const handleAddSession = () => {
    if (!name.trim() || !startTime || !endTime) return;

    const newSession: Session = {
      id: Date.now().toString(),
      name: name.trim(),
      nameAr: nameAr.trim() || undefined,
      startTime,
      endTime,
      location: location.trim() || undefined,
      genderRestriction,
    };

    setSessions([...sessions, newSession]);
    resetForm();
    setShowForm(false);
  };

  const handleRemoveSession = (id: string) => {
    setSessions(sessions.filter((s) => s.id !== id));
  };

  const handleContinue = () => {
    navigation.navigate('InviteGuests', { eventId });
  };

  const handleSkip = () => {
    navigation.navigate('InviteGuests', { eventId });
  };

  const getGenderIcon = (gender: GenderRestriction) => {
    switch (gender) {
      case 'MALE_ONLY':
        return 'person.fill';
      case 'FEMALE_ONLY':
        return 'person.fill';
      default:
        return 'person.2.fill';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UIStack direction="vertical" spacing={16}>
          <UIButton variant="plain" onPress={() => navigation.goBack()} icon="chevron.left">
            Back
          </UIButton>
          <UIStack direction="vertical" spacing={4}>
            <UIText size={24} weight="bold" color="#1a202c">
              Event Sessions
            </UIText>
            <UIText size={14} color="#718096">
              Add sessions for different parts of your event
            </UIText>
          </UIStack>
        </UIStack>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Existing Sessions */}
        {sessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <UIStack direction="vertical" spacing={8}>
              <UIStack direction="horizontal" alignItems="center">
                <UIText size={18} weight="semibold" color="#1a202c">
                  {session.name}
                </UIText>
                <UISpacer />
                <UIButton variant="plain" onPress={() => handleRemoveSession(session.id)}>
                  Remove
                </UIButton>
              </UIStack>
              <UIStack direction="horizontal" spacing={8} alignItems="center">
                <UIIcon name="clock.fill" color="#718096" size={14} />
                <UIText size={14} color="#718096">
                  {session.startTime} - {session.endTime}
                </UIText>
              </UIStack>
              {session.location && (
                <UIStack direction="horizontal" spacing={8} alignItems="center">
                  <UIIcon name="mappin.circle.fill" color="#718096" size={14} />
                  <UIText size={14} color="#718096">{session.location}</UIText>
                </UIStack>
              )}
              <UIBadge variant="default">{session.genderRestriction.replace('_', ' ')}</UIBadge>
            </UIStack>
          </View>
        ))}

        {/* Add Session Form */}
        {showForm ? (
          <View style={styles.formCard}>
            <UIText size={18} weight="semibold" color="#1a202c">
              {sessions.length === 0 ? 'Add First Session' : 'Add Another Session'}
            </UIText>

            <View style={styles.inputGroup}>
              <UIText size={14} weight="medium" color="#4a5568">
                Session Name *
              </UIText>
              <TextInput
                style={styles.input}
                placeholder="e.g., Reception, Ceremony"
                placeholderTextColor="#a0aec0"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <UIText size={14} weight="medium" color="#4a5568">
                Arabic Name (Optional)
              </UIText>
              <TextInput
                style={[styles.input, { textAlign: 'right' }]}
                placeholder="اسم الجلسة"
                placeholderTextColor="#a0aec0"
                value={nameAr}
                onChangeText={setNameAr}
              />
            </View>

            <View style={styles.timeRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <UIText size={14} weight="medium" color="#4a5568">
                  Start Time *
                </UIText>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor="#a0aec0"
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                <UIText size={14} weight="medium" color="#4a5568">
                  End Time *
                </UIText>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor="#a0aec0"
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <UIText size={14} weight="medium" color="#4a5568">
                Location (Optional)
              </UIText>
              <TextInput
                style={styles.input}
                placeholder="Session venue"
                placeholderTextColor="#a0aec0"
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <View style={styles.inputGroup}>
              <UIText size={14} weight="medium" color="#4a5568">
                Gender Restriction
              </UIText>
              <View style={styles.genderOptions}>
                {(['MIXED', 'MALE_ONLY', 'FEMALE_ONLY'] as const).map((option) => (
                  <TouchableOpacity
                    key={option}
                    style={[
                      styles.genderOption,
                      genderRestriction === option && styles.genderOptionSelected,
                    ]}
                    onPress={() => setGenderRestriction(option)}
                  >
                    <UIStack direction="horizontal" spacing={6} alignItems="center">
                      <UIIcon
                        name={getGenderIcon(option)}
                        color={genderRestriction === option ? '#ffffff' : '#4a5568'}
                        size={14}
                      />
                      <UIText
                        size={11}
                        weight="medium"
                        color={genderRestriction === option ? '#ffffff' : '#4a5568'}
                      >
                        {option.replace('_', ' ')}
                      </UIText>
                    </UIStack>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.addButtonContainer}>
              <UIButton
                variant="primary"
                disabled={!name.trim() || !startTime || !endTime}
                onPress={handleAddSession}
                fullWidth
                icon="plus"
              >
                Add Session
              </UIButton>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={() => setShowForm(true)}
          >
            <UIStack direction="horizontal" spacing={8} alignItems="center">
              <UIIcon name="plus.circle.fill" color="#2c5282" size={20} />
              <UIText size={16} weight="medium" color="#2c5282">
                Add Another Session
              </UIText>
            </UIStack>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <UIStack direction="horizontal" spacing={12}>
          <UIButton variant="secondary" onPress={handleSkip} fullWidth>
            Skip
          </UIButton>
          <UIButton
            variant="primary"
            disabled={sessions.length === 0}
            onPress={handleContinue}
            fullWidth
          >
            Continue
          </UIButton>
        </UIStack>
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
  sessionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
  },
  inputGroup: {
    marginTop: 16,
  },
  input: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a202c',
    marginTop: 8,
  },
  timeRow: {
    flexDirection: 'row',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f7fafc',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#2c5282',
  },
  addButtonContainer: {
    marginTop: 16,
  },
  addMoreButton: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
  },
  footer: {
    flexDirection: 'row',
    padding: 24,
    gap: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
});
