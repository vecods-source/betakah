import React, { useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { ProfileStackScreenProps } from '../../navigation/types';
import { UIStack, UIText, UIButton, UIIcon, UISpacer, UIAvatar, UIHeader, UIEmptyState } from '../../components/ui';

type Props = ProfileStackScreenProps<'BlockedUsers'>;

interface BlockedUser {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  blockedAt: string;
}

export default function BlockedUsersScreen({ navigation }: Props) {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);

  const handleUnblock = (user: BlockedUser) => {
    Alert.alert(
      'Unblock User',
      `Are you sure you want to unblock ${user.firstName} ${user.lastName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Unblock',
          onPress: () => {
            setBlockedUsers(blockedUsers.filter((u) => u.id !== user.id));
          },
        },
      ]
    );
  };

  const renderBlockedUser = ({ item }: { item: BlockedUser }) => (
    <View style={styles.userCard}>
      <UIStack direction="horizontal" spacing={12} align="center">
        <UIAvatar
          initials={`${item.firstName[0]}${item.lastName[0]}`}
          size={48}
          backgroundColor="#e2e8f0"
          textColor="#4a5568"
        />
        <UIStack spacing={2} style={{ flex: 1 }}>
          <UIText weight="medium">
            {item.firstName} {item.lastName}
          </UIText>
          <UIText size="sm" color="#718096">
            Blocked {new Date(item.blockedAt).toLocaleDateString('en-QA', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </UIText>
        </UIStack>
        <TouchableOpacity
          style={styles.unblockButton}
          onPress={() => handleUnblock(item)}
        >
          <UIText size="sm" weight="medium" color="#c53030">
            Unblock
          </UIText>
        </TouchableOpacity>
      </UIStack>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <UIEmptyState
        icon="person.crop.circle.badge.xmark"
        title="No blocked users"
        message="Users you block won't be able to invite you to their events or see your profile"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <UIHeader
        title="Blocked Users"
        onBack={() => navigation.goBack()}
      />

      <FlatList
        data={blockedUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderBlockedUser}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fafc',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  unblockButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#fed7d7',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
