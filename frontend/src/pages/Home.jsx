import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../api';
import ForumCard from '../components/forum/ForumCard';
import PollCard from '../components/poll/PollCard';
import { FaPlusCircle } from 'react-icons/fa';

const Home = () => {
  const [forums, setForums] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Forumları getir
        const forumsResponse = await api.get('/forums', {
          params: { page: 1, per_page: 5 }
        });
        
        // Anketleri getir
        const pollsResponse = await api.get('/polls', {
          params: { page: 1, per_page: 5, aktif: true }
        });
        
        setForums(forumsResponse.data.data || []);
        setPolls(pollsResponse.data.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Hero section */}
      <div className="text-center py-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sosyal Medya Platformuna Hoş Geldiniz</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Düşüncelerinizi paylaşın, anketlere katılın ve topluluklar keşfedin.
          İlginizi çeken konular hakkında tartışmalar başlatın ve fikirlerinizi diğer kullanıcılarla paylaşın.
        </p>
        
        {isAuthenticated ? (
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link 
              to="/forums/create" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <FaPlusCircle className="mr-2" /> Yeni Forum Oluştur
            </Link>
            <Link 
              to="/polls/create" 
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <FaPlusCircle className="mr-2" /> Yeni Anket Oluştur
            </Link>
          </div>
        ) : (
          <div className="mt-6">
            <Link 
              to="/register" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Hemen Kayıt Ol
            </Link>
          </div>
        )}
      </div>
      
      {/* Content section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Son Forumlar */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Son Forumlar</h2>
            <Link to="/forums" className="text-blue-600 hover:text-blue-800">Tümünü Gör</Link>
          </div>
          
          {error ? (
            <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>
          ) : forums.length === 0 ? (
            <div className="bg-gray-100 p-4 rounded-md text-gray-700">Henüz hiç forum yok</div>
          ) : (
            <div className="space-y-4">
              {forums.map((forum) => (
                <ForumCard key={forum.forum_id} forum={forum} />
              ))}
            </div>
          )}
        </div>
        
        {/* Aktif Anketler */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Aktif Anketler</h2>
            <Link to="/polls" className="text-blue-600 hover:text-blue-800">Tümünü Gör</Link>
          </div>
          
          {error ? (
            <div className="bg-red-100 p-4 rounded-md text-red-700">{error}</div>
          ) : polls.length === 0 ? (
            <div className="bg-gray-100 p-4 rounded-md text-gray-700">Henüz hiç anket yok</div>
          ) : (
            <div className="space-y-4">
              {polls.map((poll) => (
                <PollCard key={poll.poll_id} poll={poll} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;