// src/redux/slices/timetableSlice.js
import { createSlice } from "@reduxjs/toolkit";

const commonSlice = createSlice({
  name: "common",
  initialState: {
    classWiseTimetables: {},
    loading: false,
    error: null,
  },
  reducers: {
    setTimetable: (state, action) => {
      const { className, data } = action.payload;
      state.classWiseTimetables[className] = data;
    },
    setFinalClassOptions: (state, action) => {
      state.finalClassOptions = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearTimetable: (state) => {
      state.classWiseTimetables = {};
    },
  },
});

export const {
  setTimetable,
  setLoading,
  setError,
  clearTimetable,
} = commonSlice.actions;
export default commonSlice.reducer;
