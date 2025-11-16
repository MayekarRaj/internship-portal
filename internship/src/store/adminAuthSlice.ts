import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Admin {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}

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

const API_BASE_URL = 'http://localhost:3011/api';

// Async thunks
export const loginAdmin = createAsyncThunk(
  'adminAuth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        return rejectWithValue(data.message || 'Login failed');
      }

      localStorage.setItem('adminToken', data.data.token);
      return data.data;
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

      const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        localStorage.removeItem('adminToken');
        return rejectWithValue(data.message || 'Verification failed');
      }

      return data.data;
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
      const token = localStorage.getItem('adminToken');
      if (token) {
        await fetch(`${API_BASE_URL}/admin/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
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

