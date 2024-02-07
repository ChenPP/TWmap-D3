import { configureStore } from '@reduxjs/toolkit';
import carouselReducer from '@/redux/carouselSlice';

export const store = configureStore({
  reducer: {
    carousel: carouselReducer,
  },
});
