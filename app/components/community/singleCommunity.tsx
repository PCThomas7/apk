import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CommunityService from '../../../services/communityService';

// Define TypeScript interfaces
interface Author {
  _id?: string;
  name: string;
  email?: string;
}

interface Comment {
  _id: string;
  author: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

interface Post {
  _id: string;
  title: string;
  content: string;
  author: Author;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
  batches?: Array<{ _id: string, id: string, name: string }>;
  tags?: string[];
  attachments?: string[];
  batchAssignment?: string;
  __v?: number;
}

const SingleCommunity = () => {
  const { postId } = useLocalSearchParams<{ postId: string }>();
  const router = useRouter();

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [commentText, setCommentText] = useState('');

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!postId) return;

        const fetchedPost = await CommunityService.getPost(postId);
        if (fetchedPost) {
          setPost(fetchedPost);
          setComments(fetchedPost.comments || []);
        }
      } catch (err) {
        console.error('Error fetching post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAvatarUrl = (name: string): string => {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !post?._id) return;

    setAddLoading(true);
    try {
      await CommunityService.addComment(post._id, commentText.trim());
      const updated = await CommunityService.getPost(post._id);
      if (updated) {
        setComments(updated.comments || []);
        setCommentText('');
        setShowInput(false);
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 300);
      }
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setAddLoading(false);
    }
  };

  const renderContentWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, index) => {
      const isUrl = urlRegex.test(part);
      if (isUrl) {
        return (
          <Text
            key={index}
            style={styles.linkText}
            onPress={() => Linking.openURL(part)}
          >
            {part}
          </Text>
        );
      } else {
        return (
          <Text key={index} style={styles.postContent}>
            {part}
          </Text>
        );
      }
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <MaterialCommunityIcons name="comment-remove-outline" size={48} color="#d1d5db" />
          <Text style={styles.notFoundText}>Post not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Community Post</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Author Info */}
          <View style={styles.authorContainer}>
            <Image
              source={{ uri: getAvatarUrl(post.author?.name || 'User') }}
              style={styles.avatar}
            />
            <View style={styles.authorInfo}>
              <Text style={styles.authorName} numberOfLines={1}>
                {post.author?.name || 'Anonymous'}
              </Text>
              <View style={styles.timeContainer}>
                <Ionicons name="time-outline" size={14} color="#6B7280" />
                <Text style={styles.postDate}>{formatDate(post.createdAt)}</Text>
              </View>
            </View>
          </View>

          {/* Post Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>
              {renderContentWithLinks(post.content)}
            </Text>
          </View>

          {/* Interaction Bar */}
          <View style={styles.interactionContainer}>
            <View style={styles.interactionItem}>
              <Ionicons name="thumbs-up" size={20} color="#4F46E5" />
              <Text style={styles.interactionText}>
                {post.likes || 0} {post.likes === 1 ? 'Like' : 'Likes'}
              </Text>
            </View>
            <View style={styles.interactionItem}>
              <Ionicons name="chatbubble" size={20} color="#4F46E5" />
              <Text style={styles.interactionText}>
                {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
              </Text>
            </View>
          </View>

          {/* Comments Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comments</Text>
            {comments.length > 0 ? (
              comments.map((comment) => (
                <View key={comment._id} style={styles.commentItem}>
                  <Image
                    source={{ uri: getAvatarUrl(comment.author?.name || 'User') }}
                    style={styles.commentAvatar}
                  />
                  <View style={styles.commentContent}>
                    <Text style={styles.commentAuthor}>
                      {comment.author?.name || 'Anonymous'}
                    </Text>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <Text style={styles.commentTime}>
                      {formatDate(comment.createdAt)}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.noComments}>
                <MaterialCommunityIcons name="comment-text-outline" size={40} color="#E5E7EB" />
                <Text style={styles.noCommentsText}>No comments yet</Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Comment Input */}
        {showInput ? (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Write your comment..."
              placeholderTextColor="#9CA3AF"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              autoFocus
              editable={!addLoading}
            />
            <View style={styles.commentButtonContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowInput(false);
                  setCommentText('');
                }}
                disabled={addLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.postButton,
                  (!commentText.trim() || addLoading) && styles.postButtonDisabled
                ]}
                onPress={handleAddComment}
                disabled={!commentText.trim() || addLoading}
              >
                {addLoading ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.postButtonText}>Post</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addCommentButton}
            onPress={() => setShowInput(true)}
          >
            <Ionicons name="add" size={24} color="#FFF" />
            <Text style={styles.addCommentText}>Add Comment</Text>
          </TouchableOpacity>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: 18,
    color: '#6b7280',
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#F9FAFB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postDate: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 4,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 12,
    lineHeight: 24,
  },
  postContent: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
  linkText: {
    color: '#3B82F6',
    textDecorationLine: 'underline',
  },
  interactionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
    marginVertical: 16,
    backgroundColor: '#F9FAFB',
  },
  interactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interactionText: {
    fontSize: 16,
    color: '#4B5563',
    marginLeft: 8,
  },
  section: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 4,
  },
  commentTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  noComments: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 8,
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  commentInput: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    maxHeight: 120,
    fontSize: 16,
    marginBottom: 12,
  },
  commentButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#6b7280',
    fontWeight: '500',
  },
  postButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#a5b4fc',
  },
  postButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  addCommentButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#4F46E5',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addCommentText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default SingleCommunity;