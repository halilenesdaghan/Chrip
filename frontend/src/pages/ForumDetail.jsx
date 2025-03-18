import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaThumbsUp, 
  FaThumbsDown, 
  FaRegThumbsUp, 
  FaRegThumbsDown, 
  FaRegComment, 
  FaCalendarAlt, 
  FaUniversity, 
  FaEdit, 
  FaTrash,
  FaSpinner,
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Avatar from '../components/common/Avatar';
import CommentList from '../components/comment/CommentList';
import CommentForm from '../components/comment/CommentForm';
import Button from '../components/common/Button';
import api from '../api';
import { toast } from 'react-toastify';

const ForumDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [forum, setForum] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [userReaction, setUserReaction] = useState(null); // 'begeni', 'begenmeme', or null
  const [reactionLoading, setReactionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Forum verilerini getir
  useEffect(() => {
    const fetchForum = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/forums/${id}`);
        setForum(response.data.data);
      } catch (err) {
        console.error('Error fetching forum:', err);
        setError('Forum bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchForum();
  }, [id]);
  
  // Yorumları getir
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const response = await api.get(`/forums/${id}/comments`);
        setComments(response.data.data || []);
      } catch (err) {
        console.error('Error fetching comments:', err);
        // Yorumlar yüklenmediğinde varsayılan boş dizi kullanılır
      } finally {
        setCommentsLoading(false);
      }
    };
    
    if (forum) {
      fetchComments();
    }
  }, [id, forum]);
  
  // Tarih formatı
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };
  
  // Yorum ekleme
  const handleAddComment = (newComment) => {
    setComments([newComment, ...comments]);
  };
  
  // Reaksiyon ekleme
  const handleReaction = async (type) => {
    if (!isAuthenticated) {
      toast.warning('Lütfen önce giriş yapın.');
      return;
    }
    
    try {
      setReactionLoading(true);
      const response = await api.post(`/forums/${id}/react`, {
        reaction_type: type
      });
      
      // Reaksiyon sayılarını güncelle
      setForum({
        ...forum,
        begeni_sayisi: response.data.data.begeni_sayisi,
        begenmeme_sayisi: response.data.data.begenmeme_sayisi
      });
      
      // Kullanıcının reaksiyonunu güncelle
      setUserReaction(type);
      
      toast.success('Reaksiyonunuz kaydedildi.');
    } catch (err) {
      console.error('Error adding reaction:', err);
      toast.error('Reaksiyon eklenirken bir hata oluştu.');
    } finally {
      setReactionLoading(false);
    }
  };
  
  // Forum silme
  const handleDeleteForum = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/forums/${id}`);
      toast.success('Forum başarıyla silindi.');
      navigate('/forums');
    } catch (err) {
      console.error('Error deleting forum:', err);
      toast.error('Forum silinirken bir hata oluştu.');
      setDeleteLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }
  
  if (error || !forum) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-700">
        <p>
          {error || 'Forum bulunamadı.'} 
          <Link to="/forums" className="ml-2 underline">Forumlar sayfasına dön</Link>
        </p>
      </div>
    );
  }
  
  // Kullanıcının forum sahibi olup olmadığını kontrol et
  const isOwner = isAuthenticated && user && forum.acan_kisi_id === user.user_id;
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {/* Başlık ve eylemler */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{forum.baslik}</h1>
          
          {isOwner && (
            <div className="flex space-x-2">
              <Link to={`/forums/edit/${id}`}>
                <Button variant="outline" size="sm">
                  <FaEdit className="mr-1" /> Düzenle
                </Button>
              </Link>
              
              <Button 
                variant="danger" 
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <FaTrash className="mr-1" /> Sil
              </Button>
            </div>
          )}
        </div>
        
        {/* Meta bilgiler */}
        <div className="flex flex-wrap items-center text-sm text-gray-500 mb-6 gap-4">
          {/* Tarih */}
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1" />
            <span>{formatDate(forum.acilis_tarihi)}</span>
          </div>
          
          {/* Üniversite (varsa) */}
          {forum.universite && (
            <div className="flex items-center">
              <FaUniversity className="mr-1" />
              <span>{forum.universite}</span>
            </div>
          )}
          
          {/* Kategori (varsa) */}
          {forum.kategori && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
              {forum.kategori}
            </span>
          )}
        </div>
        
        {/* Forum görselleri */}
        {forum.foto_urls && forum.foto_urls.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-1 gap-4">
              {forum.foto_urls.map((url, index) => (
                <img 
                  key={index}
                  src={url}
                  alt={`${forum.baslik} - Görsel ${index + 1}`}
                  className="w-full h-auto rounded-lg"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Forum içeriği */}
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-line">{forum.aciklama}</p>
        </div>
        
        {/* Alt bilgiler: Forum sahibi */}
        <div className="flex items-center py-4 border-t border-b border-gray-200">
          <Avatar 
            src={forum.acan_kisi?.profil_resmi_url}
            alt={forum.acan_kisi?.username || 'Kullanıcı'}
            size="md"
            className="mr-3"
          />
          <div>
            <div className="font-medium text-gray-900">
              {forum.acan_kisi?.username || 'Anonim'}
            </div>
            <div className="text-sm text-gray-500">Forum sahibi</div>
          </div>
        </div>
        
        {/* Reaksiyonlar ve yorum sayısı */}
        <div className="flex items-center mt-6 space-x-4">
          {/* Beğeni düğmesi */}
          <button
            onClick={() => handleReaction('begeni')}
            disabled={reactionLoading}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md ${
              userReaction === 'begeni' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {userReaction === 'begeni' ? (
              <FaThumbsUp className="mr-1" />
            ) : (
              <FaRegThumbsUp className="mr-1" />
            )}
            <span>{forum.begeni_sayisi || 0}</span>
          </button>
          
          {/* Beğenmeme düğmesi */}
          <button
            onClick={() => handleReaction('begenmeme')}
            disabled={reactionLoading}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-md ${
              userReaction === 'begenmeme' 
                ? 'bg-red-100 text-red-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {userReaction === 'begenmeme' ? (
              <FaThumbsDown className="mr-1" />
            ) : (
              <FaRegThumbsDown className="mr-1" />
            )}
            <span>{forum.begenmeme_sayisi || 0}</span>
          </button>
          
          {/* Yorum sayısı */}
          <div className="flex items-center text-gray-600">
            <FaRegComment className="mr-1" />
            <span>{comments.length}</span>
          </div>
        </div>
      </div>
      
      {/* Yorum formu */}
      {isAuthenticated ? (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Yorum Ekle</h3>
          <CommentForm forumId={id} onCommentAdded={handleAddComment} />
        </div>
      ) : (
        <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-md">
          <p>
            Yorum yapabilmek için 
            <Link to="/login" className="font-medium underline mx-1">giriş yapmalı</Link>
            veya
            <Link to="/register" className="font-medium underline mx-1">kaydolmalısınız</Link>.
          </p>
        </div>
      )}
      
      {/* Yorumlar */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Yorumlar</h3>
        
        {commentsLoading ? (
          <div className="flex justify-center py-8">
            <FaSpinner className="animate-spin h-6 w-6 text-blue-500" />
          </div>
        ) : comments.length > 0 ? (
          <CommentList comments={comments} />
        ) : (
          <p className="text-gray-500 text-center py-8">
            Henüz yorum yok. İlk yorumu siz yapın!
          </p>
        )}
      </div>
      
      {/* Silme onay modalı */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Forumu Sil</h3>
            <p className="text-gray-700 mb-6">
              Bu forumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
                onClick={handleDeleteForum}
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

export default ForumDetail;