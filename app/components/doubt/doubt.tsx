import React, { useCallback, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import doubtService from '../../../services/doubtService';

type Reply = {
  _id: string;
  reply_text: string;
  replier_id?: { name: string };
  replier_role: string;
  created_at: string;
};

type Doubt = {
  _id: string;
  doubt_text: string;
  subject: string;
  chapter: string;
  topic: string;
  exam_type: string;
  status: 'open' | 'Resolved' | 'In progress' | 'Close';
  replies: Reply[];
  created_at: string;
  is_general: boolean;
};

const Doubt = () => {
  const router = useRouter();
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const textInputRef = useRef<TextInput>(null);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const fetchDoubts = async () => {
    try {
      setRefreshing(true);
      const response = await doubtService.getStudentDoubts();
      if (response?.success && Array.isArray(response.data)) {
        setDoubts(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch doubts:', error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDoubts();
  }, []);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'resolved': return '#10B981';
      case 'in_progress': return '#F59E0B';
      case 'closed_by_admin': return '#6B7280';
      default: return '#3B82F6';
    }
  };

  const handleReplyPress = (doubtId: string) => {
    setReplyingTo(doubtId);
    setIsModalVisible(true);
    setTimeout(() => textInputRef.current?.focus(), 100);
  };

  const handleSubmitReply = async () => {
    if (!replyingTo || !replyText.trim()) return;

    try {
      const result = await doubtService.replyToDoubt(replyingTo, {
        replyText,
      });

      if (!result || !result._id) {
        await fetchDoubts();
      } else {
        setDoubts(prev =>
          prev.map(doubt =>
            doubt._id === replyingTo
              ? {
                  ...doubt,
                  replies: [...doubt.replies, result],
                  status: 'In progress',
                }
              : doubt
          )
        );
      }

      setReplyText('');
      setIsModalVisible(false);
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to submit reply:', error);
    }
  };

  const handleCancelReply = () => {
    setReplyText('');
    setIsModalVisible(false);
    setReplyingTo(null);
    Keyboard.dismiss();
  };

  const renderReply = (reply: Reply, index: number) => (
    <View key={reply._id || index.toString()} style={styles.replyContainer}>
      <View style={styles.replyBubble}>
        <Text style={styles.replyText}>{reply.reply_text}</Text>
        <Text style={styles.replyMeta}>
          — {reply.replier_id?.name || 'Unknown'} • {reply.replier_role} • {formatDate(reply.created_at)}
        </Text>
      </View>
    </View>
  );

  const renderDoubt = ({ item }: { item: Doubt }) => (
    <View style={styles.doubtCard}>
      <View style={styles.doubtHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusBadgeText}>{item.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.doubtDate}>{formatDate(item.created_at)}</Text>
      </View>

      <Text style={styles.doubtText}>{item.doubt_text}</Text>

      {!item.is_general && (
        <View style={styles.tagsContainer}>
          {[item.exam_type, item.subject, item.chapter, item.topic].map(
            (tag, i) =>
              tag && (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              )
          )}
        </View>
      )}

      {item.replies.length > 0 ? (
        <View style={styles.repliesSection}>
          <Text style={styles.repliesTitle}>REPLIES ({item.replies.length})</Text>
          {item.replies.map(renderReply)}
        </View>
      ) : (
        <View style={styles.noRepliesContainer}>
          <Ionicons name="chatbubble-outline" size={24} color="#9CA3AF" />
          <Text style={styles.noReplies}>No replies yet</Text>
        </View>
      )}

      <TouchableOpacity style={styles.replyButton} onPress={() => handleReplyPress(item._id)}>
        <Ionicons name="arrow-undo" size={16} color="#4F46E5" />
        <Text style={styles.replyButtonText}>Reply</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>My Doubts</Text>

        <TouchableOpacity style={styles.askButtonHeader} onPress={() => {router.push(`/components/doubt/doubtForm`)}}>
          <Ionicons name="add-circle-outline" size={20} color="#4F46E5" />
          <Text style={styles.askButtonHeaderText}>Ask a doubt</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={doubts}
        keyExtractor={(item) => item._id}
        renderItem={renderDoubt}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="help-circle-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No doubts found</Text>
            <Text style={styles.emptySubtext}>Ask your first doubt to get started</Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchDoubts}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      />

      {/* Modal for reply */}
      <Modal animationType="slide" transparent visible={isModalVisible} onRequestClose={handleCancelReply}>
        <TouchableWithoutFeedback onPress={handleCancelReply}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Your Reply</Text>
            <TextInput
              ref={textInputRef}
              style={styles.replyInput}
              multiline
              placeholder="Type your reply here..."
              value={replyText}
              onChangeText={setReplyText}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleCancelReply}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleSubmitReply}
                disabled={!replyText.trim()}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb'
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20, fontWeight: '600', color: '#1f2937',
  },
  askButtonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    marginLeft: 'auto',
  },
  askButtonHeaderText: {
    color: '#4F46E5',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  doubtCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  doubtHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  doubtDate: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Inter-Regular',
  },
  doubtText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    marginBottom: 16,
    color: '#111827',
    fontFamily: 'Inter-Medium',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#E0E7FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  tagText: {
    color: '#4F46E5',
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Inter-Medium',
  },
  repliesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  repliesTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
    color: '#6B7280',
    letterSpacing: 0.5,
    fontFamily: 'Inter-SemiBold',
  },
  replyContainer: {
    marginBottom: 12,
  },
  replyBubble: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    borderTopLeftRadius: 0,
  },
  replyText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
    fontFamily: 'Inter-Regular',
  },
  replyMeta: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 6,
    fontFamily: 'Inter-Regular',
  },
  noRepliesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  noReplies: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'Inter-Regular',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginTop: 12,
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    gap: 6,
  },
  replyButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: '500',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  replyInput: {
    minHeight: 120,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4F46E5',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 16,
    fontFamily: 'Inter-SemiBold',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
});

export default Doubt;