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

interface AnalyticsOption {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  bgColor: string;
  route: string;
}

const analyticsOptions: AnalyticsOption[] = [
  {
    label: 'Overall Performance',
    icon: 'stats-chart',
    bgColor: '#F4A261',
    route: 'OverallPerformance',
  },
  {
    label: 'Subject Analysis',
    icon: 'book',
    bgColor: '#264653',
    route: 'SubjectAnalysis',
  },
  {
    label: 'Difficulty Analysis',
    icon: 'trending-up',
    bgColor: '#E76F51',
    route: 'DifficultyAnalysis',
  },
  {
    label: 'Question Types',
    icon: 'help-circle',
    bgColor: '#2A9D8F',
    route: 'QuestionTypes',
  },
  {
    label: 'Performance Trends',
    icon: 'analytics',
    bgColor: '#B5838D',
    route: 'PerformanceTrends',
  },
  {
    label: 'Time Analysis',
    icon: 'time',
    bgColor: '#E9C46A',
    route: 'TimeAnalysis',
  },
];

const AnalyticsList: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchStudentAnalytics());
  }, [dispatch]);

  const handlePress = (route: string) => {
    router.push(`/components/analytics/${route}`);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={router.back} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.buttonsContainer}>
          {analyticsOptions.map((option) => (
            <TouchableOpacity
              key={option.route}
              style={[styles.analyticsButton, { backgroundColor: option.bgColor }]}
              onPress={() => handlePress(option.route)}
              activeOpacity={0.9}
            >
              <View style={styles.buttonContent}>
                <View style={styles.iconTextContainer}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={option.icon} size={22} color="white" />
                  </View>
                  <Text style={styles.analyticsButtonText}>{option.label}</Text>
                </View>
                <View style={styles.arrowContainer}>
                  <Ionicons name="chevron-forward" size={18} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.footerText}>
          Tap on any category to see detailed analytics
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
    marginTop: 20,
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'stretch',
    rowGap: 8,
  },
  analyticsButton: {
    borderRadius: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  iconTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  analyticsButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  arrowContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default AnalyticsList;

