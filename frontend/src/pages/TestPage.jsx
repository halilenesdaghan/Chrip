import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const TestPage = () => {
  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Sayfası</h1>
      <p className="text-lg text-gray-700 mb-6">
        Bu test sayfası, frontend uygulamasının düzgün çalışıp çalışmadığını kontrol etmek için oluşturulmuştur.
        Aşağıdaki bağlantıları kullanarak uygulamanın farklı sayfalarına gidebilirsiniz.
      </p>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Sayfalar:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/">
            <Button variant="primary" fullWidth>Ana Sayfa</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" fullWidth>Giriş Sayfası</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline" fullWidth>Kayıt Sayfası</Button>
          </Link>
          <Link to="/forums">
            <Button variant="info" fullWidth>Forumlar</Button>
          </Link>
          <Link to="/polls">
            <Button variant="success" fullWidth>Anketler</Button>
          </Link>
          <Link to="/groups">
            <Button variant="warning" fullWidth>Gruplar</Button>
          </Link>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">UI Bileşen Testi:</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Butonlar:</h3>
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="info">Info</Button>
              <Button variant="light">Light</Button>
              <Button variant="dark">Dark</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="link">Link</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;