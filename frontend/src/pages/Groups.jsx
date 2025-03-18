import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaPlus, FaFilter, FaSpinner } from 'react-icons/fa';
import api from '../api';
import GroupCard from '../components/group/GroupCard';
import GroupList from '../components/group/GroupList';
import Button from '../components/common/Button';

const Groups = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [kategoriler, setKategoriler] = useState([]);
  const [privacy, setPrivacy] = useState('');
  
  // Filtreleme seçenekleri
  const privacyOptions = [
    { value: '', label: 'Tüm Gruplar' },
    { value: 'acik', label: 'Açık Gruplar' },
    { value: 'kapali', label: 'Kapalı Gruplar' },
    { value: 'gizli', label: 'Gizli Gruplar' }
  ];

  // Grupları getir
  const fetchGroups = async (newPage = 1, resetData = false) => {
    try {
      setLoading(true);
      
      // Filtre parametreleri
      const params = {
        page: newPage,
        per_page: 12,
      };
      
      // Arama filtresi
      if (search) params.search = search;
      
      // Kategori filtresi
      if (kategoriler.length > 0) {
        params.kategoriler = kategoriler;
      }
      
      // Gizlilik filtresi
      if (privacy) params.gizlilik = privacy;
      
      const response = await api.get('/groups', { params });
      
      if (response.data.status === 'success') {
        const data = response.data.data || [];
        const meta = response.data.meta || {};
        
        // Sayfalama verileri
        const totalGroups = meta.total || 0;
        const totalPages = meta.total_pages || 1;
        
        // Daha fazla sayfa var mı?
        setHasMore(newPage < totalPages);
        
        // Veri birleştirme veya sıfırlama
        if (resetData) {
          setGroups(data);
        } else {
          setGroups(prev => [...prev, ...data]);
        }
        
        // Sayfa numarasını güncelle
        setPage(newPage);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      setError('Gruplar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };
  
  // İlk yüklemede grupları getir
  useEffect(() => {
    fetchGroups(1, true);
  }, []);
  
  // Daha fazla grup yükle
  const handleLoadMore = () => {
    fetchGroups(page + 1);
  };
  
  // Filtre uygula
  const applyFilters = () => {
    fetchGroups(1, true);
    setShowFilters(false);
  };
  
  // Kategori ekle veya çıkar
  const toggleCategory = (category) => {
    if (kategoriler.includes(category)) {
      setKategoriler(kategoriler.filter(cat => cat !== category));
    } else {
      setKategoriler([...kategoriler, category]);
    }
  };
  
  // Kategori inputu
  const [newCategory, setNewCategory] = useState('');
  
  // Yeni kategori ekle
  const addCategory = () => {
    if (newCategory.trim() && !kategoriler.includes(newCategory.trim())) {
      setKategoriler([...kategoriler, newCategory.trim()]);
      setNewCategory('');
    }
  };
  
  // Filtreleri sıfırla
  const resetFilters = () => {
    setSearch('');
    setKategoriler([]);
    setPrivacy('');
    fetchGroups(1, true);
    setShowFilters(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Başlık ve oluşturma butonu */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gruplar</h1>
          <p className="text-gray-600 mt-1">
            İlgi alanlarınıza uygun gruplara katılın veya yeni gruplar oluşturun.
          </p>
        </div>
        
        {isAuthenticated && (
          <Link to="/groups/create" className="mt-4 sm:mt-0">
            <Button variant="primary">
              <FaPlus className="mr-2" /> Yeni Grup Oluştur
            </Button>
          </Link>
        )}
      </div>
      
      {/* Arama ve filtre */}
      <div className="mb-6">
        <div className="flex">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Grup ara..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={() => fetchGroups(1, true)}
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
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gizlilik
            </label>
            <select
              value={privacy}
              onChange={(e) => setPrivacy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {privacyOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategoriler
            </label>
            <div className="flex mb-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Kategori ekle"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md"
              />
              <button
                type="button"
                onClick={addCategory}
                disabled={!newCategory.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 disabled:opacity-50"
              >
                <FaPlus />
              </button>
            </div>
            
            {/* Seçilen kategoriler */}
            {kategoriler.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {kategoriler.map((category, index) => (
                  <div 
                    key={index}
                    className="flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
                  >
                    <span>{category}</span>
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className="ml-1 text-blue-800 hover:text-blue-900"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            )}
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
      
      {/* Grup listesi */}
      {loading && groups.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-500" />
        </div>
      ) : groups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.group_id} group={group} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 p-8 text-center rounded-md">
          <p className="text-gray-500 mb-4">Şu anda görüntülenecek grup yok.</p>
          {isAuthenticated && (
            <Link to="/groups/create">
              <Button variant="primary">
                <FaPlus className="mr-2" /> İlk Grubu Oluştur
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
            {loading ? (
              <>
                <FaSpinner className="animate-spin mr-2" /> Yükleniyor...
              </>
            ) : (
              'Daha Fazla Yükle'
            )}
          </Button>
        </div>
      )}
      
      {/* Kullanıcı giriş yapmamışsa bilgilendirme */}
      {!isAuthenticated && (
        <div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-md">
          <p className="text-center">
            Grup oluşturmak için lütfen <Link to="/login" className="font-medium underline">giriş yapın</Link> veya 
            <Link to="/register" className="font-medium underline ml-1">kayıt olun</Link>.
          </p>
        </div>
      )}
    </div>
  );
};

export default Groups;