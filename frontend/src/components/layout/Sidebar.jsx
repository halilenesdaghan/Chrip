import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaHome,
  FaComments,
  FaPoll,
  FaUsers,
  FaUser,
  FaCog,
  FaPlus,
} from 'react-icons/fa';
import Avatar from '../common/Avatar';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);

  // Seçili bağlantı kontrolü
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Ana navigasyon linkleri
  const navLinks = [
    { to: '/', icon: <FaHome />, text: 'Ana Sayfa' },
    { to: '/forums', icon: <FaComments />, text: 'Forumlar' },
    { to: '/polls', icon: <FaPoll />, text: 'Anketler' },
    { to: '/groups', icon: <FaUsers />, text: 'Gruplar' },
  ];

  // İçerik oluşturma linkleri
  const createLinks = [
    { to: '/forums/create', icon: <FaPlus />, text: 'Forum Oluştur' },
    { to: '/polls/create', icon: <FaPlus />, text: 'Anket Oluştur' },
    { to: '/groups/create', icon: <FaPlus />, text: 'Grup Oluştur' },
  ];

  // Kullanıcı linkleri
  const userLinks = [
    { to: '/profile', icon: <FaUser />, text: 'Profilim' },
    { to: '/settings', icon: <FaCog />, text: 'Ayarlar' },
  ];

  return (
    <div className="h-full py-6 px-3 flex flex-col">
      {/* Kullanıcı profili */}
      <div className="px-4 py-4 mb-6">
        <div className="flex items-center">
          <Avatar 
            src={user?.profil_resmi_url}
            alt={user?.username}
            size="lg"
          />
          <div className="ml-3">
            <div className="font-medium text-gray-900">{user?.username}</div>
            <div className="text-sm text-gray-500 truncate max-w-xs">{user?.email}</div>
          </div>
        </div>
      </div>

      {/* Ana navigasyon */}
      <div className="mb-8">
        <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Navigasyon
        </h3>
        <div className="mt-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive(link.to)
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`mr-3 h-5 w-5 ${isActive(link.to) ? 'text-blue-500' : 'text-gray-500'}`}>
                {link.icon}
              </span>
              {link.text}
            </Link>
          ))}
        </div>
      </div>

      {/* İçerik oluşturma */}
      <div className="mb-8">
        <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          İçerik Oluştur
        </h3>
        <div className="mt-2 space-y-1">
          {createLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive(link.to)
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`mr-3 h-5 w-5 ${isActive(link.to) ? 'text-blue-500' : 'text-gray-500'}`}>
                {link.icon}
              </span>
              {link.text}
            </Link>
          ))}
        </div>
      </div>

      {/* Kullanıcı bölümü */}
      <div className="mt-auto">
        <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Hesabım
        </h3>
        <div className="mt-2 space-y-1">
          {userLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                isActive(link.to)
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className={`mr-3 h-5 w-5 ${isActive(link.to) ? 'text-blue-500' : 'text-gray-500'}`}>
                {link.icon}
              </span>
              {link.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;