import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
});

const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Formik form yönetimi
  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsSubmitting(true);
        const response = await api.post('/auth/forgot-password', values);
        
        if (response.data.status === 'success') {
          setIsSuccess(true);
          toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
        } else {
          throw new Error(response.data.message || 'Şifre sıfırlama bağlantısı gönderilemedi.');
        }
      } catch (err) {
        console.error('Error sending reset link:', err);
        // Güvenlik nedeniyle hata mesajı gösterme
        toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
        setIsSuccess(true);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <Layout showSidebar={false} showFooter={false}>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="text-center text-3xl font-extrabold text-gray-900">Şifremi Unuttum</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Şifrenizi sıfırlamak için e-posta adresinizi girin.
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            {isSuccess ? (
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-3 text-lg leading-6 font-medium text-gray-900">E-posta gönderildi</h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Şifre sıfırlama bağlantısı {formik.values.email} adresine gönderildi. 
                    Lütfen e-posta kutunuzu kontrol edin.
                  </p>
                </div>
                <div className="mt-5">
                  <Link to="/login">
                    <Button
                      type="button"
                      variant="primary"
                      fullWidth
                    >
                      Giriş Sayfasına Dön
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form className="space-y-6" onSubmit={formik.handleSubmit}>
                <Input
                  label="E-posta Adresi"
                  type="email"
                  name="email"
                  placeholder="ornek@email.com"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && formik.errors.email}
                  touched={formik.touched.email}
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
                      'Şifre Sıfırlama Bağlantısı Gönder'
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
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;