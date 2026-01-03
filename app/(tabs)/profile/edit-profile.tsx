import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { useAppSelector, useAppDispatch } from '../../../src/hooks';
import { UIHeader } from '../../../src/components/ui';
import { Colors } from '../../../src/constants/colors';

export default function EditProfileScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const dispatch = useAppDispatch();

  const { user } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(user?.profilePhotoUrl || null);
  const [isLoading, setIsLoading] = useState(false);

  const getInitials = () => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return (first + last).toUpperCase() || '?';
  };

  const handlePickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert(
        t('common.error'),
        'Permission to access photos is required'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert(t('common.error'), t('errors.required'));
      return;
    }

    setIsLoading(true);
    // TODO: Dispatch update profile action
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(t('common.success'), t('profile.edit.title'));
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <UIHeader
        title={t('profile.edit.title')}
        rightAction={
          <TouchableOpacity onPress={handleSave} disabled={isLoading}>
            <Text style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
              {t('common.save')}
            </Text>
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <TouchableOpacity style={styles.photoContainer} onPress={handlePickImage}>
            {profilePhoto ? (
              <Image source={{ uri: profilePhoto }} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitials}>{getInitials()}</Text>
              </View>
            )}
            <View style={styles.photoEditBadge}>
              <Feather name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.changePhotoText}>{t('profile.edit.changePhoto')}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* First Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>
              {t('profile.edit.firstName')}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder={t('auth.registration.firstNamePlaceholder')}
              placeholderTextColor={Colors.gray[400]}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          {/* Last Name */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>
              {t('profile.edit.lastName')}
            </Text>
            <TextInput
              style={[styles.input, isRTL && styles.inputRTL]}
              value={lastName}
              onChangeText={setLastName}
              placeholder={t('auth.registration.lastNamePlaceholder')}
              placeholderTextColor={Colors.gray[400]}
              textAlign={isRTL ? 'right' : 'left'}
            />
          </View>

          {/* Phone (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>
              {t('profile.edit.phone')}
            </Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>{user?.phoneNumber || '+974 XXXX XXXX'}</Text>
            </View>
            <Text style={styles.helperText}>{t('profile.edit.phoneNote')}</Text>
          </View>

          {/* Gender (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={[styles.label, isRTL && styles.textRTL]}>
              {t('profile.edit.gender')}
            </Text>
            <View style={styles.readOnlyInput}>
              <Text style={styles.readOnlyText}>
                {user?.gender === 'MALE' ? t('auth.registration.male') : t('auth.registration.female')}
              </Text>
            </View>
            <Text style={styles.helperText}>{t('profile.edit.genderNote')}</Text>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  photoContainer: {
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitials: {
    fontSize: 36,
    fontWeight: '700',
    color: '#fff',
  },
  photoEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[700],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: Colors.gray[50],
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  textRTL: {
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  inputRTL: {
    textAlign: 'right',
  },
  readOnlyInput: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  readOnlyText: {
    fontSize: 16,
    color: Colors.gray[500],
  },
  helperText: {
    fontSize: 12,
    color: Colors.gray[400],
    marginTop: 4,
  },
});
