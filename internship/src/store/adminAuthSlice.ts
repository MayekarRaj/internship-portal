import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../services/authService';
import type { Admin } from '../types';

interface AdminAuthState {
  admin: Admin | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AdminAuthState = {
  admin: null,
  token: localStorage.getItem('adminToken'),
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // Store token
      if (response.token) {
        localStorage.setItem('adminToken', response.token);
      }

      return response;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  }
);

export const verifyAdmin = createAsyncThunk(
  'adminAuth/verify',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return rejectWithValue('No token found');
      }

      const admin = await authService.getCurrentAdmin();
      return { admin };
    } catch (error) {
      localStorage.removeItem('adminToken');
      return rejectWithValue(error instanceof Error ? error.message : 'Verification failed');
    }
  }
);

export const logoutAdmin = createAsyncThunk(
  'adminAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      localStorage.removeItem('adminToken');
      return true;
    } catch (error) {
      localStorage.removeItem('adminToken');
      return rejectWithValue(error instanceof Error ? error.message : 'Logout failed');
    }
  }
);

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Verify
      .addCase(verifyAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.admin = action.payload.admin;
        state.token = localStorage.getItem('adminToken');
      })
      .addCase(verifyAdmin.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.admin = null;
        state.token = null;
      })
      // Logout
      .addCase(logoutAdmin.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.admin = null;
        state.token = null;
        state.error = null;
      });
  },
});

export const { clearError } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;

