import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isCarouselOn: true,
};

const carouselSlice = createSlice({
  name: 'carousel',
  initialState,
  reducers: {
    toggleCarousel: (state, action) => {
      state.isCarouselOn = action.payload
    },
  },
});

export const { toggleCarousel } = carouselSlice.actions;
export default carouselSlice.reducer;
