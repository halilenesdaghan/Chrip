import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import api from '../api';
import { toast } from 'react-toastify';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Layout from '../components/layout/Layout';

// Form doğrulama şeması
const validationSchema = Yup.object({
  password: Yup.string()
    .required('Yeni şifre zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetError, setResetError] = useState(null);
  
  // URL'den token'ı al
  const searchParams = new URLSearchParams(location.search);
  const resetToken = searchParams.get('token');
  
  // Token yoksa giriş sayfasına yönlendir
  if (!resetToken) {
    toast.error('Geçersiz şifre sıfırlama bağlantısı.');
    navigate('/login');
  }

  // Formik form yönetimi
  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        setResetError(null);
        
        const response = await api.post('/auth/reset-password', {
          reset_token: resetToken,
          new_password: values.password,
        });
        
        if (response.data.status === 'success') {
          toast.success('Şifreniz başarıyla sıfırlandı.');
          navigate('/login');
        } else {
          throw new Error(response.data.message || 'Şifre sıfırlama başarısız.');
        }
      } catch (err) {
        console.error('Error resetting password:', err);
        setResetError(err.response?.data?.message || 'Şifre sıfırlama işlemi başarısız oldu. Lütfen tekrar deneyin.');
        toast.error('Şifre sıfırlama başarısız.');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Layout showSidebar={false} showFooter={false}>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-3xl font-extrabold text-gray-900">Şifre Sıfırlama</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lütfen yeni şifrenizi belirleyin.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {resetError && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                <p>{resetError}</p>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={formik.handleSubmit}>
              <Input
                label="Yeni Şifre"
                type="password"
                name="password"
                placeholder="Yeni şifrenizi girin"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && formik.errors.password}
                touched={formik.touched.password}
                required
              />

              <Input
                label="Şifre Tekrarı"
                type="password"
                name="confirmPassword"
                placeholder="Şifrenizi tekrar girin"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && formik.errors.confirmPassword}
                touched={formik.touched.confirmPassword}
                required
              />

              <div>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" /> İşleniyor...
                    </>
                  ) : (
                    'Şifreyi Sıfırla'
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-sm">
                  <Link
                    to="/login"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Giriş sayfasına dön
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ResetPassword;