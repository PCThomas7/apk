import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';


interface LogoutModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const { width: screenWidth } = Dimensions.get('window');

const LogoutModal: React.FC<LogoutModalProps> = ({ visible, onCancel, onConfirm }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.modalContent,
          {
            backgroundColor: isDark ? '#2a2a2a' : '#ffffff',
            shadowColor: isDark ? '#000' : '#000',
          }
        ]}>
          <Text style={[
            styles.title,
            { color: isDark ? '#ffffff' : '#000000' }
          ]}>
            Logout
          </Text>
          
          <Text style={[
            styles.message,
            { color: isDark ? '#e0e0e0' : '#666666' }
          ]}>
            Are you sure you want to logout?
          </Text>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
                { backgroundColor: isDark ? '#3a3a3a' : '#f0f0f0' }
              ]}
              onPress={onCancel}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.buttonText,
                { color: isDark ? '#ffffff' : '#333333' }
              ]}>
                Cancel
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: '#544de6' }
              ]}
              onPress={onConfirm}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.buttonText,
                { color: '#ffffff' }
              ]}>
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: screenWidth * 0.85,
    maxWidth: 340,
    borderRadius: 12,
    padding: 24,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
  },
  confirmButton: {
    shadowColor: '#ff4d4d',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LogoutModal;