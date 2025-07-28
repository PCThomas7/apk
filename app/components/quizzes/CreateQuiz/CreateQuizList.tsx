import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import courseServiceGet from '@/services/courseServiceGet';
import AppHeader from '../../header';

const CreateQuizList = () => {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchQuizzes = useCallback(async () => {
    try {
      setRefreshing(true);
      const response = await courseServiceGet.getStudentCreatedQuizzes();
      setQuizzes(response?.quizzes || []);
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      Alert.alert('Error', 'Failed to fetch quizzes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleCreateQuiz = () => {
    router.replace('/components/quizzes/CreateQuiz/CreateQuizExamType');
  };

  const handleTakeQuiz = (quizId: string) => {
    router.push({
      pathname: '/components/quizzes/QuizAttemptScreen',
      params: { contentId: quizId },
    });
  };

  const handleDeleteQuiz = async (quizId: string) => {
    Alert.alert(
      'Delete Quiz',
      'Are you sure you want to delete this quiz?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await courseServiceGet.deleteStudentQuiz(quizId);
              setQuizzes(prev => prev.filter(q => q._id !== quizId));
            } catch (error) {
              console.error('Error deleting quiz:', error);
              Alert.alert('Error', 'Failed to delete quiz.');
            }
          },
        },
      ]
    );
  };

  const renderQuizItem = ({ item }: { item: any }) => (
    <View style={styles.quizCard}>
      <View style={styles.quizHeader}>
        <Text style={styles.quizTitle} numberOfLines={1}>{item.title}</Text>
        <View style={styles.quizMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={16} color="#6B7280" />
            <Text style={styles.metaText}>{item.timeLimit} mins</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons
              name={item.attempted ? "checkmark-circle" : "close-circle"}
              size={16}
              color={item.attempted ? "#10B981" : "#EF4444"}
            />
            <Text style={[styles.metaText, { color: item.attempted ? "#10B981" : "#EF4444" }]}>
              {item.attempted ? "Attempted" : "Not Attempted"}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleTakeQuiz(item._id)}
        >
          <Ionicons name="play" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Take Quiz</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteQuiz(item._id)}
        >
          <Ionicons name="trash" size={18} color="#FFFFFF" />
          <Text style={styles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <AppHeader screenTitle='My Quizzes' onBackPress={() => router.back()} />

      <FlatList
        data={quizzes}
        renderItem={renderQuizItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#9CA3AF" />
            <Text style={styles.emptyText}>You haven't created any quizzes yet</Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateQuiz}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Create New Quiz</Text>
            </TouchableOpacity>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchQuizzes}
            colors={['#4F46E5']}
            tintColor="#4F46E5"
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  quizCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quizHeader: {
    marginBottom: 16,
  },
  quizTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  quizMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    color: '#6B7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#4F46E5',
    gap: 8,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});

export default CreateQuizList;