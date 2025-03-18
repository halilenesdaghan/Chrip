import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaCalendarAlt, 
  FaUniversity, 
  FaEdit, 
  FaTrash,
  FaSpinner,
  FaShare,
  FaRegCommentAlt
} from 'react-icons/fa';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import Avatar from '../components/common/Avatar';
import PollVote from '../components/poll/PollVote';
import Button from '../components/common/Button';
import CommentForm from '../components/comment/CommentForm';
import CommentList from '../components/comment/CommentList';
import api from '../api';
import { toast } from 'react-toastify';

const PollDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [poll, setPoll] = useState(null);
  const [userVote, setUserVote] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [commentsLoading, setCommentsLoading] = useState(true); 
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // Anket verilerini getir
  useEffect(() => {
    const fetchPoll = async () => {
      try {
        setLoading(true);
        
        // Anket detaylarını getir
        const response = await api.get(`/polls/${id}`);
        setPoll(response.data.data);
        
        // Kullanıcının oy kullanıp kullanmadığını kontrol et
        if (isAuthenticated) {
          try {
            const resultsResponse = await api.get(`/polls/${id}/results`);
            const votedOption = resultsResponse.data.data.voted_option;
            if (votedOption) {
              setUserVote(votedOption.option_id);
              setShowResults(true);
            }
          } catch (err) {
            console.error('Error checking user vote:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching poll:', err);
        setError('Anket bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPoll();
  }, [id, isAuthenticated]);
  
  // Yorumları getir (Anket API'si yorum desteği sağladığını varsayalım)
  useEffect(() => {
    // Gerçek uygulamada burada anket yorumları API endpoint'i olabilir
    // Şimdilik boş dizi döndürelim
    setCommentsLoading(false);
    setComments([]);
  }, [id]);
  
  // Tarih formatı
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };
  
  // Bitiş tarihi hesapla
  const getRemainingTime = (endDateString) => {
    if (!endDateString) return 'Süresiz';
    
    try {
      const endDate = new Date(endDateString);
      const now = new Date();
      
      if (endDate <= now) {
        return 'Sona erdi';
      }
      
      const daysLeft = differenceInDays(endDate, now);
      if (daysLeft === 0) return 'Bugün sona eriyor';
      if (daysLeft === 1) return 'Yarın sona eriyor';
      
      return `${daysLeft} gün kaldı`;
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };
  
  // Anket aktif mi?
  const isActive = (poll) => {
    if (!poll.bitis_tarihi) return true;
    
    try {
      const endDate = new Date(poll.bitis_tarihi);
      return new Date() <= endDate;
    } catch (error) {
      return true;
    }
  };
  
  // Oy kullanıldığında
  const handleVoteComplete = (optionId, results) => {
    if (optionId) {
      setUserVote(optionId);
    }
    setShowResults(!showResults);
  };
  
  // Paylaş fonksiyonu
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: poll.baslik,
        text: poll.aciklama || 'Ankete katılmak için tıklayın',
        url: window.location.href,
      })
      .then(() => console.log('Shared successfully'))
      .catch((error) => console.log('Error sharing:', error));
    } else {
      // Web Share API desteklemiyorsa kopyala
      navigator.clipboard.writeText(window.location.href);
      toast.success('Anket bağlantısı panoya kopyalandı');
    }
  };
  
  // Anket silme
  const handleDeletePoll = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/polls/${id}`);
      toast.success('Anket başarıyla silindi.');
      navigate('/polls');
    } catch (err) {
      console.error('Error deleting poll:', err);
      toast.error('Anket silinirken bir hata oluştu.');
      setDeleteLoading(false);
    }
  };
  
  // Yorum ekleme
  const handleAddComment = (newComment) => {
    setComments([newComment, ...comments]);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }
  
  if (error || !poll) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-700">
        <p>
          {error || 'Anket bulunamadı.'} 
          <Link to="/polls" className="ml-2 underline">Anketler sayfasına dön</Link>
        </p>
      </div>
    );
  }
  
  // Kullanıcının anket sahibi olup olmadığını kontrol et
  const isOwner = isAuthenticated && user && poll.acan_kisi_id === user.user_id;
  
  // Anketin aktif olup olmadığını kontrol et
  const active = isActive(poll);
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {/* Aktif durum */}
        {active ? (
          <div className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-4">
            Aktif Anket
          </div>
        ) : (
          <div className="inline-block bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-4">
            Sona Ermiş Anket
          </div>
        )}
        
        {/* Başlık ve eylemler */}
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{poll.baslik}</h1>
          
          {isOwner && (
            <div className="flex space-x-2">
              <Link to={`/polls/edit/${id}`}>
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
            <span>{formatDate(poll.acilis_tarihi)}</span>
          </div>
          
          {/* Üniversite (varsa) */}
          {poll.universite && (
            <div className="flex items-center">
              <FaUniversity className="mr-1" />
              <span>{poll.universite}</span>
            </div>
          )}
          
          {/* Kalan süre / Sona erme durumu */}
          <div className={`flex items-center ${active ? 'text-green-600' : 'text-red-600'}`}>
            <span>{poll.bitis_tarihi ? getRemainingTime(poll.bitis_tarihi) : 'Süresiz'}</span>
          </div>
          
          {/* Kategori (varsa) */}
          {poll.kategori && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
              {poll.kategori}
            </span>
          )}
        </div>
        
        {/* Anket içeriği */}
        {poll.aciklama && (
          <div className="prose max-w-none mb-6">
            <p className="text-gray-700 whitespace-pre-line">{poll.aciklama}</p>
          </div>
        )}
        
        {/* Alt bilgiler: Anket sahibi */}
        <div className="flex items-center py-4 border-t border-b border-gray-200">
          <Avatar 
            src={poll.acan_kisi?.profil_resmi_url}
            alt={poll.acan_kisi?.username || 'Kullanıcı'}
            size="md"
            className="mr-3"
          />
          <div>
            <div className="font-medium text-gray-900">
              {poll.acan_kisi?.username || 'Anonim'}
            </div>
            <div className="text-sm text-gray-500">Anket sahibi</div>
          </div>
        </div>
        
        {/* Paylaşma ve yorum sayısı */}
        <div className="flex items-center mt-4 space-x-4">
          {/* Paylaş buton */}
          <button
            onClick={handleShare}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <FaShare className="mr-1" />
            <span>Paylaş</span>
          </button>
          
          {/* Yorum sayısı */}
          <div className="flex items-center text-gray-600">
            <FaRegCommentAlt className="mr-1" />
            <span>{comments.length}</span>
          </div>
        </div>
      </div>
      
      {/* Anket oy kullanma / sonuçlar */}
      <div className="mt-8">
        <PollVote 
          poll={poll}
          onVoteComplete={handleVoteComplete}
          showResults={showResults}
          initialVotedOptionId={userVote}
        />
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Anketi Sil</h3>
            <p className="text-gray-700 mb-6">
              Bu anketi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
                onClick={handleDeletePoll}
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

export default PollDetail;