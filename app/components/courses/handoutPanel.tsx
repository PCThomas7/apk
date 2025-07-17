import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Linking, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import courseServiceGet from '@/services/courseServiceGet';

interface Handout {
  id: string;
  title: string;
  link: string;
  sharedAt: string | Date;
  sharedBy: {
    id: string;
    name: string;
    email?: string;
  };
}

interface HandoutPanelProps {
  params: {
    lessonId?: string;
    [key: string]: any;
  };
  socket: any; // Consider using proper Socket.IO types
}

const HandoutPanel: React.FC<HandoutPanelProps> = ({ params, socket }) => {
  const [handouts, setHandouts] = useState<Handout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lessonId = params?.lessonId;

  // Initial load of handouts
  useEffect(() => {
    if (!lessonId) return;

    const loadHandouts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Replace with your actual API call
        const response = await courseServiceGet.getHandoutsByLesson(lessonId)
        setHandouts(response || []);
      } catch (err) {
        console.error('Error fetching handouts:', err);
        setError('Failed to load handouts. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadHandouts();
  }, [lessonId]);

  // Socket event listeners for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleNewHandout = (handout: Handout) => {
      setHandouts(prev => [handout, ...prev]);
    };

    const handleDeletedHandout = (data: { handoutId: string }) => {
      setHandouts(prev => prev.filter(h => h.id !== data.handoutId));
    };

    socket.on('handout-shared', handleNewHandout);
    socket.on('handout-deleted', handleDeletedHandout);

    return () => {
      socket.off('handout-shared', handleNewHandout);
      socket.off('handout-deleted', handleDeletedHandout);
    };
  }, [socket]);

  const renderItem = ({ item }: { item: Handout }) => (
    <TouchableOpacity
      style={styles.handoutItem}
      onPress={() => Linking.openURL(item.link)}
      activeOpacity={0.7}
    >
      <View style={styles.fileIconContainer}>
        <Ionicons name="document-text" size={18} color="#3ea6ff" />
      </View>
      <View style={styles.handoutInfo}>
        <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
        <View style={styles.metaContainer}>
          <Text style={styles.sharedBy}>mentor</Text>
          <Text style={styles.date}>
            {new Date(item.sharedAt).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={64} color="#444" />
      <Text style={styles.emptyStateTitle}>No Materials Yet</Text>
      <Text style={styles.emptyStateText}>
        The Mentor hasn't shared any materials yet.
        Check back later or when the lesson starts.
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="warning-outline" size={64} color="#ff4d4d" />
      <Text style={styles.emptyStateTitle}>Connection Issue</Text>
      <Text style={styles.emptyStateText}>
        {error || 'Unable to load materials. Please check your connection.'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Lesson Materials</Text>
        <Text style={styles.headerSubtitle}>
          {handouts.length} {handouts.length === 1 ? 'resource' : 'resources'}
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3ea6ff" />
        </View>
      ) : error ? (
        renderErrorState()
      ) : handouts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={handouts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={<View style={styles.listHeader} />}
          ListFooterComponent={<View style={styles.listFooter} />}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#aaa',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  listHeader: {
    height: 8,
  },
  listFooter: {
    height: 16,
  },
  handoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#252525',
  },
  fileIconContainer: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#1a2a3a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  handoutInfo: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    width: '100%',
  },
  sharedBy: {
    fontSize: 11,
    color: '#888',
  },
  date: {
    fontSize: 11,
    color: '#555',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#eee',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default React.memo(HandoutPanel);