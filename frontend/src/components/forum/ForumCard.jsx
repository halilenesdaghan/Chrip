import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaRegThumbsUp, FaRegThumbsDown, FaRegComment, FaCalendarAlt, FaUniversity } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import Avatar from '../common/Avatar';

const ForumCard = ({ forum }) => {
  // Tarih formatla
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Forum başlığı */}
        <Link to={`/forums/${forum.forum_id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-2 truncate">
            {forum.baslik}
          </h3>
        </Link>
        
        {/* Forum açıklaması (varsa) */}
        {forum.aciklama && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {forum.aciklama}
          </p>
        )}
        
        {/* Meta bilgiler */}
        <div className="flex flex-wrap items-center text-xs text-gray-500 mb-3 gap-3">
          {/* Tarih */}
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1" />
            <span>{formatDate(forum.acilis_tarihi)}</span>
          </div>
          
          {/* Üniversite (varsa) */}
          {forum.universite && (
            <div className="flex items-center">
              <FaUniversity className="mr-1" />
              <span className="truncate max-w-[150px]">{forum.universite}</span>
            </div>
          )}
          
          {/* Kategori (varsa) */}
          {forum.kategori && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
              {forum.kategori}
            </span>
          )}
        </div>
        
        {/* Alt bilgiler: Paylaşan, reaksiyonlar ve yorumlar */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          {/* Forum sahibi */}
          <div className="flex items-center">
            <Avatar 
              src={forum.acan_kisi?.profil_resmi_url}
              alt={forum.acan_kisi?.username || 'Kullanıcı'}
              size="xs"
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              {forum.acan_kisi?.username || 'Anonim'}
            </span>
          </div>
          
          {/* İstatistikler */}
          <div className="flex items-center space-x-3 text-sm">
            {/* Beğeni sayısı */}
            <div className="flex items-center text-gray-500">
              <FaRegThumbsUp className="mr-1" />
              <span>{forum.begeni_sayisi || 0}</span>
            </div>
            
            {/* Beğenmeme sayısı */}
            <div className="flex items-center text-gray-500">
              <FaRegThumbsDown className="mr-1" />
              <span>{forum.begenmeme_sayisi || 0}</span>
            </div>
            
            {/* Yorum sayısı */}
            <div className="flex items-center text-gray-500">
              <FaRegComment className="mr-1" />
              <span>{forum.yorum_ids?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

ForumCard.propTypes = {
  forum: PropTypes.shape({
    forum_id: PropTypes.string.isRequired,
    baslik: PropTypes.string.isRequired,
    aciklama: PropTypes.string,
    acilis_tarihi: PropTypes.string,
    acan_kisi_id: PropTypes.string,
    acan_kisi: PropTypes.shape({
      username: PropTypes.string,
      profil_resmi_url: PropTypes.string
    }),
    foto_urls: PropTypes.arrayOf(PropTypes.string),
    yorum_ids: PropTypes.arrayOf(PropTypes.string),
    begeni_sayisi: PropTypes.number,
    begenmeme_sayisi: PropTypes.number,
    universite: PropTypes.string,
    kategori: PropTypes.string
  }).isRequired
};

export default ForumCard;