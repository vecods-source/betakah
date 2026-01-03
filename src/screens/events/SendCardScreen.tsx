import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { EventsStackScreenProps } from '../../navigation/types';
import { useAppSelector } from '../../hooks';
import {
  UIStack,
  UISpacer,
  UIText,
  UIButton,
  UIIcon,
} from '../../components/ui';

type Props = EventsStackScreenProps<'SendCard'>;

interface CardTemplate {
  id: string;
  name: string;
  preview: string;
}

const CARD_TEMPLATES: CardTemplate[] = [
  { id: '1', name: 'Elegant Gold', preview: 'sparkles' },
  { id: '2', name: 'Classic White', preview: 'heart.fill' },
  { id: '3', name: 'Modern Minimal', preview: 'square.fill' },
  { id: '4', name: 'Traditional Arabic', preview: 'moon.stars.fill' },
  { id: '5', name: 'Floral Garden', preview: 'leaf.fill' },
  { id: '6', name: 'Royal Blue', preview: 'crown.fill' },
];

export default function SendCardScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { currentEvent } = useAppSelector((state) => state.events);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [personalMessage, setPersonalMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSendCards = async () => {
    if (!selectedTemplate) return;

    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      navigation.goBack();
    }, 2000);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UIStack direction="horizontal" alignItems="center">
          <UIButton variant="plain" onPress={() => navigation.goBack()} icon="chevron.left">
            Back
          </UIButton>
          <UISpacer />
          <UIText size={18} weight="semibold" color="#1a202c">
            Send Invitations
          </UIText>
          <UISpacer />
          <View style={{ width: 50 }} />
        </UIStack>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Event Info */}
        {currentEvent && (
          <View style={styles.section}>
            <View style={styles.eventInfoCard}>
              <UIStack direction="vertical" spacing={4}>
                <UIText size={12} color="#718096">Sending invitations for</UIText>
                <UIText size={18} weight="semibold" color="#1a202c">
                  {currentEvent.title}
                </UIText>
              </UIStack>
            </View>
          </View>
        )}

        {/* Templates */}
        <View style={styles.section}>
          <UIText size={16} weight="semibold" color="#1a202c">
            Choose a Template
          </UIText>
          <View style={styles.templatesGrid}>
            {CARD_TEMPLATES.map((template) => (
              <TouchableOpacity
                key={template.id}
                style={[
                  styles.templateCard,
                  selectedTemplate === template.id && styles.templateCardSelected,
                ]}
                onPress={() => setSelectedTemplate(template.id)}
              >
                <UIStack direction="vertical" spacing={8} alignItems="center">
                  <UIIcon
                    name={template.preview}
                    color={selectedTemplate === template.id ? '#2c5282' : '#718096'}
                    size={32}
                  />
                  <UIText
                    size={11}
                    color={selectedTemplate === template.id ? '#2c5282' : '#4a5568'}
                    align="center"
                  >
                    {template.name}
                  </UIText>
                </UIStack>
                {selectedTemplate === template.id && (
                  <View style={styles.selectedBadge}>
                    <UIIcon name="checkmark" color="#ffffff" size={12} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Personal Message */}
        <View style={styles.section}>
          <UIText size={16} weight="semibold" color="#1a202c">
            Personal Message (Optional)
          </UIText>
          <TextInput
            style={styles.messageInput}
            placeholder="Add a personal message to your invitation..."
            placeholderTextColor="#a0aec0"
            multiline
            numberOfLines={4}
            value={personalMessage}
            onChangeText={setPersonalMessage}
            textAlignVertical="top"
          />
        </View>

        {/* Delivery Options */}
        <View style={styles.section}>
          <UIText size={16} weight="semibold" color="#1a202c">
            Delivery Options
          </UIText>
          <View style={styles.optionCard}>
            <UIStack direction="horizontal" spacing={12} alignItems="center">
              <UIIcon name="message.fill" color="#2c5282" size={24} />
              <UIStack direction="vertical" spacing={2}>
                <UIText size={16} weight="medium" color="#1a202c">
                  SMS Invitation
                </UIText>
                <UIText size={13} color="#718096">
                  Send via SMS to all guests
                </UIText>
              </UIStack>
              <UISpacer />
              <UIIcon name="checkmark.circle.fill" color="#2c5282" size={24} />
            </UIStack>
          </View>
          <View style={styles.optionCard}>
            <UIStack direction="horizontal" spacing={12} alignItems="center">
              <UIIcon name="bubble.left.and.bubble.right.fill" color="#718096" size={24} />
              <UIStack direction="vertical" spacing={2}>
                <UIText size={16} weight="medium" color="#1a202c">
                  WhatsApp
                </UIText>
                <UIText size={13} color="#718096">
                  Share via WhatsApp
                </UIText>
              </UIStack>
              <UISpacer />
              <UIIcon name="circle" color="#a0aec0" size={24} />
            </UIStack>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <UIStack direction="horizontal" spacing={12}>
          <UIButton
            variant="secondary"
            disabled={!selectedTemplate}
            fullWidth
          >
            Preview
          </UIButton>
          <UIButton
            variant="primary"
            disabled={!selectedTemplate}
            loading={isSending}
            onPress={handleSendCards}
            fullWidth
          >
            Send to All Guests
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
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  section: {
    marginBottom: 24,
  },
  eventInfoCard: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  templatesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  templateCard: {
    width: '31%',
    aspectRatio: 0.8,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  templateCardSelected: {
    borderColor: '#2c5282',
    backgroundColor: '#ebf8ff',
  },
  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#2c5282',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageInput: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1a202c',
    minHeight: 100,
    marginTop: 12,
  },
  optionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  footer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
});
