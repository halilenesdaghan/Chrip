import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import ForumForm from '../components/forum/ForumForm';
import api from '../api';

const CreateForum = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (forumData) => {
    try {
      setIsLoading(true);
      const response = await api.post('/forums', forumData);
      
      // Başarılı yanıt
      if (response.data.status === 'success') {
        toast.success('Forum başarıyla oluşturuldu');
        // Oluşturulan forumun detay sayfasına yönlendir
        navigate(`/forums/${response.data.data.forum_id}`);
      } else {
        throw new Error(response.data.message || 'Forum oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      console.error('Error creating forum:', err);
      toast.error(err.response?.data?.message || 'Forum oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Forum Oluştur</h1>
        <p className="text-gray-600 mt-2">
          Bir konu hakkında diğer kullanıcılarla tartışmak için yeni bir forum oluşturun.
        </p>
      </div>
      
      <ForumForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialValues={{
          universite: user?.universite || '',
        }}
      />
    </div>
  );
};

export default CreateForum;