import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaUser,
  FaEdit, 
  FaTrash,
  FaSpinner,
  FaSignOutAlt,
  FaUserPlus,
  FaLock,
  FaGlobe,
  FaEyeSlash,
  FaTag
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import api from '../api';
import { toast } from 'react-toastify';

const GroupDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [membersLoading, setMembersLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userMembership, setUserMembership] = useState(null); // null, 'beklemede', 'aktif'
  const [userRole, setUserRole] = useState(null); // 'uye', 'moderator', 'yonetici'
  const [joinLoading, setJoinLoading] = useState(false);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  
  // Grup verilerini getir
  useEffect(() => {
    const fetchGroup = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/groups/${id}`);
        setGroup(response.data.data);
      } catch (err) {
        console.error('Error fetching group:', err);
        setError('Grup bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroup();
  }, [id]);
  
  // Grup üyelerini getir
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setMembersLoading(true);
        
        const response = await api.get(`/groups/${id}/members`, {
          params: {
            status: 'aktif',
            page: 1,
            per_page: 10
          }
        });
        
        setMembers(response.data.data || []);
        
        // Kullanıcının üyelik durumunu kontrol et
        if (isAuthenticated && user) {
          const currentMember = response.data.data.find(member => member.user_id === user.user_id);
          
          if (currentMember) {
            setUserMembership('aktif');
            setUserRole(currentMember.rol);
          } else {
            // Bekleyen üyelik var mı kontrol et
            try {
              const pendingResponse = await api.get(`/groups/${id}/members`, {
                params: {
                  status: 'beklemede',
                  page: 1,
                  per_page: 50
                }
              });
              
              const pendingMember = pendingResponse.data.data.find(member => member.user_id === user.user_id);
              
              if (pendingMember) {
                setUserMembership('beklemede');
              }
            } catch (err) {
              console.error('Error checking pending membership:', err);
            }
          }
        }
      } catch (err) {
        console.error('Error fetching members:', err);
        // Üyeler getirilmediğinde boş dizi kullan
        setMembers([]);
      } finally {
        setMembersLoading(false);
      }
    };
    
    if (group) {
      fetchMembers();
    }
  }, [id, group, isAuthenticated, user]);
  
  // Tarih formatı
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };
  
  // Gruba katılma işlemi
  const handleJoinGroup = async () => {
    if (!isAuthenticated) {
      toast.warning('Lütfen önce giriş yapın.');
      return;
    }
    
    try {
      setJoinLoading(true);
      const response = await api.post(`/groups/${id}/join`);
      
      if (response.data.status === 'success') {
        if (response.data.data.membership_status === 'aktif') {
          toast.success('Gruba başarıyla katıldınız.');
          setUserMembership('aktif');
          setUserRole('uye');
        } else {
          toast.info('Üyelik başvurunuz onay bekliyor.');
          setUserMembership('beklemede');
        }
      }
    } catch (err) {
      console.error('Error joining group:', err);
      toast.error(err.response?.data?.message || 'Gruba katılırken bir hata oluştu.');
    } finally {
      setJoinLoading(false);
    }
  };
  
  // Gruptan ayrılma işlemi
  const handleLeaveGroup = async () => {
    try {
      setLeaveLoading(true);
      await api.post(`/groups/${id}/leave`);
      toast.success('Gruptan başarıyla ayrıldınız.');
      setUserMembership(null);
      setUserRole(null);
      setShowLeaveConfirm(false);
    } catch (err) {
      console.error('Error leaving group:', err);
      toast.error(err.response?.data?.message || 'Gruptan ayrılırken bir hata oluştu.');
      setLeaveLoading(false);
      setShowLeaveConfirm(false);
    }
  };
  
  // Grup silme işlemi
  const handleDeleteGroup = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/groups/${id}`);
      toast.success('Grup başarıyla silindi.');
      navigate('/groups');
    } catch (err) {
      console.error('Error deleting group:', err);
      toast.error('Grup silinirken bir hata oluştu.');
      setDeleteLoading(false);
    }
  };
  
  // Gizlilik ikonu
  const PrivacyIcon = () => {
    if (!group) return null;
    
    switch (group.gizlilik) {
      case 'acik':
        return <FaGlobe className="text-green-500 mr-1" title="Açık Grup" />;
      case 'kapali':
        return <FaLock className="text-yellow-500 mr-1" title="Kapalı Grup" />;
      case 'gizli':
        return <FaEyeSlash className="text-red-500 mr-1" title="Gizli Grup" />;
      default:
        return <FaGlobe className="text-green-500 mr-1" title="Açık Grup" />;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }
  
  if (error || !group) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-700">
        <p>
          {error || 'Grup bulunamadı.'} 
          <Link to="/groups" className="ml-2 underline">Gruplar sayfasına dön</Link>
        </p>
      </div>
    );
  }
  
  // Kullanıcının grup sahibi olup olmadığını kontrol et
  const isOwner = isAuthenticated && user && group.olusturan_id === user.user_id;
  
  // Kullanıcının yönetici veya moderatör olup olmadığını kontrol et
  const isAdmin = userRole === 'yonetici' || userRole === 'moderator';
  
  // Kapak resmi
  const coverImage = group.kapak_resmi_url || 'https://via.placeholder.com/1200x400?text=Kapak+Resmi+Yok';
  
  return (
    <div className="max-w-7xl mx-auto">
      {/* Kapak resmi */}
      <div 
        className="relative h-60 bg-cover bg-center rounded-t-lg" 
        style={{ backgroundImage: `url(${coverImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent rounded-t-lg"></div>
        
        {/* Grup bilgileri (kapak üzerinde) */}
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <div className="flex items-end">
            {/* Logo */}
            <div className="mr-4 -mb-10">
              {group.logo_url ? (
                <img 
                  src={group.logo_url} 
                  alt={group.grup_adi} 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-md object-cover bg-white" 
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                  {group.grup_adi.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white">{group.grup_adi}</h1>
              <div className="flex items-center text-sm text-gray-200">
                <PrivacyIcon />
                <span className="mr-3">
                  {group.gizlilik === 'acik' ? 'Açık Grup' : 
                   group.gizlilik === 'kapali' ? 'Kapalı Grup' : 'Gizli Grup'}
                </span>
                {group.olusturulma_tarihi && (
                  <div className="flex items-center">
                    <FaCalendarAlt className="mr-1" />
                    <span>{formatDate(group.olusturulma_tarihi)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* İçerik */}
      <div className="mt-10 bg-white rounded-b-lg shadow-sm p-6">
        {/* Eylem butonları */}
        <div className="flex justify-end mb-6">
          {isAuthenticated ? (
            isOwner ? (
              <div className="flex space-x-2">
                <Link to={`/groups/edit/${id}`}>
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
            ) : userMembership === 'aktif' ? (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowLeaveConfirm(true)}
              >
                <FaSignOutAlt className="mr-1" /> Gruptan Ayrıl
              </Button>
            ) : userMembership === 'beklemede' ? (
              <div className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md text-sm">
                Üyelik başvurunuz onay bekliyor
              </div>
            ) : (
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleJoinGroup}
                disabled={joinLoading}
              >
                {joinLoading ? (
                  <FaSpinner className="animate-spin mr-1" />
                ) : (
                  <FaUserPlus className="mr-1" />
                )}
                {group.gizlilik === 'kapali' ? 'Katılmak İçin Başvur' : 'Gruba Katıl'}
              </Button>
            )
          ) : (
            <Link to="/login" className="text-blue-600 hover:underline">
              Gruba katılmak için giriş yapın
            </Link>
          )}
        </div>
        
        {/* Açıklama */}
        {group.aciklama && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Grup Hakkında</h2>
            <p className="text-gray-700 whitespace-pre-line">{group.aciklama}</p>
          </div>
        )}
        
        {/* Kategoriler */}
        {group.kategoriler && group.kategoriler.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Kategoriler</h3>
            <div className="flex flex-wrap gap-2">
              {group.kategoriler.map((kategori, index) => (
                <div 
                  key={index}
                  className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <FaTag className="mr-1 text-xs" /> {kategori}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Üyeler */}
        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Üyeler ({group.uye_sayisi || members.length})
            </h2>
            {userMembership === 'aktif' && (
              <Link 
                to={`/groups/${id}/members`} 
                className="text-blue-600 hover:underline text-sm"
              >
                Tüm üyeleri görüntüle
              </Link>
            )}
          </div>
          
          {membersLoading ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin h-6 w-6 text-blue-500" />
            </div>
          ) : members.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {members.map(member => (
                <div key={member.user_id} className="flex flex-col items-center">
                  <Link to={`/profile/${member.user_id}`}>
                    <Avatar 
                      src={member.profil_resmi_url}
                      alt={member.username}
                      size="lg"
                      className="mb-2"
                    />
                  </Link>
                  <div className="text-center">
                    <Link 
                      to={`/profile/${member.user_id}`}
                      className="font-medium text-gray-900 hover:text-blue-600"
                    >
                      {member.username}
                    </Link>
                    <div className="text-xs text-gray-500">
                      {member.rol === 'yonetici' ? 'Yönetici' : 
                       member.rol === 'moderator' ? 'Moderatör' : 'Üye'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Henüz hiç üye yok.
            </div>
          )}
        </div>
      </div>
      
      {/* Silme onay modalı */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Grubu Sil</h3>
            <p className="text-gray-700 mb-6">
              Bu grubu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
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
                onClick={handleDeleteGroup}
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
      
      {/* Ayrılma onay modalı */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Gruptan Ayrıl</h3>
            <p className="text-gray-700 mb-6">
              Bu gruptan ayrılmak istediğinizden emin misiniz?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="light"
                onClick={() => setShowLeaveConfirm(false)}
                disabled={leaveLoading}
              >
                İptal
              </Button>
              <Button
                variant="danger"
                onClick={handleLeaveGroup}
                disabled={leaveLoading}
              >
                {leaveLoading ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" /> İşleniyor...
                  </>
                ) : (
                  'Evet, Ayrıl'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;