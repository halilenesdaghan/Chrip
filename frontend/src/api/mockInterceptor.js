// Mock API Interceptor
// Backend olmadan çalışabilmesi için API çağrılarını yerel depolamaya yönlendirir

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Yerel depolama yardımcı fonksiyonları
const localStorageDB = {
  // Veri tipine göre localStorage'da veri alma
  get: (key, defaultValue = []) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`LocalStorage'dan veri alınırken hata: ${key}`, e);
      return defaultValue;
    }
  },
  
  // Veri tipine göre localStorage'a veri kaydetme
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`LocalStorage'a veri kaydedilirken hata: ${key}`, e);
      return false;
    }
  },
  
  // Belirli bir ID'ye sahip öğeyi alma
  getById: (collectionKey, id) => {
    const collection = localStorageDB.get(collectionKey, []);
    return collection.find(item => item.id === id || 
                                    item.user_id === id || 
                                    item.forum_id === id || 
                                    item.poll_id === id || 
                                    item.group_id === id || 
                                    item.comment_id === id);
  },
  
  // Belirli bir koşula uyan öğeleri alma
  getWhere: (collectionKey, condition) => {
    const collection = localStorageDB.get(collectionKey, []);
    return collection.filter(condition);
  },
  
  // Yeni öğe ekleme
  add: (collectionKey, item) => {
    const collection = localStorageDB.get(collectionKey, []);
    const newItem = { ...item };
    
    // Eğer ID yoksa oluştur
    if (!newItem.id && !newItem.user_id && !newItem.forum_id && 
        !newItem.poll_id && !newItem.group_id && !newItem.comment_id) {
      // İlgili ID türünü belirle
      if (collectionKey === 'users') newItem.user_id = uuidv4();
      else if (collectionKey === 'forums') newItem.forum_id = uuidv4();
      else if (collectionKey === 'polls') newItem.poll_id = uuidv4();
      else if (collectionKey === 'groups') newItem.group_id = uuidv4();
      else if (collectionKey === 'comments') newItem.comment_id = uuidv4();
      else newItem.id = uuidv4();
    }
    
    collection.push(newItem);
    localStorageDB.set(collectionKey, collection);
    return newItem;
  },
  
  // Öğe güncelleme
  update: (collectionKey, id, updates) => {
    const collection = localStorageDB.get(collectionKey, []);
    const index = collection.findIndex(item => 
      item.id === id || 
      item.user_id === id || 
      item.forum_id === id || 
      item.poll_id === id || 
      item.group_id === id || 
      item.comment_id === id
    );
    
    if (index !== -1) {
      collection[index] = { ...collection[index], ...updates };
      localStorageDB.set(collectionKey, collection);
      return collection[index];
    }
    
    return null;
  },
  
  // Öğe silme
  remove: (collectionKey, id) => {
    const collection = localStorageDB.get(collectionKey, []);
    const filteredCollection = collection.filter(item => 
      item.id !== id && 
      item.user_id !== id && 
      item.forum_id !== id && 
      item.poll_id !== id && 
      item.group_id !== id && 
      item.comment_id !== id
    );
    
    localStorageDB.set(collectionKey, filteredCollection);
    return true;
  }
};

// Demo Veriler
const setupMockData = () => {
  // Daha önce kurulmuşsa tekrar oluşturma
  if (localStorage.getItem('mockDataInitialized')) {
    return;
  }
  
  // Demo kullanıcı
  if (localStorageDB.get('users', []).length === 0) {
    localStorageDB.add('users', {
      user_id: '1',
      username: 'demouser',
      email: 'demo@example.com',
      password: 'password123', // Gerçek uygulamada asla şifre açık metin saklanmamalı
      profil_resmi_url: '',
      cinsiyet: 'Erkek',
      universite: 'Demo Üniversitesi',
      kayit_tarihi: new Date().toISOString()
    });
  }
  
  // Demo forumlar
  if (localStorageDB.get('forums', []).length === 0) {
    localStorageDB.add('forums', {
      forum_id: '1',
      baslik: 'React Hakkında Tartışma',
      aciklama: 'React öğrenirken karşılaştığınız zorluklar ve çözümler hakkında konuşalım.',
      acilis_tarihi: new Date().toISOString(),
      acan_kisi_id: '1',
      acan_kisi: {
        username: 'demouser',
        profil_resmi_url: ''
      },
      foto_urls: [],
      yorum_ids: [],
      begeni_sayisi: 5,
      begenmeme_sayisi: 1,
      universite: 'Demo Üniversitesi',
      kategori: 'Programlama'
    });
    
    localStorageDB.add('forums', {
      forum_id: '2',
      baslik: 'Üniversite Hayatı',
      aciklama: 'Üniversite hayatı hakkında deneyimlerimizi paylaşalım.',
      acilis_tarihi: new Date().toISOString(),
      acan_kisi_id: '1',
      acan_kisi: {
        username: 'demouser',
        profil_resmi_url: ''
      },
      foto_urls: [],
      yorum_ids: [],
      begeni_sayisi: 3,
      begenmeme_sayisi: 0,
      universite: 'Demo Üniversitesi',
      kategori: 'Üniversite'
    });
  }
  
  // Demo anketler
  if (localStorageDB.get('polls', []).length === 0) {
    localStorageDB.add('polls', {
      poll_id: '1',
      baslik: 'En Sevdiğiniz Programlama Dili?',
      aciklama: 'Yazılım geliştirirken hangi dili kullanmayı tercih ediyorsunuz?',
      acilis_tarihi: new Date().toISOString(),
      bitis_tarihi: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 hafta sonra
      acan_kisi_id: '1',
      acan_kisi: {
        username: 'demouser',
        profil_resmi_url: ''
      },
      secenekler: [
        { option_id: '1', metin: 'JavaScript', oy_sayisi: 5 },
        { option_id: '2', metin: 'Python', oy_sayisi: 8 },
        { option_id: '3', metin: 'Java', oy_sayisi: 3 },
        { option_id: '4', metin: 'C#', oy_sayisi: 2 }
      ],
      universite: 'Demo Üniversitesi',
      kategori: 'Programlama'
    });
    
    localStorageDB.add('polls', {
      poll_id: '2',
      baslik: 'Uzaktan Eğitim mi, Yüz Yüze Eğitim mi?',
      aciklama: 'Hangi eğitim modelini tercih edersiniz?',
      acilis_tarihi: new Date().toISOString(),
      bitis_tarihi: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 gün sonra
      acan_kisi_id: '1',
      acan_kisi: {
        username: 'demouser',
        profil_resmi_url: ''
      },
      secenekler: [
        { option_id: '1', metin: 'Uzaktan Eğitim', oy_sayisi: 12 },
        { option_id: '2', metin: 'Yüz Yüze Eğitim', oy_sayisi: 15 },
        { option_id: '3', metin: 'Hibrit Model', oy_sayisi: 20 }
      ],
      universite: 'Demo Üniversitesi',
      kategori: 'Eğitim'
    });
  }
  
  // Demo gruplar
  if (localStorageDB.get('groups', []).length === 0) {
    localStorageDB.add('groups', {
      group_id: '1',
      grup_adi: 'Yazılım Geliştirme Kulübü',
      aciklama: 'Yazılım geliştirme hakkında bilgi paylaşımı yapabileceğimiz bir platform.',
      olusturulma_tarihi: new Date().toISOString(),
      olusturan_id: '1',
      logo_url: '',
      kapak_resmi_url: '',
      gizlilik: 'acik',
      kategoriler: ['Programlama', 'Teknoloji'],
      uye_sayisi: 1,
      uyeler: [
        {
          kullanici_id: '1',
          rol: 'yonetici',
          username: 'demouser',
          profil_resmi_url: ''
        }
      ]
    });
  }
  
  // Demo yorumlar
  if (localStorageDB.get('comments', []).length === 0) {
    localStorageDB.add('comments', {
      comment_id: '1',
      forum_id: '1',
      acan_kisi_id: '1',
      acan_kisi: {
        username: 'demouser',
        profil_resmi_url: ''
      },
      icerik: 'Bu konuda daha fazla bilgi paylaşabilir misiniz?',
      acilis_tarihi: new Date().toISOString(),
      foto_urls: [],
      begeni_sayisi: 2,
      begenmeme_sayisi: 0,
      ust_yorum_id: null
    });
  }
  
  localStorage.setItem('mockDataInitialized', 'true');
};

// Mock API yanıtları
const mockResponses = {
  // Kullanıcı işlemleri
  '/auth/login': (config) => {
    const { email, password } = JSON.parse(config.data);
    const users = localStorageDB.get('users', []);
    const user = users.find(u => u.email === email);
    
    if (user && user.password === password) {
      const token = `mock-token-${user.user_id}-${Date.now()}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      return {
        status: 'success',
        data: {
          token,
          user: { ...user, password: undefined } // Şifreyi yanıtta döndürme
        }
      };
    }
    
    throw { response: { data: { message: 'Geçersiz e-posta veya şifre' } } };
  },
  
  '/auth/register': (config) => {
    const userData = JSON.parse(config.data);
    const users = localStorageDB.get('users', []);
    
    if (users.some(u => u.email === userData.email)) {
      throw { response: { data: { message: 'Bu e-posta adresi zaten kullanılıyor' } } };
    }
    
    if (users.some(u => u.username === userData.username)) {
      throw { response: { data: { message: 'Bu kullanıcı adı zaten kullanılıyor' } } };
    }
    
    const newUser = {
      ...userData,
      user_id: uuidv4(),
      kayit_tarihi: new Date().toISOString()
    };
    
    localStorageDB.add('users', newUser);
    
    const token = `mock-token-${newUser.user_id}-${Date.now()}`;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(newUser));
    
    return {
      status: 'success',
      data: {
        token,
        user: { ...newUser, password: undefined } // Şifreyi yanıtta döndürme
      }
    };
  },
  
  '/auth/me': () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      throw { response: { status: 401, data: { message: 'Yetkilendirme başarısız' } } };
    }
    
    const user = JSON.parse(userStr);
    return {
      status: 'success',
      data: { ...user, password: undefined }
    };
  },
  
  // Forum işlemleri
  '/forums': (config, method, url) => {
    if (method === 'GET') {
      const params = new URLSearchParams(url.split('?')[1]);
      let forums = localStorageDB.get('forums', []);
      
      // Filtreleri uygula
      const kategori = params.get('kategori');
      const universite = params.get('universite');
      const search = params.get('search');
      
      if (kategori) {
        forums = forums.filter(f => f.kategori === kategori);
      }
      
      if (universite) {
        forums = forums.filter(f => f.universite === universite);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        forums = forums.filter(f => 
          f.baslik.toLowerCase().includes(searchLower) || 
          (f.aciklama && f.aciklama.toLowerCase().includes(searchLower))
        );
      }
      
      // Sayfalama
      const page = parseInt(params.get('page') || '1');
      const per_page = parseInt(params.get('per_page') || '10');
      const start = (page - 1) * per_page;
      const end = start + per_page;
      const paginatedForums = forums.slice(start, end);
      
      return {
        status: 'success',
        data: paginatedForums,
        meta: {
          pagination: {
            page,
            per_page,
            total: forums.length,
            total_pages: Math.ceil(forums.length / per_page)
          }
        }
      };
    } 
    else if (method === 'POST') {
      const forumData = JSON.parse(config.data);
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        throw { response: { status: 401, data: { message: 'Yetkilendirme başarısız' } } };
      }
      
      const user = JSON.parse(userStr);
      
      const newForum = {
        ...forumData,
        forum_id: uuidv4(),
        acilis_tarihi: new Date().toISOString(),
        acan_kisi_id: user.user_id,
        acan_kisi: {
          username: user.username,
          profil_resmi_url: user.profil_resmi_url || ''
        },
        yorum_ids: [],
        begeni_sayisi: 0,
        begenmeme_sayisi: 0
      };
      
      localStorageDB.add('forums', newForum);
      
      return {
        status: 'success',
        data: newForum
      };
    }
  },
  
  // Diğer API endpoint'leri burada eklenecek...
  // Her servis için bir entry ekleyebilirsiniz
};

// Axios interceptor kurulumu
const setupMockAxiosInterceptor = () => {
  // İlk olarak demo verileri oluştur
  setupMockData();
  
  // İstek interceptor'ı
  axios.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Yanıt interceptor'ı
  axios.interceptors.response.use(
    (response) => response, // Başarılı yanıtları olduğu gibi geçir
    (error) => {
      // Eğer error bir API isteği hatası değilse olduğu gibi geçir
      if (!error.config) {
        return Promise.reject(error);
      }
      
      // API URL'ini parse et
      const url = error.config.url;
      const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      
      // Eğer URL, baseUrl ile başlamıyorsa (yani API çağrısı değilse) olduğu gibi geçir
      if (!url.startsWith(baseUrl)) {
        return Promise.reject(error);
      }
      
      // API yolunu al
      const apiPath = url.substring(baseUrl.length);
      const method = error.config.method.toUpperCase();
      
      console.log(`Mock API çağrısı: ${method} ${apiPath}`);
      
      // Mock yanıt var mı kontrol et
      let handler = mockResponses[apiPath];
      
      // Tam eşleşme yoksa, path pattern'leri kontrol et
      if (!handler) {
        // Dinamik path'ler için regex kontrolü yap (örn: /forums/123)
        for (const path in mockResponses) {
          if (path.includes(':id')) {
            const regexPath = path.replace(':id', '[^/]+');
            const regex = new RegExp(`^${regexPath}$`);
            
            if (regex.test(apiPath)) {
              handler = mockResponses[path];
              break;
            }
          }
        }
      }
      
      // Handler bulunamazsa, genel bir mock yanıtı döndür
      if (!handler) {
        console.warn(`${apiPath} için mock endpoint bulunamadı, varsayılan yanıt döndürülüyor`);
        
        if (method === 'GET') {
          return Promise.resolve({
            data: {
              status: 'success',
              data: [],
              message: 'Mock veri bulunamadı'
            }
          });
        } else {
          return Promise.resolve({
            data: {
              status: 'success',
              data: { id: uuidv4() },
              message: 'İşlem başarıyla tamamlandı (mock)'
            }
          });
        }
      }
      
      try {
        // Handler'ı çağır ve mock yanıtı döndür
        const mockResponse = handler(error.config, method, url);
        return Promise.resolve({
          data: mockResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config: error.config
        });
      } catch (mockError) {
        // Mock handler bir hata fırlatırsa
        return Promise.reject(mockError);
      }
    }
  );
};

export default setupMockAxiosInterceptor;