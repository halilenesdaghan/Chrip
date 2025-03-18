import api from './index';

const mediaService = {
  // Tekil dosya yükleme
  uploadFile: async (file, metadata = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Metadata ekle
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    
    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Çoklu dosya yükleme
  uploadMultipleFiles: async (files, metadata = {}) => {
    const formData = new FormData();
    
    files.forEach(file => {
      formData.append('files', file);
    });
    
    // Metadata ekle
    Object.keys(metadata).forEach(key => {
      formData.append(key, metadata[key]);
    });
    
    const response = await api.post('/media/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
  
  // Dosya silme
  deleteFile: async (fileInfo) => {
    const response = await api.post('/media/delete', fileInfo);
    return response.data;
  },
  
  // Dosya URL'i alma
  getFileUrl: async (fileInfo, expires = 3600) => {
    const response = await api.post('/media/url', {
      ...fileInfo,
      expires
    });
    return response.data;
  },
  
  // Model tipine göre medya getirme
  getMediaByModel: async (modelType, modelId) => {
    const response = await api.get(`/media/by-model/${modelType}/${modelId}`);
    return response.data;
  },
  
  // Kullanıcı medyalarını getirme
  getUserMedia: async (userId, page = 1, per_page = 20, modelType = null) => {
    const params = { page, per_page };
    if (modelType) params.model_type = modelType;
    
    const response = await api.get(`/media/user/${userId}`, { params });
    return response.data;
  }
};

export default mediaService;