import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaSpinner, FaKey, FaUserAlt, FaBell, FaShieldAlt, FaTrash } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api';
import { toast } from 'react-toastify';
import { logoutUser, updateUser } from '../store/authSlice';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Avatar from '../components/common/Avatar';
import MediaUploader from '../components/media/MediaUploader';

// Şifre değiştirme şeması
const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Mevcut şifre zorunludur'),
  newPassword: Yup.string()
    .required('Yeni şifre zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), null], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
});

// Profil bilgileri şeması
const profileValidationSchema = Yup.object({
  username: Yup.string()
    .required('Kullanıcı adı zorunludur')
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(30, 'Kullanıcı adı en fazla 30 karakter olabilir'),
  cinsiyet: Yup.string()
    .oneOf(['Erkek', 'Kadın', 'Diğer'], 'Geçerli bir cinsiyet seçiniz'),
  universite: Yup.string(),
});

const Settings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showMediaUploader, setShowMediaUploader] = useState(false);
  
  // Şifre değiştirme formu
  const passwordFormik = useFormik({
    initialValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validationSchema: passwordValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsUpdatingPassword(true);
        
        const response = await api.post('/auth/change-password', {
          current_password: values.currentPassword,
          new_password: values.newPassword,
        });
        
        if (response.data.status === 'success') {
          toast.success('Şifreniz başarıyla değiştirildi.');
          passwordFormik.resetForm();
        }
      } catch (err) {
        console.error('Error changing password:', err);
        toast.error(err.response?.data?.message || 'Şifre değiştirme başarısız.');
      } finally {
        setIsUpdatingPassword(false);
      }
    },
  });
  
  // Profil bilgileri formu
  const profileFormik = useFormik({
    initialValues: {
      username: user?.username || '',
      cinsiyet: user?.cinsiyet || '',
      universite: user?.universite || '',
      profil_resmi_url: user?.profil_resmi_url || '',
    },
    validationSchema: profileValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsUpdatingProfile(true);
        
        const response = await api.put('/users/profile', values);
        
        if (response.data.status === 'success') {
          dispatch(updateUser(response.data.data));
          toast.success('Profil bilgileriniz güncellenmiştir.');
        }
      } catch (err) {
        console.error('Error updating profile:', err);
        toast.error(err.response?.data?.message || 'Profil güncellenemedi.');
      } finally {
        setIsUpdatingProfile(false);
      }
    },
  });
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Kullanıcı giriş yapmamışsa içeriği gösterme
  if (!isAuthenticated || !user) {
    return null;
  }
  
  // Hesap silme
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      
      const response = await api.delete('/users/account');
      
      if (response.data.status === 'success') {
        toast.success('Hesabınız başarıyla silindi.');
        dispatch(logoutUser());
        navigate('/');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
      toast.error(err.response?.data?.message || 'Hesap silinemedi.');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };
  
  // Profil resmi yükleme
  const handleProfilePhotoUpload = (photoUrl) => {
    profileFormik.setFieldValue('profil_resmi_url', photoUrl);
    setShowMediaUploader(false);
    // Profil resmini otomatik kaydet
    profileFormik.submitForm();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Hesap Ayarları</h1>
          <p className="text-gray-600">Hesap bilgilerinizi ve tercihlerinizi yönetin.</p>
        </div>
        
        <div className="flex border-b border-gray-200">
          <div className="w-64 border-r border-gray-200">
            {/* Sidebar menü */}
            <nav className="p-4">
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'profile'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaUserAlt className="inline-block mr-2" /> Profil Bilgileri
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'password'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaKey className="inline-block mr-2" /> Şifre Değiştir
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'notifications'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaBell className="inline-block mr-2" /> Bildirim Tercihleri
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('privacy')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'privacy'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <FaShieldAlt className="inline-block mr-2" /> Gizlilik Ayarları
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveTab('delete')}
                    className={`w-full text-left px-4 py-2 rounded-md ${
                      activeTab === 'delete'
                        ? 'bg-red-100 text-red-700'
                        : 'text-red-700 hover:bg-red-50'
                    }`}
                  >
                    <FaTrash className="inline-block mr-2" /> Hesabı Sil
                  </button>
                </li>
              </ul>
            </nav>
          </div>
          
          <div className="flex-1 p-6">
            {/* Profil bilgileri */}
            {activeTab === 'profile' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Profil Bilgileri</h2>
                
                {/* Profil resmi */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profil Fotoğrafı
                  </label>
                  <div className="flex items-center">
                    <Avatar 
                      src={profileFormik.values.profil_resmi_url}
                      alt={user?.username}
                      size="xl"
                      className="mr-4"
                    />
                    <div>
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setShowMediaUploader(true)}
                      >
                        Fotoğraf Değiştir
                      </Button>
                      {profileFormik.values.profil_resmi_url && (
                        <Button
                          variant="light"
                          type="button"
                          onClick={() => {
                            profileFormik.setFieldValue('profil_resmi_url', '');
                            profileFormik.submitForm();
                          }}
                          className="ml-2"
                        >
                          Kaldır
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  {showMediaUploader && (
                    <div className="mt-4 border border-gray-300 rounded-md p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium">Fotoğraf Yükle</h4>
                        <button
                          type="button"
                          onClick={() => setShowMediaUploader(false)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          &times;
                        </button>
                      </div>
                      <MediaUploader 
                        onUploadComplete={handleProfilePhotoUpload}
                        acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
                        modelType="user"
                      />
                    </div>
                  )}
                </div>
                
                <form onSubmit={profileFormik.handleSubmit}>
                  <div className="grid grid-cols-1 gap-6">
                    <Input
                      label="Kullanıcı Adı"
                      name="username"
                      value={profileFormik.values.username}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.username && profileFormik.errors.username}
                      touched={profileFormik.touched.username}
                      required
                    />
                    
                    <div>
                      <label 
                        htmlFor="cinsiyet" 
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Cinsiyet
                      </label>
                      <select
                        id="cinsiyet"
                        name="cinsiyet"
                        value={profileFormik.values.cinsiyet}
                        onChange={profileFormik.handleChange}
                        onBlur={profileFormik.handleBlur}
                        className={`
                          block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                          ${profileFormik.touched.cinsiyet && profileFormik.errors.cinsiyet
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                          }
                        `}
                      >
                        <option value="">Seçiniz</option>
                        <option value="Erkek">Erkek</option>
                        <option value="Kadın">Kadın</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                      {profileFormik.touched.cinsiyet && profileFormik.errors.cinsiyet && (
                        <p className="mt-1 text-sm text-red-600">{profileFormik.errors.cinsiyet}</p>
                      )}
                    </div>
                    
                    <Input
                      label="Üniversite"
                      name="universite"
                      value={profileFormik.values.universite}
                      onChange={profileFormik.handleChange}
                      onBlur={profileFormik.handleBlur}
                      error={profileFormik.touched.universite && profileFormik.errors.universite}
                      touched={profileFormik.touched.universite}
                    />
                    
                    <div className="pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isUpdatingProfile}
                      >
                        {isUpdatingProfile ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" /> Güncelleniyor...
                          </>
                        ) : (
                          'Bilgileri Güncelle'
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Şifre değiştirme */}
            {activeTab === 'password' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Şifre Değiştir</h2>
                
                <form onSubmit={passwordFormik.handleSubmit}>
                  <div className="grid grid-cols-1 gap-6">
                    <Input
                      label="Mevcut Şifre"
                      type="password"
                      name="currentPassword"
                      value={passwordFormik.values.currentPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={passwordFormik.touched.currentPassword && passwordFormik.errors.currentPassword}
                      touched={passwordFormik.touched.currentPassword}
                      required
                    />
                    
                    <Input
                      label="Yeni Şifre"
                      type="password"
                      name="newPassword"
                      value={passwordFormik.values.newPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={passwordFormik.touched.newPassword && passwordFormik.errors.newPassword}
                      touched={passwordFormik.touched.newPassword}
                      required
                    />
                    
                    <Input
                      label="Yeni Şifre Tekrar"
                      type="password"
                      name="confirmPassword"
                      value={passwordFormik.values.confirmPassword}
                      onChange={passwordFormik.handleChange}
                      onBlur={passwordFormik.handleBlur}
                      error={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
                      touched={passwordFormik.touched.confirmPassword}
                      required
                    />
                    
                    <div className="pt-4">
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={isUpdatingPassword}
                      >
                        {isUpdatingPassword ? (
                          <>
                            <FaSpinner className="animate-spin mr-2" /> Güncelleniyor...
                          </>
                        ) : (
                          'Şifreyi Değiştir'
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Bildirim tercihleri */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Bildirim Tercihleri</h2>
                <p className="text-gray-600">Bu özellik şu anda geliştirme aşamasındadır.</p>
                
                {/* Bildirim tercihleri burada gelecek */}
              </div>
            )}
            
            {/* Gizlilik ayarları */}
            {activeTab === 'privacy' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Gizlilik Ayarları</h2>
                <p className="text-gray-600">Bu özellik şu anda geliştirme aşamasındadır.</p>
                
                {/* Gizlilik ayarları burada gelecek */}
              </div>
            )}
            
            {/* Hesabı sil */}
            {activeTab === 'delete' && (
              <div>
                <h2 className="text-xl font-semibold text-red-600 mb-4">Hesabı Sil</h2>
                
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                  <h3 className="text-lg font-semibold text-red-700 mb-2">Uyarı</h3>
                  <p className="text-red-700">
                    Hesabınızı silmek geri alınamaz bir işlemdir. Hesabınız, profil bilgileriniz ve tüm içerikleriniz kalıcı olarak silinecektir.
                  </p>
                </div>
                
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Hesabımı Sil
                </Button>
                
                {/* Hesap silme onay modalı */}
                {showDeleteConfirm && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesabınızı silmek istediğinizden emin misiniz?</h3>
                      <p className="text-gray-600 mb-6">
                        Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.
                      </p>
                      
                      <div className="flex justify-end space-x-3">
                        <Button
                          variant="light"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                        >
                          İptal
                        </Button>
                        
                        <Button
                          variant="danger"
                          onClick={handleDeleteAccount}
                          disabled={isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <FaSpinner className="animate-spin mr-2" /> Siliniyor...
                            </>
                          ) : (
                            'Hesabımı Sil'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;