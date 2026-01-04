import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { InvitationTemplate, CardStyle } from '../themes/types';
import { availableFonts } from '../themes';
import { Event, EventType } from '../types';
import { Colors } from '../constants/colors';

// Helper to get font family from font ID
const getFontFamily = (fontId: string): string => {
  const font = availableFonts.find(f => f.id === fontId);
  return font?.family || 'System';
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface InvitationCardProps {
  event: Partial<Event> & {
    title?: string;
    titleAr?: string;
    type?: EventType;
    startDate?: string | Date;
    endDate?: string | Date;
    location?: string;
    description?: string;
    host?: {
      firstName: string;
      lastName: string;
    };
  };
  template: InvitationTemplate;
  customPrimaryColor?: string | null;
  customMessage?: string;
  isArabic?: boolean;
  isPreview?: boolean;
  onRSVP?: (status: 'accept' | 'decline' | 'maybe') => void;
}

const getEventIcon = (type: EventType) => {
  switch (type) {
    case 'WEDDING':
      return { name: 'heart', family: 'feather' };
    case 'ENGAGEMENT':
      return { name: 'diamond-outline', family: 'ionicons' };
    case 'BIRTHDAY':
      return { name: 'cake-variant', family: 'material' };
    case 'GRADUATION':
      return { name: 'school-outline', family: 'ionicons' };
    case 'BABY_SHOWER':
      return { name: 'baby-carriage', family: 'material' };
    case 'EID_GATHERING':
      return { name: 'moon-outline', family: 'ionicons' };
    case 'PRIVATE_PARTY':
      return { name: 'party-popper', family: 'material' };
    case 'CONDOLENCE':
      return { name: 'flower-outline', family: 'ionicons' };
    default:
      return { name: 'calendar', family: 'feather' };
  }
};

const EventIcon = ({ type, color, size = 24 }: { type: EventType; color: string; size?: number }) => {
  const icon = getEventIcon(type);
  switch (icon.family) {
    case 'ionicons':
      return <Ionicons name={icon.name as any} size={size} color={color} />;
    case 'material':
      return <MaterialCommunityIcons name={icon.name as any} size={size} color={color} />;
    default:
      return <Feather name={icon.name as any} size={size} color={color} />;
  }
};

// Simple Top Accent - used for all styles
const TopAccent = ({ primaryColor, height = 4 }: { primaryColor: string; height?: number }) => (
  <View style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height,
    backgroundColor: primaryColor,
  }} />
);

// Simple Divider
const StyledDivider = ({ primaryColor }: { primaryColor: string }) => (
  <View style={styles.dividerContainer}>
    <View style={[styles.dividerLine, { backgroundColor: primaryColor }]} />
  </View>
);

export function InvitationCard({
  event,
  template,
  customPrimaryColor,
  customMessage,
  isArabic = false,
  isPreview = false,
  onRSVP,
}: InvitationCardProps) {
  const colors = {
    ...template.colors,
    primary: customPrimaryColor || template.colors.primary,
  };

  const cardStyle = template.cardStyle || 'modern';

  // Get the appropriate fonts based on language
  const titleFontId = isArabic ? template.titleFontAr : template.titleFontEn;
  const bodyFontId = isArabic ? template.bodyFontAr : template.bodyFontEn;
  const titleFont = getFontFamily(titleFontId);
  const bodyFont = getFontFamily(bodyFontId);

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(isArabic ? 'ar-QA' : 'en-QA', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: string | Date | undefined) => {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleTimeString(isArabic ? 'ar-QA' : 'en-QA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const title = isArabic ? (event.titleAr || event.title) : (event.title || event.titleAr);
  const description = isArabic ? (event.descriptionAr || event.description) : (event.description || event.descriptionAr);
  const hostName = event.host ? `${event.host.firstName} ${event.host.lastName}` : '';

  const isCondolence = template.isCondolence || event.type === 'CONDOLENCE';

  // Get card style specific classes
  const getCardBorderRadius = () => {
    switch (cardStyle) {
      case 'modern': return 16;
      case 'classic': return 4;
      case 'somber': return 2;
      default: return 20;
    }
  };

  return (
    <View style={[
      styles.card,
      { backgroundColor: colors.background, borderRadius: getCardBorderRadius() },
      cardStyle === 'somber' && styles.somberCard,
    ]}>
      {/* Simple top accent bar */}
      <TopAccent
        primaryColor={colors.primary}
        height={cardStyle === 'classic' ? 6 : cardStyle === 'somber' ? 3 : 4}
      />

      {/* Content container with padding for decorations */}
      <View style={[
        styles.contentContainer,
        cardStyle === 'classic' && styles.classicContentPadding,
        cardStyle === 'somber' && styles.somberContentPadding,
      ]}>
        {/* Event Type Icon */}
        {event.type && (
          <View style={[
            styles.iconContainer,
            { backgroundColor: `${colors.primary}15` },
            cardStyle === 'modern' && styles.modernIconContainer,
            cardStyle === 'somber' && styles.somberIconContainer,
          ]}>
            <EventIcon type={event.type} color={colors.primary} size={cardStyle === 'somber' ? 24 : 28} />
          </View>
        )}

        {/* Invitation Text */}
        <Text style={[
          styles.invitationText,
          { color: colors.accent, fontFamily: titleFont, writingDirection: isArabic ? 'rtl' : 'ltr' },
          cardStyle === 'modern' && styles.modernInvitationText,
          cardStyle === 'somber' && styles.somberInvitationText,
        ]}>
          {isCondolence
            ? (isArabic ? 'دعوة للعزاء' : 'Condolence Invitation')
            : (isArabic ? 'أنتم مدعوون' : "You're Invited")}
        </Text>

        {/* Event Title */}
        <Text style={[
          styles.eventTitle,
          { color: colors.text, fontFamily: titleFont, writingDirection: isArabic ? 'rtl' : 'ltr' },
          cardStyle === 'somber' && styles.somberEventTitle,
        ]}>
          {title || (isArabic ? 'عنوان المناسبة' : 'Event Title')}
        </Text>

        {/* Styled Divider */}
        <StyledDivider primaryColor={colors.primary} />

        {/* Description or Custom Message */}
        {(customMessage || description) && (
          <View style={[
            styles.messageContainer,
            { backgroundColor: `${colors.primary}08` },
            cardStyle === 'modern' && styles.modernMessageContainer,
            cardStyle === 'somber' && styles.somberMessageContainer,
          ]}>
            <Text style={[
              styles.messageText,
              { color: colors.text, fontFamily: bodyFont, writingDirection: isArabic ? 'rtl' : 'ltr' },
              cardStyle === 'somber' && styles.somberMessageText,
            ]}>
              {cardStyle === 'somber' ? (customMessage || description) : `"${customMessage || description}"`}
            </Text>
          </View>
        )}

        {/* Host Info */}
        {hostName && (
          <View style={styles.hostSection}>
            <Text style={[styles.hostedBy, { color: colors.accent, fontFamily: bodyFont, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
              {isArabic ? 'مقدم من' : 'Hosted by'}
            </Text>
            <Text style={[styles.hostName, { color: colors.text, fontFamily: titleFont, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
              {hostName}
            </Text>
          </View>
        )}

        {/* Details Section */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <View style={[
              styles.detailIconContainer,
              { backgroundColor: `${colors.primary}15` },
              cardStyle === 'modern' && styles.modernDetailIcon,
              cardStyle === 'somber' && styles.somberDetailIcon,
            ]}>
              <Feather name="calendar" size={16} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.accent, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                {isArabic ? 'التاريخ' : 'Date'}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                {formatDate(event.startDate) || (isArabic ? 'سيتم التحديد' : 'To be announced')}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[
              styles.detailIconContainer,
              { backgroundColor: `${colors.primary}15` },
              cardStyle === 'modern' && styles.modernDetailIcon,
              cardStyle === 'somber' && styles.somberDetailIcon,
            ]}>
              <Feather name="clock" size={16} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text style={[styles.detailLabel, { color: colors.accent, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                {isArabic ? 'الوقت' : 'Time'}
              </Text>
              <Text style={[styles.detailValue, { color: colors.text, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                {formatTime(event.startDate) || (isArabic ? 'سيتم التحديد' : 'To be announced')}
              </Text>
            </View>
          </View>

          {event.location && (
            <View style={styles.detailRow}>
              <View style={[
                styles.detailIconContainer,
                { backgroundColor: `${colors.primary}15` },
                cardStyle === 'modern' && styles.modernDetailIcon,
                cardStyle === 'somber' && styles.somberDetailIcon,
              ]}>
                <Feather name="map-pin" size={16} color={colors.primary} />
              </View>
              <View style={styles.detailContent}>
                <Text style={[styles.detailLabel, { color: colors.accent, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                  {isArabic ? 'الموقع' : 'Location'}
                </Text>
                <Text style={[styles.detailValue, { color: colors.text, writingDirection: isArabic ? 'rtl' : 'ltr' }]} numberOfLines={2}>
                  {event.location}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* RSVP Section (only for guest view, not preview) */}
        {!isPreview && onRSVP && (
          <View style={styles.rsvpSection}>
            <Text style={[styles.rsvpTitle, { color: colors.text, writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
              {isArabic ? 'هل ستحضر؟' : 'Will you attend?'}
            </Text>
            <View style={styles.rsvpButtons}>
              <TouchableOpacity
                style={[
                  styles.rsvpButton,
                  styles.rsvpAccept,
                  { backgroundColor: colors.primary },
                  cardStyle === 'modern' && styles.modernRsvpButton,
                  cardStyle === 'somber' && styles.somberRsvpButton,
                ]}
                onPress={() => onRSVP('accept')}
              >
                <Feather name="check" size={18} color="#fff" />
                <Text style={[styles.rsvpButtonText, { writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                  {isCondolence
                    ? (isArabic ? 'سأحضر' : "I'll Attend")
                    : (isArabic ? 'بكل سرور' : 'Accept')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.rsvpButton,
                  styles.rsvpDecline,
                  cardStyle === 'modern' && styles.modernRsvpButton,
                  cardStyle === 'somber' && styles.somberRsvpButton,
                ]}
                onPress={() => onRSVP('decline')}
              >
                <Feather name="x" size={18} color={Colors.gray[600]} />
                <Text style={[styles.rsvpButtonText, { color: Colors.gray[600], writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
                  {isArabic ? 'أعتذر' : 'Decline'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      {/* Preview Badge */}
      {isPreview && (
        <View style={[
          styles.previewBadge,
          { backgroundColor: colors.primary },
          cardStyle === 'classic' && styles.classicPreviewBadge,
          cardStyle === 'somber' && styles.somberPreviewBadge,
        ]}>
          <Text style={[styles.previewBadgeText, { writingDirection: isArabic ? 'rtl' : 'ltr' }]}>
            {isArabic ? 'معاينة' : 'Preview'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
    position: 'relative',
  },
  somberCard: {
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  contentContainer: {
    paddingTop: 32,
    paddingBottom: 28,
  },
  classicContentPadding: {
    paddingTop: 40,
    paddingHorizontal: 8,
  },
  somberContentPadding: {
    paddingTop: 36,
    paddingHorizontal: 4,
  },

  // Divider
  dividerContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 60,
  },
  dividerLine: {
    height: 2,
    width: '100%',
    borderRadius: 1,
  },

  // Style-specific adjustments
  modernIconContainer: {
    borderRadius: 16,
  },
  modernInvitationText: {
    letterSpacing: 4,
  },
  modernMessageContainer: {
    borderRadius: 8,
    marginHorizontal: 20,
  },
  modernDetailIcon: {
    borderRadius: 8,
  },
  modernRsvpButton: {
    borderRadius: 8,
  },
  somberIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  somberInvitationText: {
    letterSpacing: 1,
    fontSize: 12,
  },
  somberEventTitle: {
    fontSize: 22,
  },
  somberMessageContainer: {
    backgroundColor: 'transparent',
    borderLeftWidth: 2,
    borderRadius: 0,
    marginLeft: 24,
    marginRight: 24,
    paddingLeft: 12,
  },
  somberMessageText: {
    fontStyle: 'normal',
    textAlign: 'left',
  },
  somberDetailIcon: {
    borderRadius: 4,
    width: 32,
    height: 32,
  },
  somberRsvpButton: {
    borderRadius: 4,
  },
  classicPreviewBadge: {
    top: 16,
    right: 16,
    borderRadius: 4,
  },
  somberPreviewBadge: {
    top: 16,
    right: 16,
    borderRadius: 2,
  },

  // Base styles
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  invitationText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  eventTitle: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
    marginHorizontal: 24,
    lineHeight: 34,
  },
  detailsSection: {
    marginTop: 24,
    paddingHorizontal: 24,
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  messageContainer: {
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
  },
  messageText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 22,
  },
  hostSection: {
    alignItems: 'center',
    marginTop: 24,
  },
  hostedBy: {
    fontSize: 12,
    fontWeight: '500',
  },
  hostName: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },
  rsvpSection: {
    marginTop: 28,
    paddingHorizontal: 24,
  },
  rsvpTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  rsvpButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  rsvpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  rsvpAccept: {},
  rsvpDecline: {
    backgroundColor: Colors.gray[100],
  },
  rsvpButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  previewBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 20,
  },
  previewBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});

export default InvitationCard;
