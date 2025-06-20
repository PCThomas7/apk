import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { selectQuestionStatus } from '../../../redux/slices/quizAttemptSlice';
import { isEqual } from 'lodash';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { navigateToQuestion } from '../../../redux/slices/quizAttemptSlice';

// Import images
const notVisited = require('@/assets/images/instruction-img-1.png');
const notAnswered = require('@/assets/images/instruction-img-2.png');
const answered = require('@/assets/images/instruction-img-3.png');
const markedForReview = require('@/assets/images/instruction-img-4.png');
const answeredMarkedForReview = require('@/assets/images/instruction-img-5.png');

const { width } = Dimensions.get('window');
const ITEMS_PER_PAGE = 20;
const QUESTIONS_PER_ROW = 4;
const QUESTION_ITEM_SIZE = (width - 40) / QUESTIONS_PER_ROW; // 20 padding on each side

interface PaletteItem {
    label: string;
    image: any;
    count: number;
    countColor: string;
}

interface QuestionStatusItem {
    id: string;
    status: 'notVisited' | 'notAnswered' | 'answered' | 'markedForReview' | 'answeredAndMarkedForReview';
    number: number;
}

const QuestionPalette: React.FC = () => {

    const initialPaletteItems: PaletteItem[] = [
        { label: 'Not Visited', image: notVisited, count: 0, countColor: '#000' },
        { label: 'Not Answered', image: notAnswered, count: 0, countColor: '#000' },
        { label: 'Answered', image: answered, count: 0, countColor: '#000' },
        { label: 'Marked for Review', image: markedForReview, count: 0, countColor: '#fff' },
        { label: 'Answered & Marked', image: answeredMarkedForReview, count: 0, countColor: '#fff' },
    ];
    
    const router = useRouter();
    const dispatch = useDispatch();
    const [paletteItems, setPaletteItems] = useState<PaletteItem[]>(initialPaletteItems);
    const [currentPage, setCurrentPage] = useState(0);
    const [questions, setQuestions] = useState<QuestionStatusItem[]>([]);

    const { statusMap, counts } = useSelector(selectQuestionStatus, isEqual);

    useEffect(() => {
        if (!counts) return;

        setPaletteItems([
            { ...initialPaletteItems[0], count: counts.notVisited },
            { ...initialPaletteItems[1], count: counts.notAnswered },
            { ...initialPaletteItems[2], count: counts.answered },
            { ...initialPaletteItems[3], count: counts.markedForReview },
            { ...initialPaletteItems[4], count: counts.answeredAndMarkedForReview },
        ]);

        // Prepare questions array
        if (statusMap) {
            const questionsArray = Object.entries(statusMap).map(([id, status], index) => ({
                id,
                status: status.status,
                number: index + 1
            }));
            setQuestions(questionsArray);
            setCurrentPage(0); // Reset to first page when questions change
        }
    }, [counts, statusMap]);

    const totalPages = Math.ceil(questions.length / ITEMS_PER_PAGE);
    const paginatedQuestions = questions.slice(
        currentPage * ITEMS_PER_PAGE,
        (currentPage + 1) * ITEMS_PER_PAGE
    );

    const getStatusImage = (status: QuestionStatusItem['status']) => {
        switch (status) {
            case 'notVisited': return notVisited;
            case 'notAnswered': return notAnswered;
            case 'answered': return answered;
            case 'markedForReview': return markedForReview;
            case 'answeredAndMarkedForReview': return answeredMarkedForReview;
            default: return notVisited;
        }
    };

    const getStatusColor = (status: QuestionStatusItem['status']) => {
        switch (status) {
            case 'markedForReview':
            case 'answeredAndMarkedForReview':
                return '#fff';
            default:
                return '#000';
        }
    };

    const handleQuestionPress = (questionId: string, sectionIndex: number, questionIndex: number) => {
        // Dispatch the navigation action
        dispatch(navigateToQuestion({ sectionIndex, questionIndex }));

        // Navigate back to the previous screen
        router.back();
    };

    const renderQuestionItem = ({ item }: { item: QuestionStatusItem }) => {
        // Find the section and question index from statusMap
        const questionInfo = statusMap?.[item.id];
        if (!questionInfo) return null;

        return (
            <TouchableOpacity
                style={styles.questionItem}
                onPress={() => handleQuestionPress(
                    item.id,
                    questionInfo.sectionIndex,
                    questionInfo.questionIndex
                )}
            >
                <View style={styles.questionIndicator}>
                    <Image
                        source={getStatusImage(item.status)}
                        style={styles.questionImage}
                    />
                    <Text style={[styles.questionNumber, { color: getStatusColor(item.status) }]}>
                        {item.number}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView edges={['top', 'bottom', 'left', 'right']} style={styles.safeArea}>
            {/* Summary Palette */}
            <View style={styles.paletteContainer}>
                {paletteItems.map((item, index) => (
                    <View key={`${item.label}-${index}`} style={styles.paletteRow}>
                        <View style={styles.imageWrapper}>
                            <Image source={item.image} style={styles.image} />
                            <Text style={[styles.countText, { color: item.countColor }]}>
                                {item.count}
                            </Text>
                        </View>
                        <Text style={styles.label}>{item.label}</Text>
                    </View>
                ))}
            </View>

            {/* Questions Grid */}
            <View style={styles.questionsContainer}>
                <FlatList
                    data={paginatedQuestions}
                    renderItem={renderQuestionItem}
                    keyExtractor={(item) => item.id}
                    numColumns={QUESTIONS_PER_ROW}
                    contentContainerStyle={styles.questionsGrid}
                />

                {/* Pagination Controls */}
                {totalPages > 1 && (
                    <View style={styles.paginationContainer}>
                        <TouchableOpacity
                            onPress={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                            disabled={currentPage === 0}
                            style={[styles.paginationButton, currentPage === 0 && styles.disabledButton]}
                        >
                            <Text style={styles.paginationText}>Previous</Text>
                        </TouchableOpacity>

                        <Text style={styles.pageText}>
                            Page {currentPage + 1} of {totalPages}
                        </Text>

                        <TouchableOpacity
                            onPress={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                            disabled={currentPage === totalPages - 1}
                            style={[styles.paginationButton, currentPage === totalPages - 1 && styles.disabledButton]}
                        >
                            <Text style={styles.paginationText}>Next</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#fff',
    },
    paletteContainer: {
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#aaa',
        borderRadius: 6,
        borderStyle: 'dashed',
        width: '90%',
        alignSelf: 'center',
        marginHorizontal: 20,
        marginTop: 20,
        backgroundColor: 'transparent',
    },
    paletteRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 7,
    },
    imageWrapper: {
        position: 'relative',
        width: 28,
        height: 28,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    countText: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: [{ translateX: -7 }, { translateY: -7 }],
        fontSize: 10,
        fontWeight: 'bold',
        borderRadius: 10,
        paddingHorizontal: 4,
        paddingVertical: 1,
        overflow: 'hidden',
        textAlign: 'center',
    },
    label: {
        flex: 1,
        fontSize: 14,
        color: '#222',
    },
    questionsContainer: {
        flex: 1,
        marginTop: 20,
        paddingHorizontal: 10,
    },
    questionsGrid: {
        justifyContent: 'center',
    },
    questionItem: {
        width: QUESTION_ITEM_SIZE,
        height: QUESTION_ITEM_SIZE,
        padding: 8,
    },
    questionIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    questionImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    questionNumber: {
        position: 'absolute',
        fontSize: 12,
        fontWeight: 'bold',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    paginationButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 5,
    },
    disabledButton: {
        opacity: 0.5,
    },
    paginationText: {
        color: '#333',
        fontSize: 14,
    },
    pageText: {
        fontSize: 14,
        color: '#666',
    },
});

export default QuestionPalette;
