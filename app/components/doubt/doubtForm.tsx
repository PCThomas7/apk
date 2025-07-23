import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import courseServiceGet from '@/services/courseServiceGet';
import Dropdown from './Dropdown';

const DoubtForm = () => {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const handleBack = () => {
    router.back();
  };

  const fetchTags = async () => {
    try {
      const response = await courseServiceGet.getExamTypes();
      if (Array.isArray(response)) {
        setTags(response);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ask a Doubt</Text>
      </View>

      <View style={styles.content}>
        <Dropdown
          options={tags}
          selectedOption={selectedTag}
          onSelect={setSelectedTag}
          label="Select Exam Type"
          placeholder="Choose exam type"
        />

        {/* Display selected tag for debugging */}
        {selectedTag && (
          <Text style={styles.selectedTagText}>
            Selected: {selectedTag}
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
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
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  selectedTagText: {
    marginTop: 20,
    fontSize: 16,
    color: '#4F46E5',
    textAlign: 'center',
  },
});

export default DoubtForm;