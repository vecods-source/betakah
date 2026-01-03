import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAppSelector } from '../../../src/hooks';
import { Invitation } from '../../../src/types';
import { InvitationSlideSheet } from '../../../src/components/InvitationSlideSheet';
import { Colors } from '../../../src/constants/colors';

type FilterStatus = 'ALL' | 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'MAYBE';

const getDaysUntil = (dateString: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(dateString);
  targetDate.setHours(0, 0, 0, 0);
  return Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export default function InvitationsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { invitations, isLoading } = useAppSelector((state) => state.events);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('ALL');
  const [selectedInvitation, setSelectedInvitation] = useState<Invitation | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const openSheet = useCallback((invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    setSelectedInvitation(null);
  }, []);

  const filteredInvitations = useMemo(() => {
    if (activeFilter === 'ALL') return invitations;
    return invitations.filter(inv => inv.rsvpStatus === activeFilter);
  }, [invitations, activeFilter]);

  const filterCounts = useMemo(() => ({
    ALL: invitations.length,
    PENDING: invitations.filter(i => i.rsvpStatus === 'PENDING').length,
    ACCEPTED: invitations.filter(i => i.rsvpStatus === 'ACCEPTED').length,
    DECLINED: invitations.filter(i => i.rsvpStatus === 'DECLINED').length,
    MAYBE: invitations.filter(i => i.rsvpStatus === 'MAYBE').length,
  }), [invitations]);

  const filters: { key: FilterStatus; label: string }[] = [
    { key: 'ALL', label: t('invitations.filters.all') },
    { key: 'PENDING', label: t('invitations.filters.pending') },
    { key: 'ACCEPTED', label: t('invitations.filters.accepted') },
    { key: 'MAYBE', label: t('invitations.filters.maybe') },
    { key: 'DECLINED', label: t('invitations.filters.declined') },
  ];

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return t('events.rsvp.accepted');
      case 'DECLINED': return t('events.rsvp.declined');
      case 'MAYBE': return t('events.rsvp.maybe');
      default: return t('events.rsvp.pending');
    }
  };

  const renderInvitationCard = (invitation: Invitation) => {
    const event = invitation.event;
    if (!event) return null;

    const daysUntil = getDaysUntil(event.startDate);

    return (
      <TouchableOpacity
        key={invitation.id}
        style={styles.invitationCard}
        onPress={() => openSheet(invitation)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          {/* Event Type & Status */}
          <View style={styles.cardHeader}>
            <Text style={styles.eventType}>{event.type.replace('_', ' ')}</Text>
            <Text style={[
              styles.statusText,
              invitation.rsvpStatus === 'ACCEPTED' && styles.statusAccepted,
              invitation.rsvpStatus === 'DECLINED' && styles.statusDeclined,
              invitation.rsvpStatus === 'MAYBE' && styles.statusMaybe,
            ]}>
              {getStatusLabel(invitation.rsvpStatus)}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.cardTitle}>{event.title}</Text>

          {/* Host */}
          <Text style={styles.hostText}>
            {t('home.fromHost', { name: `${event.host?.firstName || ''} ${event.host?.lastName || ''}`.trim() })}
          </Text>

          {/* Date & Location */}
          <View style={styles.cardMeta}>
            <Text style={styles.metaText}>
              {new Date(event.startDate).toLocaleDateString('en-QA', {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
              })}
              {event.location ? ` · ${event.location}` : ''}
            </Text>
            {daysUntil >= 0 && daysUntil <= 7 && (
              <Text style={styles.daysText}>
                {daysUntil === 0 ? t('home.today') : daysUntil === 1 ? t('home.tomorrow') : `${daysUntil} ${t('home.daysLeft')}`}
              </Text>
            )}
          </View>

          {/* Pending Action */}
          {invitation.rsvpStatus === 'PENDING' && (
            <View style={styles.pendingAction}>
              <Text style={styles.pendingText}>{t('invitations.tapToRespond')}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>{t('invitations.title')}</Text>
        {filterCounts.PENDING > 0 && (
          <View style={styles.pendingBadge}>
            <Text style={styles.pendingBadgeText}>{filterCounts.PENDING}</Text>
          </View>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map(filter => (
          <Pressable
            key={filter.key}
            style={[
              styles.filterChip,
              activeFilter === filter.key && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter.key)}
          >
            <Text style={[
              styles.filterText,
              activeFilter === filter.key && styles.filterTextActive,
            ]}>
              {filter.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Invitations List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredInvitations.length > 0 ? (
          <View style={styles.listContainer}>
            {filteredInvitations.map(renderInvitationCard)}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Feather name="mail" size={48} color={Colors.gray[300]} />
            <Text style={styles.emptyTitle}>
              {activeFilter === 'ALL'
                ? t('invitations.empty.noInvitations')
                : t('invitations.empty.noFiltered', { filter: filters.find(f => f.key === activeFilter)?.label.toLowerCase() })}
            </Text>
            <Text style={styles.emptySubtitle}>
              {t('invitations.empty.description')}
            </Text>
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Invitation Slide Sheet */}
      <InvitationSlideSheet
        invitation={selectedInvitation}
        visible={sheetVisible}
        onClose={closeSheet}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.black,
  },
  pendingBadge: {
    marginLeft: 10,
    backgroundColor: Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pendingBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[700],
  },
  filtersContainer: {
    maxHeight: 44,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: Colors.black,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.gray[600],
    lineHeight: 14,
    includeFontPadding: false,
  },
  filterTextActive: {
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  listContainer: {
    gap: 12,
  },
  invitationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  eventType: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  statusAccepted: {
    color: '#22C55E',
  },
  statusDeclined: {
    color: '#EF4444',
  },
  statusMaybe: {
    color: '#F59E0B',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.black,
    marginBottom: 6,
  },
  hostText: {
    fontSize: 13,
    color: Colors.gray[500],
    marginBottom: 12,
  },
  cardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  metaText: {
    fontSize: 13,
    color: Colors.gray[500],
  },
  daysText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.gray[600],
  },
  pendingAction: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
    alignItems: 'center',
  },
  pendingText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[500],
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.gray[400],
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});
