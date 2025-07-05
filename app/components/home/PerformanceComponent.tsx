import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { TrendingUp, BarChart2, ChevronRight } from 'lucide-react-native';
import courseServiceGet from '@/services/courseServiceGet';
import { useRouter } from 'expo-router';

interface PerformanceProps {
  onViewAnalytics?: () => void;
}

const PerformanceComponent: React.FC<PerformanceProps> = ({
  onViewAnalytics = () => {},
}) => {
  const [averageScore, setAverageScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter()

  // Format score with % symbol and determine color/level
  const { displayScore, scoreColor, performanceLevel } = useMemo(() => {
    const score = averageScore;
    let color = '#EF4444'; // Red (default for <= 0)
    let level = 'Needs Work';

    if (score > 90) {
      color = '#10B981'; // Emerald green
      level = 'Excellent!';
    } else if (score > 75) {
      color = '#3B82F6'; // Blue
      level = 'Great Job';
    } else if (score > 50) {
      color = '#F59E0B'; // Amber
      level = 'Good';
    } else if (score > 0) {
      color = '#F97316'; // Orange
      level = 'Keep Trying';
    }

    return {
      displayScore: `${score}%`,
      scoreColor: color,
      performanceLevel: level
    };
  }, [averageScore]);

  const progressAnim = useMemo(() => new Animated.Value(0), []);

  // Fetch data with error handling
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const response = await courseServiceGet.getUserAverageScore();
        if (isMounted) {
          setAverageScore(response.averageScore.toFixed(2));
          setIsLoading(false);
        }
      } catch (error) {
        if (isMounted && !controller.signal.aborted) {
          console.error('Error:', error);
          setIsLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  // Animation effect
  useEffect(() => {
    const score = Math.max(0, Math.min(averageScore, 100)); // Clamp between 0-100
    Animated.timing(progressAnim, {
      toValue: score,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [averageScore]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingPlaceholder} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={[styles.headerIcon, { backgroundColor: `${scoreColor}20` }]}>
          <TrendingUp size={20} color={scoreColor} />
        </View>
        <Text style={styles.headerText}>Your Performance</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Average Score</Text>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {displayScore}
          </Text>
          <Text style={[styles.performanceLevel, { color: scoreColor }]}>
            {performanceLevel}
          </Text>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                {
                  width: progressWidth,
                  backgroundColor: scoreColor,
                },
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>0%</Text>
            <Text style={styles.progressLabel}>100%</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.analyticsButton]}
          onPress={onViewAnalytics}
          activeOpacity={0.7}
        >
          <View style={styles.buttonContent}>
            <BarChart2 size={16} color="#FFFFFF" />
            <Text style={styles.buttonText}>View Analytics</Text>
          </View>
          <ChevronRight size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop: 20,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 4,
  },
  performanceLevel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  analyticsButton: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingPlaceholder: {
    height: 200,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
});

export default React.memo(PerformanceComponent);