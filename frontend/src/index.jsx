import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store';
import App from './App';
import './styles/index.css';

// uuid kütüphanesini package.json'a eklememiz gerek
// npm install uuid

// Mock API için gerekli paketleri yükleyin
// Tarayıcının konsolunda "Module not found" hatası görürseniz
// npm install uuid yapmanız gerekecek

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);