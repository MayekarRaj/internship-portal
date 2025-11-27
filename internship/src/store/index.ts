import { configureStore } from "@reduxjs/toolkit";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import adminAuthReducer from "./adminAuthSlice";
import type { Internship } from "../types";

// Application state interface
interface ApplicationState {
  currentView: "internships" | "details" | "application" | "success";
  internships: Internship[];
  selectedInternship: Internship | null;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    university: string;
    graduationYear: string;
    major: string;
    gpa: string;
    motivation: string;
    projectSubmissionUrl: string;
    internshipId: number;
  };
  isLoading: boolean;
  isSubmitting: boolean;
  submitSuccess: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
}

// Initial form data
const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  university: "",
  graduationYear: "",
  major: "",
  gpa: "",
  motivation: "",
  projectSubmissionUrl: "",
  internshipId: 0,
};

// Initial state
const initialState: ApplicationState = {
  currentView: "internships",
  internships: [],
  selectedInternship: null,
  formData: initialFormData,
  isLoading: false,
  isSubmitting: false,
  submitSuccess: false,
  error: null,
  validationErrors: {},
};

// Redux slice
const applicationSlice = createSlice({
  name: "application",
  initialState,
  reducers: {
    setCurrentView: (
      state,
      action: PayloadAction<ApplicationState["currentView"]>
    ) => {
      state.currentView = action.payload;
    },
    setInternships: (state, action: PayloadAction<Internship[]>) => {
      state.internships = action.payload;
    },
    setSelectedInternship: (
      state,
      action: PayloadAction<Internship | null>
    ) => {
      state.selectedInternship = action.payload;
      if (action.payload) {
        state.formData.internshipId = action.payload.id;
      }
    },
    updateFormData: (state, action: PayloadAction<Partial<ApplicationState["formData"]>>) => {
      state.formData = { ...state.formData, ...action.payload };
      Object.keys(action.payload).forEach((key) => {
        delete state.validationErrors[key];
      });
    },
    setValidationErrors: (
      state,
      action: PayloadAction<Record<string, string>>
    ) => {
      state.validationErrors = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSubmitting: (state, action: PayloadAction<boolean>) => {
      state.isSubmitting = action.payload;
    },
    setSubmitSuccess: (state, action: PayloadAction<boolean>) => {
      state.submitSuccess = action.payload;
      if (action.payload) {
        state.error = null;
        state.validationErrors = {};
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    resetApplication: (state) => {
      state.formData = initialFormData;
      state.submitSuccess = false;
      state.error = null;
      state.validationErrors = {};
      state.currentView = "internships";
      state.selectedInternship = null;
    },
  },
});

export const {
  setCurrentView,
  setInternships,
  setSelectedInternship,
  updateFormData,
  setValidationErrors,
  setLoading,
  setSubmitting,
  setSubmitSuccess,
  setError,
  resetApplication,
} = applicationSlice.actions;

// Store
export const store = configureStore({
  reducer: {
    application: applicationSlice.reducer,
    adminAuth: adminAuthReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

