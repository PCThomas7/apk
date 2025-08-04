import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ResponsiveGridSkeleton from '../skeltons/Skelton';
import courseServiceGet from '@/services/courseServiceGet';
import AppHeader from '../header';

const CourseLesson = () => {
    const router = useRouter();
    const { chapterId, courseId, sectionId } = useLocalSearchParams<{ chapterId: string, courseId: string, sectionId: string }>();
    const [lessons, setLessons] = useState<any[]>([]);
    const [progressData, setProgressData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLessons = async () => {
            setLoading(true);
            try {
                if (chapterId) {
                    const lessonRes = await courseServiceGet.getChapterLessons(chapterId);
                    const progressRes = await courseServiceGet.getChapterLessonsProgress(chapterId);
                    setLessons(lessonRes.lessons || []);
                    setProgressData(progressRes || []);
                }
            } catch (err) {
                setLessons([]);
                setProgressData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchLessons();
    }, [chapterId]);

    // Helper to get progress for a lesson
    const getProgressForLesson = (lessonId: string) => {
        return progressData.find((p: any) => p.lessonId === lessonId);
    };

    // Helper to get percentage
    const getPercentage = (progress: any) => {
        let percentage = 0;
        if (!progress) return 0;
        switch (progress.status) {
            case 'completed':
                percentage = 100;
                break;
            case 'in_progress':
                if (progress.watchTimeSeconds && progress.totalTimeSeconds && progress.totalTimeSeconds > 0) {
                    percentage = Math.min(100, Math.round((progress.watchTimeSeconds / progress.totalTimeSeconds) * 100));
                } else if (progress.quizScore !== undefined) {
                    percentage = progress.quizScore;
                } else {
                    percentage = 50;
                }
                break;
            default:
                percentage = 0;
        }
        return percentage;
    };

    // Helper: Lesson icon
    const getLessonIcon = (type: string, isLocked: boolean) => {
        if (isLocked)
            return <Feather name="lock" size={22} color="#9CA3AF" style={{ marginRight: 8 }} />;
        switch (type) {
            case 'video':
                return <Feather name="play-circle" size={22} color="#2563EB" style={{ marginRight: 8 }} />;
            case 'quiz':
                return <Feather name="file-text" size={22} color="#22C55E" style={{ marginRight: 8 }} />;
            case 'pdf':
                return <Feather name="file" size={22} color="#F59E42" style={{ marginRight: 8 }} />;
            default:
                return <Feather name="file" size={22} color="#F59E42" style={{ marginRight: 8 }} />;
        }
    };

    // Helper: Type badge
    const getLessonTypeLabel = (type: string) => {
        let bg = '#DBEAFE', color = '#2563EB', label = 'Video';
        if (type === 'quiz') { bg = '#DCFCE7'; color = '#22C55E'; label = 'Quiz'; }
        else if (type === 'pdf') { bg = '#FFEDD5'; color = '#F59E42'; label = 'PDF'; }
        else { label = type; }
        return (
            <View style={{ backgroundColor: bg, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, alignSelf: 'flex-start', marginRight: 8 }}>
                <Text style={{ color, fontWeight: '600', fontSize: 12 }}>{label}</Text>
            </View>
        );
    };

    // Helper: Progress badge
    const getProgressBadge = (progress: any) => {
        if (!progress)
            return (
                <View style={[styles.badge, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}>
                    <Text style={[styles.badgeText, { color: '#6B7280' }]}>Not Started</Text>
                </View>
            );
        switch (progress.status) {
            case 'completed':
                return (
                    <View style={[styles.badge, { backgroundColor: '#22C55E' }]}>
                        <Text style={[styles.badgeText, { color: '#fff' }]}>Completed</Text>
                    </View>
                );
            case 'in_progress':
                return (
                    <View style={[styles.badge, { backgroundColor: '#FACC15' }]}>
                        <Text style={[styles.badgeText, { color: '#fff' }]}>In Progress</Text>
                    </View>
                );
            default:
                return (
                    <View style={[styles.badge, { backgroundColor: '#F3F4F6', borderColor: '#E5E7EB' }]}>
                        <Text style={[styles.badgeText, { color: '#6B7280' }]}>Not Started</Text>
                    </View>
                );
        }
    };

    const toggleLessonBookmark = async (lessonId: string) => {
        try {
            const response = await courseServiceGet.toggleLessonBookmark(lessonId);
            setProgressData(prev =>
                prev.map((p: any) =>
                    p.lessonId === lessonId
                        ? { ...p, bookmarked: response.bookmarked }
                        : p
                )
            );
        } catch (error) {
            console.error('Bookmark error:', error);
        }
    };

    const isScheduledInFuture = (scheduledFor?: string) => {
        if (!scheduledFor) return false;
        const now = new Date();
        const scheduledDate = new Date(scheduledFor);
        return scheduledDate > now;
    };

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <AppHeader screenTitle='Course Lessons' onBackPress={() => router.back()} />
            <View style={styles.container}>
                {loading ? (
                    <ResponsiveGridSkeleton />
                ) : lessons.length === 0 ? (
                    <Text style={styles.text}>No lessons found.</Text>
                ) : (
                    <FlatList
                        data={lessons}
                        keyExtractor={item => item._id || item.id}
                        showsVerticalScrollIndicator={false}
                        renderItem={({ item }) => {
                            const progress = getProgressForLesson(item._id || item.id);
                            const percentage = getPercentage(progress);
                            const scheduled = isScheduledInFuture(item.scheduledFor);

                            // Helper: Completed icon or lesson icon
                            const renderLessonIcon = () => {
                                if (progress?.status === 'completed') {
                                    return (
                                        <MaterialCommunityIcons
                                            name="check-circle"
                                            size={22}
                                            color="#22C55E"
                                            style={{ marginRight: 12, marginTop: 2 }}
                                        />
                                    );
                                }
                                return getLessonIcon(item.type, !!item.isLocked);
                            };

                            // --- NEW: onPress handler for video lessons ---
                            const handleLessonPress = () => {
                                if (scheduled) return; // Prevent navigation if scheduled in future
                                if (item.type === 'video') {
                                    router.push(
                                        `/components/courses/courseRoom?video=${encodeURIComponent(item.content)}&status=${progress?.status ?? ''}&vediotitle=${encodeURIComponent(item.title)}&bookmarked=${progress?.bookmarked ?? false}&viewCount=${progress?.viewCount ?? 0}&watchTimeSeconds=${progress?.watchTimeSeconds ?? 0}&totalTimeSeconds=${progress?.totalTimeSeconds ?? 0}&lessonId=${item._id}&courseId=${courseId}&sectionId=${sectionId}&chapterId=${chapterId}`
                                    );
                                }
                                else if (item.type === 'quiz') {
                                    router.push(`/components/quizzes/QuizLessonScreen?lessonId=${item._id}&contentId=${item.content}&chapterId=${chapterId}&courseId=${courseId}&sectionId=${sectionId}`);
                                }
                            };
                            return (
                                <TouchableOpacity
                                    activeOpacity={scheduled ? 1 : 0.8}
                                    onPress={handleLessonPress}
                                    disabled={scheduled || (item.type !== 'video' && item.type !== 'quiz')}
                                    style={{ opacity: scheduled ? 0.6 : (item.type === 'video' ? 1 : 0.7) }}
                                >
                                    <View style={styles.lessonCard}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                            <View style={{ marginRight: 12, marginTop: 2 }}>
                                                {renderLessonIcon()}
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.lessonTitle}>{item.title}</Text>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                                    {getLessonTypeLabel(item.type)}
                                                    <Text style={styles.lessonMeta}>  {item.duration} min</Text>
                                                    {/* Show bookmark only if quiz */}
                                                    {item.type === 'quiz' && (
                                                        <TouchableOpacity
                                                            onPress={() => toggleLessonBookmark(item._id || item.id)}
                                                            style={{ marginLeft: 15 }}
                                                        >
                                                            <Ionicons
                                                                name={progress?.bookmarked ? "bookmark" : "bookmark-outline"}
                                                                size={20}
                                                                color="#4F46E5"
                                                            />
                                                        </TouchableOpacity>
                                                    )}
                                                </View>
                                                {/* Scheduled badge */}
                                                {scheduled && (
                                                    <View style={styles.scheduledBadge}>
                                                        <Ionicons name="time-outline" size={14} color="#F59E42" style={{ marginRight: 4 }} />
                                                        <Text style={styles.scheduledText}>
                                                            Scheduled: {new Date(item.scheduledFor).toLocaleString()}
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                            {getProgressBadge(progress)}
                                        </View>
                                        {/* Progress bar for videos only */}
                                        {item.type === 'video' && (
                                            <View style={styles.progressRow}>
                                                <View style={styles.progressBarBackground}>
                                                    <View
                                                        style={[
                                                            styles.progressBarFill,
                                                            {
                                                                width: `${percentage}%`,
                                                                backgroundColor: percentage === 100 ? '#22C55E' : '#6366F1',
                                                            },
                                                        ]}
                                                    />
                                                </View>
                                                <Text style={styles.percentText}>{percentage}%</Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#fff' },
    container: {
        flex: 1,
        padding: 16,
    },
    text: {
        fontSize: 18,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 40,
    },
    lessonCard: {
        backgroundColor: '#EEF2FF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24, // increased gap between lessons
        elevation: 2,
    },
    lessonInfo: {
        marginBottom: 8,
    },
    lessonTitle: {
        fontSize: 16,
        color: '#3730A3',
        fontWeight: '600',
        marginBottom: 2,
    },
    lessonMeta: {
        fontSize: 13,
        color: '#64748B',
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    statusText: {
        fontSize: 13,
        color: '#6366F1',
        marginRight: 8,
        minWidth: 80,
        textTransform: 'capitalize',
    },
    progressBarBackground: {
        flex: 1,
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: 8,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    percentText: {
        fontSize: 13,
        color: '#222',
        minWidth: 32,
        textAlign: 'right',
    },
    badge: {
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderWidth: 1,
        borderColor: 'transparent',
        marginLeft: 8,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    scheduledBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF7ED',
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginTop: 6,
        alignSelf: 'flex-start',
    },
    scheduledText: {
        color: '#F59E42',
        fontSize: 12,
        fontWeight: '600',
    },
});

export default CourseLesson;