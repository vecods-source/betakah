import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, useLocalization } from '../../hooks';
import { Colors } from '../../constants/colors';

interface CommentUser {
  firstName: string;
  firstNameAr?: string;
  lastName: string;
  lastNameAr?: string;
  profilePhotoUrl?: string | null;
}

interface Comment {
  id: string;
  text: string;
  user: CommentUser;
  createdAt: string;
}

interface CommentItemProps {
  comment: Comment;
  isOwn?: boolean;
  onDelete?: (commentId: string) => void;
}

export function CommentItem({ comment, isOwn = false, onDelete }: CommentItemProps) {
  const { isArabic } = useLocalization();
  const { textPrimary, textSecondary, colors } = useTheme();

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return isArabic ? 'الآن' : 'Just now';
    if (diffMins < 60) return isArabic ? `منذ ${diffMins} د` : `${diffMins}m ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return isArabic ? `منذ ${diffHours} س` : `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return isArabic ? `منذ ${diffDays} ي` : `${diffDays}d ago`;

    return date.toLocaleDateString(isArabic ? 'ar-QA' : 'en-QA', {
      month: 'short',
      day: 'numeric',
    });
  };

  const getInitials = () => {
    const firstName = isArabic ? comment.user.firstNameAr || comment.user.firstName : comment.user.firstName;
    const lastName = isArabic ? comment.user.lastNameAr || comment.user.lastName : comment.user.lastName;
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getFullName = () => {
    const firstName = isArabic ? comment.user.firstNameAr || comment.user.firstName : comment.user.firstName;
    const lastName = isArabic ? comment.user.lastNameAr || comment.user.lastName : comment.user.lastName;
    return `${firstName} ${lastName}`;
  };

  return (
    <View style={styles.container}>
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {comment.user.profilePhotoUrl ? (
          <Image source={{ uri: comment.user.profilePhotoUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarFallback, { backgroundColor: `${Colors.primary}20` }]}>
            <Text style={[styles.avatarText, { color: Colors.primary }]}>{getInitials()}</Text>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.userName, { color: textPrimary }]}>{getFullName()}</Text>
          <Text style={[styles.time, { color: textSecondary }]}>{formatTime(comment.createdAt)}</Text>
        </View>
        <Text style={[styles.text, { color: textPrimary }]}>{comment.text}</Text>
      </View>

      {/* Delete button (for own comments) */}
      {isOwn && onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(comment.id)}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="trash-2" size={16} color={colors.gray[400]} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    fontSize: 12,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  deleteButton: {
    padding: 4,
    marginLeft: 8,
  },
});
