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
  header: Yup.string()
    .required('Başlık zorunludur')
    .min(3, 'Başlık en az 3 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),
  description: Yup.string(),
  category: Yup.string(),
});

const ForumForm = ({ initialValues = {}, onSubmit, isLoading = false, isEdit = false }) => {
  const [showMediaUploader, setShowMediaUploader] = useState(false);

  // Form başlangıç değerleri
  const formik = useFormik({
    initialValues: {
      header: initialValues.header || '',
      description: initialValues.description || '',
      category: initialValues.category || '',
      photo_urls: initialValues.photo_urls || [],
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  // Medya ekle
  const handleMediaAdd = (mediaUrl) => {
    const updatedUrls = [...formik.values.photo_urls, mediaUrl];
    formik.setFieldValue('photo_urls', updatedUrls);
    setShowMediaUploader(false);
  };

  // Medya kaldır
  const handleRemoveMedia = (index) => {
    const updatedUrls = formik.values.photo_urls.filter((_, i) => i !== index);
    formik.setFieldValue('photo_urls', updatedUrls);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <form onSubmit={formik.handleSubmit}>
        <div className="space-y-4">
          {/* Başlık */}
          <Input
            label="Başlık"
            type="text"
            name="header"
            placeholder="Forum başlığını girin"
            value={formik.values.header}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.header && formik.errors.header}
            touched={formik.touched.header}
            required
          />

          {/* Açıklama */}
          <div className="mb-4">
            <label 
              htmlFor="description" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Açıklama
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Açıklamanızı girin"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`
                block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                ${formik.touched.description && formik.errors.description
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
            />
            {formik.touched.description && formik.errors.description && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.description}</p>
            )}
          </div>

          {/* category */}
          <Input
            label="Kategori"
            type="text"
            name="category"
            placeholder="Kategori girin"
            value={formik.values.category}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.category && formik.errors.category}
            touched={formik.touched.category}
          />

          {/* Medya Görüntüleme */}
          {formik.values.photo_urls.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yüklenen Görseller
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {formik.values.photo_urls.map((url, index) => (
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