import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { FaImage, FaPaperPlane, FaSpinner, FaTimes } from 'react-icons/fa';
import api from '../../api';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import MediaUploader from '../media/MediaUploader';
import { toast } from 'react-toastify';

const CommentForm = ({ 
  forumId, 
  parentCommentId = null, 
  onCommentAdded,
  onCancel = null,
  placeholder = 'Yorumunuzu yazın...'
}) => {
  const [content, setContent] = useState('');
  const [photoUrls, setPhotoUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.warning('Lütfen bir yorum yazın');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const commentData = {
        forum_id: forumId,
        icerik: content,
        foto_urls: photoUrls,
      };
      
      // Eğer yanıt ise, üst yorum ID'sini ekle
      if (parentCommentId) {
        commentData.ust_yorum_id = parentCommentId;
      }
      
      const response = await api.post('/comments', commentData);
      
      // Başarılı yanıt
      if (response.data.status === 'success') {
        // Form alanlarını temizle
        setContent('');
        setPhotoUrls([]);
        setShowMediaUploader(false);
        
        // Eklenen yorumu üst bileşene bildir
        if (onCommentAdded) {
          onCommentAdded(response.data.data);
        }
        
        toast.success(parentCommentId ? 'Yanıt başarıyla eklendi' : 'Yorum başarıyla eklendi');
      } else {
        throw new Error(response.data.message || 'Yorum eklenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Error adding comment:', err);
      toast.error(err.response?.data?.message || 'Yorum eklenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleMediaAdd = (mediaUrl) => {
    setPhotoUrls([...photoUrls, mediaUrl]);
    setShowMediaUploader(false);
  };
  
  const handleRemoveMedia = (index) => {
    const updatedUrls = photoUrls.filter((_, i) => i !== index);
    setPhotoUrls(updatedUrls);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          {/* Kullanıcı avatarı */}
          <Avatar 
            src={user?.profil_resmi_url}
            alt={user?.username}
            size="md"
          />
          
          {/* Yorum içeriği */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
              disabled={isSubmitting}
            />
            
            {/* Yüklenen görseller */}
            {photoUrls.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {photoUrls.map((url, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={url} 
                        alt={`Görsel ${index + 1}`} 
                        className="h-16 w-16 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMedia(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <FaTimes size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Medya yükleme */}
            {showMediaUploader && (
              <div className="mt-3 border border-gray-200 rounded-md p-3">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-medium">Görsel Ekle</h4>
                  <button
                    type="button"
                    onClick={() => setShowMediaUploader(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes size={14} />
                  </button>
                </div>
                <MediaUploader
                  onUploadComplete={handleMediaAdd}
                  modelType="comment"
                  maxFileSize={2}
                />
              </div>
            )}
            
            {/* Form butonları */}
            <div className="flex justify-between mt-3">
              <div className="flex space-x-2">
                {!showMediaUploader && (
                  <button
                    type="button"
                    onClick={() => setShowMediaUploader(true)}
                    className="text-gray-500 hover:text-blue-500"
                    disabled={isSubmitting}
                  >
                    <FaImage size={18} />
                  </button>
                )}
              </div>
              
              <div className="flex space-x-2">
                {onCancel && (
                  <Button
                    type="button"
                    variant="light"
                    size="sm"
                    onClick={onCancel}
                    disabled={isSubmitting}
                  >
                    İptal
                  </Button>
                )}
                
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={!content.trim() || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-1" /> Gönderiliyor
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-1" /> Gönder
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

CommentForm.propTypes = {
  forumId: PropTypes.string.isRequired,
  parentCommentId: PropTypes.string,
  onCommentAdded: PropTypes.func,
  onCancel: PropTypes.func,
  placeholder: PropTypes.string,
};

export default CommentForm;