import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { INotification } from '@/types';

interface NotificationState {
  items: INotification[];
  unreadCount: number;
  isLoading: boolean;
}

const initialState: NotificationState = {
  items: [],
  unreadCount: 0,
  isLoading: false,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setNotifications: (
      state,
      action: PayloadAction<{ items: INotification[]; unreadCount: number }>,
    ) => {
      state.items = action.payload.items;
      state.unreadCount = action.payload.unreadCount;
      state.isLoading = false;
    },
    addNotification: (state, action: PayloadAction<INotification>) => {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount++;
    },
    markRead: (state, action: PayloadAction<string>) => {
      const notification = state.items.find((n) => n._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllRead: (state) => {
      state.items.forEach((n) => (n.isRead = true));
      state.unreadCount = 0;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setNotifications, addNotification, markRead, markAllRead, setLoading } =
  notificationSlice.actions;
export default notificationSlice.reducer;
