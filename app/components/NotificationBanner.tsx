import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated,
  Dimensions,
  Platform,
  TouchableOpacity,
  Easing,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface NotificationBannerProps {
  title: string;
  body: string;
  color?: string;
  lessonId?: string;
  courseId?: string;
  sectionId?: string;
  chapterId?: string;
  content?: string;
  action?: 'join' | 'dismiss';
  onJoinLive?: (
    lessonId?: string,
    courseId?: string,
    sectionId?: string,
    chapterId?: string,
    content?: string,
    title?: string
  ) => void;
  onDismiss?: () => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({
  title,
  body,
  color = '#000000ff',
  lessonId,
  courseId,
  sectionId,
  chapterId,
  content,
  action = 'join',
  onJoinLive,
  onDismiss,
}) => {
  const translateY = useRef(new Animated.Value(-150)).current;

  const slideIn = () => {
    Animated.timing(translateY, {
      toValue: Platform.OS === 'ios' ? 50 : 30,
      duration: 350,
      easing: Easing.out(Easing.exp),
      useNativeDriver: true,
    }).start();
  };

  const slideOutAndDismiss = () => {
    Animated.timing(translateY, {
      toValue: -200,
      duration: 350,
      easing: Easing.in(Easing.exp),
      useNativeDriver: true,
    }).start(() => {
      onDismiss?.();
    });
  };

  useEffect(() => {
    slideIn();

    // Auto-dismiss after 5s
    const timer = setTimeout(() => {
      slideOutAndDismiss();
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY }], backgroundColor: color }]}
    >
      <View style={styles.topRow}>
        <MaterialCommunityIcons
          name="television-play"
          size={28}
          color="white"
          style={styles.icon}
        />
        <View style={styles.textContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.body}>{body}</Text>
        </View>
        {action === 'dismiss' && onDismiss && (
          <TouchableOpacity onPress={slideOutAndDismiss} style={styles.closeIcon}>
            <Ionicons name="close" size={20} color="#ffffff" />
          </TouchableOpacity>
        )}
      </View>

      {action === 'join' && onJoinLive && (
        <TouchableOpacity
          style={styles.joinButton}
          onPress={() => {
            onJoinLive(lessonId, courseId, sectionId, chapterId, content, title);
            slideOutAndDismiss();
          }}
        >
          <Text style={styles.joinButtonText}>JOIN NOW →</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
    width: '100%',
    zIndex: 9999,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 12,
    marginTop: 4,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#fff',
    marginBottom: 4,
  },
  body: {
    fontSize: 14,
    color: '#ccc',
  },
  closeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  joinButton: {
    marginTop: 16,
    borderWidth: 1,
    marginLeft: 40,
    borderColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 20,
    alignSelf: 'flex-start',
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

export default NotificationBanner;



