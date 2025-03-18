import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import Layout from '../components/layout/Layout';

const Login = () => {
  return (
    <Layout showSidebar={false} showFooter={false}>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <h1 className="text-center text-3xl font-extrabold text-gray-900">Sosyal Medya</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Düşüncelerinizi paylaşın, anket oluşturun ve gruplara katılın.
          </p>
        </div>
        
        <LoginForm />
      </div>
    </Layout>
  );
};

export default Login;