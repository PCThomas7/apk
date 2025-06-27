import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../redux/store';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { setSolutionSelectedQuestionId } from '../../../redux/slices/quizAttemptSlice';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 64) / 5; // 5 items per row

const QuestionStatus = {
  CORRECT: 'correct',
  WRONG: 'wrong',
  UNATTEMPTED: 'unattempted'
} as const;

const ReportPalette: React.FC = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const { answers } = useLocalSearchParams<{ answers?: string }>();
    const { currentQuiz } = useSelector((state: RootState) => state.quiz);

    // Memoize parsed answers
    const parsedAnswers = useMemo(() => {
        try {
            return answers ? JSON.parse(answers) : {};
        } catch (error) {
            console.error('Error parsing answers:', error);
            return {};
        }
    }, [answers]);

    // Memoize flattened questions
    const allQuestions = useMemo(() => 
        currentQuiz?.sections?.flatMap((section) => section.questions) || [], 
        [currentQuiz]
    );

    // Memoize question status calculation
    const getQuestionStatus = useCallback((question: any) => {
        const userAns = parsedAnswers[question.id]?.[0];
        if (!userAns) return QuestionStatus.UNATTEMPTED;
        
        const selectedOption = question.options.find((opt: any) => opt.id === userAns);
        if (!selectedOption) return QuestionStatus.UNATTEMPTED;
        
        return selectedOption.isCorrect ? QuestionStatus.CORRECT : QuestionStatus.WRONG;
    }, [parsedAnswers]);

    const handleBack = useCallback(() => router.back(), [router]);

    const handleQuestionPress = useCallback((questionId: string) => {
        dispatch(setSolutionSelectedQuestionId(questionId));
        router.back();
    }, [dispatch, router]);

    // Memoized legend items to avoid re-rendering
    const legendItems = useMemo(() => [
        { status: QuestionStatus.CORRECT, text: 'Correct', color: '#3ec170' },
        { status: QuestionStatus.WRONG, text: 'Wrong', color: '#F44336' },
        { status: QuestionStatus.UNATTEMPTED, text: 'Unattempted', color: '#bdbdbd' }
    ], []);

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={22} color="#4F46E5" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Questions Palette</Text>
                </View>

                {/* Question Palette Grid */}
                <View style={styles.paletteContainer}>
                    <View style={styles.gradientBackground} />
                    <ScrollView 
                        contentContainerStyle={styles.paletteGrid}
                        removeClippedSubviews={true}
                    >
                        {allQuestions.map((q: any, idx: number) => {
                            const status = getQuestionStatus(q);
                            return (
                                <QuestionItem 
                                    key={q.id}
                                    id={q.id}
                                    index={idx}
                                    status={status}
                                    onPress={handleQuestionPress}
                                />
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Sticky footer legend */}
                <View style={styles.legendSticky}>
                    <View style={styles.legendContainer}>
                        {legendItems.map((item) => (
                            <LegendItem 
                                key={item.status}
                                color={item.color}
                                text={item.text}
                            />
                        ))}
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
};

// Extracted QuestionItem component to prevent unnecessary re-renders
const QuestionItem = React.memo(({ id, index, status, onPress }: {
    id: string;
    index: number;
    status: string;
    onPress: (id: string) => void;
}) => {
    const iconName = status === QuestionStatus.CORRECT ? "check-circle" : 
                     status === QuestionStatus.WRONG ? "close-circle" : "minus-circle";
    const iconColor = status === QuestionStatus.CORRECT ? "#3ec170" : 
                      status === QuestionStatus.WRONG ? "#F44336" : "#bdbdbd";

    return (
        <TouchableOpacity
            style={styles.questionWrapper}
            onPress={() => onPress(id)}
            activeOpacity={0.7}
        >
            <View style={[
                styles.qBox,
                status === QuestionStatus.CORRECT && styles.correct,
                status === QuestionStatus.WRONG && styles.wrong,
                status === QuestionStatus.UNATTEMPTED && styles.unattempted,
            ]}>
                <Text style={[
                    styles.qText,
                    status === QuestionStatus.CORRECT && styles.correctText,
                    status === QuestionStatus.WRONG && styles.wrongText,
                ]}>
                    {index + 1}
                </Text>
                <MaterialCommunityIcons 
                    name={iconName} 
                    size={18} 
                    color={iconColor} 
                    style={styles.statusIcon} 
                />
            </View>
        </TouchableOpacity>
    );
});

// Extracted LegendItem component
const LegendItem = React.memo(({ color, text }: { color: string; text: string }) => (
    <View style={styles.legendItem}>
        <View style={[styles.legendIndicator, { backgroundColor: color }]} />
        <Text style={styles.legendText}>{text}</Text>
    </View>
));

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff'
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
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
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1f2937'
    },
    paletteContainer: {
        flex: 1,
        position: 'relative',
        paddingBottom: 40
    },
    gradientBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f9fafb',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    paletteGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        padding: 16,
        paddingBottom: 24,
        rowGap: 20,
    },
    questionWrapper: {
        width: '18%',
        aspectRatio: 1,
        margin: '1%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qBox: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    qText: {
        fontWeight: '600',
        fontSize: 20,
        color: '#4b5563',
    },
    correctText: {
        color: '#065f46',
    },
    wrongText: {
        color: '#b91c1c',
    },
    statusIcon: {
        position: 'absolute',
        bottom: -8,
        right: -8,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
    },
    correct: {
        backgroundColor: '#e6f9f0',
        borderColor: '#3ec170',
    },
    wrong: {
        backgroundColor: '#fde8e8',
        borderColor: '#F44336',
    },
    unattempted: {
        backgroundColor: '#f3f4f6',
        borderColor: '#d1d5db',
    },
    legendSticky: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#f8f9fa',
        borderTopWidth: 1,
        borderTopColor: '#e9ecef',
        zIndex: 10,
    },
    legendContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 12,
        backgroundColor: '#f8f9fa',
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendIndicator: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginRight: 6,
    },
    legendText: {
        fontSize: 14,
        color: '#6c757d',
    },
});

export default ReportPalette;