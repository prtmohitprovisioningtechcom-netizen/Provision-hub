import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  emailNotifications: boolean;
  leadNotifications: boolean;
  reviewNotifications: boolean;
  loginAlerts: boolean;
  subscriptionAlerts: boolean;
}

const initialState: SettingsState = {
  emailNotifications: true,
  leadNotifications: true,
  reviewNotifications: true,
  loginAlerts: true,
  subscriptionAlerts: true,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      Object.assign(state, action.payload);
    },
    toggleSetting: (state, action: PayloadAction<keyof SettingsState>) => {
      state[action.payload] = !state[action.payload];
    },
  },
});

export const { setSettings, toggleSetting } = settingsSlice.actions;
export default settingsSlice.reducer;
