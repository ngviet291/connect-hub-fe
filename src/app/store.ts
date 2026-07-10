import { configureStore } from "@reduxjs/toolkit";
import themeReducer from '../features/theme/themeSlice';
import authReducer from "../features/auth/store/authSlice";
import notificationReducer from "../features/notification/store/notificationSlice";
import conversationReducer from "../features/message/store/conversationSlice";
import toastReducer from "../shared/store/toastSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    notification: notificationReducer,
    conversation: conversationReducer,
    toast: toastReducer,
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;