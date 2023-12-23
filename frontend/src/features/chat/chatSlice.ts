import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import http from "../../services/httpService";

export const getUserPv = createAsyncThunk(
  "pv/getUserPv",
  async ({myId,pvId}:{myId:string,pvId:string}) => {
    const res = await http.get("/pv", { params: { myId,pvId } });
    return res;
  }
);
type initialStateType = {
  loading: boolean;
  pv: Record<string, any>;
  error: string;
};
const initialState:initialStateType = {
  loading: false,
  pv: {},
  error: "",
}

export const chatSlice = createSlice({
  name: "pv",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getUserPv.pending, (state) => {
        state.loading = true;
        state.pv = [];
        state.error = "";
      })
      .addCase(getUserPv.fulfilled, (state, action) => {
        state.loading = false;
        state.pv = action.payload.data.userPv;
        state.error = "";
      })
      .addCase(getUserPv.rejected, (state) => {
        state.loading = false;
        state.pv = [];
        state.error = "";
      })
  },
});

export default chatSlice.reducer;
