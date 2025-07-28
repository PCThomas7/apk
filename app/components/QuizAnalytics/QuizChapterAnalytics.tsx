import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import {
    selectChapterWisePerformance,
    ChapterPerformance,
} from '../../../redux/slices/quizAnalyticsSlice';
import AppHeader from '../header';

const QuizChapterAnalytics = () => {
    const router = useRouter();
    const { subject } = useLocalSearchParams();
    const chapterData = useSelector(selectChapterWisePerformance);
    const [filteredChapters, setFilteredChapters] = useState<ChapterPerformance[]>([]);

    useEffect(() => {
        if (typeof subject === 'string') {
            const filtered = chapterData.filter(
                (chapter) => chapter.subject === subject
            );
            setFilteredChapters(filtered);
        }
    }, [subject, chapterData]);

    const renderProgressBar = (correct: number, incorrect: number, unattempted: number) => {
        const total = correct + incorrect + unattempted || 1;
        const correctWidth = (correct / total) * 100;
        const incorrectWidth = (incorrect / total) * 100;
        const unattemptedWidth = (unattempted / total) * 100;

        return (
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressSegment, { backgroundColor: '#10B981', width: `${correctWidth}%` }]} />
                <View style={[styles.progressSegment, { backgroundColor: '#EF4444', width: `${incorrectWidth}%` }]} />
                <View style={[styles.progressSegment, { backgroundColor: '#9CA3AF', width: `${unattemptedWidth}%` }]} />
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            {/* Header */}
             <AppHeader screenTitle="Chapter-Wise Analytics" onBackPress={() => router.back()} />
            {/* Content */}
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {filteredChapters.map((chapter, index) => (
                    <View key={index} style={styles.chapterCard}>
                        <Text style={styles.chapterTitle}>{chapter.chapter}</Text>
                        <Text style={styles.accuracyText}>{chapter.percentage.toFixed(1)}% Percentage</Text>

                        {renderProgressBar(chapter.correctAnswers, chapter.incorrectAnswers, chapter.unattempted)}

                        <View style={styles.legendContainer}>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                                <Text style={styles.legendText}>Correct: {chapter.correctAnswers}</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
                                <Text style={styles.legendText}>Incorrect: {chapter.incorrectAnswers}</Text>
                            </View>
                            <View style={styles.legendItem}>
                                <View style={[styles.legendDot, { backgroundColor: '#9CA3AF' }]} />
                                <Text style={styles.legendText}>Unattempted: {chapter.unattempted}</Text>
                            </View>
                        </View>

                        <TouchableOpacity style={styles.topicButton} onPress={() =>
                            router.push(
                                `/components/QuizAnalytics/QuizTopicAnalytics?chapter=${encodeURIComponent(
                                    chapter.chapter
                                )}&subject=${subject}`
                            )}
                        >
                            <Text style={styles.topicButtonText}>View Topicwise Analytics</Text>
                            <Ionicons name="chevron-forward" size={16} color="#4F46E5" />
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    subjectText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1E293B',
        marginBottom: 16,
        marginLeft: 4,
    },
    chapterCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    chapterTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 4,
    },
    accuracyText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#10B981',
        marginBottom: 12,
    },
    progressBarContainer: {
        height: 10,
        flexDirection: 'row',
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
        marginBottom: 12,
    },
    progressSegment: {
        height: '100%',
    },
    legendRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        flexWrap: 'wrap',
        rowGap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        fontSize: 13,
        color: '#64748B',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    statBox: {
        backgroundColor: '#F3F4F6',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        fontSize: 13,
        color: '#374151',
    },
    topicButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#EEF2FF',
        borderRadius: 8,
        marginTop: 6,
    },
    topicButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4F46E5',
        marginRight: 6,
    },
});

export default QuizChapterAnalytics;
