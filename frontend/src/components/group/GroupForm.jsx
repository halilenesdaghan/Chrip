import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { FaImage, FaTimes, FaPlus } from 'react-icons/fa';
import Button from '../common/Button';
import Input from '../common/Input';
import MediaUploader from '../media/MediaUploader';

// Form doğrulama şeması
const validationSchema = Yup.object({
  grup_adi: Yup.string()
    .required('Grup adı zorunludur')
    .min(3, 'Grup adı en az 3 karakter olmalıdır')
    .max(50, 'Grup adı en fazla 50 karakter olabilir'),
  aciklama: Yup.string(),
  gizlilik: Yup.string()
    .oneOf(['acik', 'kapali', 'gizli'], 'Geçersiz gizlilik seçeneği'),
  kategoriler: Yup.array()
    .of(Yup.string())
});

const GroupForm = ({ initialValues = {}, onSubmit, isLoading = false, isEdit = false }) => {
  const [showLogoUploader, setShowLogoUploader] = useState(false);
  const [showCoverUploader, setShowCoverUploader] = useState(false);
  const [tempCategory, setTempCategory] = useState('');

  // Form başlangıç değerleri
  const formik = useFormik({
    initialValues: {
      grup_adi: initialValues.grup_adi || '',
      aciklama: initialValues.aciklama || '',
      gizlilik: initialValues.gizlilik || 'acik',
      logo_url: initialValues.logo_url || '',
      kapak_resmi_url: initialValues.kapak_resmi_url || '',
      kategoriler: initialValues.kategoriler || [],
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Logo ekle
  const handleLogoAdd = (logoUrl) => {
    formik.setFieldValue('logo_url', logoUrl);
    setShowLogoUploader(false);
  };

  // Kapak ekle
  const handleCoverAdd = (coverUrl) => {
    formik.setFieldValue('kapak_resmi_url', coverUrl);
    setShowCoverUploader(false);
  };

  // Kategori ekle
  const handleAddCategory = () => {
    if (tempCategory.trim()) {
      formik.setFieldValue('kategoriler', [...formik.values.kategoriler, tempCategory.trim()]);
      setTempCategory('');
    }
  };

  // Kategori kaldır
  const handleRemoveCategory = (index) => {
    const updatedCategories = formik.values.kategoriler.filter((_, i) => i !== index);
    formik.setFieldValue('kategoriler', updatedCategories);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-4">
          {/* Grup adı */}
          <Input
            label="Grup Adı"
            type="text"
            name="grup_adi"
            placeholder="Grup adını girin"
            value={formik.values.grup_adi}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.grup_adi && formik.errors.grup_adi}
            touched={formik.touched.grup_adi}
            required
          />

          {/* Açıklama */}
          <div className="mb-4">
            <label 
              htmlFor="aciklama" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Açıklama
            </label>
            <textarea
              id="aciklama"
              name="aciklama"
              rows={3}
              placeholder="Grup açıklamasını girin"
              value={formik.values.aciklama}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`
                block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                ${formik.touched.aciklama && formik.errors.aciklama
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
            />
            {formik.touched.aciklama && formik.errors.aciklama && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.aciklama}</p>
            )}
          </div>

          {/* Gizlilik */}
          <div className="mb-4">
            <label 
              htmlFor="gizlilik" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Gizlilik
            </label>
            <select
              id="gizlilik"
              name="gizlilik"
              value={formik.values.gizlilik}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`
                block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                ${formik.touched.gizlilik && formik.errors.gizlilik
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
            >
              <option value="acik">Açık (Herkes katılabilir)</option>
              <option value="kapali">Kapalı (Onay gerekli)</option>
              <option value="gizli">Gizli (Davet gerekli)</option>
            </select>
            {formik.touched.gizlilik && formik.errors.gizlilik && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.gizlilik}</p>
            )}
          </div>

          {/* Logo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Grup Logosu
            </label>
            
            {formik.values.logo_url ? (
              <div className="relative inline-block">
                <img 
                  src={formik.values.logo_url} 
                  alt="Grup Logosu" 
                  className="h-20 w-20 object-cover rounded-full"
                />
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('logo_url', '')}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ) : showLogoUploader ? (
              <div className="border border-gray-300 rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Logo Yükle</h3>
                  <button
                    type="button"
                    onClick={() => setShowLogoUploader(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
                <MediaUploader 
                  onUploadComplete={handleLogoAdd} 
                  modelType="group"
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowLogoUploader(true)}
                className="flex items-center"
              >
                <FaImage className="mr-2" /> Logo Ekle
              </Button>
            )}
          </div>

          {/* Kapak Resmi */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kapak Resmi
            </label>
            
            {formik.values.kapak_resmi_url ? (
              <div className="relative">
                <img 
                  src={formik.values.kapak_resmi_url} 
                  alt="Kapak Resmi" 
                  className="h-32 w-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() => formik.setFieldValue('kapak_resmi_url', '')}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ) : showCoverUploader ? (
              <div className="border border-gray-300 rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Kapak Resmi Yükle</h3>
                  <button
                    type="button"
                    onClick={() => setShowCoverUploader(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
                <MediaUploader 
                  onUploadComplete={handleCoverAdd} 
                  modelType="group"
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCoverUploader(true)}
                className="flex items-center"
              >
                <FaImage className="mr-2" /> Kapak Resmi Ekle
              </Button>
            )}
          </div>

          {/* Kategoriler */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategoriler
            </label>
            
            <div className="flex mb-2">
              <input
                type="text"
                value={tempCategory}
                onChange={(e) => setTempCategory(e.target.value)}
                placeholder="Kategori ekle"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!tempCategory.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50"
              >
                <FaPlus />
              </button>
            </div>
            
            {formik.values.kategoriler.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formik.values.kategoriler.map((kategori, index) => (
                  <div 
                    key={index}
                    className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                  >
                    <span>{kategori}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(index)}
                      className="ml-1 text-blue-800 hover:text-blue-900"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {formik.touched.kategoriler && formik.errors.kategoriler && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.kategoriler}</p>
            )}
          </div>

          {/* Form Butonları */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="light"
              onClick={() => window.history.back()}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
            >
              {isLoading ? 'Gönderiliyor...' : isEdit ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};

GroupForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isEdit: PropTypes.bool,
};

export default GroupForm;