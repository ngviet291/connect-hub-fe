import { configureStore } from "@reduxjs/toolkit";
import themeReducer from '../features/theme/themeSlice';
import authReducer from "../features/auth/store/authSlice";
import { setupListeners } from "@reduxjs/toolkit/query";
import { notificationApi } from "@/features/notification/api/notificationApi";
import conversationReducer from "../features/message/store/conversationSlice";
import toastReducer from "../shared/store/toastSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [notificationApi.reducerPath]: notificationApi.reducer,
    theme: themeReducer,
    conversation: conversationReducer,
    toast: toastReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(notificationApi.middleware),
});
setupListeners(store.dispatch);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
