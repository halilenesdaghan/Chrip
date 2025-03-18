import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaVoteYea, FaSpinner } from 'react-icons/fa';
import Button from '../common/Button';
import api from '../../api';

const PollVote = ({ 
  poll, 
  onVoteComplete,
  showResults = false,
  initialVotedOptionId = null
}) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [selectedOption, setSelectedOption] = useState(initialVotedOptionId);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  
  // Toplam oy sayısını hesapla
  const getTotalVotes = () => {
    if (results) {
      return results.reduce((sum, option) => sum + option.oy_sayisi, 0);
    }
    
    return poll.secenekler.reduce((sum, option) => sum + (option.oy_sayisi || 0), 0);
  };
  
  // Anket aktif mi?
  const isActive = () => {
    if (!poll.bitis_tarihi) return true;
    
    try {
      const endDate = new Date(poll.bitis_tarihi);
      return new Date() <= endDate;
    } catch (error) {
      return true;
    }
  };
  
  // Oy kullan
  const handleVote = async () => {
    if (!selectedOption) {
      toast.warning('Lütfen bir seçenek seçin');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await api.post(`/polls/${poll.poll_id}/vote`, {
        option_id: selectedOption
      });
      
      if (response.data.status === 'success') {
        toast.success('Oyunuz başarıyla kaydedildi');
        setResults(response.data.data.results);
        
        // Oy kullanma işlemi tamamlandığında üst bileşeni bilgilendir
        if (onVoteComplete) {
          onVoteComplete(selectedOption, response.data.data.results);
        }
      }
    } catch (err) {
      console.error('Error voting:', err);
      toast.error(err.response?.data?.message || 'Oy kullanırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  const totalVotes = getTotalVotes();
  const active = isActive();
  
  // Sonuçları göster: Kullanıcı oy kullanmışsa, showResults true ise veya anket sona ermişse
  const displayResults = !active || showResults || initialVotedOptionId || results;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      {/* Başlık */}
      <h3 className="text-lg font-semibold text-gray-900 mb-3">
        {displayResults ? 'Anket Sonuçları' : 'Oy Kullan'}
      </h3>
      
      {/* Seçenekler ve sonuçlar */}
      <div className="space-y-3 mb-4">
        {poll.secenekler.map((option) => {
          const optionId = option.option_id;
          const currentResults = results || poll.secenekler;
          const currentOption = currentResults.find(o => o.option_id === optionId) || option;
          const percentage = totalVotes > 0 
            ? Math.round((currentOption.oy_sayisi / totalVotes) * 100) 
            : 0;
          
          return (
            <div key={optionId}>
              {displayResults ? (
                // Sonuç gösterimi
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className={`font-medium ${initialVotedOptionId === optionId ? 'text-blue-600' : ''}`}>
                      {option.metin}
                      {initialVotedOptionId === optionId && ' (Sizin oyunuz)'}
                    </span>
                    <span className="text-gray-600">{percentage}% ({currentOption.oy_sayisi || 0})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        initialVotedOptionId === optionId ? 'bg-blue-600' : 'bg-gray-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ) : (
                // Oy kullanma formu
                <div className="flex items-center">
                  <input
                    type="radio"
                    id={`option-${optionId}`}
                    name="poll-option"
                    value={optionId}
                    checked={selectedOption === optionId}
                    onChange={() => setSelectedOption(optionId)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <label 
                    htmlFor={`option-${optionId}`} 
                    className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    {option.metin}
                  </label>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Toplam oy sayısı */}
      <div className="text-sm text-gray-600 mb-4">
        Toplam {totalVotes} oy kullanıldı
      </div>
      
      {/* Oy kullanma butonları */}
      {!displayResults && active && isAuthenticated ? (
        <Button
          onClick={handleVote}
          disabled={!selectedOption || loading}
          variant="primary"
          fullWidth
        >
          {loading ? (
            <>
              <FaSpinner className="animate-spin mr-2" /> Oyunuz Kaydediliyor...
            </>
          ) : (
            <>
              <FaVoteYea className="mr-2" /> Oy Kullan
            </>
          )}
        </Button>
      ) : !isAuthenticated && active && !displayResults ? (
        <div className="text-center p-3 bg-blue-50 text-blue-700 rounded-md">
          <p>
            Oy kullanabilmek için 
            <Link to="/login" className="font-medium underline mx-1">giriş yapmalı</Link>
            veya
            <Link to="/register" className="font-medium underline mx-1">kaydolmalısınız</Link>.
          </p>
        </div>
      ) : !active && (
        <div className="text-center p-3 bg-gray-100 text-gray-700 rounded-md">
          Bu anket sona ermiştir.
        </div>
      )}
      
      {/* Sonuçları göster/gizle butonu */}
      {isAuthenticated && active && !results && !initialVotedOptionId && (
        <div className="mt-3 text-center">
          <button
            onClick={() => onVoteComplete(null, poll.secenekler)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showResults ? 'Sonuçları Gizle' : 'Sonuçları Göster'}
          </button>
        </div>
      )}
    </div>
  );
};

PollVote.propTypes = {
  poll: PropTypes.shape({
    poll_id: PropTypes.string.isRequired,
    baslik: PropTypes.string.isRequired,
    bitis_tarihi: PropTypes.string,
    secenekler: PropTypes.arrayOf(
      PropTypes.shape({
        option_id: PropTypes.string.isRequired,
        metin: PropTypes.string.isRequired,
        oy_sayisi: PropTypes.number
      })
    ).isRequired
  }).isRequired,
  onVoteComplete: PropTypes.func,
  showResults: PropTypes.bool,
  initialVotedOptionId: PropTypes.string
};

export default PollVote;