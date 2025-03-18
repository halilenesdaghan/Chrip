import api from './index';

const commentService = {
  // Yorum oluşturma
  createComment: async (commentData) => {
    const response = await api.post('/comments', commentData);
    return response.data;
  },

  // Yorum getirme
  getComment: async (commentId) => {
    const response = await api.get(`/comments/${commentId}`);
    return response.data;
  },

  // Yorum güncelleme
  updateComment: async (commentId, commentData) => {
    const response = await api.put(`/comments/${commentId}`, commentData);
    return response.data;
  },

  // Yorum silme
  deleteComment: async (commentId) => {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },

  // Yoruma yanıtları getirme
  getCommentReplies: async (commentId, page = 1, per_page = 20) => {
    const response = await api.get(`/comments/${commentId}/replies`, {
      params: { page, per_page }
    });
    return response.data;
  },

  // Yoruma reaksiyon verme (beğeni/beğenmeme)
  reactToComment: async (commentId, reactionType) => {
    const response = await api.post(`/comments/${commentId}/react`, {
      reaction_type: reactionType // 'begeni' veya 'begenmeme'
    });
    return response.data;
  }
};

export default commentService;