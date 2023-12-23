import { PayloadAction, createSlice } from "@reduxjs/toolkit";

type initialStateType = {
  lang: string
};

const initialState:initialStateType = {
  lang: localStorage.getItem("selectedLanguage") == 'fa' ?'fa': 'en'
};

export const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setLang: (state, action: PayloadAction<string>) => {
      state.lang = action.payload
    },
  },
  extraReducers: () => {},
});
export const {  setLang } = settingsSlice.actions
export default settingsSlice.reducer;
