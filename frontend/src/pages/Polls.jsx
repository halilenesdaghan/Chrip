import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlus, FaFilter } from 'react-icons/fa';
import api from '../api';
import PollCard from '../components/poll/PollCard';
import Button from '../components/common/Button';

const Polls = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [filter, setFilter] = useState('active'); // 'active', 'ended', 'all'
  const [showFilters, setShowFilters] = useState(false);
  const [kategori, setKategori] = useState('');
  const [universite, setUniversite] = useState('');
  
  // Anketleri getir
  const fetchPolls = async (newPage = 1, resetData = false) => {
    try {
      setLoading(true);
      
      // Filtre parametreleri
      const params = {
        page: newPage,
        per_page: 10,
      };
      
      // Aktif/sonlanmış filtresi
      if (filter === 'active') {
        params.aktif = true;
      } else if (filter === 'ended') {
        params.aktif = false;
      }
      
      // Kategori ve üniversite filtreleri
      if (kategori) params.kategori = kategori;
      if (universite) params.universite = universite;
      
      const response = await api.get('/polls', { params });
      
      if (response.data.status === 'success') {
        const data = response.data.data || [];
        const meta = response.data.meta || {};
        
        // Sayfalama verileri
        const totalPolls = meta.total || 0;
        const totalPages = meta.total_pages || 1;
        
        // Daha fazla sayfa var mı?
        setHasMore(newPage < totalPages);
        
        // Veri birleştirme veya sıfırlama
        if (resetData) {
          setPolls(data);
        } else {
          setPolls(prev => [...prev, ...data]);
        }
        
        // Sayfa numarasını güncelle
        setPage(newPage);
      }
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError('Anketler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // İlk yüklemede anketleri getir
  useEffect(() => {
    fetchPolls(1, true);
  }, [filter, kategori, universite]);
  
  // Daha fazla anket yükle
  const handleLoadMore = () => {
    fetchPolls(page + 1);
  };
  
  // Filtre değişimi
  const applyFilters = () => {
    fetchPolls(1, true);
    setShowFilters(false);
  };
  
  // Filtreleri sıfırla
  const resetFilters = () => {
    setKategori('');
    setUniversite('');
    fetchPolls(1, true);
    setShowFilters(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Başlık ve filtreler */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Anketler</h1>
          <p className="text-gray-600 mt-1">
            Aktif anketlere katılın ve görüşlerinizi paylaşın.
          </p>
        </div>
        
        {isAuthenticated && (
          <Link to="/polls/create" className="mt-4 sm:mt-0">
            <Button variant="primary">
              <FaPlus className="mr-2" /> Yeni Anket Oluştur
            </Button>
          </Link>
        )}
      </div>
      
      {/* Ana filtreler */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'active' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Aktif Anketler
        </button>
        <button
          onClick={() => setFilter('ended')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'ended' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Sonlanmış Anketler
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Tüm Anketler
        </button>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 ml-auto"
        >
          <FaFilter className="inline mr-2" /> Detaylı Filtrele
        </button>
      </div>
      
      {/* Detaylı filtreler */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategori
              </label>
              <input
                type="text"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                placeholder="Kategori girin"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Üniversite
              </label>
              <input
                type="text"
                value={universite}
                onChange={(e) => setUniversite(e.target.value)}
                placeholder="Üniversite girin"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              variant="light" 
              size="sm"
              onClick={resetFilters}
            >
              Sıfırla
            </Button>
            <Button 
              variant="primary" 
              size="sm"
              onClick={applyFilters}
            >
              Filtrele
            </Button>
          </div>
        </div>
      )}
      
      {/* Hata durumu */}
      {error && (
        <div className="bg-red-100 p-4 rounded-md text-red-700 mb-6">
          {error}
        </div>
      )}
      
      {/* Anketler */}
      {loading && polls.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : polls.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {polls.map((poll) => (
            <PollCard 
              key={poll.poll_id} 
              poll={poll}
              showResults={filter === 'ended'}
            />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 text-center rounded-md">
          <p className="text-gray-500 mb-4">Şu anda görüntülenecek anket yok.</p>
          {isAuthenticated && (
            <Link to="/polls/create">
              <Button variant="primary">
                <FaPlus className="mr-2" /> İlk Anketi Oluştur
              </Button>
            </Link>
          )}
        </div>
      )}
      
      {/* Daha fazla yükle */}
      {hasMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={loading}
          >
            {loading ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Polls;