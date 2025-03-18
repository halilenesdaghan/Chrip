import React from 'react';
import PropTypes from 'prop-types';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({
  children,
  showSidebar = true,
  showFooter = true,
  containerClassName = '',
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="flex-grow flex">
        {/* Sidebar (varsa) */}
        {showSidebar && (
          <div className="hidden md:block w-64 border-r border-gray-200 bg-white">
            <Sidebar />
          </div>
        )}

        {/* Content */}
        <main className={`flex-grow py-6 px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
          {children}
        </main>
      </div>

      {/* Footer (varsa) */}
      {showFooter && <Footer />}

      {/* Toast bildirimler */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
  showSidebar: PropTypes.bool,
  showFooter: PropTypes.bool,
  containerClassName: PropTypes.string,
};

export default Layout;