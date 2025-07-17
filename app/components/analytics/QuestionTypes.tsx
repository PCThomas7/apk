import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import { useAppSelector } from '../../../redux/hooks';
import { selectQuestionTypePerformance } from '../../../redux/slices/analyticsSlice';

const screenWidth = Dimensions.get('window').width;

const QuestionTypes = () => {
  const router = useRouter();
  const questionTypes = useAppSelector(selectQuestionTypePerformance);
  const [selectedType, setSelectedType] = useState(questionTypes?.[0]?.questionType || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleBack = () => router.back();

  const toggleDropdown = () => {
    Animated.timing(rotateAnim, {
      toValue: dropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setDropdownOpen(!dropdownOpen);
  };

  const selectType = (type: string) => {
    setSelectedType(type);
    setDropdownOpen(false);
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const current = questionTypes.find(q => q.questionType === selectedType);

  const pieData = current
    ? [
        { name: 'Correct', value: current.correctAnswers, color: '#10B981' },
        { name: 'Incorrect', value: current.incorrectAnswers, color: '#EF4444' },
        { name: 'Unattempted', value: current.unattempted, color: '#6B7280' },
      ]
    : [];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Question Types</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Dropdown */}
        <View style={styles.dropdownContainer}>
          <View style={styles.dropdownWrapper}>
            <TouchableOpacity style={styles.dropdownHeader} onPress={toggleDropdown}>
              <Text style={styles.dropdownHeaderText}>{selectedType}</Text>
              <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                <Ionicons name="chevron-down" size={20} color="#6B7280" />
              </Animated.View>
            </TouchableOpacity>
            {dropdownOpen && (
              <View style={styles.dropdownListOverlay}>
                <ScrollView style={styles.dropdownScroll}>
                  {questionTypes.map((q, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        selectedType === q.questionType && styles.dropdownItemSelected,
                      ]}
                      onPress={() => selectType(q.questionType)}
                    >
                      <Text style={styles.dropdownItemText}>{q.questionType}</Text>
                      {selectedType === q.questionType && (
                        <Ionicons name="checkmark" size={18} color="#4F46E5" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        {/* Pie Chart */}
        {current && (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Answer Distribution</Text>
            <PieChart
              data={pieData}
              width={screenWidth - 64}
              height={200}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor="value"
              backgroundColor="transparent"
              paddingLeft="75"
              absolute
              hasLegend={false}
              style={styles.chart}
            />

            {/* Legend */}
            <View style={styles.legendContainer}>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.legendText}>Correct: {current.correctAnswers}</Text>
                </View>
                <View style={[styles.legendItem, { marginLeft: 16 }]}>
                  <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
                  <Text style={styles.legendText}>Incorrect: {current.incorrectAnswers}</Text>
                </View>
              </View>
              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendColor, { backgroundColor: '#6B7280' }]} />
                  <Text style={styles.legendText}>Unattempted: {current.unattempted}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Summary */}
        {current && (
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Performance Summary</Text>

            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <Ionicons name="help-circle" size={24} color="#4F46E5" style={styles.metricIcon} />
                <Text style={styles.metricLabel}>Total Questions</Text>
                <Text style={styles.metricValue}>{current.totalQuestions}</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="trophy" size={24} color="#10B981" style={styles.metricIcon} />
                <Text style={styles.metricLabel}>Percentage</Text>
                <Text style={styles.metricValue}>{current.percentage.toFixed(1)}%</Text>
              </View>
            </View>

            <View style={styles.metricRow}>
              <View style={styles.metricCard}>
                <Ionicons name="stats-chart" size={24} color="#F59E0B" style={styles.metricIcon} />
                <Text style={styles.metricLabel}>Score</Text>
                <Text style={styles.metricValue}>{current.score}/{current.maxScore}</Text>
              </View>
              <View style={styles.metricCard}>
                <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" style={styles.metricIcon} />
                <Text style={styles.metricLabel}>Accuracy</Text>
                <Text style={styles.metricValue}>
                  {((current.correctAnswers / current.totalQuestions) * 100).toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  headerTitle: {
    fontSize: 20, fontWeight: '600', color: '#1f2937',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 20,
  },
  dropdownWrapper: {
    zIndex: 10,
  },
  dropdownHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#F9FAFB', borderWidth: 1,
    borderColor: '#E5E7EB', borderRadius: 12,
  },
  dropdownHeaderText: {
    fontSize: 16, color: '#1F2937', fontWeight: '500',
  },
  dropdownListOverlay: {
    position: 'absolute', top: 60, left: 0, right: 0,
    backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 8, maxHeight: 200, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 8,
    zIndex: 100,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#F5F3FF',
  },
  dropdownItemText: {
    fontSize: 16, color: '#1F2937',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  chartTitle: {
    fontSize: 16, fontWeight: '600', color: '#1F2937', textAlign: 'center', marginBottom: 8,
  },
  chart: {
    borderRadius: 8,
  },
  legendContainer: {
    marginTop: 8,
  },
  legendRow: {
    flexDirection: 'row', justifyContent: 'center', marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row', alignItems: 'center',
  },
  legendColor: {
    width: 16, height: 16, borderRadius: 8, marginRight: 8,
  },
  legendText: {
    fontSize: 14, color: '#374151',
  },
  metricsContainer: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: {
    fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#F9FAFB', borderRadius: 8, padding: 16,
    width: '48%', alignItems: 'center',
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14, color: '#6B7280', marginBottom: 4, textAlign: 'center',
  },
  metricValue: {
    fontSize: 18, fontWeight: '600', color: '#1F2937', textAlign: 'center',
  },
});

export default QuestionTypes;
