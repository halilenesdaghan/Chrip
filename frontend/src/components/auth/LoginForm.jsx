import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { loginUser } from '../../store/authSlice';
import Button from '../common/Button';
import Input from '../common/Input';

// Form doğrulama şeması
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
  password: Yup.string()
    .required('Şifre zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
});

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Formik ile form yönetimi
  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await dispatch(loginUser(values)).unwrap();
        navigate('/');
      } catch (err) {
        // Hata login thunk tarafından yönetiliyor
        console.error('Login error:', err);
      }
    },
  });

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Giriş Yap</h2>
        <p className="mt-2 text-sm text-gray-600">
          Hesabınız yok mu?{' '}
          <Link to="/register" className="text-blue-600 hover:text-blue-500 font-medium">
            Kayıt ol
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-6">
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
          <div className="flex items-center justify-between">
            <Input
              label="Şifre"
              type="password"
              name="password"
              placeholder="Şifrenizi girin"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && formik.errors.password}
              touched={formik.touched.password}
              required
            />
          </div>
          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-500">
              Şifremi unuttum
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;