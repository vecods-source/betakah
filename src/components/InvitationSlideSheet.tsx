import React, { useRef, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
  Animated,
  Dimensions,
  PanResponder,
  Text,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppDispatch, useLocalization } from '../hooks';
import { updateRsvp } from '../store/slices/eventsSlice';
import { Invitation, Event as EventType } from '../types';
import { InvitationCard } from './InvitationCard';
import { getDefaultTemplate, getTemplateById } from '../themes/templates';
import { Colors } from '../constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.9;

interface InvitationSlideSheetProps {
  // For RSVP mode (invitation details)
  invitation?: Invitation | null;
  // For preview mode (create event)
  event?: Partial<EventType> | null;
  templateId?: string | null;
  customColor?: string | null;
  // Common props
  visible: boolean;
  onClose: () => void;
  // Mode flags
  isPreview?: boolean; // true = preview mode (no RSVP), false = RSVP mode
  title?: string;
  subtitle?: string;
}

export function InvitationSlideSheet({
  invitation,
  event: providedEvent,
  templateId,
  customColor,
  visible,
  onClose,
  isPreview = false,
  title,
  subtitle,
}: InvitationSlideSheetProps) {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { isArabic } = useLocalization();

  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  const openSheet = useCallback(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [slideAnim]);

  const closeSheet = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: SHEET_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [slideAnim, onClose]);

  // Open animation when visible changes to true
  React.useEffect(() => {
    if (visible) {
      slideAnim.setValue(SHEET_HEIGHT);
      openSheet();
    }
  }, [visible, openSheet, slideAnim]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          closeSheet();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleRSVP = async (status: 'accept' | 'decline' | 'maybe') => {
    if (!invitation) return;
    const rsvpStatus = status === 'accept' ? 'ACCEPTED' : status === 'decline' ? 'DECLINED' : 'MAYBE';
    try {
      await dispatch(updateRsvp({
        invitationId: invitation.id,
        status: rsvpStatus,
      })).unwrap();
      closeSheet();
    } catch (error) {
      closeSheet();
    }
  };

  // Determine event and template based on mode
  const event = providedEvent || invitation?.event;
  const template = templateId
    ? getTemplateById(templateId)
    : event?.type
    ? getDefaultTemplate(event.type)
    : getDefaultTemplate('WEDDING');
  const currentStatus = invitation?.rsvpStatus;

  // Determine title and subtitle
  const sheetTitle = title || (isArabic
    ? (isPreview ? 'معاينة الدعوة' : 'الدعوة')
    : (isPreview ? 'Invitation Preview' : 'Invitation'));

  const sheetSubtitle = subtitle || (isPreview
    ? (isArabic ? 'هذا ما سيراه ضيوفك' : 'This is what your guests will see')
    : currentStatus === 'PENDING'
      ? (isArabic ? 'الرجاء الرد على الدعوة' : 'Please respond to this invitation')
      : (isArabic ? 'مقدم من ' : 'Invited by ') +
        (invitation?.invitedByUser
          ? `${invitation.invitedByUser.firstName} ${invitation.invitedByUser.lastName}`
          : event?.host
          ? `${event.host.firstName} ${event.host.lastName}`
          : ''));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.backdrop} onPress={closeSheet} />
        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY: slideAnim }] },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Header */}
          <View style={styles.sheetHeader}>
            <View style={styles.handleBar} />
            <Text style={[styles.sheetTitle, isArabic && styles.textRTL]}>
              {sheetTitle}
            </Text>
            <Text style={[styles.sheetSubtitle, isArabic && styles.textRTL]}>
              {sheetSubtitle}
            </Text>
          </View>

          {/* Content */}
          <ScrollView
            style={styles.sheetContent}
            contentContainerStyle={styles.sheetContentContainer}
            showsVerticalScrollIndicator={false}
          >
            {event && template && (
              <InvitationCard
                event={event}
                template={template}
                customPrimaryColor={customColor}
                isArabic={isArabic}
                isPreview={isPreview}
              />
            )}
          </ScrollView>

          {/* RSVP Buttons - only show when not in preview mode */}
          {!isPreview && (
            <View style={[styles.rsvpFooter, { paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
              {currentStatus && currentStatus !== 'PENDING' && (
                <View style={[
                  styles.sheetStatusBadge,
                  currentStatus === 'ACCEPTED' && styles.statusAccepted,
                  currentStatus === 'DECLINED' && styles.statusDeclined,
                  currentStatus === 'MAYBE' && styles.statusMaybe,
                ]}>
                  <Feather
                    name={currentStatus === 'ACCEPTED' ? 'check-circle' : currentStatus === 'DECLINED' ? 'x-circle' : 'help-circle'}
                    size={16}
                    color="#fff"
                  />
                  <Text style={styles.sheetStatusText}>
                    {currentStatus === 'ACCEPTED'
                      ? (isArabic ? 'تم القبول' : 'Accepted')
                      : currentStatus === 'DECLINED'
                      ? (isArabic ? 'تم الاعتذار' : 'Declined')
                      : (isArabic ? 'ربما' : 'Maybe')}
                  </Text>
                </View>
              )}

              <View style={styles.rsvpButtonsRow}>
                <TouchableOpacity
                  style={[
                    styles.rsvpButtonCompact,
                    styles.acceptButton,
                    currentStatus === 'ACCEPTED' && styles.activeButton,
                  ]}
                  onPress={() => handleRSVP('accept')}
                >
                  <Feather name="check" size={18} color="#fff" />
                  <Text style={styles.acceptButtonText}>
                    {isArabic ? 'نعم' : 'Yes'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rsvpButtonCompact,
                    styles.maybeButton,
                    currentStatus === 'MAYBE' && styles.activeMaybeButton,
                  ]}
                  onPress={() => handleRSVP('maybe')}
                >
                  <Feather name="help-circle" size={18} color={currentStatus === 'MAYBE' ? '#fff' : Colors.gray[600]} />
                  <Text style={[
                    styles.maybeButtonText,
                    currentStatus === 'MAYBE' && styles.activeMaybeText,
                  ]}>
                    {isArabic ? 'ربما' : 'Maybe'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.rsvpButtonCompact,
                    styles.declineButton,
                    currentStatus === 'DECLINED' && styles.activeDeclineButton,
                  ]}
                  onPress={() => handleRSVP('decline')}
                >
                  <Feather name="x" size={18} color={currentStatus === 'DECLINED' ? '#fff' : Colors.gray[600]} />
                  <Text style={[
                    styles.declineButtonText,
                    currentStatus === 'DECLINED' && styles.activeDeclineText,
                  ]}>
                    {isArabic ? 'لا' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    height: SHEET_HEIGHT,
    backgroundColor: Colors.gray[100],
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  sheetHeader: {
    paddingTop: 12,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.gray[100],
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: Colors.gray[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
    textAlign: 'center',
  },
  sheetSubtitle: {
    fontSize: 13,
    color: Colors.gray[500],
    marginTop: 4,
    textAlign: 'center',
  },
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  sheetContent: {
    flex: 1,
  },
  sheetContentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  rsvpFooter: {
    backgroundColor: Colors.gray[100],
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  sheetStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusAccepted: {
    backgroundColor: '#10B981',
  },
  statusDeclined: {
    backgroundColor: '#EF4444',
  },
  statusMaybe: {
    backgroundColor: '#F59E0B',
  },
  sheetStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  rsvpButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rsvpButtonCompact: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: Colors.primary,
  },
  activeButton: {
    backgroundColor: '#10B981',
  },
  acceptButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  maybeButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  activeMaybeButton: {
    backgroundColor: '#F59E0B',
    borderColor: '#F59E0B',
  },
  maybeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  activeMaybeText: {
    color: '#fff',
  },
  declineButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  activeDeclineButton: {
    backgroundColor: '#EF4444',
    borderColor: '#EF4444',
  },
  declineButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.gray[600],
  },
  activeDeclineText: {
    color: '#fff',
  },
});
