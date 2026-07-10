import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';

export interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastState {
  toasts: ToastItem[];
}

const initialState: ToastState = { toasts: [] };

export const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    addToast(state, { payload }: PayloadAction<ToastItem>) {
      state.toasts.push(payload);
    },
    removeToast(state, { payload: id }: PayloadAction<number>) {
      state.toasts = state.toasts.filter((t) => t.id !== id);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;

export const selectToasts = (s: RootState) => s.toast.toasts;

export default toastSlice.reducer;
