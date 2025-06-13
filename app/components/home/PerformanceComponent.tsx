import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { TrendingUp, BarChart2, ChevronRight } from 'lucide-react-native';

interface PerformanceProps {
  averageScore?: number;
  onViewAnalytics?: () => void;
}

const PerformanceComponent: React.FC<PerformanceProps> = ({
  averageScore = 9,
  onViewAnalytics = () => {},
}) => {
  const cappedScore = Math.min(averageScore, 100);
  const [progressAnim] = useState(new Animated.Value(0));

  const scoreColor = useMemo(() => {
    if (cappedScore >= 90) return '#10B981'; // Green
    if (cappedScore >= 75) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  }, [cappedScore]);

  const performanceLevel = useMemo(() => {
    if (cappedScore >= 90) return 'Excellent';
    if (cappedScore >= 75) return 'Good';
    if (cappedScore >= 50) return 'Average';
    return 'Needs Improvement';
  }, [cappedScore]);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: cappedScore,
      duration: 1500,
      useNativeDriver: false,
    }).start();
  }, [cappedScore]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <TrendingUp size={20} color="#6366F1" />
        </View>
        <Text style={styles.headerText}>Learning Performance</Text>
      </View>

      {/* Card */}
      <View style={styles.card}>
        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Average Score</Text>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {cappedScore}%
          </Text>
          <Text style={[styles.performanceLevel, { color: scoreColor }]}>
            {performanceLevel}
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>0%</Text>
            <Text style={styles.progressLabel}>100%</Text>
          </View>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: progressWidth, backgroundColor: scoreColor },
              ]}
            />
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.analyticsButton}
          onPress={onViewAnalytics}
          activeOpacity={0.8}
        >
          <View style={styles.buttonContent}>
            <BarChart2 size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Detailed Analytics</Text>
          </View>
          <ChevronRight size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PerformanceComponent;

const styles = StyleSheet.create({
  container: {
    margin: 16,
    marginTop : 35,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 4,
  },
  headerIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
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
    textTransform: 'uppercase',
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  analyticsButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 14,
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
});


// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
// import { TrendingUp, BarChart2, ChevronRight } from 'lucide-react-native';
// import courseServiceGet from "../../services/courseServiceGet";
// import * as SecureStore from 'expo-secure-store';

// interface PerformanceProps {
//   onViewAnalytics?: () => void;
// }

// const PerformanceComponent: React.FC<PerformanceProps> = ({
//   onViewAnalytics = () => {},
// }) => {
//   const [progressAnim] = useState(new Animated.Value(0));
//   const [isLoading, setIsLoading] = useState(true);
//   const [averageScore, setAverageScore] = useState(0);
//   const [error, setError] = useState<string | null>(null);
//   const [userId, setUserId] = useState<string | null>(null);

//   // Get user details and fetch average score
//   const fetchData = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
      
//       // Get user ID from secure store
//       const userDetails = await SecureStore.getItemAsync('userDetails');
//       if (!userDetails) throw new Error('User not logged in');
      
//       const parsedUserDetails = JSON.parse(userDetails);
//       if (!parsedUserDetails?.id) throw new Error('User ID not found');
      
//       setUserId(parsedUserDetails.id);
      
//       // Fetch average score
//       const res = await courseServiceGet.getAverageScore(parsedUserDetails.id);
//       const score = Math.min(res.data?.averageScore || 0, 100);
//       setAverageScore(score);
      
//       // Animate the progress bar
//       Animated.timing(progressAnim, {
//         toValue: score,
//         duration: 1500,
//         useNativeDriver: false,
//       }).start();
      
//     } catch (err) {
//       console.error('Error fetching data:', err);
//       setError('Failed to load performance data');
//       setAverageScore(0);
//     } finally {
//       setIsLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchData();
//   }, []);

//   const scoreColor = useMemo(() => {
//     if (averageScore >= 90) return '#10B981'; // Green
//     if (averageScore >= 75) return '#F59E0B'; // Yellow
//     return '#EF4444'; // Red
//   }, [averageScore]);

//   const performanceLevel = useMemo(() => {
//     if (averageScore >= 90) return 'Excellent';
//     if (averageScore >= 75) return 'Good';
//     if (averageScore >= 50) return 'Average';
//     return 'Needs Improvement';
//   }, [averageScore]);

//   const progressWidth = progressAnim.interpolate({
//     inputRange: [0, 100],
//     outputRange: ['0%', '100%'],
//   });

//   if (isLoading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color="#6366F1" />
//       </View>
//     );
//   }

//   if (error) {
//     return (
//       <View style={styles.container}>
//         <View style={styles.errorContainer}>
//           <Text style={styles.errorText}>{error}</Text>
//           <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
//             <Text style={styles.retryButtonText}>Try Again</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerIcon}>
//           <TrendingUp size={20} color="#6366F1" />
//         </View>
//         <Text style={styles.headerText}>Learning Performance</Text>
//       </View>

//       {/* Card */}
//       <View style={styles.card}>
//         {/* Score */}
//         <View style={styles.scoreContainer}>
//           <Text style={styles.scoreLabel}>Average Score</Text>
//           <Text style={[styles.scoreValue, { color: scoreColor }]}>
//             {averageScore}%
//           </Text>
//           <Text style={[styles.performanceLevel, { color: scoreColor }]}>
//             {performanceLevel}
//           </Text>
//         </View>

//         {/* Progress Bar */}
//         <View style={styles.progressContainer}>
//           <View style={styles.progressLabels}>
//             <Text style={styles.progressLabel}>0%</Text>
//             <Text style={styles.progressLabel}>100%</Text>
//           </View>
//           <View style={styles.progressBar}>
//             <Animated.View
//               style={[
//                 styles.progressFill,
//                 { width: progressWidth, backgroundColor: scoreColor },
//               ]}
//             />
//           </View>
//         </View>

//         {/* Button */}
//         <TouchableOpacity
//           style={styles.analyticsButton}
//           onPress={onViewAnalytics}
//           activeOpacity={0.8}
//         >
//           <View style={styles.buttonContent}>
//             <BarChart2 size={18} color="#FFFFFF" />
//             <Text style={styles.buttonText}>Detailed Analytics</Text>
//           </View>
//           <ChevronRight size={18} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     margin: 16,
//     marginBottom: 24,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 12,
//     marginLeft: 4,
//   },
//   headerIcon: {
//     width: 36,
//     height: 36,
//     backgroundColor: '#EEF2FF',
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   headerText: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#1F2937',
//     marginLeft: 12,
//   },
//   card: {
//     backgroundColor: '#FFFFFF',
//     borderRadius: 16,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 2,
//   },
//   scoreContainer: {
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   scoreLabel: {
//     fontSize: 14,
//     color: '#6B7280',
//     marginBottom: 4,
//   },
//   scoreValue: {
//     fontSize: 36,
//     fontWeight: '800',
//     marginBottom: 4,
//   },
//   performanceLevel: {
//     fontSize: 14,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//   },
//   progressContainer: {
//     marginBottom: 20,
//   },
//   progressLabels: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 6,
//   },
//   progressLabel: {
//     fontSize: 12,
//     color: '#9CA3AF',
//   },
//   progressBar: {
//     height: 8,
//     backgroundColor: '#F3F4F6',
//     borderRadius: 4,
//     overflow: 'hidden',
//   },
//   progressFill: {
//     height: '100%',
//     borderRadius: 4,
//   },
//   analyticsButton: {
//     backgroundColor: '#6366F1',
//     borderRadius: 12,
//     padding: 14,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   buttonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   buttonText: {
//     color: '#FFFFFF',
//     fontSize: 14,
//     fontWeight: '600',
//   },
//   errorContainer: {
//     backgroundColor: '#FEE2E2',
//     borderRadius: 12,
//     padding: 16,
//     alignItems: 'center',
//   },
//   errorText: {
//     color: '#B91C1C',
//     fontSize: 14,
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   retryButton: {
//     backgroundColor: '#6366F1',
//     borderRadius: 8,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//   },
//   retryButtonText: {
//     color: '#FFFFFF',
//     fontWeight: '600',
//   },
// });

// export default PerformanceComponent;