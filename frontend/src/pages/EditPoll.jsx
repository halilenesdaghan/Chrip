import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa';
import GroupForm from '../components/group/GroupForm';
import api from '../api';

const EditGroup = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [group, setGroup] = useState(null);
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null);

  // Grup verilerini getir
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
        if (!isAuthenticated) {
          navigate('/login');
          return;
        }
        
        setLoading(true);
        const response = await api.get(`/groups/${id}`);
        
        const groupData = response.data.data;
        setGroup(groupData);
        
        // Kullanıcı rolünü kontrol et
        let hasEditPermission = false;
        let userRoleInGroup = null;
        
        // Grup kurucusu mu?
        if (groupData.olusturan_id === user.user_id) {
          hasEditPermission = true;
          userRoleInGroup = 'yonetici';
        } else {
          // Grup üyelerinde yönetici veya moderatör mü?
          if (groupData.uyeler && Array.isArray(groupData.uyeler)) {
            for (const member of groupData.uyeler) {
              if (member.kullanici_id === user.user_id) {
                userRoleInGroup = member.rol;
                if (member.rol === 'yonetici' || member.rol === 'moderator') {
                  hasEditPermission = true;
                }
                break;
              }
            }
          }
        }
        
        setUserRole(userRoleInGroup);
        
        // Düzenleme yetkisi yoksa detay sayfasına yönlendir
        if (!hasEditPermission) {
          toast.error('Bu grubu düzenleme yetkiniz yok.');
          navigate(`/groups/${id}`);
          return;
        }
        
        // Form için başlangıç değerlerini ayarla
        setInitialValues({
          grup_adi: groupData.grup_adi || '',
          aciklama: groupData.aciklama || '',
          logo_url: groupData.logo_url || '',
          kapak_resmi_url: groupData.kapak_resmi_url || '',
          gizlilik: groupData.gizlilik || 'acik',
          kategoriler: groupData.kategoriler || [],
        });
        
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Grup bilgileri yüklenirken bir hata oluştu.');
        toast.error('Grup bilgileri yüklenemedi.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroup();
  }, [id, isAuthenticated, user, navigate]);

  // Grubu güncelle
  const handleSubmit = async (groupData) => {
    try {
      setIsSubmitting(true);
      const response = await api.put(`/groups/${id}`, groupData);
      
      // Başarılı yanıt
      if (response.data.status === 'success') {
        toast.success('Grup başarıyla güncellendi');
        // Güncellenen grubun detay sayfasına yönlendir
        navigate(`/groups/${id}`);
      } else {
        throw new Error(response.data.message || 'Grup güncellenirken bir hata oluştu');
      }
    } catch (err) {
      console.error('Error updating group:', err);
      toast.error(err.response?.data?.message || 'Grup güncellenirken bir hata oluştu');
      setError('Grup güncellenirken bir hata oluştu.');
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
        <h1 className="text-2xl font-bold text-gray-900">Grup Düzenle</h1>
        <p className="text-gray-600 mt-2">
          Grubunuzun bilgilerini güncelleyin.
        </p>
      </div>
      
      <GroupForm 
        initialValues={initialValues}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
        isEdit={true}
      />
    </div>
  );
};

export default EditGroup;