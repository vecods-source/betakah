import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TextInput } from 'react-native';
import { EventsStackScreenProps } from '../../navigation/types';
import { useAppSelector } from '../../hooks';
import {
  UIStack,
  UISpacer,
  UIText,
  UIButton,
  UIAvatar,
  UIBadge,
  UIEmptyState,
} from '../../components/ui';

type Props = EventsStackScreenProps<'GuestList'>;

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  rsvpStatus: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'MAYBE';
  gender: 'MALE' | 'FEMALE';
}

export default function GuestListScreen({ navigation, route }: Props) {
  const { eventId } = route.params;
  const { currentEvent } = useAppSelector((state) => state.events);
  const { user } = useAppSelector((state) => state.auth);

  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'accepted' | 'pending' | 'declined'>('all');
  const [guests] = useState<Guest[]>([]);

  const isHost = currentEvent?.hostId === user?.id;

  const filteredGuests = guests.filter((guest) => {
    const matchesSearch =
      guest.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guest.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === 'all') return matchesSearch;
    return matchesSearch && guest.rsvpStatus === filter.toUpperCase();
  });

  const getBadgeVariant = (status: string): 'success' | 'error' | 'warning' | 'default' => {
    switch (status) {
      case 'ACCEPTED':
        return 'success';
      case 'DECLINED':
        return 'error';
      case 'MAYBE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const stats = {
    total: guests.length,
    accepted: guests.filter((g) => g.rsvpStatus === 'ACCEPTED').length,
    pending: guests.filter((g) => g.rsvpStatus === 'PENDING').length,
    declined: guests.filter((g) => g.rsvpStatus === 'DECLINED').length,
  };

  const renderGuestItem = ({ item }: { item: Guest }) => {
    return (
      <View style={styles.guestCard}>
        <UIStack direction="horizontal" spacing={12} alignItems="center">
          <UIAvatar
            name={`${item.firstName} ${item.lastName}`}
            size={44}
          />
          <UIStack direction="vertical" spacing={2}>
            <UIText size={16} weight="medium" color="#1a202c">
              {item.firstName} {item.lastName}
            </UIText>
            <UIText size={13} color="#718096">
              {item.gender}
            </UIText>
          </UIStack>
          <UISpacer />
          <UIBadge variant={getBadgeVariant(item.rsvpStatus)}>
            {item.rsvpStatus}
          </UIBadge>
        </UIStack>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <UIEmptyState
        icon="person.2.fill"
        title="No guests yet"
        message={isHost ? 'Start inviting guests to your event' : 'Guest list is empty'}
      />
    </View>
  );

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
            Guest List
          </UIText>
          <UISpacer />
          <View style={{ width: 50 }} />
        </UIStack>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <UIStack direction="horizontal" spacing={0}>
          <View style={styles.statItem}>
            <UIText size={24} weight="bold" color="#1a202c">{stats.total}</UIText>
            <UIText size={12} color="#718096">Total</UIText>
          </View>
          <View style={styles.statItem}>
            <UIText size={24} weight="bold" color="#38a169">{stats.accepted}</UIText>
            <UIText size={12} color="#718096">Accepted</UIText>
          </View>
          <View style={styles.statItem}>
            <UIText size={24} weight="bold" color="#d69e2e">{stats.pending}</UIText>
            <UIText size={12} color="#718096">Pending</UIText>
          </View>
          <View style={styles.statItem}>
            <UIText size={24} weight="bold" color="#e53e3e">{stats.declined}</UIText>
            <UIText size={12} color="#718096">Declined</UIText>
          </View>
        </UIStack>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search guests..."
          placeholderTextColor="#a0aec0"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <UIStack direction="horizontal" spacing={8}>
          {(['all', 'accepted', 'pending', 'declined'] as const).map((f) => (
            <UIButton
              key={f}
              variant={filter === f ? 'primary' : 'secondary'}
              onPress={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </UIButton>
          ))}
        </UIStack>
      </View>

      <FlatList
        data={filteredGuests}
        keyExtractor={(item) => item.id}
        renderItem={renderGuestItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {isHost && (
        <View style={styles.footer}>
          <UIButton variant="primary" fullWidth>
            Invite Guests
          </UIButton>
        </View>
      )}
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
  statsContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1a202c',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  guestCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  emptyContainer: {
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
