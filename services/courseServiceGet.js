import { api } from "./api";

const courseServiceGet = {
  // Course get Operations
  getUpcomingLessons: async () => {
    try {
      const response = await api.get('/courses/upcoming-lessons');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch upcoming lessons');
    }
  },

  getEnrolledVideoLessons: async () => {
    try {
      const response = await api.get('/lessons/enrolled/videos');
      return response.data;
    } catch (error) {
      console.error('Error fetching enrolled video lessons:', error);
      throw error;
    }
  },

  getAverageScore: async (userId) => {
    try {
      const response = await api.get(`/analytics/${userId}`);
      console.log("data : ", response.data)
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch Average Score for user');
    }
  },

  getDppQuizzes: async (quizType) => {
    try {
      const response = await api.get(`/course-quizzes/${quizType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching DPP quizzes:', error);
      throw error;
    }
  },

  getDppSubjects: async (quizType) => {
    try {
      const response = await api.get(`/course-quizzes/subjects/${quizType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching DPP subjects:', error);
      throw error;
    }
  },

  getDppChapters: async (quizType, subject, examType) => {
    try {
      const response = await api.get(`/course-quizzes/chapters/${quizType}/${subject}/${examType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching DPP chapters:', error);
      throw error;
    }
  },

  getDppQuizzesByFilter: async (quizType, subject, chapter, examType = 'all') => {
    try {
      const response = await api.get(`/course-quizzes/quizzes/${quizType}/${subject}/${chapter}/${examType}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching filtered DPP quizzes:', error);
      throw error;
    }
  },

  getQuiz: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw error; // Re-throw to let the caller handle it
    }
  },

  getQuizHighestScore: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/highest-score`);
      return response.data;
    } catch (error) {
      console.error('Error fetching highest score:', error);
      throw error;
    }
  },

  getUserQuizAttempts: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/attempts/me`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch quiz attempts');
    }
  },

  getCoursesStudent: async () => {
    try {
      const response = await api.get('/courses/student');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch courses');
    }
  },
  // Get course progress.currently not in use.
  getCourseProgress: async (courseId) => {
    try {
      const response = await api.get(`/progress/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      throw new Error('Failed to fetch course progress');
    }
  },

  getCourse: async (courseId) => {
    try {
      const response = await api.get(`/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course details');
    }
  },

  getCourseV2: async (courseId) => {
    try {
      const response = await api.get(`/courses/v2/${courseId}`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch course details');
    }
  },

  getCourseDetailedAnalytics: async (courseId) => {
    try {
      const response = await api.get(`/progress/course/${courseId}/analytics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw new Error('Failed to fetch course analytics');
    }
  },

  getSectionChapters: async (sectionId) => {
    try {
      const response = await api.get(`/courses/v2/section/${sectionId}/chapters`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch section chapters');
    }
  },

  getChapterLessons: async (chapterId) => {
    try {
      const response = await api.get(`/courses/v2/chapter/${chapterId}/lessons`);
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch chapter lessons');
    }
  },

  getChapterLessonsProgress: async (chapterId) => {
    try {
      const response = await api.get(`/lessons/progress/chapter/${chapterId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lessons progress:', error);
      throw error;
    }
  },

  toggleLessonBookmark: async (lessonId) => {
    try {
      const response = await api.post(`/progress/lesson/${lessonId}/bookmark`);
      return response.data;
    } catch (error) {
      console.error('Error toggling lesson bookmark:', error);
      throw new Error('Failed to toggle lesson bookmark');
    }
  },

  markLessonCompleted: async (lessonId, data) => {
    try {
      const response = await api.post(`/progress/lesson/${lessonId}/complete`, data);
      return response.data;
    } catch (error) {
      console.error('Error marking lesson as completed:', error);
      throw new Error('Failed to mark lesson as completed');
    }
  },

  updateLessonProgress: async (lessonId, progressData) => {
    try {
      const response = await api.post(`/progress/lesson/${lessonId}`, progressData);
      return response.data;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw new Error('Failed to update lesson progress');
    }
  },

  getUserAverageScore: async () => {
    try {
      const response = await api.get(`/student/analytics/averageScore`);
      return response.data;
    } catch (error) {
      console.error('Error fetching average score :', error);
      throw new Error('Failed to fetch average score');
    }
  },

  getLesson: async (lessonId) => {
    try {
      const response = await api.get(`/lessons/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching lesson:', error);
      throw error;
    }
  },

  getStudentAnalytics: async () => {
    try {
      const response = await api.get('/student/analytics');
      return response.data;
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      throw error;
    }
  },

  getQuizAttemptReport: async (quizId) => {
    try {
      const response = await api.get(`/quizzes/${quizId}/attempts/me/report`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quiz attempt report:', error);
      throw error;
    }
  },

  getHandoutsByLesson: async (lessonId) => {
    try {
      const response = await api.get(`/handouts/lesson/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching handouts:', error);
      throw error;
    }
  },

}
export default courseServiceGet;