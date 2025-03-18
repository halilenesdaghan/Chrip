import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import forumReducer from './forumSlice';
import commentReducer from './commentSlice';
import pollReducer from './pollSlice';
import groupReducer from './groupSlice';
import userReducer from './userSlice';

// Redux store yapılandırması
const store = configureStore({
  reducer: {
    auth: authReducer,
    forum: forumReducer,
    comment: commentReducer,
    poll: pollReducer,
    group: groupReducer,
    user: userReducer,
  },
  // Redux devtools eklentisini sadece geliştirme ortamında etkinleştir
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;