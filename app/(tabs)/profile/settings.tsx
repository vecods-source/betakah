import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useLocalization } from '../../../src/hooks';
import { logout } from '../../../src/store/slices/authSlice';
import { Colors } from '../../../src/constants/colors';
import { UIBackButton } from '../../../src/components/ui';

export default function SettingsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isArabic, setLanguage } = useLocalization();

  const handleLogout = () => {
    Alert.alert(
      isArabic ? 'تسجيل الخروج' : 'Logout',
      isArabic ? 'هل أنت متأكد؟' : 'Are you sure you want to logout?',
      [
        { text: isArabic ? 'إلغاء' : 'Cancel', style: 'cancel' },
        {
          text: isArabic ? 'خروج' : 'Logout',
          style: 'destructive',
          onPress: async () => {
            await dispatch(logout());
            router.replace('/(auth)');
          },
        },
      ]
    );
  };

  const handleLanguageChange = async () => {
    await setLanguage(isArabic ? 'en' : 'ar');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <UIBackButton style={styles.backButton} />
        <Text style={[styles.title, isArabic && styles.textRTL]}>{isArabic ? 'الإعدادات' : 'Settings'}</Text>
      </View>

      <ScrollView style={styles.content}>
        <TouchableOpacity style={styles.menuItem} onPress={handleLanguageChange}>
          <Text style={styles.menuIcon}>🌐</Text>
          <View style={styles.menuContent}>
            <Text style={styles.menuLabel}>{isArabic ? 'اللغة' : 'Language'}</Text>
            <Text style={styles.menuValue}>{isArabic ? 'العربية' : 'English'}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={handleLogout}>
          <Text style={styles.menuIcon}>🚪</Text>
          <Text style={styles.logoutText}>{isArabic ? 'تسجيل الخروج' : 'Logout'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: { backgroundColor: Colors.white, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.gray[200] },
  backButton: { marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.black },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  content: { flex: 1, padding: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 8 },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 16, fontWeight: '500', color: Colors.black },
  menuValue: { fontSize: 14, color: Colors.gray[500], marginTop: 2 },
  logoutItem: { marginTop: 24 },
  logoutText: { fontSize: 16, fontWeight: '600', color: Colors.error },
});
