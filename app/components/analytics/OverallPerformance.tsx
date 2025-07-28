import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAppSelector } from '../../../redux/hooks';
import { selectAnalytics } from '../../../redux/slices/analyticsSlice';
import { PieChart } from 'react-native-chart-kit';
import AppHeader from '../../components/header';

// Helper function to format seconds into hh:mm:ss
const formatTime = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hrs > 0) {
    return `${hrs}h ${mins}m`;
  } else if (mins > 0) {
    return `${mins}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

const OverallPerformance = () => {
    const router = useRouter();
    const analyticsData = useAppSelector(selectAnalytics);


    // Memoize the metrics to prevent unnecessary recalculations
    const metrics = useMemo(() => {
        if (!analyticsData) return null;
        
        return {
            totalAttempts: analyticsData.totalAttempts,
            averageScore: analyticsData.averageScore.toFixed(2),
            totalQuestions: analyticsData.totalQuestions,
            correctAnswers: analyticsData.correctAnswers,
            incorrectAnswers: analyticsData.incorrectAnswers,
            unattempted: analyticsData.unattempted,
            totalTimeSpent: analyticsData.timeSpentAnalysis?.totalTimeSpent || 0,
            avgTimePerQuiz: analyticsData.timeSpentAnalysis?.averageTimePerQuiz || 0,
            avgTimePerQuestion: analyticsData.timeSpentAnalysis?.averageTimePerQuestion || 0,
        };
    }, [analyticsData]);

    // Memoize pie chart data
    const pieData = useMemo(() => {
        if (!metrics) return [];
        
        return [
            {
                name: 'Correct',
                value: metrics.correctAnswers,
                color: '#10B981',
            },
            {
                name: 'Incorrect',
                value: metrics.incorrectAnswers,
                color: '#EF4444',
            },
            {
                name: 'Unattempted',
                value: metrics.unattempted,
                color: '#6B7280',
            },
        ];
    }, [metrics]);

    if (!metrics) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <AppHeader screenTitle="Overall Performance" onBackPress={() => router.back()} />
                <View style={styles.loadingContainer}>
                    <Text>Loading analytics data...</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <AppHeader screenTitle="Ask a Doubt" onBackPress={() => router.back()} />

            {/* Main Content */}
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Metrics Cards */}
                <View style={styles.cardsContainer}>
                    <MetricCard 
                        icon="stats-chart" 
                        title="Total Quizzes" 
                        value={metrics.totalAttempts.toString()} 
                        color="#4F46E5" 
                    />
                    <MetricCard 
                        icon="school" 
                        title="Average Score" 
                        value={`${metrics.averageScore}%`} 
                        color="#10B981" 
                    />
                    <MetricCard 
                        icon="help-circle" 
                        title="Total Questions" 
                        value={metrics.totalQuestions.toString()} 
                        color="#F59E0B" 
                    />
                    <MetricCard 
                        icon="time" 
                        title="Total Time" 
                        value={formatTime(metrics.totalTimeSpent)} 
                        color="#8B5CF6" 
                    />
                    <MetricCard 
                        icon="timer" 
                        title="Avg Time/Quiz" 
                        value={formatTime(metrics.avgTimePerQuiz)} 
                        color="#EC4899" 
                    />
                    <MetricCard 
                        icon="speedometer" 
                        title="Avg Time/Ques" 
                        value={formatTime(metrics.avgTimePerQuestion)} 
                        color="#3B82F6" 
                    />
                </View>

                {/* Pie Chart */}
                <View style={styles.chartContainer}>
                    <Text style={styles.chartTitle}>Question Analysis</Text>
                    <View style={styles.chartWrapper}>
                        <PieChart
                            data={pieData}
                            width={Dimensions.get('window').width - 64} // Narrower for better centering
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
                                    Correct: {metrics.correctAnswers}
                                </Text>
                            </View>
                            <View style={[styles.legendItem, { marginLeft: 16 }]}>
                                <View style={[styles.legendColor, { backgroundColor: '#EF4444' }]} />
                                <Text style={styles.legendText}>
                                    Incorrect: {metrics.incorrectAnswers}
                                </Text>
                            </View>
                        </View>
                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: '#6B7280' }]} />
                                <Text style={styles.legendText}>
                                    Unattempted: {metrics.unattempted}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

// Reusable Metric Card Component
const MetricCard = React.memo(({ icon, title, value, color }: {
    icon: string;
    title: string;
    value: string;
    color: string;
}) => (
    <View style={[styles.card, { borderLeftColor: color }]}>
        <View style={styles.cardContent}>
            <Ionicons name={icon as any} size={24} color={color} style={styles.cardIcon} />
            <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardValue}>{value}</Text>
            </View>
        </View>
    </View>
));

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContainer: {
        padding: 16,
        paddingBottom: 24,
    },
    cardsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    card: {
        width: '48%',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardContent: {
        flexDirection: 'column',
    },
    cardIcon: {
        marginBottom: 8,
    },
    cardText: {
        flex: 1,
    },
    cardTitle: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    cardValue: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    chartContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    chartWrapper: {
        alignItems: 'center', // Centers the chart horizontally
        marginBottom: 10,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: 4,
        textAlign: 'center',
    },
    chart: {
        borderRadius: 8,
    },
    legendContainer: {
        marginTop: 0,
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
        width: 12,
        height: 12,
        borderRadius: 8,
        marginRight: 8,
    },
    legendText: {
        fontSize: 14,
        color: '#374151',
    },
});

export default React.memo(OverallPerformance);
