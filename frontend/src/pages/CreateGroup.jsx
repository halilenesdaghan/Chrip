import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import GroupForm from '../components/group/GroupForm';
import api from '../api';

const CreateGroup = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (groupData) => {
    try {
      setIsLoading(true);
      const response = await api.post('/groups', groupData);
      
      // Başarılı yanıt
      if (response.data.status === 'success') {
        toast.success('Grup başarıyla oluşturuldu');
        // Oluşturulan grubun detay sayfasına yönlendir
        navigate(`/groups/${response.data.data.group_id}`);
      } else {
        throw new Error(response.data.message || 'Grup oluşturulurken bir hata oluştu');
      }
    } catch (err) {
      console.error('Error creating group:', err);
      toast.error(err.response?.data?.message || 'Grup oluşturulurken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Grup Oluştur</h1>
        <p className="text-gray-600 mt-2">
          Ortak ilgi alanlarına sahip insanlarla bağlantı kurmak için bir grup oluşturun.
        </p>
      </div>
      
      <GroupForm 
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CreateGroup;