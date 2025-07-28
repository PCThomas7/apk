import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import courseServiceGet from '@/services/courseServiceGet';
import Dropdown from './Dropdown';
import doubtService from '@/services/doubtService';
import AppHeader from '../../components/header';

const DoubtForm = () => {
  const router = useRouter();
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [chapters, setChapters] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [doubtText, setDoubtText] = useState<string>('');
  const [isGeneralDoubt, setIsGeneralDoubt] = useState<boolean>(false);

  const fetchTags = async () => {
    try {
      const response = await courseServiceGet.getExamTypes();
      if (Array.isArray(response)) setTags(response);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleTagChange = async (examType: string) => {
    setSelectedTag(examType);
    setSelectedSubject(null);
    setSelectedChapter(null);
    setSelectedTopic(null);
    setDoubtText('');
    setChapters([]);
    setTopics([]);
    try {
      const response = await courseServiceGet.getSubjectsForExamType(examType);
      setSubjects(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const handleSubjectChange = async (subject: string) => {
    setSelectedSubject(subject);
    setSelectedChapter(null);
    setSelectedTopic(null);
    setDoubtText('');
    try {
      if (selectedTag) {
        const response = await courseServiceGet.getChaptersForSubject(selectedTag, subject);
        setChapters(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleChapterChange = async (chapter: string) => {
    setSelectedChapter(chapter);
    setSelectedTopic(null);
    setDoubtText('');
    try {
      if (selectedTag && selectedSubject) {
        const response = await courseServiceGet.getTopicsForChapter(selectedTag, selectedSubject, chapter);
        setTopics(Array.isArray(response) ? response : []);
      }
    } catch (error) {
      console.error('Error fetching topics:', error);
    }
  };

  const handleSubmit = async () => {
    if (!doubtText.trim()) {
      Alert.alert('Please enter your doubt');
      return;
    }

    const payload = {
      examType: isGeneralDoubt ? 'General' : selectedTag,
      subject: isGeneralDoubt ? 'General' : selectedSubject,
      chapter: isGeneralDoubt ? 'General' : selectedChapter,
      topic: isGeneralDoubt ? 'General' : selectedTopic,
      doubtText,
      is_general: isGeneralDoubt,
    };

    try {
      await doubtService.createDoubt(payload);
      Alert.alert('Doubt Submitted', 'Your doubt has been submitted successfully!');
      setDoubtText('');
      router.push('/components/doubt/doubt')
    } catch (error) {
      console.error('Error submitting doubt:', error);
      Alert.alert('Submission Failed', 'Something went wrong while submitting your doubt.');
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppHeader screenTitle="Ask a Doubt" onBackPress={() => router.back()} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* General Doubt Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setIsGeneralDoubt(prev => !prev)}
          >
            <Ionicons
              name={isGeneralDoubt ? 'checkbox-outline' : 'square-outline'}
              size={24}
              color="#4F46E5"
            />
            <Text style={styles.checkboxLabel}>General Doubt (not related to specific content)</Text>
          </TouchableOpacity>

          {!isGeneralDoubt && (
            <>
              <Dropdown
                options={tags}
                selectedOption={selectedTag}
                onSelect={handleTagChange}
                placeholder="Choose exam type"
              />

              <Dropdown
                options={selectedTag ? subjects : []}
                selectedOption={selectedSubject}
                onSelect={handleSubjectChange}
                placeholder={selectedTag ? 'Choose subject' : 'Select exam type first'}
              />

              <Dropdown
                options={selectedSubject ? chapters : []}
                selectedOption={selectedChapter}
                onSelect={handleChapterChange}
                placeholder={selectedSubject ? 'Choose chapter' : 'Select subject first'}
              />

              <Dropdown
                options={selectedChapter ? topics : []}
                selectedOption={selectedTopic}
                onSelect={setSelectedTopic}
                placeholder={selectedChapter ? 'Choose topic' : 'Select chapter first'}
              />
            </>
          )}

          {(isGeneralDoubt || (selectedTag && selectedSubject && selectedChapter && selectedTopic)) && (
            <>
              <Text style={styles.textLabel}>Type your doubt below</Text>
              <TextInput
                style={styles.textArea}
                multiline
                numberOfLines={6}
                placeholder="Enter your doubt clearly..."
                value={doubtText}
                onChangeText={setDoubtText}
                textAlignVertical="top"
              />

              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.submitButtonText}>Submit Doubt</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkboxLabel: {
    marginLeft: 10,
    fontSize: 14,
    color: '#374151',
  },
  textLabel: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '500',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DoubtForm;
