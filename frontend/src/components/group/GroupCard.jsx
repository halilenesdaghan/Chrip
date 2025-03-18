import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FaUsers, FaCalendarAlt, FaLock, FaGlobe, FaEyeSlash, FaTag } from 'react-icons/fa';

const GroupCard = ({ group }) => {
  // Gizlilik ikonu
  const privacyIcon = () => {
    switch (group.gizlilik) {
      case 'acik':
        return <FaGlobe className="text-green-500" title="Açık Grup" />;
      case 'kapali':
        return <FaLock className="text-yellow-500" title="Kapalı Grup" />;
      case 'gizli':
        return <FaEyeSlash className="text-red-500" title="Gizli Grup" />;
      default:
        return <FaGlobe className="text-green-500" title="Açık Grup" />;
    }
  };
  
  // Gizlilik metni
  const privacyText = () => {
    switch (group.gizlilik) {
      case 'acik':
        return 'Açık Grup';
      case 'kapali':
        return 'Kapalı Grup';
      case 'gizli':
        return 'Gizli Grup';
      default:
        return 'Açık Grup';
    }
  };
  
  // Tarih formatla
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };
  
  // Kategorileri formatlı göster
  const formatCategories = (categories) => {
    if (!categories || !categories.length) return 'Kategorisiz';
    
    if (categories.length <= 2) {
      return categories.join(', ');
    }
    
    return `${categories[0]}, ${categories[1]} +${categories.length - 2}`;
  };

  // Kapak resmi
  const coverImage = group.kapak_resmi_url || 'https://via.placeholder.com/800x200?text=Kapak+Resmi+Yok';
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200">
      {/* Kapak resmi */}
      <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${coverImage})` }}>
        <div className="h-full w-full bg-gradient-to-t from-black/50 to-transparent p-4 flex items-end">
          <div className="text-white">
            {/* Gizlilik durumu */}
            <div className="flex items-center text-xs font-medium">
              {privacyIcon()}
              <span className="ml-1">{privacyText()}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        {/* Grup bilgileri */}
        <div className="flex items-center mb-3">
          {/* Logo */}
          <div className="relative mr-3">
            {group.logo_url ? (
              <img 
                src={group.logo_url} 
                alt={group.grup_adi} 
                className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover" 
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-medium">
                {group.grup_adi.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Grup ismi */}
          <div>
            <Link to={`/groups/${group.group_id}`} className="block">
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                {group.grup_adi}
              </h3>
            </Link>
            <div className="text-xs text-gray-500">
              <FaCalendarAlt className="inline mr-1" /> {formatDate(group.olusturulma_tarihi)}
            </div>
          </div>
        </div>
        
        {/* Açıklama */}
        {group.aciklama && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {group.aciklama}
          </p>
        )}
        
        {/* Kategoriler ve üye sayısı */}
        <div className="flex flex-wrap justify-between items-center mt-4 pt-3 border-t border-gray-100">
          {/* Kategoriler */}
          {group.kategoriler && group.kategoriler.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <FaTag className="mr-1" />
              <span title={group.kategoriler.join(', ')}>
                {formatCategories(group.kategoriler)}
              </span>
            </div>
          )}
          
          {/* Üye sayısı */}
          <div className="flex items-center text-sm text-gray-600">
            <FaUsers className="mr-1" />
            <span>{group.uye_sayisi || 0} üye</span>
          </div>
        </div>
      </div>
    </div>
  );
};

GroupCard.propTypes = {
  group: PropTypes.shape({
    group_id: PropTypes.string.isRequired,
    grup_adi: PropTypes.string.isRequired,
    aciklama: PropTypes.string,
    olusturulma_tarihi: PropTypes.string,
    olusturan_id: PropTypes.string,
    logo_url: PropTypes.string,
    kapak_resmi_url: PropTypes.string,
    gizlilik: PropTypes.oneOf(['acik', 'kapali', 'gizli']),
    kategoriler: PropTypes.arrayOf(PropTypes.string),
    uye_sayisi: PropTypes.number
  }).isRequired
};

export default GroupCard;