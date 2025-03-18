import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Button from '../common/Button';
import Input from '../common/Input';
import { FaImage, FaTimes } from 'react-icons/fa';
import MediaUploader from '../media/MediaUploader';

// Form doğrulama şeması
const validationSchema = Yup.object({
  baslik: Yup.string()
    .required('Başlık zorunludur')
    .min(3, 'Başlık en az 3 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),
  aciklama: Yup.string(),
  kategori: Yup.string(),
});

const ForumForm = ({ initialValues = {}, onSubmit, isLoading = false, isEdit = false }) => {
  const [showMediaUploader, setShowMediaUploader] = useState(false);

  // Form başlangıç değerleri
  const formik = useFormik({
    initialValues: {
      baslik: initialValues.baslik || '',
      aciklama: initialValues.aciklama || '',
      kategori: initialValues.kategori || '',
      foto_urls: initialValues.foto_urls || [],
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Medya ekle
  const handleMediaAdd = (mediaUrl) => {
    const updatedUrls = [...formik.values.foto_urls, mediaUrl];
    formik.setFieldValue('foto_urls', updatedUrls);
    setShowMediaUploader(false);
  };

  // Medya kaldır
  const handleRemoveMedia = (index) => {
    const updatedUrls = formik.values.foto_urls.filter((_, i) => i !== index);
    formik.setFieldValue('foto_urls', updatedUrls);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-4">
          {/* Başlık */}
          <Input
            label="Başlık"
            type="text"
            name="baslik"
            placeholder="Forum başlığını girin"
            value={formik.values.baslik}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.baslik && formik.errors.baslik}
            touched={formik.touched.baslik}
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
              rows={4}
              placeholder="Açıklamanızı girin"
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

          {/* Kategori */}
          <Input
            label="Kategori"
            type="text"
            name="kategori"
            placeholder="Kategori girin"
            value={formik.values.kategori}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.kategori && formik.errors.kategori}
            touched={formik.touched.kategori}
          />

          {/* Medya Görüntüleme */}
          {formik.values.foto_urls.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yüklenen Görseller
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formik.values.foto_urls.map((url, index) => (
                  <div key={index} className="relative">
                    <img 
                      src={url} 
                      alt={`Görsel ${index + 1}`} 
                      className="h-24 w-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <FaTimes size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Medya Yükleme Seçeneği */}
          <div className="mb-4">
            {showMediaUploader ? (
              <div className="border border-gray-300 rounded-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Görsel Yükle</h3>
                  <button
                    type="button"
                    onClick={() => setShowMediaUploader(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <FaTimes size={16} />
                  </button>
                </div>
                <MediaUploader 
                  onUploadComplete={handleMediaAdd} 
                  modelType="forum"
                />
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowMediaUploader(true)}
                className="flex items-center"
              >
                <FaImage className="mr-2" /> Görsel Ekle
              </Button>
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

ForumForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isEdit: PropTypes.bool,
};

export default ForumForm;