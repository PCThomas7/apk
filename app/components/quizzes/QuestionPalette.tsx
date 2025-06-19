import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const notVisited = require('@/assets/images/instruction-img-1.png');
const notAnswered = require('@/assets/images/instruction-img-2.png');
const answered = require('@/assets/images/instruction-img-3.png');
const markedForReview = require('@/assets/images/instruction-img-4.png');
const answeredMarkedForReview = require('@/assets/images/instruction-img-5.png');

const paletteItems = [
    { label: 'Not Visited', image: notVisited, count: 0, countColor: '#000' },
    { label: 'Not Answered', image: notAnswered, count: 0, countColor: '#000' },
    { label: 'Answered', image: answered, count: 0, countColor: '#000' },
    { label: 'Marked for Review', image: markedForReview, count: 0, countColor: '#fff' },
    { label: 'Answered & Marked for Review', image: answeredMarkedForReview, count: 0, countColor: '#fff' },
];

const QuestionPalette: React.FC = () => {
    return (
        <SafeAreaView edges={['top', 'bottom', 'left', 'right']}>
            <View style={styles.container}>
                {paletteItems.map((item, index) => (
                    <View key={index} style={styles.row}>
                        <View style={styles.imageWrapper}>
                            <Image source={item.image} style={styles.image} />
                            <Text style={[styles.countText, { color: item.countColor }]}>{item.count}</Text>
                        </View>
                        <Text style={styles.label}>{item.label}</Text>
                    </View>
                ))}
            </View>
        </SafeAreaView>

    );
};

const styles = StyleSheet.create({
    container: {
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
    row: {
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
});

export default QuestionPalette;
