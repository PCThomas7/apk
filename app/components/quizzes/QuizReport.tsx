import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import courseServiceGet from '@/services/courseServiceGet';

type ReportData = {
    highScore: number;
    score: number;
    correctAnswers: number;
    incorrectAnswers: number;
    unattemptedAnswers: number;
    timeSpent: number;
    attemptNumber?: number;
    answers: Object
};

const QuizReport: React.FC = () => {
    const quiz = useSelector((state: RootState) => state.quiz.currentQuiz)!;
    const [report, setReport] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);

    const totalQuestions = quiz.sections.reduce(
        (acc, s) => acc + (s.questions?.length || 0),
        0
    );
    const totalMarks = quiz.sections.reduce(
        (acc, s) => acc + (s.questions?.length || 0) * (s.marksPerQuestion || 1),
        0
    );

    const formattedDate = quiz.createdAt
        ? new Date(quiz.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        })
        : '';

    const fetchReport = async () => {
        try {
            const highScoreResponse = await courseServiceGet.getQuizHighestScore(quiz.id);
            const attemptsResponse = await courseServiceGet.getUserQuizAttempts(quiz.id);

            const latestAttempt = attemptsResponse.attempts[0];

            setReport({
                highScore: highScoreResponse.highestScore.score,
                score: latestAttempt.score,
                correctAnswers: latestAttempt.correctAnswers,
                incorrectAnswers: latestAttempt.incorrectAnswers,
                unattemptedAnswers: latestAttempt.unattemptedAnswers,
                timeSpent: latestAttempt.timeSpent,
                attemptNumber: latestAttempt.attemptNumber,
                answers: latestAttempt.answers
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReport();
    }, []);

    const handleBack = () => {
        router.replace('/components/quizzes/QuizAttemptScreen');
    };

    const handleAnalytics = () => {
        router.push(`/components/QuizAnalytics/QuizAnalyticsScreen?quizId=${quiz.id}`);
    };

    const handleSolutions = () => {
        if (report) {
            router.push(
                `/components/quizzes/QuizSolutions?answers=${encodeURIComponent(JSON.stringify(report.answers))}`
            );
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ActivityIndicator size="large" style={{ flex: 1 }} />
            </SafeAreaView>
        );
    }

    const accuracy = report
        ? ((report.score / totalMarks) * 100).toFixed(1)
        : '0.0';

    const performanceColor = (report?.score ?? 0) >= (quiz.passingScore || 0)
        ? '#4CAF50'
        : '#F44336';

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#4F46E5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quiz Report</Text>
            </View>

            <View style={styles.contentContainer}>
                {/* Quiz Title and Date */}
                <View style={styles.quizInfoContainer}>
                    <Text style={styles.quizTitle}>{quiz.title}</Text>
                    {formattedDate !== '' && (
                        <Text style={styles.quizDate}>{formattedDate}</Text>
                    )}
                </View>

                {/* Basic Info Grid */}
                <View style={[styles.basicInfoContainer, styles.dashedBorderBottom]}>
                    <View style={styles.gridContainer}>
                        <View style={styles.gridColumn}>
                            {renderGridItem('list-outline', 'Total Questions', totalQuestions.toString())}
                            {renderGridItem('time-outline', 'Time Limit', `${quiz.timeLimit} min`)}
                        </View>
                        <View style={styles.gridColumn}>
                            {renderGridItem('book-outline', 'Total Marks', totalMarks.toString())}
                            {renderGridItem('trophy-outline', 'Highest Score', (report?.highScore ?? 0).toString())}
                        </View>
                    </View>
                </View>

                {/* Performance Metrics */}
                <View style={styles.metricsContainer}>
                    <Text style={styles.centeredSectionTitle}>Performance Overview</Text>
                    <View style={styles.gridContainer}>
                        <View style={styles.gridColumn}>
                            {renderGridItem('star', 'Your Score', `${report?.score || 0}/${totalMarks}`, performanceColor, true)}
                            {renderGridItem('checkmark-circle', 'Correct', (report?.correctAnswers || 0).toString(), '#4CAF50', true)}
                            {renderGridItem('timer', 'Time Spent', formatTime(report?.timeSpent || 0), '#3B82F6', true)}
                        </View>
                        <View style={styles.gridColumn}>
                            {renderGridItem('repeat-outline', 'UnAttempted', `${report?.unattemptedAnswers ?? 0}`, '#10B981', true)}
                            {renderGridItem('close-circle', 'Incorrect', (report?.incorrectAnswers || 0).toString(), '#F44336', true)}
                            {renderGridItem('speedometer', 'Accuracy', `${accuracy}%`, '#10B981', true)}
                        </View>
                    </View>
                </View>

                {/* Retake Quiz Button */}
                {(report?.attemptNumber || 0) >= 1 && (
                    <TouchableOpacity
                        style={styles.retakeButton}
                        onPress={handleBack}
                    >
                        <Text style={styles.retakeButtonText}>Retake Quiz</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Bottom Buttons - now fixed at bottom */}
            <View style={styles.bottomButtonContainer}>
                <TouchableOpacity style={styles.bottomButton} onPress={handleAnalytics}>
                    <Text style={styles.bottomButtonText}>Analytics</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bottomButton} onPress={handleSolutions}>
                    <Text style={styles.bottomButtonText}>Solutions</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

// Helper Components
const renderGridItem = (iconName: string, label: string, value: string, color?: string, isSecondGrid?: boolean) => (
    <View style={styles.gridItem}>
        <View style={styles.gridItemContent}>
            <Ionicons
                name={iconName as any}
                size={20}
                color={'#4F46E5'} // Always use #4F46E5 for icon in second grid
                style={styles.gridIcon}
            />
            <View style={styles.gridText}>
                <Text style={[
                    styles.gridLabel,
                    isSecondGrid && { color: '#6b7280' } // gray label for second grid
                ]}>
                    {label}
                </Text>
                <Text style={[
                    styles.gridValue,
                    isSecondGrid
                        ? { color: '#1f2937' } // black value for second grid
                        : (color ? { color } : {})
                ]}>
                    {value}
                </Text>
            </View>
        </View>
    </View>
);

const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
};

// Styles
const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center', // Center icon horizontally
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937'
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: 16,
    },
    quizInfoContainer: {
        alignItems: 'center',
        marginBottom: 16,
        paddingTop: 8,
    },
    quizTitle: {
        fontSize: 20,
        fontWeight: '500',
        color: '#2D3A4B',
        textAlign: 'center',
    },
    quizDate: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    basicInfoContainer: {
        marginBottom: 16,
    },
    dashedBorderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: '#8c95a6',
        paddingBottom: 16,
        borderStyle: 'dashed',
    },
    metricsContainer: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3A4B',
        marginBottom: 12,
    },
    centeredSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2D3A4B',
        marginBottom: 12,
        textAlign: 'center',
    },
    gridContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    gridColumn: {
        width: '48%',
    },
    gridItem: {
        marginBottom: 12,
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 12,
    },
    gridItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    gridIcon: {
        marginRight: 12,
    },
    gridText: {
        flex: 1,
    },
    gridLabel: {
        fontSize: 13,
        color: '#6b7280',
        fontWeight: '500',
    },
    gridValue: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 4,
    },
    retakeButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 24,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        marginBottom: 16,
    },
    retakeButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    bottomButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#fff',
    },
    bottomButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#7c3aed', // violet border
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    bottomButtonText: {
        color: '#7c3aed',       // violet text
        fontSize: 16,
        fontWeight: '600',
    }

});

export default QuizReport;