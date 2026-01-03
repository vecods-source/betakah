import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { RootStackScreenProps } from '../../navigation/types';
import { UIStack, UIText, UIButton, UIIcon, UISpacer } from '../../components/ui';

type Props = RootStackScreenProps<'RSVPModal'>;

type RSVPStatus = 'ACCEPTED' | 'DECLINED' | 'MAYBE';

export default function RSVPModal({ navigation, route }: Props) {
  const { eventId, invitationId } = route.params;
  const [selectedStatus, setSelectedStatus] = useState<RSVPStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStatus) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      navigation.goBack();
    }, 1500);
  };

  const options: { status: RSVPStatus; icon: string; label: string; color: string }[] = [
    { status: 'ACCEPTED', icon: 'checkmark', label: 'Accept', color: '#38a169' },
    { status: 'MAYBE', icon: 'questionmark', label: 'Maybe', color: '#d69e2e' },
    { status: 'DECLINED', icon: 'xmark', label: 'Decline', color: '#e53e3e' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.handle} />

        <UIStack spacing={8} align="center">
          <UIText size="2xl" weight="bold">RSVP to Event</UIText>
          <UIText size="sm" color="#718096">
            Let the host know if you'll be attending
          </UIText>
        </UIStack>

        <View style={styles.optionsContainer}>
          {options.map((option) => (
            <TouchableOpacity
              key={option.status}
              style={[
                styles.optionCard,
                selectedStatus === option.status && {
                  borderColor: option.color,
                  backgroundColor: `${option.color}10`,
                },
              ]}
              onPress={() => setSelectedStatus(option.status)}
            >
              <UIStack spacing={12} align="center">
                <View
                  style={[
                    styles.optionIcon,
                    {
                      backgroundColor:
                        selectedStatus === option.status
                          ? option.color
                          : `${option.color}20`,
                    },
                  ]}
                >
                  <UIIcon
                    name={option.icon}
                    color={selectedStatus === option.status ? 'white' : option.color}
                    size={24}
                  />
                </View>
                <UIText
                  weight="semibold"
                  color={selectedStatus === option.status ? option.color : '#4a5568'}
                >
                  {option.label}
                </UIText>
              </UIStack>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.buttonContainer}>
          <UIStack direction="horizontal" spacing={12}>
            <View style={{ flex: 1 }}>
              <UIButton variant="secondary" onPress={() => navigation.goBack()}>
                Cancel
              </UIButton>
            </View>
            <View style={{ flex: 1 }}>
              <UIButton
                variant="primary"
                disabled={!selectedStatus || isSubmitting}
                onPress={handleSubmit}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  'Confirm RSVP'
                )}
              </UIButton>
            </View>
          </UIStack>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 12,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 24,
  },
  optionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 32,
  },
  optionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    marginTop: 8,
  },
});
