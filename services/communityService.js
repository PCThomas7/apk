import { api } from "./api";

const CommunityService = {

  // Get all community posts with pagination
  getPosts: async (page = 1, limit = 5, search = '') => {
    try {
      const response = await api.get('/community/posts', {
        params: { page, limit, search }
      });
      return {
        posts: response.data.data,
        pagination: response.data.pagination
      };
    } catch (error) {
      console.error('Error fetching community posts:', error);
      throw error;
    }
  },

  // Get a single post by ID
  getPost: async (postId) => {
    try {
      const response = await api.get(`/community/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching community post:', error);
      throw error;
    }
  },

  // Get popular posts
  getPopularPosts: async () => {
    try {
      const response = await api.get('/community/posts/popular');
      return response.data;
    } catch (error) {
      console.error('Error fetching popular posts:', error);
      throw error;
    }
  },

  likePost: async (postId) => {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  },

  addComment: async (postId, content) => {
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, { content });
      return response.data;
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
}
export default CommunityService;