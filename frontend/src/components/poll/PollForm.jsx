import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { FaPlus, FaTrash } from 'react-icons/fa';
import Button from '../common/Button';
import Input from '../common/Input';

// Form doğrulama şeması
const validationSchema = Yup.object({
  baslik: Yup.string()
    .required('Başlık zorunludur')
    .min(3, 'Başlık en az 3 karakter olmalıdır')
    .max(100, 'Başlık en fazla 100 karakter olabilir'),
  aciklama: Yup.string(),
  kategori: Yup.string(),
  secenekler: Yup.array()
    .of(Yup.string().required('Seçenek boş olamaz'))
    .min(2, 'En az 2 seçenek gereklidir')
    .test(
      'unique-options',
      'Seçenekler benzersiz olmalıdır',
      (options) => {
        if (!options) return true;
        return new Set(options.map(o => o.trim())).size === options.length;
      }
    ),
  bitis_tarihi: Yup.date()
    .nullable()
    .min(new Date(), 'Bitiş tarihi gelecekte bir tarih olmalıdır'),
});

const PollForm = ({ initialValues = {}, onSubmit, isLoading = false, isEdit = false }) => {
  // Form başlangıç değerleri
  const formik = useFormik({
    initialValues: {
      baslik: initialValues.baslik || '',
      aciklama: initialValues.aciklama || '',
      kategori: initialValues.kategori || '',
      secenekler: initialValues.secenekler?.map(option => option.metin) || ['', ''],
      bitis_tarihi: initialValues.bitis_tarihi ? new Date(initialValues.bitis_tarihi) : null,
    },
    validationSchema,
    onSubmit: (values) => {
      // Bitiş tarihini ISO formatına dönüştür
      const formattedValues = {
        ...values,
        bitis_tarihi: values.bitis_tarihi 
          ? format(new Date(values.bitis_tarihi), "yyyy-MM-dd'T'HH:mm:ss") 
          : null,
      };
      
      onSubmit(formattedValues);
    },
  });

  // Yeni seçenek ekle
  const handleAddOption = () => {
    formik.setFieldValue('secenekler', [...formik.values.secenekler, '']);
  };

  // Seçeneği kaldır
  const handleRemoveOption = (index) => {
    const updatedOptions = formik.values.secenekler.filter((_, i) => i !== index);
    formik.setFieldValue('secenekler', updatedOptions);
  };

  // Seçeneği güncelle
  const handleOptionChange = (index, value) => {
    const updatedOptions = [...formik.values.secenekler];
    updatedOptions[index] = value;
    formik.setFieldValue('secenekler', updatedOptions);
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
            placeholder="Anket başlığını girin"
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
              rows={3}
              placeholder="Anket açıklamasını girin"
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

          {/* Bitiş tarihi */}
          <div className="mb-4">
            <label 
              htmlFor="bitis_tarihi" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Bitiş Tarihi
            </label>
            <input
              id="bitis_tarihi"
              name="bitis_tarihi"
              type="datetime-local"
              value={formik.values.bitis_tarihi ? format(new Date(formik.values.bitis_tarihi), "yyyy-MM-dd'T'HH:mm") : ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`
                block w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                ${formik.touched.bitis_tarihi && formik.errors.bitis_tarihi
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }
              `}
            />
            {formik.touched.bitis_tarihi && formik.errors.bitis_tarihi && (
              <p className="mt-1 text-sm text-red-600">{formik.errors.bitis_tarihi}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Boş bırakırsanız, anket süresiz olarak aktif kalır.
            </p>
          </div>

          {/* Seçenekler */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seçenekler <span className="text-red-500">*</span>
            </label>
            
            <div className="space-y-2">
              {formik.values.secenekler.map((option, index) => (
                <div key={index} className="flex items-center">
                  <input
                    type="text"
                    placeholder={`Seçenek ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    onBlur={formik.handleBlur}
                    className={`
                      block flex-1 px-3 py-2 border rounded-md shadow-sm placeholder-gray-400
                      ${formik.touched.secenekler && formik.errors.secenekler && formik.errors.secenekler[index]
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                      }
                    `}
                  />
                  
                  {formik.values.secenekler.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      className="ml-2 p-2 text-red-500 hover:text-red-700"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
              ))}
              
              {formik.touched.secenekler && typeof formik.errors.secenekler === 'string' && (
                <p className="mt-1 text-sm text-red-600">{formik.errors.secenekler}</p>
              )}
            </div>
            
            <button
              type="button"
              onClick={handleAddOption}
              className="mt-2 flex items-center text-blue-600 hover:text-blue-800"
            >
              <FaPlus className="mr-1" /> Seçenek Ekle
            </button>
          </div>

          {/* Hata mesajı */}
          {formik.submitCount > 0 && Object.keys(formik.errors).length > 0 && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              Lütfen formdaki hataları düzeltin.
            </div>
          )}

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

PollForm.propTypes = {
  initialValues: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  isEdit: PropTypes.bool,
};

export default PollForm;