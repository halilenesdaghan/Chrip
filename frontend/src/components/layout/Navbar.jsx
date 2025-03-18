import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../../store/authSlice';
import { FaHome, FaUser, FaSignOutAlt, FaUsers, FaPoll, FaBars, FaTimes } from 'react-icons/fa';
import Avatar from '../common/Avatar';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-blue-600 font-bold text-xl">SosyalMedya</Link>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link 
                to="/" 
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                <FaHome className="mr-1" /> Ana Sayfa
              </Link>
              <Link 
                to="/forums" 
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                <FaUsers className="mr-1" /> Forumlar
              </Link>
              <Link 
                to="/polls" 
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                <FaPoll className="mr-1" /> Anketler
              </Link>
              <Link 
                to="/groups" 
                className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
              >
                <FaUsers className="mr-1" /> Gruplar
              </Link>
            </div>
          </div>
          
          {/* Right side menu (desktop) */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <div className="flex items-center">
                <div className="relative">
                  <Link to="/profile" className="flex items-center text-gray-900 hover:text-blue-600">
                    <Avatar
                      src={user?.profil_resmi_url}
                      alt={user?.username}
                      size="sm"
                      className="mr-2"
                    />
                    <span className="font-medium">{user?.username}</span>
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 p-2 rounded-full text-red-600 hover:bg-red-100 focus:outline-none"
                  title="Çıkış Yap"
                >
                  <FaSignOutAlt />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  Giriş Yap
                </Link>
                <Link 
                  to="/register" 
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Menü Aç</span>
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={toggleMobileMenu}
            >
              <FaHome className="inline mr-2" /> Ana Sayfa
            </Link>
            <Link
              to="/forums"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={toggleMobileMenu}
            >
              <FaUsers className="inline mr-2" /> Forumlar
            </Link>
            <Link
              to="/polls"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={toggleMobileMenu}
            >
              <FaPoll className="inline mr-2" /> Anketler
            </Link>
            <Link
              to="/groups"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={toggleMobileMenu}
            >
              <FaUsers className="inline mr-2" /> Gruplar
            </Link>
          </div>
          
          {/* Mobile authentication links */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <>
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0">
                    <Avatar
                      src={user?.profil_resmi_url}
                      alt={user?.username}
                      size="md"
                    />
                  </div>
                  <div className="ml-3">
                    <div className="text-base font-medium text-gray-800">{user?.username}</div>
                    <div className="text-sm font-medium text-gray-500">{user?.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  <Link
                    to="/profile"
                    className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                    onClick={toggleMobileMenu}
                  >
                    <FaUser className="inline mr-2" /> Profil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  >
                    <FaSignOutAlt className="inline mr-2" /> Çıkış Yap
                  </button>
                </div>
              </>
            ) : (
              <div className="mt-3 space-y-1">
                <Link
                  to="/login"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={toggleMobileMenu}
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={toggleMobileMenu}
                >
                  Kayıt Ol
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;