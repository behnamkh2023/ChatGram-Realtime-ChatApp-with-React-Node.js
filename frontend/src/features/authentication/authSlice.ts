import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import http from "../../services/httpService";
import type { User } from "../chat/types";


export const logout = createAsyncThunk(
  "users/logout",
  async ({ myId }:{myId:string}) => {
    const res = await http.get("/auth/logout", { params: { myId } });
    return res;
  }
);

export const getAllUsers = createAsyncThunk(
  "users/getAllUsers",
  async () => {
    const res = await http.post("/users", {});
    return res;
  }
);
export const fetchUserById = createAsyncThunk(
  "users/fetchById",
  async (_, { rejectWithValue }) => {
    try {
      const response = await http.get(`/auth/get-user/`);
      return await response.data;
    } catch (error) {
      return rejectWithValue((error as AxiosError).message);
    }
  }
);
export const sendEmail = createAsyncThunk("users/send", async (email:string, { rejectWithValue }) => {
  try {
    const response = await http.post(`/auth/get-otp/`, {
      email,
    });
    return response;
  } catch (error) {
    return rejectWithValue((error as AxiosError).message);
  }
});
export const updateUser = createAsyncThunk(
  "users/updateUser",
  async (formData:FormData) => {
    const config = {
      headers: { "content-type": "multipart/form-data"}
    };
    const res = await http.post("/updateUser", formData,config);
    return res;
  }
);
export const confirmCode = createAsyncThunk(
  "users/confirm",
  async ({ email, code }: { email: string, code: string }) => {
    try {
      const res = await http.post("/auth/check-otp", {
        email,
        code,
      });
      return res;
    } catch (error) {
    throw new Error((error as AxiosError).response?.status?.toString());
    }
  }
);

type initialStateType = {
  loading: boolean,
  data: User,
  error: string,
  login: boolean,
  status: number,
  users:[],
};

const initialState:initialStateType = {
  loading: false,
  data: {
    avatar:"",
    email: "",
    isActive: false,
    lang: "",
    lastOnline: "",
    role: "",
    username: "",
    _id: ""
  },
  error: "",
  login: false,
  status: 0,
  users:[],
};

export const loginSlice = createSlice({
  name: "users",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = "";
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.user;
        state.error = "";
        state.login = true;
        state.status = 1;
        localStorage.setItem("userId",action.payload.user?._id);
      })
      .addCase(fetchUserById.rejected, (state) => {
        state.loading = false;
        state.error = "";
        state.status = 1;
      })
      .addCase(sendEmail.pending, (state) => {
        state.error=''
      })
      .addCase(sendEmail.fulfilled, (_state,action) => {
        sessionStorage.setItem('expireCode',action.payload.data.expireCode)
      })
      .addCase(sendEmail.rejected, () => {
        
      })
      .addCase(confirmCode.fulfilled, (state, action) => {
          state.data = action.payload.data.data.user;
          state.error = "";
          state.login = true;
          state.status = 1;
      })
      .addCase(confirmCode.pending, (state) => {
        state.error=''
      })
      .addCase(confirmCode.rejected, (state, action) => {
           if(action.error.message == "400"){
          state.error = "mistake";
        }
        if(action.error.message == "404"){
          state.error = "expire";
        }
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload.data;
      })
      .addCase(logout.fulfilled, (state) => {
        state.login = false;
        state.status = 1;
        localStorage.removeItem("userId");
      })
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.rejected, (state) => {
        state.loading = false;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        return {
          ...state,
          data: action.payload.data,
          loading: false,
        };
      });
  },
});

export default loginSlice.reducer;
