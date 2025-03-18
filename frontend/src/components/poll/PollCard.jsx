import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaRegCommentAlt, FaCalendarAlt, FaUniversity, FaVoteYea } from 'react-icons/fa';
import { formatDistanceToNow, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';
import Avatar from '../common/Avatar';

const PollCard = ({ poll, showResults = false }) => {
  // Tarih formatla
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };
  
  // Bitiş tarihi hesapla
  const getRemainingTime = (endDateString) => {
    if (!endDateString) return 'Süresiz';
    
    try {
      const endDate = new Date(endDateString);
      const now = new Date();
      
      if (endDate <= now) {
        return 'Sona erdi';
      }
      
      const daysLeft = differenceInDays(endDate, now);
      if (daysLeft === 0) return 'Bugün sona eriyor';
      if (daysLeft === 1) return 'Yarın sona eriyor';
      
      return `${daysLeft} gün kaldı`;
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };
  
  // Toplam oy sayısını hesapla
  const getTotalVotes = (options) => {
    if (!options || !options.length) return 0;
    return options.reduce((sum, option) => sum + (option.oy_sayisi || 0), 0);
  };
  
  // Anket aktif mi?
  const isActive = (poll) => {
    if (!poll.bitis_tarihi) return true;
    
    try {
      const endDate = new Date(poll.bitis_tarihi);
      return new Date() <= endDate;
    } catch (error) {
      return true;
    }
  };
  
  // Toplam oy sayısı
  const totalVotes = getTotalVotes(poll.secenekler);
  const active = isActive(poll);

  return (
    <div className={`bg-white border ${active ? 'border-blue-200' : 'border-gray-200'} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
      {/* Aktif durum */}
      {active ? (
        <div className="bg-blue-500 text-white text-xs font-medium py-1 px-2 text-center">
          Aktif Anket
        </div>
      ) : (
        <div className="bg-gray-500 text-white text-xs font-medium py-1 px-2 text-center">
          Sona Ermiş Anket
        </div>
      )}
      
      <div className="p-4">
        {/* Anket başlığı */}
        <Link to={`/polls/${poll.poll_id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 mb-2 truncate">
            {poll.baslik}
          </h3>
        </Link>
        
        {/* Anket açıklaması */}
        {poll.aciklama && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {poll.aciklama}
          </p>
        )}
        
        {/* Meta bilgiler */}
        <div className="flex flex-wrap items-center text-xs text-gray-500 mb-3 gap-3">
          {/* Oluşturulma tarihi */}
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1" />
            <span>{formatDate(poll.acilis_tarihi)}</span>
          </div>
          
          {/* Üniversite */}
          {poll.universite && (
            <div className="flex items-center">
              <FaUniversity className="mr-1" />
              <span className="truncate max-w-[150px]">{poll.universite}</span>
            </div>
          )}
          
          {/* Kalan süre veya sona erme durumu */}
          <div className={`flex items-center ${active ? 'text-green-600' : 'text-red-600'}`}>
            <FaVoteYea className="mr-1" />
            <span>{poll.bitis_tarihi ? getRemainingTime(poll.bitis_tarihi) : 'Süresiz'}</span>
          </div>
          
          {/* Kategori */}
          {poll.kategori && (
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
              {poll.kategori}
            </span>
          )}
        </div>
        
        {/* Anket seçenekleri (mini önizleme) */}
        {poll.secenekler && poll.secenekler.length > 0 && (showResults || !active) ? (
          <div className="mt-2 mb-4 space-y-2">
            {poll.secenekler.slice(0, 3).map((option, index) => {
              const percentage = totalVotes > 0 ? Math.round((option.oy_sayisi / totalVotes) * 100) : 0;
              
              return (
                <div key={option.option_id || index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{option.metin}</span>
                    <span className="text-gray-600">{percentage}% ({option.oy_sayisi || 0})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            
            {poll.secenekler.length > 3 && (
              <div className="text-center text-sm text-blue-600 mt-2">
                <Link to={`/polls/${poll.poll_id}`}>
                  +{poll.secenekler.length - 3} daha fazla seçenek
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-2 mb-4">
            <div className="text-sm text-gray-600">
              <Link to={`/polls/${poll.poll_id}`} className="text-blue-600 hover:underline">
                Ankete katılmak veya sonuçları görmek için tıklayın
              </Link>
            </div>
          </div>
        )}
        
        {/* Alt bilgiler: Paylaşan, toplam oy sayısı */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          {/* Anket sahibi */}
          <div className="flex items-center">
            <Avatar 
              src={poll.acan_kisi?.profil_resmi_url}
              alt={poll.acan_kisi?.username || 'Kullanıcı'}
              size="xs"
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              {poll.acan_kisi?.username || 'Anonim'}
            </span>
          </div>
          
          {/* Toplam oy sayısı */}
          <div className="flex items-center text-sm text-gray-500">
            <FaVoteYea className="mr-1" />
            <span>{totalVotes} oy</span>
          </div>
        </div>
      </div>
    </div>
  );
};

PollCard.propTypes = {
  poll: PropTypes.shape({
    poll_id: PropTypes.string.isRequired,
    baslik: PropTypes.string.isRequired,
    aciklama: PropTypes.string,
    acilis_tarihi: PropTypes.string,
    bitis_tarihi: PropTypes.string,
    acan_kisi_id: PropTypes.string,
    acan_kisi: PropTypes.shape({
      username: PropTypes.string,
      profil_resmi_url: PropTypes.string
    }),
    secenekler: PropTypes.arrayOf(
      PropTypes.shape({
        option_id: PropTypes.string,
        metin: PropTypes.string,
        oy_sayisi: PropTypes.number
      })
    ),
    universite: PropTypes.string,
    kategori: PropTypes.string
  }).isRequired,
  showResults: PropTypes.bool
};

export default PollCard;