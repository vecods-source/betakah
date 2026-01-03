import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { CreateStackScreenProps } from '../../navigation/types';
import {
  UIStack,
  UISpacer,
  UIText,
  UIButton,
  UIIcon,
  UIAvatar,
  UIEmptyState,
} from '../../components/ui';

type Props = CreateStackScreenProps<'InviteGuests'>;

interface Contact {
  id: string;
  name: string;
  phoneNumber: string;
  selected: boolean;
}

export default function InviteGuestsScreen({ navigation, route }: Props) {
  const { eventId } = route.params;

  const [searchQuery, setSearchQuery] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const selectedCount = contacts.filter((c) => c.selected).length;

  const handleToggleContact = (id: string) => {
    setContacts(
      contacts.map((c) =>
        c.id === id ? { ...c, selected: !c.selected } : c
      )
    );
  };

  const handleAddManual = () => {
    if (manualPhone.length < 8) return;

    const newContact: Contact = {
      id: Date.now().toString(),
      name: `+974${manualPhone}`,
      phoneNumber: `+974${manualPhone}`,
      selected: true,
    };

    setContacts([newContact, ...contacts]);
    setManualPhone('');
  };

  const handleImportContacts = () => {
    const mockContacts: Contact[] = [
      { id: '1', name: 'Ahmed Al-Thani', phoneNumber: '+97450001111', selected: false },
      { id: '2', name: 'Fatima Hassan', phoneNumber: '+97450002222', selected: false },
      { id: '3', name: 'Mohammed Ali', phoneNumber: '+97450003333', selected: false },
    ];
    setContacts(mockContacts);
  };

  const handleSendInvitations = async () => {
    const selectedContacts = contacts.filter((c) => c.selected);
    if (selectedContacts.length === 0) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.getParent()?.navigate('EventsTab');
    }, 2000);
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phoneNumber.includes(searchQuery)
  );

  const renderContactItem = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={[styles.contactCard, item.selected && styles.contactCardSelected]}
      onPress={() => handleToggleContact(item.id)}
    >
      <UIStack direction="horizontal" spacing={12} alignItems="center">
        <UIAvatar
          name={item.name}
          size={44}
        />
        <UIStack direction="vertical" spacing={2}>
          <UIText size={16} weight="medium" color="#1a202c">
            {item.name}
          </UIText>
          <UIText size={14} color="#718096">
            {item.phoneNumber}
          </UIText>
        </UIStack>
        <UISpacer />
        <UIIcon
          name={item.selected ? 'checkmark.circle.fill' : 'circle'}
          color={item.selected ? '#2c5282' : '#e2e8f0'}
          size={24}
        />
      </UIStack>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <UIEmptyState
        icon="person.crop.circle.badge.plus"
        title="Import Contacts"
        message="Import your phone contacts to quickly invite guests"
        action={{
          label: 'Import from Contacts',
          onPress: handleImportContacts,
        }}
      />
    </View>
  );

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
              Invite Guests
            </UIText>
            <UIText size={14} color="#718096">
              Select contacts to invite to your event
            </UIText>
          </UIStack>
        </UIStack>
      </View>

      {/* Add Manual Phone */}
      <View style={styles.addManualSection}>
        <UIText size={14} weight="medium" color="#4a5568">
          Add by Phone Number
        </UIText>
        <View style={styles.manualRow}>
          <View style={styles.phoneInputContainer}>
            <UIText size={16} weight="medium" color="#4a5568">
              +974
            </UIText>
            <TextInput
              style={styles.phoneInput}
              placeholder="5000 0000"
              placeholderTextColor="#a0aec0"
              keyboardType="phone-pad"
              value={manualPhone}
              onChangeText={(text) => setManualPhone(text.replace(/[^0-9]/g, '').slice(0, 8))}
            />
          </View>
          <TouchableOpacity
            style={[styles.addButton, manualPhone.length < 8 && styles.buttonDisabled]}
            onPress={handleAddManual}
            disabled={manualPhone.length < 8}
          >
            <UIIcon name="plus" color="#ffffff" size={16} />
          </TouchableOpacity>
        </View>
      </View>

      {contacts.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {/* Search */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <UIIcon name="magnifyingglass" color="#a0aec0" size={16} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search contacts..."
                placeholderTextColor="#a0aec0"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <FlatList
            data={filteredContacts}
            keyExtractor={(item) => item.id}
            renderItem={renderContactItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <UIStack direction="horizontal" spacing={16} alignItems="center">
          <UIStack direction="vertical" spacing={2}>
            <UIText size={24} weight="bold" color="#2c5282">
              {selectedCount}
            </UIText>
            <UIText size={12} color="#718096">selected</UIText>
          </UIStack>
          <UISpacer />
          <UIButton
            variant="primary"
            disabled={selectedCount === 0}
            loading={isLoading}
            onPress={handleSendInvitations}
            icon="paperplane.fill"
          >
            Send Invitations
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
  addManualSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  manualRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  phoneInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a202c',
    paddingVertical: 12,
  },
  addButton: {
    backgroundColor: '#2c5282',
    width: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#a0aec0',
  },
  searchSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1a202c',
    paddingVertical: 12,
  },
  listContent: {
    padding: 16,
  },
  contactCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  contactCardSelected: {
    backgroundColor: '#ebf8ff',
    borderWidth: 1,
    borderColor: '#2c5282',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  footer: {
    padding: 24,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
});
