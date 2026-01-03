import React, { useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector, useLocalization } from '../../../src/hooks';
import { fetchAllEvents } from '../../../src/store/slices/eventsSlice';
import { Event } from '../../../src/types';
import { Colors } from '../../../src/constants/colors';

export default function EventsListScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { allEvents, isLoading } = useAppSelector((state) => state.events);
  const { isArabic } = useLocalization();

  const loadEvents = useCallback(() => {
    dispatch(fetchAllEvents());
  }, [dispatch]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, isArabic && styles.textRTL]}>{isArabic ? 'المناسبات' : 'Events'}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={loadEvents} tintColor={Colors.primary} />}
      >
        {allEvents.map((event: Event) => (
          <TouchableOpacity
            key={event.id}
            style={styles.eventCard}
            onPress={() => router.push({ pathname: '/(tabs)/events/[id]', params: { id: event.id } })}
          >
            <Text style={styles.eventTitle}>{event.title}</Text>
            <Text style={styles.eventDate}>{new Date(event.startDate).toLocaleDateString()}</Text>
          </TouchableOpacity>
        ))}
        {!isLoading && allEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{isArabic ? 'لا توجد مناسبات' : 'No events yet'}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray[50] },
  header: { backgroundColor: Colors.white, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: Colors.gray[200] },
  title: { fontSize: 28, fontWeight: '700', color: Colors.black },
  textRTL: { textAlign: 'right', writingDirection: 'rtl' },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, flexGrow: 1 },
  eventCard: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  eventTitle: { fontSize: 18, fontWeight: '600', color: Colors.black, marginBottom: 4 },
  eventDate: { fontSize: 14, color: Colors.gray[500] },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: Colors.gray[500] },
});
