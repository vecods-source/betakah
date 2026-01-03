import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppSelector } from '../../../src/hooks';
import { Invitation } from '../../../src/types';
import { UIText, UIIcon, UIBadge } from '../../../src/components/ui';
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACCEPTED': return '#38A169';
      case 'DECLINED': return '#E53E3E';
      case 'MAYBE': return '#DD6B20';
      default: return Colors.primary;
    }
  };

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
    const statusColor = getStatusColor(invitation.rsvpStatus);

    return (
      <TouchableOpacity
        key={invitation.id}
        style={styles.invitationCard}
        onPress={() => openSheet(invitation)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <UIBadge variant="info">{event.type.replace('_', ' ')}</UIBadge>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}15` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <UIText size={12} weight="medium" color={statusColor}>
                {getStatusLabel(invitation.rsvpStatus)}
              </UIText>
            </View>
          </View>

          <UIText size={17} weight="semibold" color="#1a202c" style={styles.cardTitle}>
            {event.title}
          </UIText>

          <View style={styles.hostRow}>
            <UIIcon name="person.fill" color="#718096" size={14} />
            <UIText size={13} color="#718096" style={styles.hostName}>
              {`${event.host?.firstName || ''} ${event.host?.lastName || ''}`.trim()}
            </UIText>
          </View>

          <View style={styles.cardMeta}>
            <View style={styles.metaItem}>
              <UIIcon name="calendar" color="#718096" size={14} />
              <UIText size={13} color="#718096">
                {new Date(event.startDate).toLocaleDateString('en-QA', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </UIText>
            </View>
            <View style={styles.metaItem}>
              <UIIcon name="mappin" color="#718096" size={14} />
              <UIText size={13} color="#718096" numberOfLines={1} style={styles.locationText}>
                {event.location || t('events.form.location')}
              </UIText>
            </View>
          </View>

          {invitation.rsvpStatus === 'PENDING' && (
            <View style={styles.pendingAction}>
              <UIText size={13} weight="medium" color={Colors.primary}>
                {t('invitations.tapToRespond')}
              </UIText>
              <UIIcon name="chevron.right" color={Colors.primary} size={14} />
            </View>
          )}

          {daysUntil >= 0 && daysUntil <= 7 && (
            <View style={styles.daysChip}>
              <UIText size={12} weight="semibold" color={daysUntil <= 1 ? '#E53E3E' : Colors.primary}>
                {daysUntil === 0 ? t('home.today') : daysUntil === 1 ? t('home.tomorrow') : `${daysUntil} days left`}
              </UIText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <UIText size={28} weight="bold" color="#1a202c">
          {t('invitations.title')}
        </UIText>
        {filterCounts.PENDING > 0 && (
          <View style={styles.pendingBadge}>
            <UIText size={13} weight="semibold" color="#fff">
              {filterCounts.PENDING}
            </UIText>
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
            <UIText
              size={14}
              weight={activeFilter === filter.key ? 'semibold' : 'regular'}
              color={activeFilter === filter.key ? '#fff' : '#4a5568'}
            >
              {filter.label}
            </UIText>
            {filterCounts[filter.key] > 0 && (
              <View style={[
                styles.filterCount,
                activeFilter === filter.key && styles.filterCountActive,
              ]}>
                <UIText
                  size={11}
                  weight="semibold"
                  color={activeFilter === filter.key ? Colors.primary : '#718096'}
                >
                  {filterCounts[filter.key]}
                </UIText>
              </View>
            )}
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
            colors={[Colors.primary]}
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
            <UIIcon name="envelope" color="#CBD5E0" size={48} />
            <UIText size={16} weight="medium" color="#718096" style={styles.emptyTitle}>
              {activeFilter === 'ALL'
                ? t('invitations.empty.noInvitations')
                : t('invitations.empty.noFiltered')}
            </UIText>
            <UIText size={14} color="#a0aec0" style={styles.emptySubtitle}>
              {t('invitations.empty.description')}
            </UIText>
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
    backgroundColor: '#f7fafc',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#f7fafc',
  },
  pendingBadge: {
    marginLeft: 10,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  filtersContainer: {
    maxHeight: 50,
    backgroundColor: '#f7fafc',
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterCount: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  filterCountActive: {
    backgroundColor: '#fff',
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
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardTitle: {
    marginBottom: 8,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  hostName: {
    flex: 1,
  },
  cardMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    maxWidth: 150,
  },
  pendingAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  daysChip: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: 8,
    textAlign: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});
