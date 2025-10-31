// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import useSchoolClassData from './slices/useSchoolClassData';

export const store = configureStore({
  reducer: {
    commonData: useSchoolClassData,
  }
});
