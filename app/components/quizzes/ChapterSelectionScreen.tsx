import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChapterSelectionScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chapter Selection Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default ChapterSelectionScreen;
