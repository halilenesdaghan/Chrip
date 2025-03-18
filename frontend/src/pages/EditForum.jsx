import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';
import ForumForm from '../components/forum/ForumForm';
import api from '../api';

const EditForum = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [forum, setForum] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Forum verilerini getir
  useEffect(() => {
    const fetchForum = async () => {
      try {
        // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
        if (!isAuthenticated) {
          navigate('/login');
          return;
        }
        
        setLoading(true);
        const response = await api.get(`/forums/${id}`);
        
        const forumData = response.data.data;
        setForum(forumData);
        
        // Forum sahibi değilse detay sayfasına yönlendir
        if (forumData.acan_kisi_id !== user.user_id) {
          toast.error('Bu forumu düzenleme yetkiniz yok.');
          navigate(`/forums/${id}`);
          return;
        }
        
        // Form için başlangıç değerlerini ayarla
        setInitialValues({
          baslik: forumData.baslik || '',
          aciklama: forumData.aciklama || '',
          foto_urls: forumData.foto_urls || [],
          kategori: forumData.kategori || '',
        });
        
      } catch (err) {
        console.error('Error fetching forum:', err);
        setError('Forum bilgileri yüklenirken bir hata oluştu.');
        toast.error('Forum bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchForum();
  }, [id, isAuthenticated, user, navigate]);

  // Forumu güncelle
  const handleSubmit = async (forumData) => {
    try {
      setIsSubmitting(true);
      const response = await api.put(`/forums/${id}`, forumData);
      
      // Başarılı yanıt
      if (response.data.status === 'success') {
        toast.success('Forum başarıyla güncellendi');
        // Güncellenen forumun detay sayfasına yönlendir
        navigate(`/forums/${id}`);
      } else {
        throw new Error(response.data.message || 'Forum güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Error updating forum:', err);
      toast.error(err.response?.data?.message || 'Forum güncellenirken bir hata oluştu');
      setError('Forum güncellenirken bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 p-4 rounded-md text-red-700">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Forum Düzenle</h1>
        <p className="text-gray-600 mt-2">
          Forumunuzu güncelleyin ve içeriğini değiştirin.
        </p>
      </div>
      
      <ForumForm 
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        isEdit={true}
      />
    </div>
  );
};

export default EditForum;