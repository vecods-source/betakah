import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme, useLocalization } from '../../hooks';
import { CommentItem } from './CommentItem';
import { CommentInput } from './CommentInput';
import { Colors } from '../../constants/colors';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const PANEL_HEIGHT = SCREEN_HEIGHT * 0.6;

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

interface CommentsPanelProps {
  visible: boolean;
  comments: Comment[];
  currentUserId?: string;
  onClose: () => void;
  onSendComment: (text: string) => void;
  onDeleteComment?: (commentId: string) => void;
  isSending?: boolean;
}

export function CommentsPanel({
  visible,
  comments,
  currentUserId,
  onClose,
  onSendComment,
  onDeleteComment,
  isSending = false,
}: CommentsPanelProps) {
  const slideAnim = useRef(new Animated.Value(PANEL_HEIGHT)).current;
  const { isArabic } = useLocalization();
  const { cardBackground, textPrimary, textSecondary, colors } = useTheme();

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: PANEL_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const renderComment = ({ item }: { item: Comment }) => (
    <CommentItem
      comment={item}
      isOwn={item.user.firstName === 'Me'} // For mock, we'll use a simple check
      onDelete={onDeleteComment}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: `${Colors.primary}15` }]}>
        <Feather name="message-circle" size={32} color={Colors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: textPrimary }]}>
        {isArabic ? 'لا توجد تعليقات' : 'No comments yet'}
      </Text>
      <Text style={[styles.emptyText, { color: textSecondary }]}>
        {isArabic ? 'كن أول من يعلق!' : 'Be the first to comment!'}
      </Text>
    </View>
  );

  if (!visible) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.keyboardView}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View
          style={[
            styles.panel,
            {
              backgroundColor: cardBackground,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            {/* Handle */}
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.gray[300] }]} />
            </View>

            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.headerTitle, { color: textPrimary }]}>
                {isArabic ? `التعليقات (${comments.length})` : `Comments (${comments.length})`}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Feather name="x" size={22} color={textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            <FlatList
              data={comments}
              keyExtractor={(item) => item.id}
              renderItem={renderComment}
              ListEmptyComponent={renderEmptyState}
              contentContainerStyle={[
                styles.listContent,
                comments.length === 0 && styles.listContentEmpty,
              ]}
              showsVerticalScrollIndicator={false}
              style={styles.list}
            />

            {/* Comment Input */}
            <CommentInput onSend={onSendComment} isLoading={isSending} />
          </Pressable>
        </Animated.View>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  panel: {
    height: PANEL_HEIGHT,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
  },
});
