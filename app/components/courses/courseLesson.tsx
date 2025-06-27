import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import ResponsiveGridSkeleton from '../skeltons/Skelton';
import courseServiceGet from '@/services/courseServiceGet';

const CourseLesson = () => {
    const router = useRouter();
    const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
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

    const handleBack = () => router.back();

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

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#4F46E5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Course Lessons</Text>
            </View>
            <View style={styles.container}>
                {loading ? (
                    <ResponsiveGridSkeleton />
                ) : lessons.length === 0 ? (
                    <Text style={styles.text}>No lessons found.</Text>
                ) : (
                    <FlatList
                        data={lessons}
                        keyExtractor={item => item._id || item.id}
                        renderItem={({ item }) => {
                            const progress = getProgressForLesson(item._id || item.id);
                            const percentage = getPercentage(progress);

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
                                if (item.type === 'video') {
                                    router.push(
                                        `/components/courses/vedioPlayer?video=${encodeURIComponent(item.content)}&status=${progress?.status ?? ''}&is_bookmarked=${progress?.bookmarked ?? false}`
                                    );
                                }
                                // You can add handling for other types if needed
                            };

                            return (
                                <TouchableOpacity
                                    activeOpacity={0.8}
                                    onPress={handleLessonPress}
                                    disabled={item.type !== 'video'}
                                    style={{ opacity: item.type === 'video' ? 1 : 0.7 }}
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
                                                    <Text style={styles.lessonMeta}>{item.duration} min</Text>
                                                </View>
                                            </View>
                                            {getProgressBadge(progress)}
                                        </View>
                                        <View style={styles.progressRow}>
                                            <View style={styles.progressBarBackground}>
                                                <View
                                                    style={[
                                                        styles.progressBarFill,
                                                        { width: `${percentage}%`, backgroundColor: percentage === 100 ? '#22C55E' : '#6366F1' },
                                                    ]}
                                                />
                                            </View>
                                            <Text style={styles.percentText}>{percentage}%</Text>
                                        </View>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f3f4f6',
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        flex: 1,
    },
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
});

export default CourseLesson;