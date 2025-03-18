import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4 text-center">
      <div className="mb-6 text-red-500">
        <FaExclamationTriangle size={60} />
      </div>
      
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Sayfa Bulunamadı</h2>
      
      <p className="text-gray-600 mb-8 max-w-md">
        Aradığınız sayfa kaldırılmış, adı değiştirilmiş veya geçici olarak kullanılamıyor olabilir.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button
          variant="primary"
          onClick={() => window.history.back()}
          className="flex items-center justify-center"
        >
          <FaArrowLeft className="mr-2" /> Geri Dön
        </Button>
        
        <Link to="/">
          <Button
            variant="outline"
            className="flex items-center justify-center"
          >
            <FaHome className="mr-2" /> Ana Sayfaya Git
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;