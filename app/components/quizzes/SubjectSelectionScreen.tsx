import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import courseServiceGet from '../../../services/courseServiceGet';
import { setSubjects, selectSubjectCacheEntry, selectIsSubjectCacheValid } from '@/redux/slices/subjectSlice';
import { Ionicons } from '@expo/vector-icons';
import ResponsiveGridSkeleton from '../skeltons/Skelton';
import AppHeader from '../../components/header';

const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes

interface Subject {
    subject: string;
    courseName: string;
    courseId: string;
}

interface ExamTypeGroup {
    examType: string;
    subjects: Subject[];
}

interface ApiResponse {
    groupedSubjects: ExamTypeGroup[];
}

const SubjectSelectionScreen = () => {
    const { quizType } = useLocalSearchParams<{ quizType: string }>();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const currentRoute = 'subject-selection';
    const cachedEntry = useAppSelector((state) =>
        selectSubjectCacheEntry(state, quizType || '', currentRoute)
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
            default: return 'Practice Tests';
        }
    }, [quizType]);

    const fetchSubjects = useCallback(async () => {
        if (!quizType || quizType === 'Mock Exam') return;

        try {
            setLoading(true);
            setError('');

            // Use cached data if valid - with proper type checking
            if (cachedEntry && isCacheValid && cachedEntry.examSubjects) {
                // Ensure the cached data matches our component's expected type
                const cachedGroups: ExamTypeGroup[] = cachedEntry.examSubjects.map(group => ({
                    examType: group.examType,
                    subjects: group.subjects.map(sub => ({
                        subject: sub.name, // Map from your slice's Subject.name to component's Subject.subject
                        courseName: '',    // Default values if not in cache
                        courseId: ''       // Default values if not in cache
                    }))
                }));
                setExamTypeGroups(cachedGroups);
                return;
            }

            // Fetch fresh data with proper typing
            const response = await courseServiceGet.getDppSubjects(quizType);
            if (!response || !response.groupedSubjects) {
                throw new Error('Invalid response format');
            }

            const subjectsData: ExamTypeGroup[] = response.groupedSubjects;
            setExamTypeGroups(subjectsData);

            // Prepare data for Redux cache (mapping to the slice's expected format)
            const cacheData = subjectsData.map(group => ({
                examType: group.examType,
                subjects: group.subjects.map(sub => ({
                    id: sub.courseId || '',  // Using courseId as id if your slice requires it
                    name: sub.subject        // Mapping to your slice's Subject.name
                }))
            }));

            dispatch(setSubjects({
                quizType,
                examSubjects: cacheData,
                route: currentRoute
            }));

        } catch (err) {
            console.error('Error fetching subjects:', err);
            setError('Unable to load subjects. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [quizType, cachedEntry, isCacheValid, dispatch]);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);


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
        <View
            key={`${examType}_${subject.subject}`}
            style={styles.subjectCard}

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
            <TouchableOpacity
                onPress={() => handleSubjectPress(subject, examType)}
            >
                <View style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View Chapters</Text>
                </View>
            </TouchableOpacity>

        </View>
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

    if (loading) {
        return (
            <View style={[styles.container, { paddingTop: 30 }]}>
                <AppHeader screenTitle={screenTitle} onBackPress={() => router.back()} />
                <ScrollView style={styles.content}>
                    <ResponsiveGridSkeleton />
                </ScrollView>
            </View>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.container}>
                <AppHeader screenTitle={screenTitle} onBackPress={() => router.back()} />

                <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
                    {error ? (
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
                    ) : quizType === 'Mock Exam' ? (
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
                    ) : examTypeGroups.length === 0 ? (
                        <View style={styles.messageContainer}>
                            <Text style={styles.messageTitle}>📚 No subjects available</Text>
                            <Text style={styles.messageText}>
                                No {quizType?.toLowerCase()} subjects found at the moment.
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.content}>
                            {examTypeGroups.map(renderExamGroup)}
                        </View>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
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
        alignItems: 'center', paddingVertical: 10,
        paddingHorizontal: 18,
        marginTop: 7,
        backgroundColor: '#4F46E5',
        borderRadius: 8,
    },
    viewButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#ffffff',
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


