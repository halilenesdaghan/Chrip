import React, { useState } from 'react';
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
  
  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }
  
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