import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaEnvelope, 
  FaGraduationCap, 
  FaMars, 
  FaVenus, 
  FaGenderless,
  FaEdit,
  FaSpinner,
  FaCalendarAlt,
  FaComments,
  FaPoll,
  FaUsers
} from 'react-icons/fa';
import { Tab } from '@headlessui/react';
import { updateUser } from '../store/authSlice';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import ForumCard from '../components/forum/ForumCard';
import PollCard from '../components/poll/PollCard';
import api from '../api';
import { toast } from 'react-toastify';

// Tab panel bileşeni
function TabPanel({ children, className = '' }) {
  return (
    <div className={`py-4 ${className}`}>
      {children}
    </div>
  );
}

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userId } = useParams(); // URL'den kullanıcı ID'si (varsa)
  
  const { user: authUser, isAuthenticated } = useSelector((state) => state.auth);
  
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  
  // Tab içerikleri
  const [activeTab, setActiveTab] = useState(0);
  const [forums, setForums] = useState([]);
  const [forumsLoading, setForumsLoading] = useState(false);
  const [forumsError, setForumsError] = useState(null);
  
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState(null);
  
  const [polls, setPolls] = useState([]);
  const [pollsLoading, setPollsLoading] = useState(false);
  const [pollsError, setPollsError] = useState(null);
  
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupsError, setGroupsError] = useState(null);
  
  // Profil düzenleme
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: '',
    cinsiyet: '',
    universite: '',
    profil_resmi_url: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Kullanıcı verilerini getir
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // Kendi profili mi başkasının mı kontrol et
        if (!userId && isAuthenticated) {
          setUser(authUser);
          setIsOwnProfile(true);
          setEditedUser({
            username: authUser.username || '',
            cinsiyet: authUser.cinsiyet || '',
            universite: authUser.universite || '',
            profil_resmi_url: authUser.profil_resmi_url || ''
          });
        } else if (userId) {
          // Başka bir kullanıcının profili
          const response = await api.get(`/users/${userId}`);
          setUser(response.data.data);
          setIsOwnProfile(isAuthenticated && authUser.user_id === response.data.data.user_id);
          
          if (isAuthenticated && authUser.user_id === response.data.data.user_id) {
            setEditedUser({
              username: response.data.data.username || '',
              cinsiyet: response.data.data.cinsiyet || '',
              universite: response.data.data.universite || '',
              profil_resmi_url: response.data.data.profil_resmi_url || ''
            });
          }
        } else {
          // Kullanıcı giriş yapmamış ve URL'de ID yok
          navigate('/login');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError('Kullanıcı bilgileri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
  }, [userId, isAuthenticated, authUser, navigate]);
  
  // Forumları getir
  const fetchForums = async () => {
    try {
      setForumsLoading(true);
      setForumsError(null);
      
      const url = isOwnProfile ? '/users/forums' : `/users/${user.user_id}/forums`;
      const response = await api.get(url);
      
      setForums(response.data.data || []);
    } catch (err) {
      console.error('Error fetching forums:', err);
      setForumsError('Forumlar yüklenirken bir hata oluştu.');
    } finally {
      setForumsLoading(false);
    }
  };
  
  // Yorumları getir
  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      setCommentsError(null);
      
      const url = isOwnProfile ? '/users/comments' : `/users/${user.user_id}/comments`;
      const response = await api.get(url);
      
      setComments(response.data.data || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setCommentsError('Yorumlar yüklenirken bir hata oluştu.');
    } finally {
      setCommentsLoading(false);
    }
  };
  
  // Anketleri getir
  const fetchPolls = async () => {
    try {
      setPollsLoading(true);
      setPollsError(null);
      
      const url = isOwnProfile ? '/users/polls' : `/users/${user.user_id}/polls`;
      const response = await api.get(url);
      
      setPolls(response.data.data || []);
    } catch (err) {
      console.error('Error fetching polls:', err);
      setPollsError('Anketler yüklenirken bir hata oluştu.');
    } finally {
      setPollsLoading(false);
    }
  };
  
  // Grupları getir
  const fetchGroups = async () => {
    try {
      setGroupsLoading(true);
      setGroupsError(null);
      
      const url = isOwnProfile ? '/users/groups' : `/users/${user.user_id}/groups`;
      const response = await api.get(url);
      
      setGroups(response.data.data || []);
    } catch (err) {
      console.error('Error fetching groups:', err);
      setGroupsError('Gruplar yüklenirken bir hata oluştu.');
    } finally {
      setGroupsLoading(false);
    }
  };
  
  // Tab değiştiğinde ilgili verileri yükle
  useEffect(() => {
    if (!user) return;
    
    switch(activeTab) {
      case 0: // Forumlar
        fetchForums();
        break;
      case 1: // Yorumlar
        fetchComments();
        break;
      case 2: // Anketler
        fetchPolls();
        break;
      case 3: // Gruplar
        fetchGroups();
        break;
      default:
        break;
    }
  }, [activeTab, user]);
  
  // Profil güncelleme
  const handleUpdateProfile = async () => {
    try {
      setUpdateLoading(true);
      
      const response = await api.put('/users/profile', editedUser);
      
      if (response.data.status === 'success') {
        // Kullanıcı verilerini güncelle
        dispatch(updateUser(response.data.data));
        setUser(response.data.data);
        setIsEditing(false);
        toast.success('Profil başarıyla güncellendi');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error(err.response?.data?.message || 'Profil güncellenirken bir hata oluştu');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  // Cinsiyet ikonu
  const GenderIcon = ({ gender }) => {
    switch (gender) {
      case 'Erkek':
        return <FaMars className="text-blue-500" />;
      case 'Kadın':
        return <FaVenus className="text-pink-500" />;
      default:
        return <FaGenderless className="text-purple-500" />;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div className="bg-red-100 p-4 rounded-md text-red-700">
        <p>
          {error || 'Kullanıcı bulunamadı.'}
        </p>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {/* Üst kısım: Profil bilgileri */}
        <div className="relative p-6">
          {/* Profil düzenleme butonu */}
          {isOwnProfile && !isEditing && (
            <div className="absolute top-6 right-6">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit className="mr-2" /> Profili Düzenle
              </Button>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row items-center md:items-start">
            {/* Avatar */}
            <div className="mb-4 md:mb-0 md:mr-6">
              {isEditing ? (
                <div className="relative">
                  <Avatar 
                    src={editedUser.profil_resmi_url}
                    alt={user.username}
                    size="2xl"
                  />
                  <button
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full"
                    onClick={() => {/* Profil resmi yükleme modalını aç */}}
                  >
                    <FaEdit size={16} />
                  </button>
                </div>
              ) : (
                <Avatar 
                  src={user.profil_resmi_url}
                  alt={user.username}
                  size="2xl"
                />
              )}
            </div>
            
            {/* Kullanıcı bilgileri */}
            <div className="text-center md:text-left">
              {isEditing ? (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      value={editedUser.username}
                      onChange={(e) => setEditedUser({...editedUser, username: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cinsiyet
                    </label>
                    <select
                      value={editedUser.cinsiyet || ''}
                      onChange={(e) => setEditedUser({...editedUser, cinsiyet: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Seçiniz</option>
                      <option value="Erkek">Erkek</option>
                      <option value="Kadın">Kadın</option>
                      <option value="Diğer">Diğer</option>
                    </select>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Üniversite
                    </label>
                    <input
                      type="text"
                      value={editedUser.universite || ''}
                      onChange={(e) => setEditedUser({...editedUser, universite: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  
                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="light"
                      onClick={() => setIsEditing(false)}
                      disabled={updateLoading}
                    >
                      İptal
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleUpdateProfile}
                      disabled={updateLoading}
                    >
                      {updateLoading ? (
                        <>
                          <FaSpinner className="animate-spin mr-2" /> Kaydediliyor...
                        </>
                      ) : (
                        'Kaydet'
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-gray-900">{user.username}</h1>
                  
                  <div className="mt-2 space-y-2">
                    {user.email && (
                      <div className="flex items-center justify-center md:justify-start text-gray-600">
                        <FaEnvelope className="mr-2" /> {user.email}
                      </div>
                    )}
                    
                    {user.universite && (
                      <div className="flex items-center justify-center md:justify-start text-gray-600">
                        <FaGraduationCap className="mr-2" /> {user.universite}
                      </div>
                    )}
                    
                    {user.cinsiyet && (
                      <div className="flex items-center justify-center md:justify-start text-gray-600">
                        <GenderIcon gender={user.cinsiyet} />
                        <span className="ml-2">{user.cinsiyet}</span>
                      </div>
                    )}
                    
                    {user.kayit_tarihi && (
                      <div className="flex items-center justify-center md:justify-start text-gray-600">
                        <FaCalendarAlt className="mr-2" /> 
                        {new Date(user.kayit_tarihi).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} tarihinde katıldı
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Alt kısım: Tab'li içerik */}
        <div className="p-6 bg-gray-50">
          <Tab.Group onChange={setActiveTab}>
            <Tab.List className="flex space-x-1 rounded-lg bg-gray-100 p-1">
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                    selected
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center justify-center">
                  <FaComments className="mr-2" /> Forumlar
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                    selected
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center justify-center">
                  <FaComments className="mr-2" /> Yorumlar
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                    selected
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center justify-center">
                  <FaPoll className="mr-2" /> Anketler
                </div>
              </Tab>
              <Tab
                className={({ selected }) =>
                  `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                    selected
                      ? 'bg-white shadow text-blue-600'
                      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                  }`
                }
              >
                <div className="flex items-center justify-center">
                  <FaUsers className="mr-2" /> Gruplar
                </div>
              </Tab>
            </Tab.List>
            <Tab.Panels className="mt-4">
              {/* Forumlar */}
              <Tab.Panel>
                <TabPanel>
                  {forumsLoading ? (
                    <div className="flex justify-center py-8">
                      <FaSpinner className="animate-spin h-6 w-6 text-blue-500" />
                    </div>
                  ) : forumsError ? (
                    <div className="bg-red-100 p-4 rounded-md text-red-700">
                      {forumsError}
                    </div>
                  ) : forums.length > 0 ? (
                    <div className="space-y-4">
                      {forums.map(forum => (
                        <ForumCard key={forum.forum_id} forum={forum} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Henüz hiç forum yok
                    </div>
                  )}
                </TabPanel>
              </Tab.Panel>
              
              {/* Yorumlar */}
              <Tab.Panel>
                <TabPanel>
                  {commentsLoading ? (
                    <div className="flex justify-center py-8">
                      <FaSpinner className="animate-spin h-6 w-6 text-blue-500" />
                    </div>
                  ) : commentsError ? (
                    <div className="bg-red-100 p-4 rounded-md text-red-700">
                      {commentsError}
                    </div>
                  ) : comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map(comment => (
                        <div key={comment.comment_id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start">
                            <Avatar 
                              src={user.profil_resmi_url}
                              alt={user.username}
                              size="md"
                              className="mr-3"
                            />
                            <div>
                              <div className="flex items-center mb-1">
                                <span className="font-medium mr-2">{user.username}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.acilis_tarihi).toLocaleDateString('tr-TR')}
                                </span>
                              </div>
                              <p className="text-gray-700">{comment.icerik}</p>
                              <div className="mt-2">
                                <Link 
                                  to={`/forums/${comment.forum_id}`}
                                  className="text-sm text-blue-600 hover:underline"
                                >
                                  Foruma git
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Henüz hiç yorum yok
                    </div>
                  )}
                </TabPanel>
              </Tab.Panel>
              
              {/* Anketler */}
              <Tab.Panel>
                <TabPanel>
                  {pollsLoading ? (
                    <div className="flex justify-center py-8">
                      <FaSpinner className="animate-spin h-6 w-6 text-blue-500" />
                    </div>
                  ) : pollsError ? (
                    <div className="bg-red-100 p-4 rounded-md text-red-700">
                      {pollsError}
                    </div>
                  ) : polls.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {polls.map(poll => (
                        <PollCard key={poll.poll_id} poll={poll} showResults={true} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Henüz hiç anket yok
                    </div>
                  )}
                </TabPanel>
              </Tab.Panel>
              
              {/* Gruplar */}
              <Tab.Panel>
                <TabPanel>
                  {groupsLoading ? (
                    <div className="flex justify-center py-8">
                      <FaSpinner className="animate-spin h-6 w-6 text-blue-500" />
                    </div>
                  ) : groupsError ? (
                    <div className="bg-red-100 p-4 rounded-md text-red-700">
                      {groupsError}
                    </div>
                  ) : groups.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {groups.map(group => (
                        <div key={group.group_id} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 mr-3">
                              {group.logo_url ? (
                                <img 
                                  src={group.logo_url} 
                                  alt={group.grup_adi} 
                                  className="w-12 h-12 rounded-full" 
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                  {group.grup_adi.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <Link 
                                to={`/groups/${group.group_id}`}
                                className="text-lg font-medium text-gray-900 hover:text-blue-600"
                              >
                                {group.grup_adi}
                              </Link>
                              <div className="text-sm text-gray-500">
                                {group.uyelik_rolu === 'yonetici' ? 'Yönetici' : 
                                 group.uyelik_rolu === 'moderator' ? 'Moderatör' : 'Üye'}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Henüz hiç gruba üye değil
                    </div>
                  )}
                </TabPanel>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default Profile;