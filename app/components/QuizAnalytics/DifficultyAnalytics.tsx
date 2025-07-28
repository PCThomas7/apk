// import React, { useRef, useState, useMemo } from 'react';
// import {
//     View,
//     Text,
//     StyleSheet,
//     TouchableOpacity,
//     Dimensions,
//     Animated,
//     ScrollView,
// } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Ionicons } from '@expo/vector-icons';
// import { useRouter } from 'expo-router';
// import { useSelector } from 'react-redux';
// import { PieChart } from 'react-native-chart-kit';
// import {
//     selectDifficultyWisePerformance,
//     DifficultyPerformance,
// } from '../../../redux/slices/quizAnalyticsSlice';

// const screenWidth = Dimensions.get('window').width;

// const DifficultyAnalytics = () => {
//     const router = useRouter();
//     const difficultyData = useSelector(selectDifficultyWisePerformance);
//     const [selectedDifficulty, setSelectedDifficulty] = useState(
//         difficultyData?.[0]?.difficulty || ''
//     );
//     const [dropdownVisible, setDropdownVisible] = useState(false);
//     const rotateAnim = useRef(new Animated.Value(0)).current;

//     const current: DifficultyPerformance | undefined = useMemo(() => {
//         return difficultyData.find((item) => item.difficulty === selectedDifficulty);
//     }, [difficultyData, selectedDifficulty]);

//     const toggleDropdown = () => {
//         Animated.timing(rotateAnim, {
//             toValue: dropdownVisible ? 0 : 1,
//             duration: 200,
//             useNativeDriver: true,
//         }).start();
//         setDropdownVisible(!dropdownVisible);
//     };

//     const handleSelect = (difficulty: string) => {
//         setSelectedDifficulty(difficulty);
//         toggleDropdown();
//     };

//     const rotateInterpolate = rotateAnim.interpolate({
//         inputRange: [0, 1],
//         outputRange: ['0deg', '180deg'],
//     });

//     const pieData = current
//         ? [
//             {
//                 name: 'Correct',
//                 value: current.correctAnswers,
//                 color: '#10B981',
//                 legendFontColor: '#1F2937',
//                 legendFontSize: 13,
//             },
//             {
//                 name: 'Incorrect',
//                 value: current.incorrectAnswers,
//                 color: '#EF4444',
//                 legendFontColor: '#1F2937',
//                 legendFontSize: 13,
//             },
//             {
//                 name: 'Unattempted',
//                 value: current.unattempted,
//                 color: '#9CA3AF',
//                 legendFontColor: '#1F2937',
//                 legendFontSize: 13,
//             },
//         ]
//         : [];

//     return (
//         <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
//             <View style={styles.header}>
//                 <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//                     <Ionicons name="arrow-back" size={22} color="#4F46E5" />
//                 </TouchableOpacity>
//                 <Text style={styles.headerTitle}>Difficulty Analytics</Text>
//             </View>

//             <ScrollView contentContainerStyle={styles.scrollContainer}>
//                 {/* Dropdown */}
//                 <View style={styles.dropdownWrapper}>
//                     <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownHeader}>
//                         <Text style={styles.dropdownText}>{selectedDifficulty}</Text>
//                         <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
//                             <Ionicons name="chevron-down" size={20} color="#6B7280" />
//                         </Animated.View>
//                     </TouchableOpacity>

//                     {dropdownVisible && (
//                         <View style={styles.dropdownList}>
//                             <ScrollView>
//                                 {difficultyData.map((item, idx) => (
//                                     <TouchableOpacity
//                                         key={idx}
//                                         style={[
//                                             styles.dropdownItem,
//                                             selectedDifficulty === item.difficulty && styles.dropdownItemActive,
//                                         ]}
//                                         onPress={() => handleSelect(item.difficulty)}
//                                     >
//                                         <Text style={styles.dropdownItemText}>{item.difficulty}</Text>
//                                         {selectedDifficulty === item.difficulty && (
//                                             <Ionicons name="checkmark" size={18} color="#4F46E5" />
//                                         )}
//                                     </TouchableOpacity>
//                                 ))}
//                             </ScrollView>
//                         </View>
//                     )}
//                 </View>

//                 {/* Chart */}
//                 {current && (
//                     <View style={styles.card}>
//                         <Text style={styles.chartTitle}>Answer Distribution</Text>
//                         <PieChart
//                             data={pieData}
//                             width={screenWidth - 64}
//                             height={200}
//                             chartConfig={{ color: () => '#000' }}
//                             accessor="value"
//                             backgroundColor="transparent"
//                             paddingLeft="60"
//                             absolute
//                             hasLegend={false}
//                             style={styles.chart}
//                         />
//                         <View style={styles.legendRow}>
//                             <View style={styles.legendItem}>
//                                 <View style={[styles.legendColor, { backgroundColor: pieData[0]?.color }]} />
//                                 <Text style={styles.legendText}>{`Correct: ${pieData[0]?.value}`}</Text>
//                             </View>
//                             <View style={styles.legendItem}>
//                                 <View style={[styles.legendColor, { backgroundColor: pieData[1]?.color }]} />
//                                 <Text style={styles.legendText}>{`Incorrect: ${pieData[1]?.value}`}</Text>
//                             </View>
//                         </View>
//                         <View style={[styles.legendRow, { justifyContent: 'center' }]}>
//                             <View style={styles.legendItem}>
//                                 <View style={[styles.legendColor, { backgroundColor: pieData[2]?.color }]} />
//                                 <Text style={styles.legendText}>{`Unattempted: ${pieData[2]?.value}`}</Text>
//                             </View>
//                         </View>

//                     </View>
//                 )}

//                 {/* Summary */}
//                 {current && (
//                     <View style={styles.metricsWrapper}>
//                         <Text style={styles.sectionTitle}>Summary</Text>
//                         <View style={styles.metricRow}>
//                             <Text style={styles.metricLabel}>Total Questions</Text>
//                             <Text style={styles.metricValue}>{current.totalQuestions}</Text>
//                         </View>
//                         <View style={styles.metricRow}>
//                             <Text style={styles.metricLabel}>Score</Text>
//                             <Text style={styles.metricValue}>
//                                 {current.score} / {current.maxScore}
//                             </Text>
//                         </View>
//                         <View style={styles.metricRow}>
//                             <Text style={styles.metricLabel}>Percentage</Text>
//                             <Text style={styles.metricValue}>{current.percentage.toFixed(1)}%</Text>
//                         </View>
//                     </View>
//                 )}
//             </ScrollView>
//         </SafeAreaView>
//     );
// };

// const styles = StyleSheet.create({
//     safeArea: { flex: 1, backgroundColor: '#ffffff' },
//     header: {
//         flexDirection: 'row',
//         alignItems: 'center',
//         padding: 16,
//         borderBottomWidth: 1,
//         borderBottomColor: '#E5E7EB',
//     },
//     backButton: {
//         width: 40,
//         height: 40,
//         borderRadius: 20,
//         backgroundColor: '#F3F4F6',
//         justifyContent: 'center',
//         alignItems: 'center',
//         marginRight: 12,
//     },
//     headerTitle: {
//         fontSize: 20,
//         fontWeight: '600',
//         color: '#1F2937',
//     },
//     scrollContainer: {
//         padding: 16,
//     },
//     dropdownWrapper: {
//         position: 'relative',
//         zIndex: 100, // Ensures dropdown overlays other content
//         marginBottom: 16,
//     },
//     dropdownHeader: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         alignItems: 'center',
//         backgroundColor: '#F9FAFB',
//         padding: 12,
//         borderRadius: 8,
//         borderWidth: 1,
//         borderColor: '#E5E7EB',
//         height: 50,
//     },
//     dropdownText: {
//         fontSize: 16,
//         color: '#1F2937',
//     },
//     dropdownList: {
//         position: 'absolute',
//         top: 50,
//         left: 0,
//         right: 0,
//         backgroundColor: '#fff',
//         borderColor: '#E5E7EB',
//         borderWidth: 1,
//         borderRadius: 8,
//         maxHeight: 180,
//         elevation: 4,
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 4,
//         zIndex: 100,
//     },
//     dropdownItem: {
//         padding: 12,
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//     },
//     dropdownItemActive: {
//         backgroundColor: '#EEF2FF',
//     },
//     dropdownItemText: {
//         fontSize: 16,
//         color: '#1F2937',
//     },
//     card: {
//         backgroundColor: '#fff',
//         padding: 16,
//         borderRadius: 12,
//         marginBottom: 16,
//         elevation: 2,
//     },
//     chartTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#1F2937',
//         textAlign: 'center',
//         marginBottom: 8,
//     },
//     chart: {
//         marginTop: 8,
//     },
//     legendRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-evenly',
//         marginTop: 12,
//     },
//     legendItem: {
//         flexDirection: 'row',
//         alignItems: 'center',
//     },
//     legendColor: {
//         width: 12,
//         height: 12,
//         borderRadius: 6,
//         marginRight: 6,
//     },
//     legendText: {
//         fontSize: 14,
//         color: '#374151',
//     },
//     metricsWrapper: {
//         backgroundColor: '#fff',
//         padding: 16,
//         borderRadius: 12,
//     },
//     sectionTitle: {
//         fontSize: 16,
//         fontWeight: '600',
//         color: '#1F2937',
//         marginBottom: 12,
//     },
//     metricRow: {
//         flexDirection: 'row',
//         justifyContent: 'space-between',
//         paddingVertical: 6,
//     },
//     metricLabel: {
//         fontSize: 15,
//         color: '#6B7280',
//     },
//     metricValue: {
//         fontSize: 15,
//         fontWeight: '500',
//         color: '#111827',
//     },
// });

// export default DifficultyAnalytics;

import React, { useRef, useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    Animated,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import { PieChart } from 'react-native-chart-kit';
import {
    selectDifficultyWisePerformance,
    selectQuestionTypePerformance,
    DifficultyPerformance,
    QuestionTypePerformance,
} from '../../../redux/slices/quizAnalyticsSlice';
import AppHeader from '../../components/header';

type AnalyticsData = DifficultyPerformance | QuestionTypePerformance;
type AnalyticsMode = 'difficulty' | 'questionType';

const screenWidth = Dimensions.get('window').width;

const AnalyticsScreen = () => {
    const router = useRouter();
    const { page } = useLocalSearchParams<{ page: AnalyticsMode }>();

    const difficultyData = useSelector(selectDifficultyWisePerformance);
    const questionTypeData = useSelector(selectQuestionTypePerformance);

    const [selectedValue, setSelectedValue] = useState<string>('');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const rotateAnim = useRef(new Animated.Value(0)).current;

    // Get the current mode (difficulty or questionType)
    const mode: AnalyticsMode = Array.isArray(page) ? page[0] as AnalyticsMode : page || 'difficulty';

    // Determine which data to use based on mode
    const currentData = useMemo(() => {
        return mode === 'difficulty' ? difficultyData : questionTypeData;
    }, [mode, difficultyData, questionTypeData]);

    function isDifficultyPerformance(item: AnalyticsData): item is DifficultyPerformance {
        return (item as DifficultyPerformance).difficulty !== undefined;
    }

    // Then in your useEffect:
    useEffect(() => {
        if (currentData?.length > 0 && !selectedValue) {
            const firstItem = currentData[0];
            const initialValue = isDifficultyPerformance(firstItem)
                ? firstItem.difficulty
                : firstItem.questionType;
            setSelectedValue(initialValue);
        }
    }, [currentData, mode]);

    const current: AnalyticsData | undefined = useMemo(() => {
        if (!currentData || !selectedValue) return undefined;
        return currentData.find((item) =>
            mode === 'difficulty'
                ? (item as DifficultyPerformance).difficulty === selectedValue
                : (item as QuestionTypePerformance).questionType === selectedValue
        );
    }, [currentData, selectedValue, mode]);

    const toggleDropdown = () => {
        Animated.timing(rotateAnim, {
            toValue: dropdownVisible ? 0 : 1,
            duration: 200,
            useNativeDriver: true,
        }).start();
        setDropdownVisible(!dropdownVisible);
    };

    const handleSelect = (value: string) => {
        setSelectedValue(value);
        toggleDropdown();
    };

    const rotateInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg'],
    });

    const pieData = current
        ? [
            {
                name: 'Correct',
                value: current.correctAnswers ?? 0,
                color: '#10B981',
                legendFontColor: '#1F2937',
                legendFontSize: 13,
            },
            {
                name: 'Incorrect',
                value: current.incorrectAnswers ?? 0,
                color: '#EF4444',
                legendFontColor: '#1F2937',
                legendFontSize: 13,
            },
            {
                name: 'Unattempted',
                value: current.unattempted ?? 0,
                color: '#9CA3AF',
                legendFontColor: '#1F2937',
                legendFontSize: 13,
            },
        ].filter(item => item.value >= 0) // Only show segments with values
        : [];

    const getDisplayValue = (item: AnalyticsData): string => {
        return mode === 'difficulty'
            ? (item as DifficultyPerformance).difficulty
            : (item as QuestionTypePerformance).questionType;
    };



    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <AppHeader screenTitle={mode === 'difficulty'  ? 'Difficulty Analytics'
            : 'Question Type Analytics'} onBackPress={() => router.back()} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                {/* Dropdown */}
                {currentData && currentData.length > 0 && (
                    <View style={styles.dropdownWrapper}>
                        <TouchableOpacity onPress={toggleDropdown} style={styles.dropdownHeader}>
                            <Text style={styles.dropdownText}>{selectedValue}</Text>
                            <Animated.View style={{ transform: [{ rotate: rotateInterpolate }] }}>
                                <Ionicons name="chevron-down" size={20} color="#6B7280" />
                            </Animated.View>
                        </TouchableOpacity>

                        {dropdownVisible && (
                            <View style={styles.dropdownList}>
                                <ScrollView>
                                    {currentData.map((item, idx) => {
                                        const displayValue = getDisplayValue(item);
                                        return (
                                            <TouchableOpacity
                                                key={idx}
                                                style={[
                                                    styles.dropdownItem,
                                                    selectedValue === displayValue && styles.dropdownItemActive,
                                                ]}
                                                onPress={() => handleSelect(displayValue)}
                                            >
                                                <Text style={styles.dropdownItemText}>{displayValue}</Text>
                                                {selectedValue === displayValue && (
                                                    <Ionicons name="checkmark" size={18} color="#4F46E5" />
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                )}

                {/* Chart */}
                {current && pieData.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.chartTitle}>Answer Distribution</Text>
                        <PieChart
                            data={pieData}
                            width={screenWidth - 64}
                            height={200}
                            chartConfig={{ color: () => '#000' }}
                            accessor="value"
                            backgroundColor="transparent"
                            paddingLeft="60"
                            absolute
                            hasLegend={false}
                            style={styles.chart}
                        />
                        <View style={styles.legendRow}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: pieData[0]?.color }]} />
                                <Text style={styles.legendText}>{`Correct: ${pieData[0]?.value}`}</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: pieData[1]?.color }]} />
                                <Text style={styles.legendText}>{`Incorrect: ${pieData[1]?.value}`}</Text>
                            </View>
                        </View>
                        <View style={[styles.legendRow, { justifyContent: 'center' }]}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendColor, { backgroundColor: pieData[2]?.color }]} />
                                <Text style={styles.legendText}>{`Unattempted: ${pieData[2]?.value}`}</Text>
                            </View>
                        </View>

                    </View>
                )}

                {/* Summary */}
                {current && (
                    <View style={styles.metricsWrapper}>
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>Total Questions</Text>
                            <Text style={styles.metricValue}>{current.totalQuestions}</Text>
                        </View>
                        <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>Score</Text>
                            <Text style={styles.metricValue}>
                                {current.score} / {current.maxScore}
                            </Text>
                        </View>
                        <View style={styles.metricRow}>
                            <Text style={styles.metricLabel}>Percentage</Text>
                            <Text style={[styles.metricValue, {
                                color: current.percentage >= 75 ? '#10B981' :
                                    current.percentage >= 50 ? '#F59E0B' : '#EF4444'
                            }]}>
                                {current.percentage.toFixed(1)}%
                            </Text>
                        </View>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

// Styles remain exactly the same as in your original code
const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#ffffff' },
    scrollContainer: {
        padding: 16,
    },
    dropdownWrapper: {
        position: 'relative',
        zIndex: 100,
        marginBottom: 16,
    },
    dropdownHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        height: 50,
    },
    dropdownText: {
        fontSize: 16,
        color: '#1F2937',
    },
    dropdownList: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 8,
        maxHeight: 180,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 100,
    },
    dropdownItem: {
        padding: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    dropdownItemActive: {
        backgroundColor: '#EEF2FF',
    },
    dropdownItemText: {
        fontSize: 16,
        color: '#1F2937',
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        elevation: 2,
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 8,
    },
    chart: {
        marginTop: 8,
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        marginTop: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendColor: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        fontSize: 14,
        color: '#374151',
    },
    metricsWrapper: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 12,
    },
    metricRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    metricLabel: {
        fontSize: 15,
        color: '#6B7280',
    },
    metricValue: {
        fontSize: 15,
        fontWeight: '500',
        color: '#111827',
    },
});

export default AnalyticsScreen;