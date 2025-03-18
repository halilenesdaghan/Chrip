import React from 'react';
import { Link } from 'react-router-dom';
import { FaTwitter, FaFacebook, FaInstagram, FaGithub } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Site bilgileri */}
          <div className="md:col-span-1">
            <Link to="/" className="text-blue-600 font-bold text-xl">SosyalMedya</Link>
            <p className="mt-2 text-sm text-gray-500">
              Twitter benzeri sosyal medya platformu. Düşüncelerinizi paylaşın, anketler oluşturun ve gruplara katılın.
            </p>
          </div>
          
          {/* Bağlantılar */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Platformumuz</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-500 hover:text-gray-900">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-base text-gray-500 hover:text-gray-900">
                  Yardım
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-gray-500 hover:text-gray-900">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Yasal bağlantılar */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Yasal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-base text-gray-500 hover:text-gray-900">
                  Gizlilik Politikası
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-500 hover:text-gray-900">
                  Kullanım Şartları
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-base text-gray-500 hover:text-gray-900">
                  Çerez Politikası
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Sosyal medya */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Sosyal Medya</h3>
            <div className="mt-4 flex space-x-6">
              <a href="https://twitter.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="https://facebook.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="https://github.com/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">GitHub</span>
                <FaGithub className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Telif hakkı */}
        <div className="mt-8 border-t border-gray-200 pt-8 md:flex md:items-center md:justify-between">
          <div className="flex space-x-6 md:order-2">
            <span className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} SosyalMedya. Tüm hakları saklıdır.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;