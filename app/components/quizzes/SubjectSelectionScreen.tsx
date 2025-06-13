import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import courseServiceGet from '@/services/courseServiceGet';
import ResponsiveSkeleton from '../skeltons/Skelton';
import { setSubjects, selectSubjectCache, selectIsSubjectCacheValid } from '@/redux/slices/subjectSlice';
import { Ionicons } from '@expo/vector-icons';


const CACHE_EXPIRY = 3 * 60 * 1000; // 3 minutes

interface Subject {
    subject: string;
    courseName: string;
    courseId: string;
}

interface ExamTypeGroup {
    examType: string;
    subjects: Subject[];
}

const SubjectSelectionScreen = () => {
    const { quizType } = useLocalSearchParams<{ quizType: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const currentRoute = 'subject-selection';
    const cache = useAppSelector((state) =>
        selectSubjectCache(state, quizType || '', currentRoute)
    );
    const isCacheValid = useAppSelector((state) =>
        selectIsSubjectCacheValid(state, quizType || '', CACHE_EXPIRY, currentRoute)
    );

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [examTypeGroups, setExamTypeGroups] = useState<ExamTypeGroup[]>([]);

    const screenTitle = useMemo(() => {
        switch (quizType) {
            case 'DPP': return 'Daily Practice Problems';
            case 'Short Exam': return 'Short Examinations';
            case 'Mock Exam': return 'Mock Examinations';
            default: return 'Practice Tests';
        }
    }, [quizType]);

    const fetchSubjects = useCallback(async () => {
        if (!quizType || quizType === 'Mock Exam') return;

        const now = Date.now();

        if (cache && isCacheValid && cache.groupedSubjects) {
            const reconstructed: ExamTypeGroup[] = Object.entries(cache.groupedSubjects).map(
                ([examType, subjects]) => ({
                    examType,
                    subjects: Array.isArray(subjects)
                        ? subjects.map((subjectName: string) => ({
                            subject: subjectName,
                            courseName: '',
                            courseId: '',
                        }))
                        : []
                })
            );
            setExamTypeGroups(reconstructed);
            return;
        }

        if (quizType === 'DPP' || quizType === 'Short Exam') {
            try {
                setLoading(true);
                setError('');

                const response = await courseServiceGet.getDppSubjects(quizType);
                setExamTypeGroups(response.groupedSubjects || []);

                const transformed = response.groupedSubjects.reduce(
                    (acc: Record<string, string[]>, group: { examType: string; subjects: Array<{ subject: string }> }) => {
                        acc[group.examType] = group.subjects.map(subjectItem => subjectItem.subject);
                        return acc;
                    },
                    {}
                );

                dispatch(setSubjects({
                    quizType,
                    groupedSubjects: transformed,
                    timestamp: now,
                    route: currentRoute,
                }));

            } catch (err) {
                console.error('Fetch subject error:', err);
                setError('Unable to load subjects. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    }, [quizType, cache, isCacheValid, dispatch, currentRoute]);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleSubjectPress = useCallback((subject: Subject, examType: string) => {
        router.push({
            pathname: '/components/quizzes/ChapterSelectionScreen',
            params: {
                quizType,
                subject: subject.subject,
                examType,
                courseId: subject.courseId
            }
        });
    }, [router, quizType]);

    const renderSubjectCard = useCallback((subject: Subject, examType: string) => (
        <TouchableOpacity
            key={`${examType}_${subject.subject}`}
            style={styles.subjectCard}
            onPress={() => handleSubjectPress(subject, examType)}
        >
            <View style={styles.subjectHeader}>
                <Text style={styles.subjectTitle}>{subject.subject}</Text>
                <View style={styles.quizTypeBadge}>
                    <Text style={styles.quizTypeText}>{quizType}</Text>
                </View>
            </View>

            {subject.courseName && (
                <Text style={styles.courseText}>Course: {subject.courseName}</Text>
            )}

            <View style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Chapters</Text>
            </View>
        </TouchableOpacity>
    ), [quizType, handleSubjectPress]);

    const renderExamGroup = useCallback((group: ExamTypeGroup) => (
        <View key={group.examType} style={styles.examGroup}>
            <Text style={styles.examTitle}>{group.examType}</Text>
            <Text style={styles.examSubtitle}>
                {group.subjects.length} subject{group.subjects.length !== 1 ? 's' : ''} available
            </Text>
            <View style={styles.subjectsList}>
                {group.subjects.map(subject => renderSubjectCard(subject, group.examType))}
            </View>
        </View>
    ), [renderSubjectCard]);

    const renderContent = useMemo(() => {
        if (error) {
            return (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorTitle}>⚠️ Unable to load subjects</Text>
                    <Text style={styles.errorMessage}>{error}</Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={fetchSubjects}
                    >
                        <Text style={styles.buttonText}>Try Again</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (quizType === 'Mock Exam') {
            return (
                <View style={styles.messageContainer}>
                    <Text style={styles.messageTitle}>📝 Mock Examinations</Text>
                    <Text style={styles.messageText}>
                        Mock examinations are available in the dedicated Mock Test section.
                    </Text>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={() => router.push('/components/quizzes/QuizListScreen')}
                    >
                        <Text style={styles.buttonText}>Go to Mock Tests</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (examTypeGroups.length === 0) {
            return (
                <View style={styles.messageContainer}>
                    <Text style={styles.messageTitle}>📚 No subjects available</Text>
                    <Text style={styles.messageText}>
                        No {quizType?.toLowerCase()} subjects found at the moment.
                    </Text>
                </View>
            );
        }

        return (
            <View style={styles.content}>
                {examTypeGroups.map(renderExamGroup)}
            </View>
        );
    }, [error, quizType, examTypeGroups, fetchSubjects, renderExamGroup, router]);

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                     <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#4F46E5" />
                </TouchableOpacity>
                    <Text style={styles.headerTitle}>{screenTitle}</Text>
                </View>
                <ScrollView style={styles.content}>
                    <ResponsiveSkeleton />
                </ScrollView>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#4F46E5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{screenTitle}</Text>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                {renderContent}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        paddingTop: 48, // SafeArea padding
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
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
        color: '#111827',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    examGroup: {
        marginBottom: 28,
    },
    examTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 6,
    },
    examSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 14,
    },
    subjectsList: {
        gap: 14,
    },
    subjectCard: {
        backgroundColor: '#ffffff',
        borderRadius: 14,
        padding: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        minHeight: 120, // Increased card height
    },
    subjectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    subjectTitle: {
        fontSize: 17,
        fontWeight: '500',
        color: '#111827',
        flex: 1,
    },
    quizTypeBadge: {
        backgroundColor: '#e0e7ff',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 20,
        marginLeft: 10,
    },
    quizTypeText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#4F46E5',
    },
    courseText: {
        fontSize: 15,
        color: '#6b7280',
        marginBottom: 16,
    },
    viewButton: {
        alignSelf: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 18,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
    },
    viewButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#4F46E5',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    errorTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#dc2626',
        marginBottom: 8,
    },
    errorMessage: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    messageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    messageTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    messageText: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    primaryButton: {
        backgroundColor: '#4F46E5',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 24,
        minWidth: 200,
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#ffffff',
    },
});

export default SubjectSelectionScreen;