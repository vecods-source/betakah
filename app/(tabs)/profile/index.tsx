import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppSelector, useLocalization } from '../../../src/hooks';
import { Colors } from '../../../src/constants/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const { isArabic } = useLocalization();

  const menuItems = [
    { id: 'settings', labelEn: 'Settings', labelAr: 'الإعدادات', icon: '⚙️', route: '/(tabs)/profile/settings' },
    { id: 'important-dates', labelEn: 'Important Dates', labelAr: 'تواريخ مهمة', icon: '📅' },
    { id: 'blocked', labelEn: 'Blocked Users', labelAr: 'المستخدمين المحظورين', icon: '🚫' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.firstName?.[0] || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.firstName} {user?.lastName}</Text>
        <Text style={styles.phone}>{user?.phoneNumber}</Text>
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>{isArabic ? 'تعديل الملف' : 'Edit Profile'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => item.route && router.push(item.route as any)}
          >
            <Text style={styles.menuIcon}>{item.icon}</Text>
            <Text style={[styles.menuLabel, isArabic && styles.textRTL]}>{isArabic ? item.labelAr : item.labelEn}</Text>
            <Text style={styles.menuArrow}>{isArabic ? '←' : '→'}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: { backgroundColor: Colors.white, paddingTop: 60, paddingBottom: 24, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: Colors.gray[200] },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.white },
  name: { fontSize: 22, fontWeight: '700', color: Colors.black, marginBottom: 4 },
  phone: { fontSize: 14, color: Colors.gray[500], marginBottom: 16 },
  editButton: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: Colors.gray[100], borderRadius: 20 },
  editButtonText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  content: { flex: 1, padding: 16 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 8 },
  menuIcon: { fontSize: 20, marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 16, fontWeight: '500', color: Colors.black },
  textRTL: { textAlign: 'right' },
  menuArrow: { fontSize: 16, color: Colors.gray[400] },
});
