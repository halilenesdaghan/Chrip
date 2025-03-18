import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlus, FaFilter, FaSpinner } from 'react-icons/fa';
import api from '../api';
import ForumList from '../components/forum/ForumList';
import Button from '../components/common/Button';

const Forums = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [forums, setForums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [kategori, setKategori] = useState('');
  const [universite, setUniversite] = useState('');
  const [search, setSearch] = useState('');
  
  // Filtre seçenekleri
  const filterOptions = {
    all: 'Tüm Forumlar',
    newest: 'En Yeniler',
    popular: 'Popüler'
  };
  
  // Aktif filtre
  const [activeFilter, setActiveFilter] = useState('all');

  // Forumları getir
  const fetchForums = async (newPage = 1, resetData = false) => {
    try {
      setLoading(true);
      
      // Filtre parametreleri
      const params = {
        page: newPage,
        per_page: 10,
      };
      
      // Kategori ve üniversite filtreleri
      if (kategori) params.kategori = kategori;
      if (universite) params.universite = universite;
      if (search) params.search = search;
      
      const response = await api.get('/forums', { params });
      
      if (response.data.status === 'success') {
        const data = response.data.data || [];
        const meta = response.data.meta || {};
        
        // Sayfalama verileri
        const totalForums = meta.total || 0;
        const totalPages = meta.total_pages || 1;
        
        // Daha fazla sayfa var mı?
        setHasMore(newPage < totalPages);
        
        // Veri birleştirme veya sıfırlama
        if (resetData) {
          setForums(data);
        } else {
          setForums(prev => [...prev, ...data]);
        }
        
        // Sayfa numarasını güncelle
        setPage(newPage);
      }
    } catch (err) {
      console.error('Error fetching forums:', err);
      setError('Forumlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // İlk yüklemede forumları getir
  useEffect(() => {
    fetchForums(1, true);
  }, [activeFilter, kategori, universite, search]);
  
  // Daha fazla forum yükle
  const handleLoadMore = () => {
    fetchForums(page + 1);
  };
  
  // Filtre değişimi
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };
  
  // Filtre uygula
  const applyFilters = () => {
    fetchForums(1, true);
    setShowFilters(false);
  };
  
  // Filtreleri sıfırla
  const resetFilters = () => {
    setKategori('');
    setUniversite('');
    setSearch('');
    fetchForums(1, true);
    setShowFilters(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Başlık ve oluşturma butonu */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forumlar</h1>
          <p className="text-gray-600 mt-1">
            İlgi alanlarınızla ilgili tartışmalara katılın ve fikirlerinizi paylaşın.
          </p>
        </div>
        
        {isAuthenticated && (
          <Link to="/forums/create" className="mt-4 sm:mt-0">
            <Button variant="primary">
              <FaPlus className="mr-2" /> Yeni Forum Oluştur
            </Button>
          </Link>
        )}
      </div>
      
      {/* Arama kutusu */}
      <div className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Forum ara..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => fetchForums(1, true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700"
          >
            Ara
          </button>
        </div>
      </div>
      
      {/* Detaylı filtre butonu */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-md text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 flex items-center"
        >
          <FaFilter className="mr-2" /> Detaylı Filtrele
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
      
      {/* Forum listesi */}
      <ForumList
        forums={forums}
        loading={loading}
        error={error}
        onLoadMore={handleLoadMore}
        hasMore={hasMore}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
      />
      
      {/* Kullanıcı giriş yapmamışsa bilgilendirme */}
      {!isAuthenticated && (
        <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-md">
          <p className="text-center">
            Forum oluşturmak için lütfen <Link to="/login" className="font-medium underline">giriş yapın</Link> veya 
            <Link to="/register" className="font-medium underline ml-1">kayıt olun</Link>.
          </p>
        </div>
      )}
    </div>
  );
};

export default Forums;