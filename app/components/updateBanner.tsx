import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Animated,
  Platform,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface UpdateBannerProps {
  updateUrl: string;
  onClose?: () => void;
  duration?: number; // optional auto-dismiss duration
}

const UpdateBanner: React.FC<UpdateBannerProps> = ({ updateUrl, onClose, duration }) => {
  const translateY = useRef(new Animated.Value(-150)).current;

  const slideIn = () => {
    Animated.timing(translateY, {
      toValue: Platform.OS === 'ios' ? 50 : 30,
      duration: 600,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  const slideOut = (callback?: () => void) => {
    Animated.timing(translateY, {
      toValue: -200,
      duration: 600,
      easing: Easing.in(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      callback?.();
    });
  };

  const handleUpdatePress = () => {
    Linking.openURL(updateUrl).catch(err =>
      console.error('Failed to open URL:', err)
    );
  };

  const handleClose = () => {
    slideOut(onClose);
  };

  useEffect(() => {
    slideIn();

    if (duration) {
      const timer = setTimeout(() => {
        slideOut(onClose);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY }] }]}>
      <View style={styles.contentRow}>
        <Ionicons name="download-outline" size={24} color="#fff" style={styles.icon} />
        {updateUrl === "noupdate" ? (
          <View style={styles.textBlock}>
            <Text style={styles.title}>You're Up to Date</Text>
            <Text style={styles.subtitle}>No updates available at the moment.</Text>
          </View>
        ) : (
          <View style={styles.textBlock}>
            <Text style={styles.title}>Time to level up!</Text>
            <Text style={styles.subtitle}>
              A new version of the app is available. Would you like to update now?
            </Text>
          </View>
        )}

        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {updateUrl === "noupdate" ? (
        <Text></Text>
      ) : (
        <TouchableOpacity style={styles.updateButton} onPress={handleUpdatePress}>
        <Text style={styles.updateButtonText}>UPDATE NOW</Text>
        <Ionicons name="arrow-forward-outline" size={16} color="#fff" style={styles.arrowIcon} />
      </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -20,
    left: 0,
    right: 0,
    backgroundColor: '#000',
    paddingVertical: 20,
    paddingHorizontal: 20,
    elevation: 10,
    zIndex: 9999,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textBlock: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    color: '#ccc',
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 12,
    padding: 4,
    alignSelf: 'flex-start',
  },
  updateButton: {
    marginTop: 16,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    borderColor: '#fff',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginLeft: 30,
  },
  updateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    marginRight: 6,
  },
  arrowIcon: {
    marginTop: 1,
  },
});

export default UpdateBanner;
