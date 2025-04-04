import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { 
  FaRegThumbsUp, 
  FaRegThumbsDown, 
  FaThumbsUp, 
  FaThumbsDown, 
  FaReply, 
  FaEllipsisV, 
  FaEdit, 
  FaTrash, 
  FaSpinner 
} from 'react-icons/fa';
import Avatar from '../common/Avatar';
import CommentForm from './CommentForm';
import Button from '../common/Button';
import api from '../../api';
import { toast } from 'react-toastify';

const CommentCard = ({ comment, onUpdate, onDelete, showReplyForm = true, isReply = false }) => {
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const [showReply, setShowReply] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [userReaction, setUserReaction] = useState(null); // 'begeni', 'begenmeme', or null
  const [reactionLoading, setReactionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [ comment_creator_info, setCommentCreatorInfo ] = useState(null);

  const config = {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };

  // When The Card is Mounted asks for the created info of the comment using /comments/:comment_id/creator_info
  useEffect(() => {
    const getCommentCreatorInfo = async () => {
      try {
        const response = await api.get(`/comments/${comment.comment_id}/creator_info`, config);
        if (response.data.status === 'success') {
          setCommentCreatorInfo(response.data.data);
        }
      } catch (err) {
        console.error('Error getting comment creator info:', err);
      }
    }
    getCommentCreatorInfo();
  }, []);
  // Tarih formatla
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };
  
  // Reaksiyon ekleme işlemi
  const handleReaction = async (type) => {
    if (!isAuthenticated) {
      toast.warning('Lütfen önce giriş yapın.');
      return;
    }

    try {
      setReactionLoading(true); 
      const response = await api.post(`/comments/${comment.comment_id}/react`, {
        reaction_type: type
      }, config);
      
      if (response.data.status === 'success') {
        // Başarılı reaksiyon
        setUserReaction(type);
        
        // Yorum'u güncelle
        if (onUpdate) {
          onUpdate({
            ...comment,
            like_count: response.data.data.like_count,
            dislike_count: response.data.data.dislike_count
          });
        }
        
        toast.success('Reaksiyonunuz kaydedildi.');
      }
    } catch (err) {
      console.error('Error adding reaction:', err);
      toast.error('Reaksiyon eklenirken bir hata oluştu.');
    } finally {
      setReactionLoading(false);
    }
  };
  
  // Yorumu silme işlemi
  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      const response = await api.delete(`/comments/${comment.comment_id}`);
      
      if (response.data.status === 'success') {
        // Başarılı silme
        toast.success('Yorum başarıyla silindi.');
        
        if (onDelete) {
          onDelete(comment.comment_id);
        }
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
      toast.error('Yorum silinirken bir hata oluştu.');
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Yanıt eklendiğinde
  const handleReplyAdded = (newReply) => {
    setShowReply(false);
    // Bu bileşenin temel amacı tek bir yorumu göstermektir
    // Yanıtları göstermek, üst bileşenin sorumluluğundadır
    toast.success('Yanıt başarıyla eklendi.');
  };
  
  // Kullanıcının bu yorumu düzenleme yetkisi var mı?
  const canEdit = isAuthenticated && user && comment.creator_id === user.user_id;

  return (
    <div className={`bg-white rounded-lg ${isReply ? 'pl-4 border-l-2 border-gray-200' : 'border border-gray-200'} p-4 mb-4`}>
      {/* Yorum içeriği */}
      <div className="flex">
        {/* Kullanıcı avatarı */}
        <Avatar
          src={comment_creator_info?.profile_image_url}
          alt={comment_creator_info?.username || 'Kullanıcı'}
          size="md"
          className="mr-3 flex-shrink-0"
        />
        
        {/* Yorum metni ve bilgileri */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-medium text-gray-900">
                {comment_creator_info?.username || 'Anonim'}
              </div>
              <div className="text-xs text-gray-500">
                {formatDate(comment.created_at)}
              </div>
            </div>
            
            {/* Eylemler menüsü (sadece yorum sahibine gösterilir) */}
            {canEdit && (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaEllipsisV />
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 top-8 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowDropdown(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <FaEdit className="mr-2" /> Düzenle
                      </button>
                      <button
                        onClick={() => {
                          setShowDeleteConfirm(true);
                          setShowDropdown(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        <FaTrash className="mr-2" /> Sil
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Yorum içeriği */}
          <div className="mt-2">
            <p className="text-gray-700 whitespace-pre-line">{comment.content}</p>
          </div>
          
          {/* Yorum fotoğrafları */}
          {comment.photo_urls && comment.photo_urls.length > 0 && (
            <div className="mt-3">
              <div className="flex flex-wrap gap-2">
                {comment.photo_urls.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Görsel ${index + 1}`}
                    className="h-20 w-20 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Reaksiyonlar ve yanıt butonu */}
          <div className="mt-3 flex space-x-4">
            {/* Beğeni */}
            <button
              onClick={() => handleReaction('like')}
              disabled={reactionLoading}
              className={`flex items-center text-sm ${
                userReaction === 'like' 
                  ? 'text-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {userReaction === 'begeni' ? (
                <FaThumbsUp className="mr-1" />
              ) : (
                <FaRegThumbsUp className="mr-1" />
              )}
              <span>{comment.like_count || 0}</span>
            </button>
            
            {/* Beğenmeme */}
            <button
              onClick={() => handleReaction('dislike')}
              disabled={reactionLoading}
              className={`flex items-center text-sm ${
                userReaction === 'begenmeme' 
                  ? 'text-red-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {userReaction === 'dislike' ? (
                <FaThumbsDown className="mr-1" />
              ) : (
                <FaRegThumbsDown className="mr-1" />
              )}
              <span>{comment.dislike_count || 0}</span>
            </button>
            
            {/* Yanıt butonu */}
            {showReplyForm && isAuthenticated && (
              <button
                onClick={() => setShowReply(!showReply)}
                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <FaReply className="mr-1" />
                <span>Yanıtla</span>
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Yanıt formu */}
      {showReply && (
        <div className="mt-4 ml-12">
          <CommentForm
            commented_on_id={comment.comment_id}
            onCommentAdded={handleReplyAdded}
            onCancel={() => setShowReply(false)}
            isReply={true}
            placeholder="Yanıtınızı yazın..."
          />
        </div>
      )}
      
      {/* Silme onay modalı */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Yorumu Sil</h3>
            <p className="text-gray-700 mb-6">
              Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="light"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                İptal
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> Siliniyor...
                  </>
                ) : (
                  'Evet, Sil'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

CommentCard.propTypes = {
  comment: PropTypes.shape({
    comment_id: PropTypes.string.isRequired,
    commented_on_id: PropTypes.string.isRequired,
    creator_id: PropTypes.string,
    content: PropTypes.string.isRequired,
    created_at: PropTypes.string,
    photo_urls: PropTypes.arrayOf(PropTypes.string),
    like_count: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    dislike_count: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    latest_sub_comment: PropTypes.oneOfType([
      PropTypes.shape({
        comment_id: PropTypes.string,
        commented_on_id: PropTypes.string,
        creator_id: PropTypes.string,
        content: PropTypes.string,
        created_at: PropTypes.string,
        photo_urls: PropTypes.arrayOf(PropTypes.string),
        like_count: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number
        ]),
        dislike_count: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number
        ]),
      }),
      PropTypes.oneOf([null])
    ])
  }).isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  showReplyForm: PropTypes.bool,
  isReply: PropTypes.bool
};

export default CommentCard;