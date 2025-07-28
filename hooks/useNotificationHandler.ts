import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';

export interface NotificationPayload {
  title: string;
  body: string;
  color?: string;
  lessonId?: string;
  courseId?: string;
  action?: 'join' | 'dismiss';
}

export function useNotificationHandler() {
  const [notification, setNotification] = useState<NotificationPayload | null>(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((event) => {
      const title = typeof event.request.content.title === 'string' ? event.request.content.title : '';
      const body = typeof event.request.content.body === 'string' ? event.request.content.body : '';
      const color = typeof event.request.content.data?.color === 'string' ? event.request.content.data.color : undefined;
      const lessonId = typeof event.request.content.data?.lessonId === 'string' ? event.request.content.data.lessonId : undefined;
      const courseId = typeof event.request.content.data?.courseId === 'string' ? event.request.content.data.courseId : undefined;
      const action = typeof event.request.content.data?.action === 'string' ? event.request.content.data.action as 'join' | 'dismiss' : undefined;
      setNotification({ title, body, color, lessonId, courseId, action });
    });
    return () => subscription.remove();
  }, []);

  // Optionally: clear notification after some time
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (notification) {
      timeout = setTimeout(() => setNotification(null), 5000);
    }
    return () => clearTimeout(timeout);
  }, [notification]);

  // Handle notification responses (when user taps notification, even if app is not open)
  useEffect(() => {
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const action = response.notification.request.content.data?.action;
      const lessonId = response.notification.request.content.data?.lessonId;
      const courseId = response.notification.request.content.data?.courseId;
      if (action === 'join' && lessonId) {
        // Navigate to the lesson page, including courseId if present
        if (courseId) {
        //   router.push(`/lesson/${lessonId}?courseId=${courseId}`);
        } else {
        //   router.push(`/lesson/${lessonId}`);
        }
      }
    });
    return () => responseSubscription.remove();
  }, []);

  return { notification, setNotification };
}
