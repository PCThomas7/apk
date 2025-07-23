import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type DropdownProps = {
  options: string[];
  selectedOption: string | null;
  onSelect: (option: string) => void;
  placeholder?: string;
  label?: string;
};

const Dropdown = ({
  options,
  selectedOption,
  onSelect,
  placeholder = 'Select an option',
  label
}: DropdownProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleDropdown = () => setIsVisible(prev => !prev);

  const handleSelect = (option: string) => {
    onSelect(option);
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <TouchableOpacity
        style={styles.dropdownHeader}
        onPress={toggleDropdown}
        activeOpacity={0.8}
      >
        <Text style={selectedOption ? styles.headerTextSelected : styles.headerText}>
          {selectedOption || placeholder}
        </Text>
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
                key={index}
                style={[
                  styles.dropdownItem,
                  selectedOption === item && styles.dropdownItemSelected
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
    zIndex: 10, // make sure it renders above charts or other elements
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontWeight: '500',
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
  },
});

export default Dropdown;
