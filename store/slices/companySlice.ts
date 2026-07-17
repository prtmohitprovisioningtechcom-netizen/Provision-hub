import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ICompany } from '@/types';

interface CompanyState {
  current: ICompany | null;
  isLoading: boolean;
}

const initialState: CompanyState = {
  current: null,
  isLoading: false,
};

const companySlice = createSlice({
  name: 'company',
  initialState,
  reducers: {
    setCompany: (state, action: PayloadAction<ICompany>) => {
      state.current = action.payload;
      state.isLoading = false;
    },
    clearCompany: (state) => {
      state.current = null;
    },
    setCompanyLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    updateCompany: (state, action: PayloadAction<Partial<ICompany>>) => {
      if (state.current) {
        state.current = { ...state.current, ...action.payload };
      }
    },
  },
});

export const { setCompany, clearCompany, setCompanyLoading, updateCompany } = companySlice.actions;
export default companySlice.reducer;
