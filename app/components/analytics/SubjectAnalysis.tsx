import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../../redux/hooks';
import { selectSubjectPerformance } from '../../../redux/slices/analyticsSlice';
import { PieChart } from 'react-native-chart-kit';

const SubjectAnalysis = () => {
  const router = useRouter();
  const subjectPerformance = useAppSelector(selectSubjectPerformance);
  console.log("subjectPerformance :",subjectPerformance)
  const [selectedSubject, setSelectedSubject] = useState(subjectPerformance?.[0]?.subject || '');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleBack = () => {
    router.back();
  };

  const toggleDropdown = () => {
    Animated.timing(rotateAnim, {
      toValue: dropdownOpen ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    setDropdownOpen(!dropdownOpen);
  };

  const selectSubject = (subject: string) => {
    setSelectedSubject(subject);
    setDropdownOpen(false);
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  if (!subjectPerformance || subjectPerformance.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subject Analysis</Text>
        </View>
        <View style={styles.container}>
          <Text>No subject data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentSubject = subjectPerformance.find(sub => sub.subject === selectedSubject) || subjectPerformance[0];

  // Pie chart data
  const pieData = [
    {
      name: 'Correct',
      value: currentSubject.correctAnswers,
      color: '#10B981',
    },
    {
      name: 'Incorrect',
      value: currentSubject.incorrectAnswers,
      color: '#EF4444',
    },
    {
      name: 'Unattempted',
      value: currentSubject.unattempted,
      color: '#6B7280',
    }
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right','bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subject Analysis</Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Custom Dropdown */}
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity 
            style={styles.dropdownHeader} 
            onPress={toggleDropdown}
            activeOpacity={0.8}
          >
            <Text style={styles.dropdownHeaderText}>{selectedSubject}</Text>
            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
              <Ionicons name="chevron-down" size={20} color="#6B7280" />
            </Animated.View>
          </TouchableOpacity>
          
          {dropdownOpen && (
            <View style={styles.dropdownList}>
              <ScrollView style={styles.dropdownScroll}>
                {subjectPerformance.map((subject, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      selectedSubject === subject.subject && styles.dropdownItemSelected
                    ]}
                    onPress={() => selectSubject(subject.subject)}
                  >
                    <Text style={styles.dropdownItemText}>{subject.subject}</Text>
                    {selectedSubject === subject.subject && (
                      <Ionicons name="checkmark" size={18} color="#4F46E5" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Pie Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Question Analysis</Text>
          <View style={styles.chartWrapper}>
            <PieChart
              data={pieData}
              width={Dimensions.get('window').width - 64}
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
          </View>
          
          {/* Custom legend container below the chart */}
          <View style={styles.legendContainer}>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#10B981' }]} />
                <Text style={styles.legendText}>
                  Correct: {currentSubject.correctAnswers}
                </Text>
              </View>
              <View style={[styles.legendItem, { marginLeft: 16 }]}>
                <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
                <Text style={styles.legendText}>
                  Incorrect: {currentSubject.incorrectAnswers}
                </Text>
              </View>
            </View>
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColor, { backgroundColor: '#6B7280' }]} />
                <Text style={styles.legendText}>
                  Unattempted: {currentSubject.unattempted}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Performance Metrics */}
        <View style={styles.metricsContainer}>
          <Text style={styles.sectionTitle}>Performance Summary</Text>
          
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Ionicons name="help-circle" size={24} color="#4F46E5" style={styles.metricIcon} />
              <Text style={styles.metricLabel}>Total Questions</Text>
              <Text style={styles.metricValue}>{currentSubject.totalQuestions}</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="trophy" size={24} color="#10B981" style={styles.metricIcon} />
              <Text style={styles.metricLabel}>Percentage</Text>
              <Text style={styles.metricValue}>{currentSubject.percentage.toFixed(1)}%</Text>
            </View>
          </View>
          
          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Ionicons name="stats-chart" size={24} color="#F59E0B" style={styles.metricIcon} />
              <Text style={styles.metricLabel}>Score</Text>
              <Text style={styles.metricValue}>{currentSubject.score}/{currentSubject.maxScore}</Text>
            </View>
            <View style={styles.metricCard}>
              <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" style={styles.metricIcon} />
              <Text style={styles.metricLabel}>Accuracy</Text>
              <Text style={styles.metricValue}>
                {((currentSubject.correctAnswers / (currentSubject.correctAnswers + currentSubject.incorrectAnswers)) * 100 || 0).toFixed(1)}%
              </Text>
            </View>
          </View>
        </View>
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
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownWrapper: {
    marginBottom: 20,
    position: 'relative',
    zIndex: 1,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  dropdownHeaderText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 2,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#F5F3FF',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#1F2937',
  },
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom:8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  chartWrapper: {
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  legendContainer: {
    marginTop: 3,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#374151',
  },
  metricsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 16,
    width: '48%',
    alignItems: 'center',
  },
  metricIcon: {
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
});

export default SubjectAnalysis;