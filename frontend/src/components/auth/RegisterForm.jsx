import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { registerUser } from '../../store/authSlice';
import Button from '../common/Button';
import Input from '../common/Input';

// Form doğrulama şeması
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Geçerli bir e-posta adresi giriniz')
    .required('E-posta adresi zorunludur'),
  username: Yup.string()
    .required('Kullanıcı adı zorunludur')
    .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
    .max(30, 'Kullanıcı adı en fazla 30 karakter olabilir'),
  password: Yup.string()
    .required('Şifre zorunludur')
    .min(6, 'Şifre en az 6 karakter olmalıdır'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Şifreler eşleşmiyor')
    .required('Şifre tekrarı zorunludur'),
  cinsiyet: Yup.string()
    .oneOf(['Erkek', 'Kadın', 'Diğer'], 'Geçerli bir cinsiyet seçiniz'),
  universite: Yup.string(),
});

const RegisterForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  // Formik ile form yönetimi
  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
      cinsiyet: '',
      universite: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      // confirmPassword alanını kaldır (API'de yok)
      const { confirmPassword, ...userData } = values;
      
      try {
        await dispatch(registerUser(userData)).unwrap();
        navigate('/');
      } catch (err) {
        // Hata register thunk tarafından yönetiliyor
        console.error('Register error:', err);
      }
    },
  });

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Hesap Oluştur</h2>
        <p className="mt-2 text-sm text-gray-600">
          Zaten hesabınız var mı?{' '}
          <Link to="/login" className="text-blue-600 hover:text-blue-500 font-medium">
            Giriş yap
          </Link>
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
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

        <Input
          label="Kullanıcı Adı"
          type="text"
          name="username"
          placeholder="kullanici_adi"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.username && formik.errors.username}
          touched={formik.touched.username}
          required
        />

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

        <div className="mb-4">
          <label 
            htmlFor="cinsiyet" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Cinsiyet
          </label>
          <select
            id="cinsiyet"
            name="cinsiyet"
            value={formik.values.cinsiyet}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`
              block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
              ${formik.touched.cinsiyet && formik.errors.cinsiyet
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
          {formik.touched.cinsiyet && formik.errors.cinsiyet && (
            <p className="mt-1 text-sm text-red-600">{formik.errors.cinsiyet}</p>
          )}
        </div>

        <Input
          label="Üniversite"
          type="text"
          name="universite"
          placeholder="Üniversitenizi girin (isteğe bağlı)"
          value={formik.values.universite}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.universite && formik.errors.universite}
          touched={formik.touched.universite}
        />

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={loading}
          className="mt-6"
        >
          {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-gray-500">
        Kayıt olarak, Kullanım Şartlarını ve Gizlilik Politikasını kabul etmiş olursunuz.
      </div>
    </div>
  );
};

export default RegisterForm;