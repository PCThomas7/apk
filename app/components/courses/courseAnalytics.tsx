import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialIcons, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../../redux/store';
import courseServiceGet from '@/services/courseServiceGet';
import ResponsiveGridSkeleton from '../skeltons/Skelton';
import AppHeader from '../header';

interface Course {
    id: string;
    title: string;
    thumbnail?: string;
    isEnrolled: boolean;
    completedLessons?: number;
    totalLessons?: number;
    instructor?: string;
    price?: number;
}

interface AnalyticsData {
    completedLessons?: number;
    totalLessons?: number;
    startedAt?: string;
    lastAccessedAt?: string;
    timeSpentMinutes?: number;
    lessonTypeStats?: {
        video?: { completed: number; total: number };
        quiz?: { completed: number; total: number };
        pdf?: { completed: number; total: number };
    };
}

const CourseAnalytics = () => {
    const router = useRouter();
    const { courseId } = useLocalSearchParams<{ courseId: string }>();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { all: courses } = useSelector((state: RootState) => state.courses);
    const course = courses?.find((c: Course) => c.id === courseId);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                setIsLoading(true);
                if (courseId) {
                    const data = await courseServiceGet.getCourseDetailedAnalytics(courseId);
                    setAnalytics(data);
                }
            } catch (err) {
                console.error('Analytics fetch error:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAnalytics();
    }, [courseId]);


    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'Not started';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const completionPercentage = analytics?.totalLessons && analytics.totalLessons > 0
        ? Math.round(((analytics.completedLessons ?? 0) / analytics.totalLessons) * 100)
        : 0;

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <AppHeader screenTitle='Course Analytics' onBackPress={() => router.back()} />
                <ResponsiveGridSkeleton />
            </SafeAreaView>
        );
    }

    if (!course) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <AppHeader screenTitle='Course Analytics' onBackPress={() => router.back()} />
                <View style={styles.errorContainer}>
                    <MaterialIcons name="error-outline" size={48} color="#EF4444" />
                    <Text style={styles.errorText}>Course not found</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            {/* Header */}
          <AppHeader screenTitle='Course Analytics' onBackPress={() => router.back()} />

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.container}>
                    {/* Main Analytics Card */}
                    <View style={styles.analyticsCard}>
                        <Text style={styles.title}>{course.title}</Text>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressHeader}>
                                <MaterialIcons name="trending-up" size={20} color="#4F46E5" />
                                <Text style={styles.progressHeading}>Overall Progress</Text>
                            </View>

                            <View style={styles.progressBarBackground}>
                                <View
                                    style={[
                                        styles.progressBarFill,
                                        { width: `${completionPercentage}%` },
                                    ]}
                                />
                            </View>

                            <View style={styles.progressStats}>
                                <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
                                <Text style={styles.progressText}>
                                    {analytics?.completedLessons ?? 0} of {analytics?.totalLessons ?? 0} lessons completed
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Lesson Type Progress - Full width rows */}
                    <Text style={styles.sectionTitle}>
                        <MaterialCommunityIcons name="format-list-checks" size={18} color="#4F46E5" />
                        {' '}Lesson Progress
                    </Text>

                    <View style={styles.fullWidthContainer}>
                        {/* Video Card */}
                        <View style={styles.fullWidthCard}>
                            <View style={styles.cardHeader}>
                                <FontAwesome name="video-camera" size={18} color="#38BDF8" />
                                <Text style={styles.cardTitle}>Video Lessons</Text>
                            </View>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBarBackgroundSmall}>
                                    <View
                                        style={[
                                            styles.progressBarFillSmall,
                                            {
                                                width: `${analytics?.lessonTypeStats?.video?.total
                                                    ? Math.round(
                                                        ((analytics.lessonTypeStats.video.completed ?? 0) /
                                                            analytics.lessonTypeStats.video.total) * 100
                                                    )
                                                    : 0
                                                    }%`,
                                                backgroundColor: '#38BDF8',
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.cardSubText}>
                                    {analytics?.lessonTypeStats?.video?.completed ?? 0} of {analytics?.lessonTypeStats?.video?.total ?? 0} completed
                                </Text>
                            </View>
                        </View>

                        {/* Quiz Card */}
                        <View style={styles.fullWidthCard}>
                            <View style={styles.cardHeader}>
                                <MaterialIcons name="quiz" size={18} color="#FACC15" />
                                <Text style={styles.cardTitle}>Quiz Assessments</Text>
                            </View>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBarBackgroundSmall}>
                                    <View
                                        style={[
                                            styles.progressBarFillSmall,
                                            {
                                                width: `${analytics?.lessonTypeStats?.quiz?.total
                                                    ? Math.round(
                                                        ((analytics.lessonTypeStats.quiz.completed ?? 0) /
                                                            analytics.lessonTypeStats.quiz.total) * 100
                                                    )
                                                    : 0
                                                    }%`,
                                                backgroundColor: '#FACC15',
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.cardSubText}>
                                    {analytics?.lessonTypeStats?.quiz?.completed ?? 0} of {analytics?.lessonTypeStats?.quiz?.total ?? 0} completed
                                </Text>
                            </View>
                        </View>

                        {/* PDF Card */}
                        <View style={styles.fullWidthCard}>
                            <View style={styles.cardHeader}>
                                <MaterialCommunityIcons name="file-pdf-box" size={18} color="#A3A3A3" />
                                <Text style={styles.cardTitle}>PDF Materials</Text>
                            </View>
                            <View style={styles.progressContainer}>
                                <View style={styles.progressBarBackgroundSmall}>
                                    <View
                                        style={[
                                            styles.progressBarFillSmall,
                                            {
                                                width: `${analytics?.lessonTypeStats?.pdf?.total
                                                    ? Math.round(
                                                        ((analytics.lessonTypeStats.pdf.completed ?? 0) /
                                                            analytics.lessonTypeStats.pdf.total) * 100
                                                    )
                                                    : 0
                                                    }%`,
                                                backgroundColor: '#A3A3A3',
                                            },
                                        ]}
                                    />
                                </View>
                                <Text style={styles.cardSubText}>
                                    {analytics?.lessonTypeStats?.pdf?.completed ?? 0} of {analytics?.lessonTypeStats?.pdf?.total ?? 0} completed
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Course Activity - Full width rows */}
                    <Text style={styles.sectionTitle}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="time-outline" size={18} color="#0EA5E9" style={{ marginRight: 6 }} />
                            <Text style={{ fontSize: 16, fontWeight: '600', color: '#1E293B' }}>Course Activity</Text>
                        </View>
                    </Text>

                    <View style={styles.fullWidthContainer}>
                        {/* Started On Card */}
                        <View style={styles.fullWidthCard}>
                            <View style={[styles.cardHeader, { alignItems: 'center' }]}>
                                <MaterialIcons name="play-circle-outline" size={18} color="#4F46E5" style={{ marginRight: 10 }} />
                                <Text style={styles.cardTitle}>Started On</Text>
                            </View>
                            <Text style={styles.cardValue}>{formatDate(analytics?.startedAt)}</Text>
                        </View>

                        {/* Last Accessed Card */}
                        <View style={styles.fullWidthCard}>
                            <View style={[styles.cardHeader, { alignItems: 'center' }]}>
                                <MaterialIcons name="access-time" size={18} color="#4F46E5" style={{ marginRight: 10 }} />
                                <Text style={styles.cardTitle}>Last Accessed</Text>
                            </View>
                            <Text style={styles.cardValue}>{formatDate(analytics?.lastAccessedAt)}</Text>
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
        backgroundColor: '#fff'
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    container: {
        flex: 1,
        padding: 16
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 18,
        color: '#EF4444',
        marginTop: 16,
    },
    analyticsCard: {
        width: '100%',
        backgroundColor: '#EEF2FF',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 16,
        textAlign: 'center'
    },
    progressContainer: {
        width: '100%',
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressHeading: {
        fontSize: 16,
        fontWeight: '500',
        color: '#4F46E5',
        marginLeft: 8,
    },
    progressBarBackground: {
        width: '100%',
        height: 12,
        backgroundColor: '#E5E7EB',
        borderRadius: 6,
        overflow: 'hidden',
        marginBottom: 8,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#4F46E5',
        borderRadius: 6,
    },
    progressStats: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    progressPercentage: {
        fontSize: 16,
        fontWeight: '700',
        color: '#4F46E5',
    },
    progressText: {
        fontSize: 14,
        color: '#64748B',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 16,
        marginTop: 8,
    },
    fullWidthContainer: {
        width: '100%',
        marginBottom: 24,
    },
    fullWidthCard: {
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#334155',
        marginLeft: 5,
    },
    cardSubText: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 8,
    },
    cardValue: {
        fontSize: 15,
        color: '#1E293B',
        fontWeight: '500',
        marginTop: 4,
    },
    progressBarBackgroundSmall: {
        width: '100%',
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressBarFillSmall: {
        height: '100%',
        borderRadius: 3,
    },
});

export default CourseAnalytics;