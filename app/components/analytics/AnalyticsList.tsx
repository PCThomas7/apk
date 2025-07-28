import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppDispatch } from '../../../redux/hooks';
import { fetchStudentAnalytics } from '../../../redux/slices/analyticsSlice';
import AppHeader from '../../components/header';

interface AnalyticsOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
}

const analyticsOptions: AnalyticsOption[] = [
  { label: 'Overall Performance', icon: 'stats-chart', route: '/components/analytics/OverallPerformance' },
  { label: 'Subject Analysis', icon: 'book', route: '/components/analytics/SubjectAnalysis' },
  { label: 'Difficulty Analysis', icon: 'trending-up', route: '/components/analytics/DifficultyAnalysis' },
  { label: 'Question Types', icon: 'help-circle', route: '/components/analytics/QuestionTypes' },
  { label: 'Performance Trends', icon: 'analytics', route: '/components/analytics/PerformanceOverview' },
  { label: 'Time Analysis', icon: 'time', route: '/components/analytics/TimeAnalysis' },
];

const AnalyticsList: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchStudentAnalytics());
  }, [dispatch]);

  const handlePress = (path: (typeof analyticsOptions)[number]['route']) => {
    router.push(path as any);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      {/* Header */}
       <AppHeader screenTitle="Analytics DashBoard" onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.buttonsContainer}>
          {analyticsOptions.map((option) => (
            <TouchableOpacity
              key={option.route}
              style={styles.card}
              onPress={() => handlePress(option.route)}
              activeOpacity={0.85}
            >
              <View style={styles.cardContent}>
                <View style={styles.iconWrapper}>
                  <Ionicons name={option.icon} size={22} color="#4F46E5" />
                </View>
                <Text style={styles.cardText}>{option.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#6B7280" />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerText}>Tap an option to explore your analytics</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  buttonsContainer: {
    marginTop: 10,
    gap: 17,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#6B7280',
    marginTop: 25,
    fontStyle: 'italic',
  },
});

export default AnalyticsList;
