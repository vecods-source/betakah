import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAppSelector } from '../../hooks';
import { ProfileStackScreenProps } from '../../navigation/types';
import { UIStack, UIText, UIButton, UIIcon, UISpacer, UIAvatar } from '../../components/ui';

type Props = ProfileStackScreenProps<'EditProfile'>;

export default function EditProfileScreen({ navigation }: Props) {
  const { user } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isLoading, setIsLoading] = useState(false);

  const hasChanges =
    firstName !== user?.firstName || lastName !== user?.lastName;

  const handleSave = async () => {
    if (!hasChanges) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigation.goBack();
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <UIStack direction="horizontal" align="center">
          <UIButton variant="plain" onPress={() => navigation.goBack()}>
            <UIText color="#718096">Cancel</UIText>
          </UIButton>
          <UISpacer />
          <UIText size="lg" weight="semibold">Edit Profile</UIText>
          <UISpacer />
          <TouchableOpacity
            disabled={!hasChanges || isLoading}
            onPress={handleSave}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#2c5282" />
            ) : (
              <UIText
                color={hasChanges ? '#2c5282' : '#a0aec0'}
                weight="semibold"
              >
                Save
              </UIText>
            )}
          </TouchableOpacity>
        </UIStack>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <UIStack spacing={12} align="center">
            <UIAvatar
              initials={`${firstName?.[0] || '?'}${lastName?.[0] || ''}`}
              size={100}
            />
            <UIButton variant="plain">
              <UIText color="#2c5282" weight="medium" size="sm">
                Change Photo
              </UIText>
            </UIButton>
          </UIStack>
        </View>

        {/* Form Section */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <UIText size="sm" weight="medium" color="#4a5568">
              First Name
            </UIText>
            <TextInput
              style={styles.input}
              placeholder="Enter first name"
              placeholderTextColor="#a0aec0"
              value={firstName}
              onChangeText={setFirstName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <UIText size="sm" weight="medium" color="#4a5568">
              Last Name
            </UIText>
            <TextInput
              style={styles.input}
              placeholder="Enter last name"
              placeholderTextColor="#a0aec0"
              value={lastName}
              onChangeText={setLastName}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <UIText size="sm" weight="medium" color="#4a5568">
              Phone Number
            </UIText>
            <View style={styles.disabledInput}>
              <UIStack direction="horizontal" spacing={8} align="center">
                <UIIcon name="lock.fill" color="#a0aec0" size={14} />
                <UIText color="#718096">{user?.phoneNumber}</UIText>
              </UIStack>
            </View>
            <UIText size="xs" color="#a0aec0">
              Phone number cannot be changed
            </UIText>
          </View>

          <View style={styles.inputGroup}>
            <UIText size="sm" weight="medium" color="#4a5568">
              Gender
            </UIText>
            <View style={styles.disabledInput}>
              <UIStack direction="horizontal" spacing={8} align="center">
                <UIIcon name="lock.fill" color="#a0aec0" size={14} />
                <UIText color="#718096">
                  {user?.gender === 'MALE' ? 'Male' : 'Female'}
                </UIText>
              </UIStack>
            </View>
            <UIText size="xs" color="#a0aec0">
              Gender cannot be changed after registration
            </UIText>
          </View>
        </View>
      </ScrollView>
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
  },
  avatarSection: {
    marginBottom: 32,
  },
  formSection: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#f7fafc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1a202c',
    marginTop: 8,
  },
  disabledInput: {
    backgroundColor: '#edf2f7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 6,
  },
});
