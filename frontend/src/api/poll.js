import api from './index';

const pollService = {
  // Tüm anketleri getirme
  getAllPolls: async (page = 1, per_page = 10, kategori = null, universite = null, aktif = null) => {
    const params = { page, per_page };
    if (kategori) params.kategori = kategori;
    if (universite) params.universite = universite;
    if (aktif !== null) params.aktif = aktif;

    const response = await api.get('/polls', { params });
    return response.data;
  },

  // Belirli bir anketi getirme
  getPoll: async (pollId) => {
    const response = await api.get(`/polls/${pollId}`);
    return response.data;
  },

  // Yeni anket oluşturma
  createPoll: async (pollData) => {
    const response = await api.post('/polls', pollData);
    return response.data;
  },

  // Anket güncelleme
  updatePoll: async (pollId, pollData) => {
    const response = await api.put(`/polls/${pollId}`, pollData);
    return response.data;
  },

  // Anket silme
  deletePoll: async (pollId) => {
    const response = await api.delete(`/polls/${pollId}`);
    return response.data;
  },

  // Ankete oy verme
  votePoll: async (pollId, optionId) => {
    const response = await api.post(`/polls/${pollId}/vote`, {
      option_id: optionId
    });
    return response.data;
  },

  // Anket sonuçlarını görme
  getPollResults: async (pollId) => {
    const response = await api.get(`/polls/${pollId}/results`);
    return response.data;
  }
};

export default pollService;