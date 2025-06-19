import { api } from "./api";

const courseServiceGet = {
  // Course get Operations
  getUpcomingLessons: async () => {
    try {
      const response = await api.get('/courses/upcoming-lessons');
      console.log("data : ", response.data)
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Failed to fetch upcoming lessons');
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
  }


}
export default courseServiceGet;