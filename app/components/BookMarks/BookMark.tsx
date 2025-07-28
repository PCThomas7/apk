import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    Animated,
    Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import courseServiceGet from '@/services/courseServiceGet';
import KatexRendered from '../../components/quizzes/KatexRenderer';
import { router } from 'expo-router';
import AppHeader from '../../components/header';

const MAX_QUESTION_PREVIEW_LENGTH = 56;

type TabType = 'lessons' | 'questions';

type LessonBookmarkItem = {
    course: { title: string, _id: string };
    chapter: { title: string, _id: string };
    section: { title: string, _id: string };
    lesson: {
        _id: string;
        title: string;
        type: string;
        duration: string;
        content: string;
        lessonType: string
    };
    progress: { status: 'completed' | 'in-progress', watchTimeSeconds: string };
};


type QuestionBookmarkItem = {
    bookmarkId: string;
    bookmarkedAt: string;
    question: {
        id: string;
        _id: string; // In case some APIs use MongoDB _id
        question_text: string;
        correct_answer: 'A' | 'B' | 'C' | 'D';
        explanation?: string;
        image_url?: string;
        option_a?: string;
        option_b?: string;
        option_c?: string;
        option_d?: string;
        option_e?: string;
        [key: string]: any;
        tags?: {
            subject?: string;
            chapter?: string;
            exam_type?: string;
            question_type?: string;
            topic?: string;
        };
    };
};

const BookMark = () => {
    const navigation = useNavigation();
    const [activeTab, setActiveTab] = useState('lessons');
    const [lessonBookmarks, setLessonBookmarks] = useState<LessonBookmarkItem[]>([]);
    const [questionBookmarks, setQuestionBookmarks] = useState<QuestionBookmarkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null); const [animation] = useState(new Animated.Value(0));
    const [currentPage] = useState(1);
    const [itemsPerPage] = useState(10);


    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            if (activeTab === 'lessons') {
                const response = await courseServiceGet.getBookmarkedLessons();
                setLessonBookmarks(response || []);
            } else {
                const response = await courseServiceGet.getBookmarkedQuestions(currentPage, itemsPerPage);
                setQuestionBookmarks(response?.bookmarks || []);
            }
        } catch (err) {
            console.error('Error fetching bookmarks:', err);
        } finally {
            setLoading(false);
        }
    }, [activeTab, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleTabPress = useCallback((tab: 'lessons' | 'questions') => {
        Animated.timing(animation, {
            toValue: tab === 'lessons' ? 0 : 1,
            duration: 300,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
        }).start();
        setActiveTab(tab);
    }, [animation]);


    const handleRemoveBookmark = useCallback(async (type: 'lessons' | 'questions', id: string) => {
        try {
            if (type === 'lessons') {
                await courseServiceGet.toggleLessonBookmark(id);
                setLessonBookmarks(prev => prev.filter(item => item.lesson._id !== id));
            } else {
                await courseServiceGet.removeBookmark(id);
                setQuestionBookmarks(prev => prev.filter(item => item.bookmarkId !== id));
            }
            fetchData();
        } catch (err) {
            console.error('Error removing bookmark:', err);
        }
    }, [fetchData]);


    const toggleQuestionExpansion = useCallback((questionId: string) => {
        setExpandedQuestionId(prev => prev === questionId ? null : questionId);
    }, []);


    const translateX = animation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 180],
    });

    const truncateQuestionText = (text: string) => {
        if (!text) return '';
        return text.length > MAX_QUESTION_PREVIEW_LENGTH
            ? `${text.substring(0, MAX_QUESTION_PREVIEW_LENGTH)}...`
            : text;
    };

    const handleLessonPress = (item: LessonBookmarkItem) => {
        if (item.lesson.type === 'video') {
            handleLessonVideo(
                'lesson',
                item.lesson._id,
                item.section._id,
                item.chapter._id,
                item.course._id,
                item.progress.status,
                item.lesson.content,
                item.lesson.title,
                item.lesson.duration,
                item.lesson.type,
                item.progress.watchTimeSeconds
            );
        } else {
            handleLessonQuiz(
                item.lesson._id,
                item.course._id,
                item.section._id,
                item.chapter._id,
                item.lesson.content
            );
        }
    };


    const handleLessonVideo = (type: string, lessonId: string, sectionId: string, chapterId: string, courseId: string, status: string, contenId: string, title: string, duration: string, lessonType: string, watchTimeSeconds: string) => {
        router.push(`/components/courses/courseRoom?video=${encodeURIComponent(contenId)}&status=${status}&vediotitle=${encodeURIComponent(title)}&bookmarked=${true}&viewCount=${0}&watchTimeSeconds=${watchTimeSeconds ?? 0}&totalTimeSeconds=${duration ?? 0}&lessonId=${lessonId}&courseId${courseId}&sectionId=${sectionId}&chapterId=${chapterId}`
        );
    }

    const handleLessonQuiz = (lessonId: string, courseId: string, sectionId: string, chapterId: string, contenId: string) => {
        router.push(`/components/quizzes/QuizLessonScreen?lessonId=${lessonId}&contentId=${contenId}&chapterId=${chapterId}&courseId=${courseId}&sectionId=${sectionId}`);
    }

    const renderLessonCards = useCallback(() => (
        <View style={styles.cardsContainer}>
            {lessonBookmarks.map((item: LessonBookmarkItem) => (
                <TouchableOpacity key={item.lesson._id} onPress={() => handleLessonPress(item)}>
                    <View style={styles.lessonCard}>
                        <View style={styles.lessonHeader}>
                            <View>
                                <Text style={styles.courseTitle}>
                                    {item.course.title.length > 30
                                        ? `${item.course.title.slice(0, 30)}...`
                                        : item.course.title}
                                </Text>
                                <Text style={styles.lessonType}>{item.lesson.type.toUpperCase()}</Text>
                            </View>
                            <TouchableOpacity
                                onPress={() => handleRemoveBookmark('lessons', item.lesson._id)}
                                style={styles.removeButton}
                            >
                                <Ionicons name="bookmark" size={18} color="#4F46E5" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.lessonTitle}>{item.lesson.title}</Text>

                        <View style={styles.lessonMeta}>
                            <Text style={styles.metaText}>📘 {item.chapter.title}</Text>
                            <Text style={styles.metaText}>📚 {item.section.title}</Text>
                        </View>

                        <View style={styles.lessonFooter}>
                            <Text style={styles.duration}>⏱ {item.lesson.duration} mins</Text>
                            <View style={[
                                styles.statusBadge,
                                item.progress.status === 'completed' ? styles.completedBadge : styles.inProgressBadge
                            ]}>
                                <Text style={styles.statusText}>
                                    {item.progress.status === 'completed' ? 'Completed' : 'In Progress'}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    ), [lessonBookmarks, handleRemoveBookmark]);


    const renderQuestionCards = useCallback(() => (
        <View style={styles.cardsContainer}>
            {questionBookmarks.map((item: QuestionBookmarkItem) => {
                const isExpanded = expandedQuestionId === item.question.id;
                const { subject, chapter, exam_type, question_type } = item.question.tags || {};

                return (
                    <View key={item.bookmarkId} style={styles.questionCard}>
                        <View style={styles.questionHeader}>
                            <View style={styles.questionBadge}>
                                <Text style={styles.questionSubject}>{subject || 'General'}</Text>
                            </View>

                            <View style={styles.questionActions}>
                                <TouchableOpacity
                                    onPress={() => handleRemoveBookmark('questions', item.question._id)}
                                    style={styles.removeButton}
                                >
                                    <Ionicons name="bookmark" size={18} color="#4F46E5" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => toggleQuestionExpansion(item.question.id)}>
                                    <Ionicons
                                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                        size={20}
                                        color="#6b7280"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {!isExpanded && (
                            <Text style={styles.questionPreview}>
                                <KatexRendered
                                    content={truncateQuestionText(item?.question?.question_text || '')}
                                    style={styles.mathView}
                                />
                            </Text>)}

                        <View style={styles.tagsRow}>
                            {chapter && <Text style={styles.tagItem}>📘 {chapter}</Text>}
                            {exam_type && <Text style={styles.tagItem}>📝 {exam_type}</Text>}
                            {question_type && <Text style={styles.tagItem}>❓ {question_type}</Text>}
                        </View>

                        {isExpanded && (
                            <View style={styles.questionContent}>
                                <KatexRendered
                                    content={item.question.question_text}
                                    style={styles.mathView}
                                />

                                <View style={styles.optionsContainer}>
                                    {['A', 'B', 'C', 'D'].map((option) => {
                                        const optionText = item.question[`option_${option.toLowerCase()}`];
                                        if (!optionText) return null;

                                        return (
                                            <View
                                                key={option}
                                                style={[
                                                    styles.option,
                                                    item.question.correct_answer === option && styles.correctOption,
                                                ]}
                                            >
                                                <Text style={styles.optionLabel}>{option}</Text>
                                                <KatexRendered content={optionText} style={styles.optionText} />
                                            </View>
                                        );
                                    })}
                                </View>

                                {item.question.explanation && (
                                    <View style={styles.explanationContainer}>
                                        <Text style={styles.explanationTitle}>Explanation</Text>
                                        <KatexRendered content={item.question.explanation} style={styles.mathView} />
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                );
            })}
        </View>
    ), [questionBookmarks, expandedQuestionId, handleRemoveBookmark, toggleQuestionExpansion]);

    return (
        <SafeAreaView style={styles.container}>
            <AppHeader screenTitle="My BookMarks" onBackPress={() => router.back()} />

            <View style={styles.tabContainer}>
                <View style={styles.tabBackground}>
                    <Animated.View
                        style={[
                            styles.activeTabIndicator,
                            { transform: [{ translateX }] }
                        ]}
                    />
                </View>

                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => handleTabPress('lessons')}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="book"
                        size={20}
                        color={activeTab === 'lessons' ? '#4F46E5' : '#9CA3AF'}
                    />
                    <Text style={[
                        styles.tabText,
                        activeTab === 'lessons' && styles.activeTabText
                    ]}>
                        Lessons
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tab}
                    onPress={() => handleTabPress('questions')}
                    activeOpacity={0.7}
                >
                    <Ionicons
                        name="help-circle"
                        size={20}
                        color={activeTab === 'questions' ? '#4F46E5' : '#9CA3AF'}
                    />
                    <Text style={[
                        styles.tabText,
                        activeTab === 'questions' && styles.activeTabText
                    ]}>
                        Questions
                    </Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loader}>
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 'lessons' ? (
                        lessonBookmarks.length > 0 ? (
                            renderLessonCards()
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="bookmark-outline" size={48} color="#D1D5DB" />
                                <Text style={styles.emptyTitle}>No saved lessons</Text>
                                <Text style={styles.emptySubtitle}>
                                    Bookmark lessons to access them here
                                </Text>
                            </View>
                        )
                    ) : questionBookmarks.length > 0 ? (
                        renderQuestionCards()
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="help-circle-outline" size={48} color="#D1D5DB" />
                            <Text style={styles.emptyTitle}>No saved questions</Text>
                            <Text style={styles.emptySubtitle}>
                                Bookmark questions to access them here
                            </Text>
                        </View>
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    tabContainer: {
        flexDirection: 'row',
        height: 60,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        position: 'relative',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
    },
    tabBackground: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 3,
        backgroundColor: '#E5E7EB',
    },
    activeTabIndicator: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '50%',
        height: 3,
        backgroundColor: '#4F46E5',
    },
    tab: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#9CA3AF',
        marginLeft: 8,
    },
    activeTabText: {
        color: '#4F46E5',
        fontWeight: '600',
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 32,
    },
    cardsContainer: {
        gap: 16,
    },
    lessonCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    lessonHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    courseTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1D4ED8',
    },
    lessonType: {
        fontSize: 12,
        fontWeight: '500',
        color: '#6B7280',
        marginTop: 4,
    },
    lessonTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#111827',
        marginBottom: 12,
        lineHeight: 22,
    },
    lessonMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 12,
    },
    metaText: {
        fontSize: 13,
        color: '#6B7280',
    },
    lessonFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    duration: {
        fontSize: 13,
        color: '#4B5563',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    completedBadge: {
        backgroundColor: '#DCFCE7',
    },
    inProgressBadge: {
        backgroundColor: '#FEF3C7',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    questionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 8,
        elevation: 2,
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    questionBadge: {
        backgroundColor: '#E0E7FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    questionSubject: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4F46E5',
    },
    questionActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    questionPreview: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
        lineHeight: 20,
    },
    mathView: {
        width: '100%',
        marginBottom: 12,
    },
    tagsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 8,
    },
    tagItem: {
        fontSize: 12,
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    questionContent: {
        marginTop: 12,
    },
    optionsContainer: {
        gap: 8,
        marginBottom: 16,
    },
    option: {
        flexDirection: 'row',
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#F3F4F6',
    },
    correctOption: {
        backgroundColor: '#DCFCE7',
        borderLeftWidth: 3,
        borderLeftColor: '#16A34A',
    },
    optionLabel: {
        fontWeight: 'bold',
        marginRight: 8,
        color: '#111827',
    },
    optionText: {
        flex: 1,
    },
    explanationContainer: {
        backgroundColor: '#F0F9FF',
        borderRadius: 8,
        padding: 12,
        borderLeftWidth: 3,
        borderLeftColor: '#0284C7',
    },
    explanationTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0369A1',
        marginBottom: 8,
    },
    removeButton: {
        padding: 4,
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#374151',
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 300,
    },
});

export default BookMark;