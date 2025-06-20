import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Image,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface InstructionsScreenProps {
    timeLimit?: number;
    questionsCount?: number;
    onStartQuiz: () => void;
}

const InstructionsScreen: React.FC<InstructionsScreenProps> = ({
    timeLimit,
    questionsCount,
    onStartQuiz
}) => {
    const router = useRouter();
    const [accepted, setAccepted] = useState(false);

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#4F46E5" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Read the instructions carefully</Text>
            </View>
            <Text style={styles.sectionTitle}>General Instructions:</Text>
            <View style={styles.sectionContent}>
                <Text style={styles.text}>
                    • Total duration of the quiz is{' '}
                    {typeof timeLimit === 'number'
                        ? `${timeLimit} minute${timeLimit > 1 ? 's' : ''}`
                        : 'not specified'}.
                </Text>
                <Text style={styles.text}>
                    • There are{' '}
                    {typeof questionsCount === 'number'
                        ? `${questionsCount} question${questionsCount !== 1 ? 's' : ''}`
                        : 'multiple questions'} in this quiz,try to attempt all.
                </Text>


                <Text style={styles.text}>
                    • The clock will be set at the server. The countdown timer in the top right corner of screen will display the remaining time available. When the timer reaches zero, the examination will end by itself.
                </Text>
                <Text style={styles.text}>• The Questions Palette will show the status of each question using symbols:</Text>

                <View style={styles.listItem}><Image source={require('@/assets/images/instruction-img-1.png')} style={styles.icon} /><Text style={styles.text}>You have not visited the question yet.</Text></View>
                <View style={styles.listItem}><Image source={require('@/assets/images/instruction-img-2.png')} style={styles.icon} /><Text style={styles.text}>You have not answered the question.</Text></View>
                <View style={styles.listItem}><Image source={require('@/assets/images/instruction-img-3.png')} style={styles.icon} /><Text style={styles.text}>You have answered the question.</Text></View>
                <View style={styles.listItem}><Image source={require('@/assets/images/instruction-img-4.png')} style={styles.icon} /><Text style={styles.text}>You have NOT answered the question, but have marked it for review.</Text></View>
                <View style={styles.listItem}><Image source={require('@/assets/images/instruction-img-5.png')} style={styles.icon} /><Text style={styles.text}>Answered and marked for review will be considered for evaluation.</Text></View>

                <Text style={styles.text}>• Use the arrows to collapse/expand the question palette.</Text>
                <Text style={styles.text}>• You can change the language from the Profile dropdown.</Text>
            </View>

            <Text style={styles.sectionTitle}>Navigating to a Question:</Text>
            <View style={styles.sectionContent}>
                <Text style={styles.text}>• To answer a question, do the following:</Text>
                <Text style={styles.subItem}>a. Click on the question number to go to it directly.</Text>
                <Text style={styles.subItem}>b. Click on "Save & Next" to save and go to next.</Text>
                <Text style={styles.subItem}>c. Click on "Mark for Review & Next" to save, mark and go to next.</Text>
            </View>

            <Text style={styles.sectionTitle}>Answering a Question:</Text>
            <View style={styles.sectionContent}>
                <Text style={styles.text}>• To answer multiple choice type question:</Text>
                <Text style={styles.subItem}>a. Select by clicking one option.</Text>
                <Text style={styles.subItem}>b. Deselect by clicking again or using "Clear Response".</Text>
                <Text style={styles.subItem}>c. Change answer by selecting another option.</Text>
                <Text style={styles.subItem}>d. Save using "Save & Next".</Text>
                <Text style={styles.subItem}>e. Mark for review using "Mark for Review & Next".</Text>
            </View>

            <Text style={styles.sectionTitle}>Navigating through sections:</Text>
            <View style={styles.sectionContent}>
                <Text style={styles.text}>• Sections are displayed on top bar.</Text>
                <Text style={styles.text}>• After finishing one, auto-navigate to the next.</Text>
                <Text style={styles.text}>• Shuffle freely during available time.</Text>
                <Text style={styles.text}>• View section summary above the palette.</Text>
            </View>

            {/* ✅ Custom Checkbox */}
            <View style={styles.checkboxContainer}>
                <Pressable
                    style={[styles.checkbox, accepted && styles.checkboxChecked]}
                    onPress={() => setAccepted(!accepted)}
                >
                    {accepted && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
                <Text style={styles.checkboxLabel}>
                    I have read and understood the instructions. I declare I am not carrying prohibited gadgets/material. I agree to disciplinary actions in case of violations.
                </Text>
            </View>

            <TouchableOpacity onPress={onStartQuiz}
                disabled={!accepted} style={[styles.button, !accepted && styles.disabledButton]}>
                <Text style={[styles.buttonText, !accepted && styles.disabledText]}>Proceed</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}


const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingBottom: 10,
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
        marginTop: 16,
        marginBottom: 8,
        color: '#111827',
    },
    sectionContent: {
        marginBottom: 16,
    },
    text: {
        fontSize: 14,
        color: '#374151',
        marginBottom: 8,
    },
    subItem: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 12,
        marginBottom: 4,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        paddingHorizontal: 5
    },
    icon: {
        width: 20,
        height: 20,
        marginRight: 8,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginVertical: 16,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 1,
        borderColor: '#374151',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#4F46E5',
        borderColor: '#3B82F6',
    },
    checkmark: {
        color: '#fff',
        fontWeight: 'bold',
    },
    checkboxLabel: {
        flex: 1,
        fontSize: 14,
        color: '#374151',
    },
    button: {
        backgroundColor: '#4F46E5',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        backgroundColor: '#D1D5DB',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    disabledText: {
        color: '#6B7280',
    },
});

export default InstructionsScreen;


