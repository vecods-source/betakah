import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { RootStackScreenProps } from '../../navigation/types';
import { useAppSelector } from '../../hooks';
import { UIStack, UIText, UIButton, UIIcon, UISpacer } from '../../components/ui';

type Props = RootStackScreenProps<'InvitationPreview'>;

const { width } = Dimensions.get('window');
const CARD_WIDTH = width - 48;

export default function InvitationPreviewModal({ navigation, route }: Props) {
  const { eventId, templateId } = route.params;
  const { currentEvent } = useAppSelector((state) => state.events);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UIStack direction="horizontal" align="center">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <UIIcon name="xmark" color="#718096" size={20} />
          </TouchableOpacity>
          <UISpacer />
          <UIText size="lg" weight="semibold">Invitation Preview</UIText>
          <UISpacer />
          <View style={{ width: 44 }} />
        </UIStack>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cardContainer}>
          <View style={styles.invitationCard}>
            <UIStack spacing={24}>
              {/* Decoration */}
              <UIStack direction="horizontal" align="center" justify="center">
                <UIIcon name="sparkles" color="#d4af37" size={40} />
              </UIStack>

              {/* You're Invited */}
              <UIStack direction="horizontal" align="center" justify="center">
                <View style={styles.invitedBadge}>
                  <UIText size="sm" weight="semibold" color="#2c5282">
                    YOU'RE INVITED
                  </UIText>
                </View>
              </UIStack>

              {/* Event Title */}
              <UIStack spacing={8} align="center">
                <UIText size={28} weight="bold" align="center">
                  {currentEvent?.title || 'Event Title'}
                </UIText>
                {currentEvent?.titleAr && (
                  <UIText size={24} color="#4a5568" align="center">
                    {currentEvent.titleAr}
                  </UIText>
                )}
              </UIStack>

              {/* Divider */}
              <UIStack direction="horizontal" align="center" justify="center">
                <View style={styles.divider} />
              </UIStack>

              {/* Details */}
              <UIStack spacing={12}>
                <UIStack direction="horizontal" spacing={12} align="center">
                  <UIIcon name="calendar" color="#2c5282" size={18} />
                  <UIText color="#4a5568">
                    {currentEvent?.startDate
                      ? new Date(currentEvent.startDate).toLocaleDateString('en-QA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Date TBD'}
                  </UIText>
                </UIStack>

                {currentEvent?.location && (
                  <UIStack direction="horizontal" spacing={12} align="center">
                    <UIIcon name="mappin.circle.fill" color="#2c5282" size={18} />
                    <UIText color="#4a5568">{currentEvent.location}</UIText>
                  </UIStack>
                )}
              </UIStack>

              {/* RSVP Section */}
              <View style={styles.rsvpSection}>
                <UIText size="sm" color="#718096" align="center">
                  Please respond to let us know if you can attend
                </UIText>
              </View>

              {/* Footer */}
              <UIText size="xs" color="#a0aec0" align="center">
                Powered by Betakah
              </UIText>
            </UIStack>
          </View>
        </View>

        <UIText size="sm" color="#718096" align="center">
          This is how your invitation will appear to guests
        </UIText>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <UIButton variant="primary" onPress={() => navigation.goBack()}>
          <UIStack direction="horizontal" spacing={8} align="center" justify="center">
            <UIIcon name="checkmark" color="white" size={16} />
            <UIText color="white" weight="semibold">Looks Good</UIText>
          </UIStack>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
    alignItems: 'center',
  },
  cardContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 24,
  },
  invitationCard: {
    width: CARD_WIDTH,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 32,
  },
  invitedBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#ebf8ff',
    borderRadius: 8,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#e2e8f0',
  },
  rsvpSection: {
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  footer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
});
