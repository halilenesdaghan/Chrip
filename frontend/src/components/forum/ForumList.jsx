import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ForumCard from './ForumCard';
import Button from '../common/Button';

const ForumList = ({
  forums,
  loading,
  error,
  onLoadMore,
  hasMore = false,
  filterOptions = null,
  onFilterChange = null,
}) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    if (onFilterChange) {
      onFilterChange(filter);
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtre seçenekleri (varsa) */}
      {filterOptions && (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-200">
          {Object.keys(filterOptions).map((key) => (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activeFilter === key
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filterOptions[key]}
            </button>
          ))}
        </div>
      )}

      {/* Hata mesajı */}
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Yükleniyor */}
      {loading && forums.length === 0 && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Forumlar */}
      {forums.length > 0 ? (
        <div className="space-y-4">
          {forums.map((forum) => (
            <ForumCard key={forum.forum_id} forum={forum} />
          ))}
        </div>
      ) : !loading ? (
        <div className="p-8 text-center bg-gray-50 rounded-md">
          <p className="text-gray-600">Hiç forum bulunamadı.</p>
        </div>
      ) : null}

      {/* Daha fazla yükle */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={loading}
            className="px-4 py-2"
          >
            {loading ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
          </Button>
        </div>
      )}
    </div>
  );
};

ForumList.propTypes = {
  forums: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onLoadMore: PropTypes.func,
  hasMore: PropTypes.bool,
  filterOptions: PropTypes.object,
  onFilterChange: PropTypes.func,
};

export default ForumList;