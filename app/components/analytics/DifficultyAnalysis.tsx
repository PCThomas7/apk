import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native'; // Added Dimensions here
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../../redux/hooks';
import { selectDifficultyPerformance } from '../../../redux/slices/analyticsSlice';
import { PieChart } from 'react-native-chart-kit';

const DifficultyAnalysis = () => {
  const router = useRouter();
  const difficultyData = useAppSelector(selectDifficultyPerformance);

  const handleBack = () => {
    router.back();
  };

  if (!difficultyData || difficultyData.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color="#4F46E5" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Difficulty Analysis</Text>
        </View>
        <View style={styles.container}>
          <Text>No difficulty data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Prepare data for pie chart
  const pieData = difficultyData.map(item => ({
    name: item.difficulty,
    value: item.totalQuestions,
    color: getColorForDifficulty(item.difficulty),
    legendFontColor: '#6B7280',
    legendFontSize: 12
  }));

  function getColorForDifficulty(difficulty: string) {
    switch(difficulty.toLowerCase()) {
      case 'easy': return '#10B981'; // Green
      case 'medium': return '#F59E0B'; // Yellow
      case 'hard': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#4F46E5" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Difficulty Analysis</Text>
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Pie Chart - Question Distribution by Difficulty */}
        <View style={styles.chartContainer}>
          <Text style={styles.sectionTitle}>Question Distribution by Difficulty</Text>
          <PieChart
            data={pieData}
            width={Dimensions.get('window').width - 32} // Now using imported Dimensions
            height={220}
            chartConfig={{
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="value"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>

        {/* Difficulty Performance Table */}
        <View style={styles.tableContainer}>
          <Text style={styles.sectionTitle}>Performance by Difficulty</Text>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Difficulty</Text>
            <Text style={styles.tableHeaderText}>Correct</Text>
            <Text style={styles.tableHeaderText}>Incorrect</Text>
            <Text style={styles.tableHeaderText}>% Correct</Text>
          </View>
          {difficultyData.map((item, index) => (
            <View key={index} style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
              <Text style={[styles.tableCell, { flex: 2, color: getColorForDifficulty(item.difficulty) }]}>
                {item.difficulty}
              </Text>
              <Text style={styles.tableCell}>{item.correctAnswers}</Text>
              <Text style={styles.tableCell}>{item.incorrectAnswers}</Text>
              <Text style={styles.tableCell}>
                {((item.correctAnswers / (item.correctAnswers + item.incorrectAnswers)) * 100 || 0).toFixed(1)}%
              </Text>
            </View>
          ))}
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
  chartContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  tableContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
  },
  evenRow: {
    backgroundColor: '#F9FAFB',
  },
  tableCell: {
    flex: 1,
    color: '#374151',
    textAlign: 'center',
  },
});

export default DifficultyAnalysis;