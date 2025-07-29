import React from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

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
  color = '#cccccc', 
  lessonId, 
  courseId,
  sectionId,
  chapterId,
  content,
  action, 
  onJoinLive, 
  onDismiss 
}) => {
  return (
    <View style={[styles.container, { backgroundColor: color }]}> 
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>

      <View style={styles.buttonContainer}>
        {action === 'join' && onJoinLive && (
          <Button 
            title="Join Live" 
            onPress={() => onJoinLive(lessonId, courseId , sectionId ,chapterId , content ,title)} 
          />
        )}
        {action === 'dismiss' && onDismiss && (
          <Button 
            title="Dismiss" 
            onPress={onDismiss} 
            color="#ff4444"
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    margin: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
    color: '#fff',
  },
  body: {
    fontSize: 14,
    color: '#fff',
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    color: '#fff',
    marginTop: 2,
    opacity: 0.8,
  },
  buttonContainer: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
});

export default NotificationBanner;