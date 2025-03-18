import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaImage, FaSpinner, FaTrash, FaDownload, FaExpand } from 'react-icons/fa';
import Button from '../common/Button';
import Modal from '../common/Modal';
import mediaService from '../../api/media';
import { toast } from 'react-toastify';

const MediaGallery = ({
  mediaItems = [],
  onDelete = null,
  isLoading = false,
  error = null,
  canDelete = false,
  className = ''
}) => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Medya silme işlevi
  const handleDelete = async (item, e) => {
    e.stopPropagation();
    
    if (!canDelete) return;
    
    if (window.confirm('Bu dosyayı silmek istediğinize emin misiniz?')) {
      try {
        setDeleting(true);
        
        await mediaService.deleteFile({
          storage_path: item.storage_path,
          storage_type: item.storage_type,
          uploader_id: item.uploader_id
        });
        
        toast.success('Dosya başarıyla silindi');
        
        // Üst bileşene bildirme
        if (onDelete) {
          onDelete(item);
        }
        
        // Eğer silinen dosya şu anda görüntülenen dosya ise modalı kapat
        if (selectedItem && selectedItem.url === item.url) {
          setShowModal(false);
        }
      } catch (err) {
        console.error('Dosya silme hatası:', err);
        toast.error('Dosya silinemedi');
      } finally {
        setDeleting(false);
      }
    }
  };

  // Medyayı görüntüleme
  const handleView = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Dosya indirme
  const handleDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`media-gallery ${className}`}>
      {/* Hata mesajı */}
      {error && (
        <div className="w-full p-4 bg-red-100 text-red-700 rounded-md mb-4">
          {error}
        </div>
      )}
      
      {/* Yükleniyor */}
      {isLoading && (
        <div className="w-full flex justify-center py-8">
          <FaSpinner className="animate-spin text-blue-500 text-3xl" />
        </div>
      )}
      
      {/* Içerik yoksa */}
      {!isLoading && !error && mediaItems.length === 0 && (
        <div className="w-full text-center py-8 bg-gray-50 rounded-md">
          <FaImage className="mx-auto text-gray-400 text-4xl mb-2" />
          <p className="text-gray-500">Henüz medya yok.</p>
        </div>
      )}
      
      {/* Medya grid'i */}
      {!isLoading && !error && mediaItems.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaItems.map((item, index) => (
            <div 
              key={index} 
              className="relative group overflow-hidden border border-gray-200 rounded-md"
              onClick={() => handleView(item)}
            >
              {/* Görsel veya dosya ikonu */}
              {item.content_type?.startsWith('image/') ? (
                <img 
                  src={item.url} 
                  alt={item.original_filename || `Media ${index + 1}`}
                  className="w-full h-32 object-cover cursor-pointer"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 flex items-center justify-center cursor-pointer">
                  <FaImage className="text-gray-400 text-3xl" />
                </div>
              )}
              
              {/* Hover durumunda görünen kontroller */}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="light"
                  size="sm"
                  className="mr-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(item.url, item.original_filename);
                  }}
                >
                  <FaDownload />
                </Button>
                
                {canDelete && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={(e) => handleDelete(item, e)}
                    disabled={deleting}
                  >
                    {deleting ? <FaSpinner className="animate-spin" /> : <FaTrash />}
                  </Button>
                )}
              </div>
              
              {/* Dosya adı */}
              <div className="p-2 bg-white truncate text-xs">
                {item.original_filename || `Dosya ${index + 1}`}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Görüntüleme modalı */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={selectedItem?.original_filename || 'Medya Görüntüleme'}
      >
        {selectedItem && (
          <div className="flex flex-col">
            {/* Görsel veya dosya ikonu */}
            {selectedItem.content_type?.startsWith('image/') ? (
              <img 
                src={selectedItem.url} 
                alt={selectedItem.original_filename || 'Media preview'}
                className="max-w-full max-h-[70vh] object-contain mx-auto"
              />
            ) : (
              <div className="w-full h-64 bg-gray-100 flex items-center justify-center">
                <FaImage className="text-gray-400 text-5xl" />
              </div>
            )}
            
            {/* Bilgi satırı */}
            <div className="mt-4 bg-gray-50 p-3 rounded-md">
              <p className="mb-1">
                <strong>Dosya Adı:</strong> {selectedItem.original_filename}
              </p>
              {selectedItem.content_type && (
                <p className="mb-1">
                  <strong>Dosya Türü:</strong> {selectedItem.content_type}
                </p>
              )}
              {selectedItem.file_size && (
                <p>
                  <strong>Boyut:</strong> {(selectedItem.file_size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
            
            {/* Butonlar */}
            <div className="flex justify-end mt-4 space-x-2">
              {canDelete && (
                <Button
                  variant="danger"
                  onClick={(e) => handleDelete(selectedItem, e)}
                  disabled={deleting}
                >
                  {deleting ? <FaSpinner className="animate-spin mr-2" /> : <FaTrash className="mr-2" />}
                  Sil
                </Button>
              )}
              <Button
                variant="light"
                onClick={() => handleDownload(selectedItem.url, selectedItem.original_filename)}
              >
                <FaDownload className="mr-2" /> İndir
              </Button>
              {selectedItem.content_type?.startsWith('image/') && (
                <Button
                  variant="primary"
                  onClick={() => window.open(selectedItem.url, '_blank')}
                >
                  <FaExpand className="mr-2" /> Tam Boyut
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

MediaGallery.propTypes = {
  mediaItems: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      original_filename: PropTypes.string,
      content_type: PropTypes.string,
      file_size: PropTypes.number,
      storage_path: PropTypes.string,
      storage_type: PropTypes.string,
      uploader_id: PropTypes.string
    })
  ),
  onDelete: PropTypes.func,
  isLoading: PropTypes.bool,
  error: PropTypes.string,
  canDelete: PropTypes.bool,
  className: PropTypes.string
};

export default MediaGallery;