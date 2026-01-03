import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../src/hooks';
import { Colors } from '../../../src/constants/colors';
import { UIHeader } from '../../../src/components/ui';

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const { allEvents, upcomingEvents } = useAppSelector((state) => state.events);

  const event = [...allEvents, ...upcomingEvents].find((e) => e.id === id);

  if (!event) {
    return (
      <View style={styles.container}>
        <UIHeader title={t('events.details')} />
        <View style={styles.center}>
          <Text style={styles.notFound}>
            {t('events.empty.title')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <UIHeader title={t('events.details')} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Event Title */}
        <Text style={[styles.title, isRTL && styles.textRTL]}>{event.title}</Text>
        {event.titleAr && (
          <Text style={[styles.titleAr, isRTL && styles.textRTL]}>{event.titleAr}</Text>
        )}

        {/* Date */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {t('events.form.startDate')}
          </Text>
          <Text style={[styles.sectionValue, isRTL && styles.textRTL]}>
            {new Date(event.startDate).toLocaleDateString('en-QA', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>

        {/* Location */}
        {event.location && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('events.form.location')}
            </Text>
            <Text style={[styles.sectionValue, isRTL && styles.textRTL]}>
              {event.location}
            </Text>
          </View>
        )}

        {/* Description */}
        {event.description && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
              {t('events.form.description')}
            </Text>
            <Text style={[styles.sectionValue, isRTL && styles.textRTL]}>
              {event.description}
            </Text>
          </View>
        )}

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{event.guestCount || 0}</Text>
            <Text style={styles.statLabel}>{t('events.guests.invited')}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{event.stats?.accepted || 0}</Text>
            <Text style={styles.statLabel}>{t('events.guests.accepted')}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.black,
    marginBottom: 4,
  },
  titleAr: {
    fontSize: 20,
    color: Colors.gray[600],
    marginBottom: 20,
  },
  textRTL: {
    textAlign: 'right',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[500],
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionValue: {
    fontSize: 16,
    color: Colors.black,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  stat: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.primary,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 4,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFound: {
    fontSize: 16,
    color: Colors.gray[500],
  },
});
