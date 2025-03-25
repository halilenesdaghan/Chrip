import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import api from '../api';
import ForumCard from '../components/forum/ForumCard';
import PollCard from '../components/poll/PollCard';
import { FaPlusCircle } from 'react-icons/fa';
import { set } from 'date-fns';

const Home = () => {
  const [forums, setForums] = useState([]);
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [forumPagination, setForumPagination] = useState({});
  const [pollPagination, setPollPagination] = useState(null);
  const [forumsHasPrevious, setForumsHasPrevious] = useState(false);
  const [forumsHasNext, setForumsHasNext] = useState(false);
  const [pollsHasPrevious, setPollsHasPrevious] = useState(false);
  const [pollsHasNext, setPollsHasNext] = useState(false);
  const [currentForumPage, setCurrentForumPage] = useState(1);
  const [currentPollPage, setCurrentPollPage] = useState(1);
  
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);

  const fetchForums = async (page = 1) => {
    try {
      setLoading(true);
      
      let university = null;
      if (user && user.role !== 'admin') {
        university = user.university;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: page,
          per_page: 10,
          university: university
        }
      };
      
      // Fetch forums
      const forumsResponse = await api.get('/forums/', config);

      const forum_pagination = {
        has_prev: forumsResponse.data.meta.pagination.has_prev,
        has_next: forumsResponse.data.meta.pagination.has_next,
        current_page: forumsResponse.data.meta.pagination.page,
        per_page: forumsResponse.data.meta.pagination.per_page,
        total_pages: forumsResponse.data.meta.pagination.total_pages,
        total_items: forumsResponse.data.meta.pagination.total_items
      };
      
      setForumPagination(forum_pagination || {});
      setForumsHasPrevious(forumsResponse.data.meta.pagination.has_prev || false);
      setForumsHasNext(forumsResponse.data.meta.pagination.has_next || false);
      setForums(forumsResponse.data.data || []);
      setCurrentForumPage(page);
      
      return true;
    } catch (err) {
      console.error('Error fetching forums:', err);
      setError('Forumlar yüklenirken bir hata oluştu.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const fetchPolls = async (page = 1) => {
    try {
      setLoading(true);
      
      let university = null;
      if (user && user.role !== 'admin') {
        university = user.university;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          page: page,
          per_page: 10,
          university: university
        }
      };
      
      // Fetch polls
      const pollsResponse = await api.get('/polls', config);

      const poll_pagination = {
        has_prev: pollsResponse.data.meta.pagination.has_prev,
        has_next: pollsResponse.data.meta.pagination.has_next,
        current_page: pollsResponse.data.meta.pagination.page,
        per_page: pollsResponse.data.meta.pagination.per_page,
        total_pages: pollsResponse.data.meta.pagination.total_pages,
        total_items: pollsResponse.data.meta.pagination.total_items
      };
      
      setPollPagination(poll_pagination || {});
      setPollsHasPrevious(pollsResponse.data.meta.pagination.has_prev || false);
      setPollsHasNext(pollsResponse.data.meta.pagination.has_next || false);
      setPolls(pollsResponse.data.data || []);
      setCurrentPollPage(page);
      
      return true;
    } catch (err) {
      console.error('Error fetching polls:', err);
      setError('Anketler yüklenirken bir hata oluştu.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleNextForumPage = async () => {
    if (forumsHasNext) {
      await fetchForums(currentForumPage + 1);
    }
  };

  const handlePreviousForumPage = async () => {
    if (forumsHasPrevious) {
      await fetchForums(currentForumPage - 1);
    }
  };

  const handleNextPollPage = async () => {
    if (pollsHasNext) {
      await fetchPolls(currentPollPage + 1);
    }
  };

  const handlePreviousPollPage = async () => {
    if (pollsHasPrevious) {
      await fetchPolls(currentPollPage - 1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const forumsSuccess = await fetchForums(1);
        // Uncomment when you want to enable polls
        // if (forumsSuccess) {
        //   await fetchPolls(1);
        // }
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
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
              
              {/* Pagination controls */}
              <div className="flex justify-between mt-4">
                {forumsHasPrevious && (
                  <button 
                    className="w-8 h-8 flex items-center justify-center text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={handlePreviousForumPage}
                    aria-label="Previous page"
                  >
                    &lt;
                  </button>
                )}
                
                {forumPagination && forumPagination.current_page && (
                  <span className="mx-auto flex items-center">
                    Sayfa {forumPagination.current_page} / {forumPagination.total_pages || 1}
                  </span>
                )}
                
                {forumsHasNext && (
                  <button 
                    className="ml-auto w-8 h-8 flex items-center justify-center text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    onClick={handleNextForumPage}
                    aria-label="Next page"
                  >
                    &gt;
                  </button>
                )}
              </div>
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
              
              {/* Poll Pagination controls */}
              <div className="flex justify-between mt-4">
                {pollsHasPrevious && (
                  <button 
                    className="w-8 h-8 flex items-center justify-center text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onClick={handlePreviousPollPage}
                    aria-label="Previous page"
                  >
                    &lt;
                  </button>
                )}
                
                {pollPagination && pollPagination.current_page && (
                  <span className="mx-auto flex items-center">
                    Sayfa {pollPagination.current_page} / {pollPagination.total_pages || 1}
                  </span>
                )}
                
                {pollsHasNext && (
                  <button 
                    className="ml-auto w-8 h-8 flex items-center justify-center text-blue-600 border border-blue-600 rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    onClick={handleNextPollPage}
                    aria-label="Next page"
                  >
                    &gt;
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;