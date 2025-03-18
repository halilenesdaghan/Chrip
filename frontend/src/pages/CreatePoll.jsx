import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import PollForm from '../components/poll/PollForm';
import api from '../api';

const CreatePoll = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (pollData) => {
    try {
      setIsLoading(true);
      const response = await api.post('/polls', pollData);
      
      // Başarılı yanıt
      if (response.data.status === 'success') {
        toast.success('Anket başarıyla oluşturuldu');
        // Oluşturulan anketin detay sayfasına yönlendir
        navigate(`/polls/${response.data.data.poll_id}`);
      } else {
        throw new Error(response.data.message || 'Anket oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      console.error('Error creating poll:', err);
      toast.error(err.response?.data?.message || 'Anket oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Anket Oluştur</h1>
        <p className="text-gray-600 mt-2">
          Kullanıcıların görüşlerini toplamak için yeni bir anket oluşturun.
        </p>
      </div>
      
      <PollForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
        initialValues={{
          universite: user?.universite || '',
        }}
      />
    </div>
  );
};

export default CreatePoll;