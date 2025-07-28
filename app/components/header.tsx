import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AppHeaderProps {
  screenTitle: string;
  onBackPress?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ screenTitle, onBackPress }) => {
  return (
    <View style={styles.header}>
      {onBackPress && (
        <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4F46E5" />
        </TouchableOpacity>
      )}
      <Text style={styles.headerTitle} numberOfLines={1}>{screenTitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal:16,
    paddingVertical:10,
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
    flex:1,
  },
});

export default AppHeader;
