import { api } from "./api";

const courseServicePost = {
  submitQuizAttempt: async (quizId, attemptData) => {
    try {
      const response = await api.post(`/quizzes/${quizId}/attempts`, attemptData);
      return response.data;
    } catch (error) {
      console.error("Error submitting quiz attempt:", error);
      throw new Error(error.response?.data?.message || 'Failed to submit quiz attempt');
    }
  },
};

export default courseServicePost;
