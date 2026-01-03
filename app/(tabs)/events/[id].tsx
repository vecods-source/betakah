import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAppSelector, useLocalization } from '../../../src/hooks';
import { Colors } from '../../../src/constants/colors';
import { UIBackButton } from '../../../src/components/ui';

export default function EventDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isArabic } = useLocalization();
  const { allEvents, upcomingEvents } = useAppSelector((state) => state.events);

  const event = [...allEvents, ...upcomingEvents].find((e) => e.id === id);

  if (!event) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <UIBackButton style={styles.backButton} />
        </View>
        <View style={styles.center}>
          <Text style={styles.notFound}>{isArabic ? 'المناسبة غير موجودة' : 'Event not found'}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <UIBackButton style={styles.backButton} />
        <Text style={[styles.title, isArabic && styles.textRTL]}>{event.title}</Text>
        {event.titleAr && <Text style={[styles.titleAr, isArabic && styles.textRTL]}>{event.titleAr}</Text>}
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{isArabic ? 'التاريخ' : 'Date'}</Text>
          <Text style={styles.sectionValue}>{new Date(event.startDate).toLocaleDateString('en-QA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
        </View>

        {event.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isArabic ? 'الموقع' : 'Location'}</Text>
            <Text style={styles.sectionValue}>{event.location}</Text>
          </View>
        )}

        {event.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{isArabic ? 'الوصف' : 'Description'}</Text>
            <Text style={styles.sectionValue}>{event.description}</Text>
          </View>
        )}

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{event.guestCount || 0}</Text>
            <Text style={styles.statLabel}>{isArabic ? 'ضيوف' : 'Guests'}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{event.stats?.accepted || 0}</Text>
            <Text style={styles.statLabel}>{isArabic ? 'مؤكد' : 'Confirmed'}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.gray[200] },
  backButton: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', color: Colors.black },
  titleAr: { fontSize: 22, color: Colors.gray[600], marginTop: 4 },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  content: { flex: 1 },
  contentContainer: { padding: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: '600', color: Colors.gray[500], marginBottom: 4 },
  sectionValue: { fontSize: 16, color: Colors.black },
  statsRow: { flexDirection: 'row', gap: 16, marginTop: 24 },
  stat: { flex: 1, backgroundColor: Colors.gray[50], borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: Colors.primary },
  statLabel: { fontSize: 14, color: Colors.gray[500], marginTop: 4 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  notFound: { fontSize: 16, color: Colors.gray[500] },
});
