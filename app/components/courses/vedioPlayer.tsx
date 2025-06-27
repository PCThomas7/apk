import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const VedioPlayer = () => {
  const router = useRouter();
  const { video, status, is_bookmarked } = useLocalSearchParams<{
    video?: string;
    status?: string;
    is_bookmarked?: string;
  }>();

  const handleBack = () => router.back();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Video Player</Text>
      </View>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 12 }}>This is a vedioplayer page</Text>
        <Text style={styles.infoText}>Video Link: {video}</Text>
        <Text style={styles.infoText}>Status: {status}</Text>
        <Text style={styles.infoText}>Bookmarked: {is_bookmarked}</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  infoText: {
    fontSize: 16,
    color: '#334155',
    marginBottom: 8,
  },
});

export default VedioPlayer;