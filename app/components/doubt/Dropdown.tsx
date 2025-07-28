import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type DropdownProps = {
  options: string[];
  selectedOption: string | null;
  onSelect: (option: string) => void;
  placeholder?: string;
};

const Dropdown = ({
  options,
  selectedOption,
  onSelect,
  placeholder = 'Select an option',
}: DropdownProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleDropdown = () => setIsVisible((prev) => !prev);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={toggleDropdown}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={`Dropdown: ${placeholder}`}
        accessibilityState={{ expanded: isVisible }}
      >
        <View style={styles.headerTextWrapper}>
          <Text
            style={selectedOption ? styles.headerTextSelected : styles.headerText}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {selectedOption || placeholder}
          </Text>
        </View>
        <Ionicons
          name={isVisible ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>

      {isVisible && (
        <View style={styles.dropdownList}>
          <ScrollView style={styles.dropdownScroll}>
            {options.map((item, index) => (
              <TouchableOpacity
                key={`${item}-${index}`}
                style={[
                  styles.dropdownItem,
                  selectedOption === item && styles.dropdownItemSelected,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text style={styles.itemText}>{item}</Text>
                {selectedOption === item && (
                  <Ionicons name="checkmark" size={18} color="#4F46E5" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    zIndex: 10,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  headerTextWrapper: {
    flex: 1,
    marginRight: 8, // prevent text from overlapping with chevron
  },
  headerText: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  headerTextSelected: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  dropdownItemSelected: {
    backgroundColor: '#F5F3FF',
  },
  itemText: {
    fontSize: 16,
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
});

export default Dropdown;
