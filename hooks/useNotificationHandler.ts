import * as Notifications from 'expo-notifications';
import { Stack,router } from 'expo-router';
import { useEffect, useState } from 'react';

export interface NotificationPayload {
  title: string;
  body: string;
  color?: string;
  lessonId?: string;
  courseId?: string;
  sectionId?: string;
  chapterId?: string;
  content?: string;
  action?: 'join' | 'dismiss';
}

export function useNotificationHandler() {
  const [notification, setNotification] = useState<NotificationPayload | null>(null);

  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((event) => {
      const payload = event.request.content;
      const data = payload.data as Partial<NotificationPayload>;
      
      setNotification({
        title: typeof payload.title === 'string' ? payload.title : '',
        body: typeof payload.body === 'string' ? payload.body : '',
        color: typeof data.color === 'string' ? data.color : undefined,
        lessonId: typeof data.lessonId === 'string' ? data.lessonId : undefined,
        courseId: typeof data.courseId === 'string' ? data.courseId : undefined,
        sectionId: typeof data.sectionId === 'string' ? data.sectionId : undefined,
        chapterId: typeof data.chapterId === 'string' ? data.chapterId : undefined,
        content: typeof data.content === 'string' ? data.content : undefined,
        action: data.action === 'join' || data.action === 'dismiss' ? data.action : undefined
      });
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (notification) {
      timeout = setTimeout(() => setNotification(null), 5000);
    }
    return () => clearTimeout(timeout);
  }, [notification]);

  useEffect(() => {
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const payload = response.notification.request.content;
      const data = payload.data as Partial<NotificationPayload>;
      
      if (data.action === 'join' && data.lessonId) {
        const queryParams = new URLSearchParams({
          video: encodeURIComponent(data.content || ''),
          status: '',
          vediotitle: encodeURIComponent(payload.title || ''),
          bookmarked: 'false',
          viewCount: '0',
          watchTimeSeconds: '0',
          totalTimeSeconds: '0',
          lessonId: data.lessonId,
          ...(data.courseId && { courseId: data.courseId }),
          ...(data.sectionId && { sectionId: data.sectionId }),
          ...(data.chapterId && { chapterId: data.chapterId })
        });

        router.push(`/components/courses/courseRoom?${queryParams.toString()}`);
      }
    });

    return () => responseSubscription.remove();
  }, []);

  return { notification, setNotification };
}