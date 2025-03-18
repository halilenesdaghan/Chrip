import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { FaUpload, FaImage, FaSpinner, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../common/Button';
import mediaService from '../../api/media';
import { toast } from 'react-toastify';

const MediaUploader = ({ 
  onUploadComplete, 
  maxFileSize = 5, 
  acceptedFileTypes = ['image/jpeg', 'image/png', 'image/gif'], 
  modelType = 'genel',
  modelId = null,
  multiple = false,
  className = '' 
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Maksimum dosya boyutu kontrolü (MB cinsinden)
  const maxFileSizeBytes = maxFileSize * 1024 * 1024;

  // Desteklenen dosya formatları için hata mesajı
  const acceptedFileTypesMessage = acceptedFileTypes
    .map(type => type.replace('image/', '.'))
    .join(', ');

  // Dosya seçme butonuna tıklama işlevi
  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Dosya seçildiğinde
  const handleFileChange = async (e) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }

    // Birden fazla dosya için kontroller
    if (!multiple && files.length > 1) {
      setError('Sadece bir dosya yükleyebilirsiniz');
      return;
    }

    // Dosya boyutu ve tür kontrolü
    let hasError = false;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Boyut kontrolü
      if (file.size > maxFileSizeBytes) {
        setError(`Dosya boyutu çok büyük. Maksimum dosya boyutu: ${maxFileSize}MB`);
        hasError = true;
        break;
      }
      
      // Tür kontrolü
      if (!acceptedFileTypes.includes(file.type)) {
        setError(`Desteklenmeyen dosya formatı. Desteklenen formatlar: ${acceptedFileTypesMessage}`);
        hasError = true;
        break;
      }
    }

    if (hasError) {
      e.target.value = null;
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(10); // Başlangıç yükleme durumu

    try {
      // Metadata
      const metadata = {
        model_type: modelType
      };
      
      if (modelId) {
        metadata.model_id = modelId;
      }

      let response;
      
      // Tek veya çoklu yükleme
      if (multiple) {
        // İlerleme simülasyonu
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 10, 80));
        }, 300);
        
        response = await mediaService.uploadMultipleFiles(Array.from(files), metadata);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (response.status === 'success') {
          // Yüklenen dosyaları dosya URL'leri olarak döndür
          const fileUrls = response.data.map(file => file.url);
          onUploadComplete(fileUrls);
          toast.success('Dosyalar başarıyla yüklendi');
        }
      } else {
        // İlerleme simülasyonu
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 15, 80));
        }, 200);
        
        response = await mediaService.uploadFile(files[0], metadata);
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        if (response.status === 'success') {
          onUploadComplete(response.data.url);
          toast.success('Dosya başarıyla yüklendi');
        }
      }
    } catch (err) {
      console.error('Dosya yükleme hatası:', err);
      setError(err.message || 'Dosya yüklenirken bir hata oluştu');
      toast.error('Dosya yüklenemedi');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Dosya seçimini sıfırla
      e.target.value = null;
    }
  };

  // Sürükle bırak bölgesi
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Dosya input'una dosyaları atayamayız, bu yüzden manuel yükleme yapacağız
      const dataTransfer = new DataTransfer();
      
      // Çok dosyalı mı? Tek dosyalı mı?
      if (multiple) {
        for (let i = 0; i < files.length; i++) {
          dataTransfer.items.add(files[i]);
        }
      } else {
        dataTransfer.items.add(files[0]);
      }
      
      fileInputRef.current.files = dataTransfer.files;
      handleFileChange({ target: { files: dataTransfer.files } });
    }
  };

  return (
    <div className={`media-uploader ${className}`}>
      {/* Görünmez dosya seçici */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept={acceptedFileTypes.join(',')}
        multiple={multiple}
      />
      
      {/* Sürükle bırak bölgesi */}
      <div 
        className={`
          border-2 border-dashed rounded-md p-6 text-center
          ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'}
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-blue-500 text-3xl mb-2" />
            <p className="text-sm text-gray-600">Yükleniyor... ({uploadProgress}%)</p>
            <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center text-red-500">
            <FaExclamationTriangle className="text-3xl mb-2" />
            <p className="text-sm">{error}</p>
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => setError(null)}
              className="mt-2"
            >
              Tekrar Dene
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaImage className="text-gray-400 text-3xl mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              Dosya yüklemek için sürükleyip bırakın veya
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleBrowseClick}
            >
              <FaUpload className="mr-2" /> Dosya Seç
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Maksimum dosya boyutu: {maxFileSize}MB<br />
              Desteklenen formatlar: {acceptedFileTypesMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

MediaUploader.propTypes = {
  onUploadComplete: PropTypes.func.isRequired,
  maxFileSize: PropTypes.number,
  acceptedFileTypes: PropTypes.arrayOf(PropTypes.string),
  modelType: PropTypes.string,
  modelId: PropTypes.string,
  multiple: PropTypes.bool,
  className: PropTypes.string
};

export default MediaUploader;