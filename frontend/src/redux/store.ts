import { configureStore } from '@reduxjs/toolkit'
import loginReducer from "../features/authentication/authSlice";
import chatReducer from "../features/chat/chatSlice";
import settingsReducer from "../features/settings/settingsSlice";

const createStore = () => {
  const store = configureStore({
    reducer: {
      login: loginReducer,
      userPv: chatReducer,
      settings: settingsReducer,
    },
  });

  return store;
};

export const store = createStore();

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch