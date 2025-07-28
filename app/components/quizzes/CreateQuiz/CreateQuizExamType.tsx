import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import courseServiceGet from '@/services/courseServiceGet';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import ResponsiveGridSkeleton from '../../skeltons/Skelton';
import AppHeader from '../../header';

const MAX_QUIZZES = 5;

const CreateQuizScreen = () => {
    const router = useRouter();
    const { quizType } = useLocalSearchParams<{ quizType: string }>();

    const [examTypes, setExamTypes] = useState<string[]>([]);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [selectedExamType, setSelectedExamType] = useState<string | null>(null);
    const [count, setCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [subjectsLoading, setSubjectsLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    // Memoized fetch function
    const fetchData = useCallback(async () => {
        try {
            const [typesResponse, countResponse] = await Promise.all([
                courseServiceGet.getExamTypes(),
                courseServiceGet.getCustomizedQuizCount()
            ]);

            setExamTypes(typesResponse || []);
            setCount(countResponse || 0);
        } catch (error) {
            console.error("Error loading quiz data:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);


    const handleExamTypeSelect = useCallback(async (type: string) => {
        if (selectedExamType === type) return;

        setSelectedExamType(type);
        setSubjects([]);
        setSelectedSubjects([]);
        setSubjectsLoading(true);

        try {
            const response = await courseServiceGet.getSubjectsForExamType(type);
            setSubjects(response || []);
        } catch (err) {
            console.error('Failed to fetch subjects:', err);
        } finally {
            setSubjectsLoading(false);
        }
    }, [selectedExamType]);

    const toggleSubjectSelect = useCallback((subject: string) => {
        setSelectedSubjects((prev) =>
            prev.includes(subject)
                ? prev.filter((s) => s !== subject)
                : [...prev, subject]
        );
    }, []);

    const handleSubmit = useCallback(() => {
        if (selectedSubjects.length === 0 || !selectedExamType) return;

        router.push({
            pathname: '/components/quizzes/CreateQuiz/CreateQuizChapters',
            params: {
                examType: selectedExamType,
                subjects: JSON.stringify(selectedSubjects),
                count: count
            },
        });
    }, [selectedExamType, selectedSubjects, router]);

    // Render loading state
    if (loading) {
        return (
            <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
                <ResponsiveGridSkeleton />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <AppHeader screenTitle='Create Quiz' onBackPress={() => router.back()} />

            <ScrollView
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        colors={['#4F46E5']}
                        tintColor="#4F46E5"
                    />
                }
            >
                <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.introContainer}>
                    <Text style={styles.introTitle}>Build Your Custom Quiz</Text>
                    <Text style={styles.introText}>
                        Select an exam type and subjects to create a personalized quiz experience.
                    </Text>
                    <View style={styles.limitRow}>
                        <Ionicons name="book-outline" size={18} color="#4F46E5" style={styles.limitIcon} />
                        <Text style={styles.limitText}>
                            You have created {count} out of {MAX_QUIZZES} allowed quizzes
                        </Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInDown.delay(200).duration(500)}>
                    <Text style={styles.sectionTitle}>1. Choose Exam Type</Text>
                    <Text style={styles.sectionSubtitle}>Select the type of exam you're preparing for</Text>

                    <View style={styles.tagsContainer}>
                        {examTypes.map((type, index) => (
                            <Animated.View
                                key={type}
                                entering={FadeInDown.delay(200 + (index * 50)).duration(500)}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.tagButton,
                                        selectedExamType === type && styles.tagButtonSelected,
                                    ]}
                                    onPress={() => handleExamTypeSelect(type)}
                                >
                                    <Text
                                        style={[
                                            styles.tagText,
                                            selectedExamType === type && styles.tagTextSelected,
                                        ]}
                                    >
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>
                </Animated.View>

                {selectedExamType && (
                    <Animated.View
                        entering={FadeInDown.duration(500)}
                        style={styles.sectionContainer}
                    >
                        <Text style={styles.sectionTitle}>2. Select Subjects</Text>
                        <Text style={styles.sectionSubtitle}>Pick the subjects you want to include</Text>

                        {subjectsLoading ? (
                            <View style={styles.subjectsLoading}>
                                <ActivityIndicator size="small" color="#4F46E5" />
                                <Text style={styles.loadingSubjectsText}>Loading subjects...</Text>
                            </View>
                        ) : (
                            <View style={styles.tagsContainer}>
                                {subjects.map((subject, index) => (
                                    <Animated.View
                                        key={subject}
                                        entering={FadeInDown.delay(100 + (index * 30)).duration(500)}
                                    >
                                        <TouchableOpacity
                                            style={[
                                                styles.tagButton,
                                                selectedSubjects.includes(subject) && styles.tagButtonSelected,
                                            ]}
                                            onPress={() => toggleSubjectSelect(subject)}
                                        >
                                            <Text
                                                style={[
                                                    styles.tagText,
                                                    selectedSubjects.includes(subject) && styles.tagTextSelected,
                                                ]}
                                            >
                                                {subject}
                                            </Text>
                                        </TouchableOpacity>
                                    </Animated.View>
                                ))}
                            </View>
                        )}
                    </Animated.View>
                )}

                {(selectedExamType || selectedSubjects.length > 0) && (
                    <Animated.View
                        entering={FadeInDown.duration(500)}
                        style={styles.selectionSummary}
                    >
                        <Text style={styles.summaryTitle}>Your Selection</Text>
                        {selectedExamType && (
                            <View style={styles.summaryItem}>
                                <Ionicons name="school-outline" size={16} color="#4F46E5" />
                                <Text style={styles.summaryText}>
                                    <Text style={styles.summaryLabel}>Exam: </Text>
                                    {selectedExamType}
                                </Text>
                            </View>
                        )}
                        {selectedSubjects.length > 0 && (
                            <View style={styles.summaryItem}>
                                <Ionicons name="library-outline" size={16} color="#4F46E5" />
                                <Text style={styles.summaryText}>
                                    <Text style={styles.summaryLabel}>Subjects: </Text>
                                    {selectedSubjects.join(', ')}
                                </Text>
                            </View>
                        )}
                    </Animated.View>
                )}

                {selectedExamType && selectedSubjects.length > 0 && (
                    <Animated.View
                        entering={FadeInDown.duration(500)}
                        style={styles.footer}
                    >
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                count >= MAX_QUIZZES && styles.submitButtonDisabled
                            ]}
                            onPress={handleSubmit}
                            disabled={count >= MAX_QUIZZES}
                        >
                            <Text style={styles.submitButtonText}>
                                {count >= MAX_QUIZZES ? 'Quiz Limit Reached' : 'Next'}
                            </Text>
                            {count < MAX_QUIZZES && (
                                <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.submitIcon} />
                            )}
                        </TouchableOpacity>

                        {count >= MAX_QUIZZES && (
                            <Text style={styles.limitWarning}>
                                You've reached your maximum quiz limit. Please delete existing quizzes to create new ones.
                            </Text>
                        )}
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
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
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    introContainer: {
        marginBottom: 30,
    },
    introTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 8,
    },
    introText: {
        fontSize: 16,
        color: '#6b7280',
        lineHeight: 24,
        marginBottom: 16,
    },
    limitRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    limitIcon: {
        marginRight: 8,
    },
    limitText: {
        fontSize: 15,
        color: '#4b5563',
    },
    limitCount: {
        fontWeight: '700',
        color: '#4F46E5',
    },
    sectionContainer: {
        marginTop: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    sectionSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    tagButton: {
        backgroundColor: '#f0f4ff',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#dbe4ff',
    },
    tagButtonSelected: {
        backgroundColor: '#4F46E5',
        borderColor: '#4338ca',
    },
    tagText: {
        color: '#4F46E5',
        fontWeight: '500',
        fontSize: 14,
    },
    tagTextSelected: {
        color: '#ffffff',
    },
    subjectsLoading: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        marginTop: 8,
    },
    loadingSubjectsText: {
        marginLeft: 8,
        color: '#4b5563',
        fontSize: 14,
    },
    selectionSummary: {
        backgroundColor: '#f8fafc',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        marginTop: 24,
    },
    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    summaryText: {
        fontSize: 14,
        color: '#4b5563',
        marginLeft: 8,
    },
    summaryLabel: {
        fontWeight: '500',
        color: '#1f2937',
    },
    footer: {
        marginTop: 24,
    },
    submitButton: {
        backgroundColor: '#4F46E5',
        paddingVertical: 16,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    submitButtonDisabled: {
        backgroundColor: '#9ca3af',
        shadowColor: 'transparent',
    },
    submitButtonText: {
        color: '#ffffff',
        fontWeight: '600',
        fontSize: 16,
    },
    submitIcon: {
        marginLeft: 8,
    },
    limitWarning: {
        color: '#ef4444',
        fontSize: 13,
        marginTop: 12,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default CreateQuizScreen;