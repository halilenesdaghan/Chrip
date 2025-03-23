import React from 'react';
import PropTypes from 'prop-types';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaRegThumbsUp, FaRegThumbsDown, FaRegComment, FaCalendarAlt, FaUniversity } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { ca, tr } from 'date-fns/locale';
import Avatar from '../common/Avatar';
import api from '../../api';

const ForumCard = ({ forum }) => {

  /*
  const{ token } = useSelector((state) => state.auth.token);
  const navigate = useNavigate();

  const handleHeaderClick = async (e) => {
    e.preventDefault();

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await api.get(`/forums/${forum.forum_id}`, config);
      console.log("Fetch forum response:", response.data);

      navigate(`/forums/${forum.forum_id}`);
    } catch (error) {
      console.error('Fetch forum error:', error);
    }
  };

  */
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
            {forum.header}
          </h3>
        </Link>
        
        {/* Forum açıklaması (varsa) */}
        {forum.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {forum.description}
          </p>
        )}
        
        {/* Meta bilgiler */}
        <div className="flex flex-wrap items-center text-xs text-gray-500 mb-3 gap-3">
          {/* Tarih */}
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1" />
            <span>{formatDate(forum.created_at)}</span>
          </div>
          
          {/* Üniversite (varsa) */}
          {forum.university && (
            <div className="flex items-center">
              <FaUniversity className="mr-1" />
              <span className="truncate max-w-[150px]">{forum.university}</span>
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
              src={forum.creator_id?.profile_image_url}
              alt={forum.creator_id?.username || 'Kullanıcı'}
              size="xs"
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              {forum.creator_id?.username || 'Anonim'}
            </span>
          </div>
          
          {/* İstatistikler */}
          <div className="flex items-center space-x-3 text-sm">
            {/* Beğeni sayısı */}
            <div className="flex items-center text-gray-500">
              <FaRegThumbsUp className="mr-1" />
              <span>{forum.like_count || 0}</span>
            </div>
            
            {/* Beğenmeme sayısı */}
            <div className="flex items-center text-gray-500">
              <FaRegThumbsDown className="mr-1" />
              <span>{forum.dislike_count || 0}</span>
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
    header: PropTypes.string.isRequired,
    description: PropTypes.string,
    created_at: PropTypes.string,
    creator_id: PropTypes.string,
    photo_urls: PropTypes.arrayOf(PropTypes.string),
    like_count: PropTypes.string,
    dislike_count: PropTypes.string,
    university: PropTypes.string,
    category: PropTypes.string
  }).isRequired
};

export default ForumCard;