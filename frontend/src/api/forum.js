import api from './index';

const forumService = {
  // Tüm forumları getirme
  getAllForums: async (page = 1, per_page = 10, kategori = null, universite = null, search = null) => {
    const params = { page, per_page };
    if (kategori) params.kategori = kategori;
    if (universite) params.universite = universite;
    if (search) params.search = search;

    const response = await api.get('/forums', { params });
    return response.data;
  },

  // Belirli bir forumu getirme
  getForum: async (forumId) => {
    const response = await api.get(`/forums/${forumId}`);
    return response.data;
  },

  // Yeni forum oluşturma
  createForum: async (forumData) => {
    const response = await api.post('/forums', forumData);
    return response.data;
  },

  // Forum güncelleme
  updateForum: async (forumId, forumData) => {
    const response = await api.put(`/forums/${forumId}`, forumData);
    return response.data;
  },

  // Forum silme
  deleteForum: async (forumId) => {
    const response = await api.delete(`/forums/${forumId}`);
    return response.data;
  },

  // Forum yorumlarını getirme
  getForumComments: async (forumId, page = 1, per_page = 20) => {
    const response = await api.get(`/forums/${forumId}/comments`, {
      params: { page, per_page }
    });
    return response.data;
  },

  // Foruma reaksiyon verme (beğeni/beğenmeme)
  reactToForum: async (forumId, reactionType) => {
    const response = await api.post(`/forums/${forumId}/react`, {
      reaction_type: reactionType // 'begeni' veya 'begenmeme'
    });
    return response.data;
  }
};

export default forumService;