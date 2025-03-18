import React from 'react';
import RegisterForm from '../components/auth/RegisterForm';
import Layout from '../components/layout/Layout';

const Register = () => {
  return (
    <Layout showSidebar={false} showFooter={false}>
      <div className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md mb-8">
          <h1 className="text-center text-3xl font-extrabold text-gray-900">Sosyal Medya</h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Hesap oluşturarak tartışmalara katılabilir, paylaşım yapabilir ve diğer özelliklere erişebilirsiniz.
          </p>
        </div>
        
        <RegisterForm />
      </div>
    </Layout>
  );
};

export default Register;