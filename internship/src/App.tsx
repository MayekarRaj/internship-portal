// import React, { useState } from "react";
// import { Provider } from "react-redux";
// import type { PayloadAction } from '@reduxjs/toolkit';
// import { configureStore, createSlice } from "@reduxjs/toolkit";
// import { useDispatch, useSelector } from "react-redux";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import {
//   CheckCircle,
//   AlertCircle,
//   Loader2,
//   Smartphone,
//   Code,
//   Users,
// } from "lucide-react";

// // Types
// interface FormData {
//   firstName: string;
//   lastName: string;
//   email: string;
//   phone: string;
//   university: string;
//   graduationYear: string;
//   major: string;
//   gpa: string;
//   githubUrl: string;
//   linkedinUrl: string;
//   portfolioUrl: string;
//   experienceLevel: string;
//   preferredTechnologies: string;
//   motivation: string;
//   availabilityStart: string;
// }

// interface ApplicationState {
//   formData: FormData;
//   isSubmitting: boolean;
//   submitSuccess: boolean;
//   submitError: string | null;
//   validationErrors: Record<string, string>;
// }

// // Initial state
// const initialFormData: FormData = {
//   firstName: "",
//   lastName: "",
//   email: "",
//   phone: "",
//   university: "",
//   graduationYear: "",
//   major: "",
//   gpa: "",
//   githubUrl: "",
//   linkedinUrl: "",
//   portfolioUrl: "",
//   experienceLevel: "",
//   preferredTechnologies: "",
//   motivation: "",
//   availabilityStart: "",
// };

// const initialState: ApplicationState = {
//   formData: initialFormData,
//   isSubmitting: false,
//   submitSuccess: false,
//   submitError: null,
//   validationErrors: {},
// };

// // Redux slice
// const applicationSlice = createSlice({
//   name: "application",
//   initialState,
//   reducers: {
//     updateFormData: (state, action: PayloadAction<Partial<FormData>>) => {
//       state.formData = { ...state.formData, ...action.payload };
//       // Clear validation errors for updated fields
//       Object.keys(action.payload).forEach((key) => {
//         delete state.validationErrors[key];
//       });
//     },
//     setValidationErrors: (
//       state,
//       action: PayloadAction<Record<string, string>>
//     ) => {
//       state.validationErrors = action.payload;
//     },
//     setSubmitting: (state, action: PayloadAction<boolean>) => {
//       state.isSubmitting = action.payload;
//     },
//     setSubmitSuccess: (state, action: PayloadAction<boolean>) => {
//       state.submitSuccess = action.payload;
//       if (action.payload) {
//         state.submitError = null;
//         state.validationErrors = {};
//       }
//     },
//     setSubmitError: (state, action: PayloadAction<string | null>) => {
//       state.submitError = action.payload;
//       state.submitSuccess = false;
//     },
//     resetForm: (state) => {
//       state.formData = initialFormData;
//       state.submitSuccess = false;
//       state.submitError = null;
//       state.validationErrors = {};
//     },
//   },
// });

// const {
//   updateFormData,
//   setValidationErrors,
//   setSubmitting,
//   setSubmitSuccess,
//   setSubmitError,
//   resetForm,
// } = applicationSlice.actions;

// // Store
// const store = configureStore({
//   reducer: {
//     application: applicationSlice.reducer,
//   },
// });

// type RootState = ReturnType<typeof store.getState>;

// // Validation
// const validateForm = (data: FormData): Record<string, string> => {
//   const errors: Record<string, string> = {};

//   if (!data.firstName.trim()) errors.firstName = "First name is required";
//   if (!data.lastName.trim()) errors.lastName = "Last name is required";

//   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//   if (!data.email.trim()) {
//     errors.email = "Email is required";
//   } else if (!emailRegex.test(data.email)) {
//     errors.email = "Please enter a valid email address";
//   }

//   const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
//   if (!data.phone.trim()) {
//     errors.phone = "Phone number is required";
//   } else if (!phoneRegex.test(data.phone)) {
//     errors.phone = "Please enter a valid phone number";
//   }

//   if (!data.university.trim()) errors.university = "University is required";

//   const currentYear = new Date().getFullYear();
//   const gradYear = parseInt(data.graduationYear);
//   if (!data.graduationYear) {
//     errors.graduationYear = "Graduation year is required";
//   } else if (gradYear < currentYear || gradYear > currentYear + 10) {
//     errors.graduationYear = "Please enter a valid graduation year";
//   }

//   if (!data.major.trim()) errors.major = "Major is required";

//   if (data.gpa && (parseFloat(data.gpa) < 0 || parseFloat(data.gpa) > 4)) {
//     errors.gpa = "GPA must be between 0.0 and 4.0";
//   }

//   if (!data.experienceLevel)
//     errors.experienceLevel = "Experience level is required";
//   if (!data.motivation.trim()) errors.motivation = "Motivation is required";
//   if (!data.availabilityStart)
//     errors.availabilityStart = "Start date is required";

//   return errors;
// };

// // API configuration
// const API_BASE_URL = "http://localhost:3001/api";

// // API functions
// const submitApplication = async (data: FormData): Promise<void> => {
//   const response = await fetch(`${API_BASE_URL}/applications`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data),
//   });

//   if (!response.ok) {
//     const errorData = await response.json();
//     if (response.status === 409) {
//       throw new Error("An application with this email already exists.");
//     } else if (response.status === 400 && errorData.errors) {
//       const errorMessages = errorData.errors
//         .map((err: any) => err.message)
//         .join(", ");
//       throw new Error(`Validation failed: ${errorMessages}`);
//     } else {
//       throw new Error(
//         errorData.message || "Failed to submit application. Please try again."
//       );
//     }
//   }

//   return response.json();
// };

// // Components
// const FormField: React.FC<{
//   label: string;
//   error?: string;
//   required?: boolean;
//   children: React.ReactNode;
// }> = ({ label, error, required, children }) => (
//   <div className="space-y-2">
//     <Label className="text-sm font-medium">
//       {label} {required && <span className="text-red-500">*</span>}
//     </Label>
//     {children}
//     {error && (
//       <p className="text-sm text-red-600 flex items-center gap-1">
//         <AlertCircle className="h-4 w-4" />
//         {error}
//       </p>
//     )}
//   </div>
// );

// const RegistrationForm: React.FC = () => {
//   const dispatch = useDispatch();
//   const {
//     formData,
//     isSubmitting,
//     submitSuccess,
//     submitError,
//     validationErrors,
//   } = useSelector((state: RootState) => state.application);

//   const handleInputChange = (field: keyof FormData, value: string) => {
//     dispatch(updateFormData({ [field]: value }));
//   };

//   const handleSubmit = async () => {
//     const errors = validateForm(formData);
//     if (Object.keys(errors).length > 0) {
//       dispatch(setValidationErrors(errors));
//       return;
//     }

//     dispatch(setSubmitting(true));
//     dispatch(setSubmitError(null));

//     try {
//       await submitApplication(formData);
//       dispatch(setSubmitSuccess(true));
//     } catch (error) {
//       dispatch(
//         setSubmitError(
//           error instanceof Error ? error.message : "An error occurred"
//         )
//       );
//     } finally {
//       dispatch(setSubmitting(false));
//     }
//   };

//   const handleReset = () => {
//     dispatch(resetForm());
//   };

//   if (submitSuccess) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
//         <div className="max-w-2xl mx-auto">
//           <Card className="text-center">
//             <CardContent className="pt-12 pb-8">
//               <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
//               <h2 className="text-2xl font-bold text-gray-900 mb-2">
//                 Application Submitted Successfully!
//               </h2>
//               <p className="text-gray-600 mb-6">
//                 Thank you for applying for the Mobile App Developer Internship.
//                 We'll review your application and get back to you within 5-7
//                 business days.
//               </p>
//               <Button
//                 onClick={handleReset}
//                 className="bg-blue-600 hover:bg-blue-700"
//               >
//                 Submit Another Application
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-8">
//           <div className="flex justify-center items-center gap-2 mb-4">
//             <Smartphone className="h-8 w-8 text-blue-600" />
//             <h1 className="text-3xl font-bold text-gray-900">
//               Mobile App Developer Internship
//             </h1>
//           </div>
//           <div className="flex justify-center gap-8 text-sm text-gray-600 mb-6">
//             <div className="flex items-center gap-2">
//               <Code className="h-4 w-4" />
//               React Native • Flutter • iOS • Android
//             </div>
//             <div className="flex items-center gap-2">
//               <Users className="h-4 w-4" />
//               Remote & On-site Options
//             </div>
//           </div>
//           <p className="text-lg text-gray-700 max-w-2xl mx-auto">
//             Join our team and gain hands-on experience building cutting-edge
//             mobile applications. This internship offers mentorship, real-world
//             projects, and potential full-time opportunities.
//           </p>
//         </div>

//         {/* Form */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="text-xl">Application Form</CardTitle>
//           </CardHeader>
//           <CardContent>
//             {submitError && (
//               <Alert className="mb-6 border-red-200 bg-red-50">
//                 <AlertCircle className="h-4 w-4 text-red-600" />
//                 <AlertDescription className="text-red-800">
//                   {submitError}
//                 </AlertDescription>
//               </Alert>
//             )}

//             <div className="space-y-6">
//               {/* Personal Information */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-900">
//                   Personal Information
//                 </h3>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <FormField
//                     label="First Name"
//                     required
//                     error={validationErrors.firstName}
//                   >
//                     <Input
//                       value={formData.firstName}
//                       onChange={(e) =>
//                         handleInputChange("firstName", e.target.value)
//                       }
//                       placeholder="Enter your first name"
//                     />
//                   </FormField>
//                   <FormField
//                     label="Last Name"
//                     required
//                     error={validationErrors.lastName}
//                   >
//                     <Input
//                       value={formData.lastName}
//                       onChange={(e) =>
//                         handleInputChange("lastName", e.target.value)
//                       }
//                       placeholder="Enter your last name"
//                     />
//                   </FormField>
//                   <FormField
//                     label="Email"
//                     required
//                     error={validationErrors.email}
//                   >
//                     <Input
//                       type="email"
//                       value={formData.email}
//                       onChange={(e) =>
//                         handleInputChange("email", e.target.value)
//                       }
//                       placeholder="your.email@example.com"
//                     />
//                   </FormField>
//                   <FormField
//                     label="Phone Number"
//                     required
//                     error={validationErrors.phone}
//                   >
//                     <Input
//                       value={formData.phone}
//                       onChange={(e) =>
//                         handleInputChange("phone", e.target.value)
//                       }
//                       placeholder="+1 (555) 123-4567"
//                     />
//                   </FormField>
//                 </div>
//               </div>

//               {/* Educational Background */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-900">
//                   Educational Background
//                 </h3>
//                 <div className="grid md:grid-cols-2 gap-4">
//                   <FormField
//                     label="University/College"
//                     required
//                     error={validationErrors.university}
//                   >
//                     <Input
//                       value={formData.university}
//                       onChange={(e) =>
//                         handleInputChange("university", e.target.value)
//                       }
//                       placeholder="Your university name"
//                     />
//                   </FormField>
//                   <FormField
//                     label="Expected Graduation Year"
//                     required
//                     error={validationErrors.graduationYear}
//                   >
//                     <Input
//                       type="number"
//                       value={formData.graduationYear}
//                       onChange={(e) =>
//                         handleInputChange("graduationYear", e.target.value)
//                       }
//                       placeholder="2025"
//                       min="2024"
//                       max="2030"
//                     />
//                   </FormField>
//                   <FormField
//                     label="Major/Field of Study"
//                     required
//                     error={validationErrors.major}
//                   >
//                     <Input
//                       value={formData.major}
//                       onChange={(e) =>
//                         handleInputChange("major", e.target.value)
//                       }
//                       placeholder="Computer Science, Software Engineering, etc."
//                     />
//                   </FormField>
//                   <FormField
//                     label="GPA (Optional)"
//                     error={validationErrors.gpa}
//                   >
//                     <Input
//                       type="number"
//                       step="0.01"
//                       min="0"
//                       max="4"
//                       value={formData.gpa}
//                       onChange={(e) => handleInputChange("gpa", e.target.value)}
//                       placeholder="3.5"
//                     />
//                   </FormField>
//                 </div>
//               </div>

//               {/* Online Presence */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-900">
//                   Online Presence
//                 </h3>
//                 <div className="grid md:grid-cols-3 gap-4">
//                   <FormField label="GitHub Profile">
//                     <Input
//                       value={formData.githubUrl}
//                       onChange={(e) =>
//                         handleInputChange("githubUrl", e.target.value)
//                       }
//                       placeholder="https://github.com/yourusername"
//                     />
//                   </FormField>
//                   <FormField label="LinkedIn Profile">
//                     <Input
//                       value={formData.linkedinUrl}
//                       onChange={(e) =>
//                         handleInputChange("linkedinUrl", e.target.value)
//                       }
//                       placeholder="https://linkedin.com/in/yourprofile"
//                     />
//                   </FormField>
//                   <FormField label="Portfolio Website">
//                     <Input
//                       value={formData.portfolioUrl}
//                       onChange={(e) =>
//                         handleInputChange("portfolioUrl", e.target.value)
//                       }
//                       placeholder="https://yourportfolio.com"
//                     />
//                   </FormField>
//                 </div>
//               </div>

//               {/* Technical Background */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-900">
//                   Technical Background
//                 </h3>
//                 <div className="space-y-4">
//                   <FormField
//                     label="Experience Level"
//                     required
//                     error={validationErrors.experienceLevel}
//                   >
//                     <Select
//                       value={formData.experienceLevel}
//                       onValueChange={(value) =>
//                         handleInputChange("experienceLevel", value)
//                       }
//                     >
//                       <SelectTrigger>
//                         <SelectValue placeholder="Select your experience level" />
//                       </SelectTrigger>
//                       <SelectContent>
//                         <SelectItem value="beginner">
//                           Beginner (Learning mobile development)
//                         </SelectItem>
//                         <SelectItem value="intermediate">
//                           Intermediate (Some projects/coursework)
//                         </SelectItem>
//                         <SelectItem value="advanced">
//                           Advanced (Professional or extensive experience)
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </FormField>
//                   <FormField label="Preferred Technologies">
//                     <Textarea
//                       value={formData.preferredTechnologies}
//                       onChange={(e) =>
//                         handleInputChange(
//                           "preferredTechnologies",
//                           e.target.value
//                         )
//                       }
//                       placeholder="React Native, Flutter, Swift, Kotlin, JavaScript, TypeScript, etc."
//                       rows={3}
//                     />
//                   </FormField>
//                 </div>
//               </div>

//               {/* Additional Information */}
//               <div>
//                 <h3 className="text-lg font-semibold mb-4 text-gray-900">
//                   Additional Information
//                 </h3>
//                 <div className="space-y-4">
//                   <FormField
//                     label="Why do you want this internship?"
//                     required
//                     error={validationErrors.motivation}
//                   >
//                     <Textarea
//                       value={formData.motivation}
//                       onChange={(e) =>
//                         handleInputChange("motivation", e.target.value)
//                       }
//                       placeholder="Tell us about your interest in mobile development, career goals, and what you hope to learn..."
//                       rows={4}
//                     />
//                   </FormField>
//                   <FormField
//                     label="Available Start Date"
//                     required
//                     error={validationErrors.availabilityStart}
//                   >
//                     <Input
//                       type="date"
//                       value={formData.availabilityStart}
//                       onChange={(e) =>
//                         handleInputChange("availabilityStart", e.target.value)
//                       }
//                       min={new Date().toISOString().split("T")[0]}
//                     />
//                   </FormField>
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <div className="pt-6 border-t">
//                 <Button
//                   onClick={handleSubmit}
//                   disabled={isSubmitting}
//                   className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3"
//                 >
//                   {isSubmitting ? (
//                     <>
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                       Submitting Application...
//                     </>
//                   ) : (
//                     "Submit Application"
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// const App: React.FC = () => {
//   return (
//     <Provider store={store}>
//       <RegistrationForm />
//     </Provider>
//   );
// };

// export default App;

import React, { useState, useEffect } from "react";
import { Provider } from "react-redux";
import type { PayloadAction } from "@reduxjs/toolkit";
import { configureStore, createSlice } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Download,
  ArrowLeft,
  Building2,
  Users,
  ExternalLink,
  BookOpen,
} from "lucide-react";

// Types
interface Internship {
  id: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  duration: string;
  stipend: string;
  location: string;
  type: "remote" | "onsite" | "hybrid";
  application_deadline: string;
  start_date: string;
  skills_required: string;
  task_sheet_url?: string;
  created_at: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  graduationYear: string;
  major: string;
  gpa: string;
  // githubUrl: string;
  // linkedinUrl: string;
  // portfolioUrl: string;
  // experienceLevel: string;
  // preferredTechnologies: string;
  motivation: string;
  // availabilityStart: string;
  projectSubmissionUrl: string;
  internshipId: number;
}

interface ApplicationState {
  currentView: "internships" | "details" | "application" | "success";
  internships: Internship[];
  selectedInternship: Internship | null;
  formData: FormData;
  isLoading: boolean;
  isSubmitting: boolean;
  submitSuccess: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
}

// Initial state
const initialFormData: FormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  university: "",
  graduationYear: "",
  major: "",
  gpa: "",
  // githubUrl: "",
  // linkedinUrl: "",
  // portfolioUrl: "",
  // experienceLevel: "",
  // preferredTechnologies: "",
  motivation: "",
  // availabilityStart: "",
  projectSubmissionUrl: "",
  internshipId: 0,
};

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
    updateFormData: (state, action: PayloadAction<Partial<FormData>>) => {
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

const {
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
const store = configureStore({
  reducer: {
    application: applicationSlice.reducer,
  },
});

type RootState = ReturnType<typeof store.getState>;

// API configuration
const API_BASE_URL = "http://localhost:3011/api";

// API functions
const fetchInternships = async (): Promise<Internship[]> => {
  const response = await fetch(`${API_BASE_URL}/internships`);
  if (!response.ok) {
    throw new Error("Failed to fetch internships");
  }
  const data = await response.json();
  return data.data;
};

const fetchInternshipDetails = async (id: number): Promise<Internship> => {
  const response = await fetch(`${API_BASE_URL}/internships/${id}`);
  if (!response.ok) {
    throw new Error("Failed to fetch internship details");
  }
  const data = await response.json();
  return data.data;
};

const submitApplication = async (data: FormData): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  console.log(response);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to submit application");
  }
};

// Components
const InternshipCard: React.FC<{
  internship: Internship;
  onSelect: () => void;
}> = ({ internship, onSelect }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "remote":
        return "bg-green-100 text-green-800";
      case "onsite":
        return "bg-blue-100 text-blue-800";
      case "hybrid":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card
      className="h-full hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{internship.title}</CardTitle>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
              internship.type
            )}`}
          >
            {internship.type.charAt(0).toUpperCase() + internship.type.slice(1)}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Building2 className="w-4 h-4 mr-1" />
          {internship.department}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-700 line-clamp-3">{internship.description}</p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {internship.location}
          </div>
          {/* <div className="flex items-center text-sm text-gray-600">
            <DollarSign className="w-4 h-4 mr-2" />
            {internship.stipend}
          </div> */}
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {internship.duration}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Apply by {formatDate(internship.application_deadline)}
          </div>
        </div>

        <div className="pt-2">
          <Button className="w-full">View Details & Apply</Button>
        </div>
      </CardContent>
    </Card>
  );
};

const InternshipsList: React.FC = () => {
  const dispatch = useDispatch();
  const { internships, isLoading, error } = useSelector(
    (state: RootState) => state.application
  );

  useEffect(() => {
    const loadInternships = async () => {
      dispatch(setLoading(true));
      try {
        const data = await fetchInternships();
        dispatch(setInternships(data));
      } catch (err) {
        dispatch(
          setError(
            err instanceof Error ? err.message : "Failed to load internships"
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadInternships();
  }, [dispatch]);

  const handleSelectInternship = async (internship: Internship) => {
    try {
      const details = await fetchInternshipDetails(internship.id);
      dispatch(setSelectedInternship(details));
      dispatch(setCurrentView("details"));
    } catch (err) {
      dispatch(
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load internship details"
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Available Internships
        </h1>
        <p className="text-gray-600">
          Discover exciting opportunities to grow your career
        </p>
      </div>

      {internships.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">
              No internships available
            </h3>
            <p className="text-gray-600">
              Check back later for new opportunities
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              onSelect={() => handleSelectInternship(internship)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const InternshipDetails: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedInternship } = useSelector(
    (state: RootState) => state.application
  );

  if (!selectedInternship) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleApply = () => {
    dispatch(setCurrentView("application"));
  };

  const handleBack = () => {
    dispatch(setCurrentView("internships"));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="outline" onClick={handleBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Internships
      </Button>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">
                {selectedInternship.title}
              </CardTitle>
              <div className="flex items-center text-gray-600 mb-2">
                <Building2 className="w-5 h-5 mr-2" />
                {selectedInternship.department}
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedInternship.type === "remote"
                  ? "bg-green-100 text-green-800"
                  : selectedInternship.type === "onsite"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-purple-100 text-purple-800"
              }`}
            >
              {selectedInternship.type.charAt(0).toUpperCase() +
                selectedInternship.type.slice(1)}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Location</div>
                <div className="font-medium">{selectedInternship.location}</div>
              </div>
            </div>
            {/* <div className="flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Stipend</div>
                <div className="font-medium">{selectedInternship.stipend}</div>
              </div>
            </div> */}
            <div className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Duration</div>
                <div className="font-medium">{selectedInternship.duration}</div>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-gray-500" />
              <div>
                <div className="text-sm text-gray-500">Deadline</div>
                <div className="font-medium">
                  {formatDate(selectedInternship.application_deadline)}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">
              {selectedInternship.description}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Requirements</h3>
            <p className="text-gray-700 leading-relaxed">
              {selectedInternship.requirements}
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Skills Required</h3>
            <div className="flex flex-wrap gap-2">
              {selectedInternship.skills_required
                .split(",")
                .map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
            </div>
          </div>

          {selectedInternship.task_sheet_url && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Task Sheet</h3>
              <Button variant="outline" asChild>
                <a
                  href={selectedInternship.task_sheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Task Sheet
                </a>
              </Button>
            </div>
          )}

          <div className="pt-4">
            <Button
              onClick={handleApply}
              size="lg"
              className="w-full md:w-auto"
            >
              Apply for this Internship
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const ApplicationForm: React.FC = () => {
  const dispatch = useDispatch();
  const {
    formData,
    selectedInternship,
    isSubmitting,
    validationErrors,
    error,
  } = useSelector((state: RootState) => state.application);

  const handleInputChange = (field: keyof FormData, value: string) => {
    dispatch(updateFormData({ [field]: value }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) errors.firstName = "First name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last name is required";
    if (!formData.email.trim()) errors.email = "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Invalid email format";
    if (!formData.phone.trim()) errors.phone = "Phone number is required";
    if (!formData.university.trim())
      errors.university = "University is required";
    if (!formData.graduationYear.trim())
      errors.graduationYear = "Graduation year is required";
    if (!formData.major.trim()) errors.major = "Major is required";
    // if (!formData.experienceLevel)
    //   errors.experienceLevel = "Experience level is required";
    if (!formData.motivation.trim())
      errors.motivation = "Motivation is required";
    if (formData.motivation.length < 20)
      errors.motivation = "Motivation must be at least 50 characters";
    // if (!formData.availabilityStart.trim())
    //   errors.availabilityStart = "Availability start date is required";
    if (!formData.projectSubmissionUrl.trim())
      errors.projectSubmissionUrl = "Project submission URL is required";

    dispatch(setValidationErrors(errors));
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log("trying to submit");
    console.log(formData);

    dispatch(setSubmitting(true));
    try {
      await submitApplication(formData);
      dispatch(setSubmitSuccess(true));
      dispatch(setCurrentView("success"));
    } catch (err) {
      dispatch(
        setError(
          err instanceof Error ? err.message : "Failed to submit application"
        )
      );
    } finally {
      dispatch(setSubmitting(false));
    }
  };

  const handleBack = () => {
    dispatch(setCurrentView("details"));
  };

  if (!selectedInternship) {
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button variant="outline" onClick={handleBack} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Details
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Apply for {selectedInternship.title}
          </CardTitle>
          <p className="text-gray-600">
            Fill out the form below to submit your application
          </p>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className={validationErrors.firstName ? "border-red-500" : ""}
                />
                {validationErrors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.firstName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className={validationErrors.lastName ? "border-red-500" : ""}
                />
                {validationErrors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.lastName}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={validationErrors.email ? "border-red-500" : ""}
                />
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={validationErrors.phone ? "border-red-500" : ""}
                />
                {validationErrors.phone && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="university">College Name *</Label>
                <Input
                  id="university"
                  value={formData.university}
                  onChange={(e) =>
                    handleInputChange("university", e.target.value)
                  }
                  className={
                    validationErrors.university ? "border-red-500" : ""
                  }
                />
                {validationErrors.university && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.university}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="graduationYear">Graduation Year *</Label>
                <Input
                  id="graduationYear"
                  type="number"
                  min="2024"
                  max="2035"
                  value={formData.graduationYear}
                  onChange={(e) =>
                    handleInputChange("graduationYear", e.target.value)
                  }
                  className={
                    validationErrors.graduationYear ? "border-red-500" : ""
                  }
                />
                {validationErrors.graduationYear && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.graduationYear}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="major">Course *</Label>
                <Input
                  id="major"
                  value={formData.major}
                  onChange={(e) => handleInputChange("major", e.target.value)}
                  className={validationErrors.major ? "border-red-500" : ""}
                />
                {validationErrors.major && (
                  <p className="text-red-500 text-sm mt-1">
                    {validationErrors.major}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="gpa">GPA (Optional)</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.gpa}
                  onChange={(e) => handleInputChange("gpa", e.target.value)}
                />
              </div>
            </div>

            {/* <div>
              <Label htmlFor="experienceLevel">Experience Level *</Label>
              <Select
                value={formData.experienceLevel}
                onValueChange={(value) =>
                  handleInputChange("experienceLevel", value)
                }
              >
                <SelectTrigger
                  className={
                    validationErrors.experienceLevel ? "border-red-500" : ""
                  }
                >
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
              {validationErrors.experienceLevel && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.experienceLevel}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="githubUrl">GitHub URL (Optional)</Label>
              <Input
                id="githubUrl"
                type="url"
                value={formData.githubUrl}
                onChange={(e) => handleInputChange("githubUrl", e.target.value)}
                placeholder="https://github.com/yourusername"
              />
            </div>

            <div>
              <Label htmlFor="linkedinUrl">LinkedIn URL (Optional)</Label>
              <Input
                id="linkedinUrl"
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) =>
                  handleInputChange("linkedinUrl", e.target.value)
                }
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </div>

            <div>
              <Label htmlFor="portfolioUrl">Portfolio URL (Optional)</Label>
              <Input
                id="portfolioUrl"
                type="url"
                value={formData.portfolioUrl}
                onChange={(e) =>
                  handleInputChange("portfolioUrl", e.target.value)
                }
                placeholder="https://yourportfolio.com"
              />
            </div>

            <div>
              <Label htmlFor="preferredTechnologies">
                Preferred Technologies (Optional)
              </Label>
              <Input
                id="preferredTechnologies"
                value={formData.preferredTechnologies}
                onChange={(e) =>
                  handleInputChange("preferredTechnologies", e.target.value)
                }
                placeholder="React, Node.js, Python, etc."
              />
            </div>

            <div>
              <Label htmlFor="availabilityStart">Available Start Date *</Label>
              <Input
                id="availabilityStart"
                type="date"
                value={formData.availabilityStart}
                onChange={(e) =>
                  handleInputChange("availabilityStart", e.target.value)
                }
                className={
                  validationErrors.availabilityStart ? "border-red-500" : ""
                }
              />
              {validationErrors.availabilityStart && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.availabilityStart}
                </p>
              )}
            </div> */}

            <div className="space-y-2">
              <Label htmlFor="projectSubmissionUrl">
                Project Submission URL *
              </Label>
              <Input
                id="projectSubmissionUrl"
                type="url"
                value={formData.projectSubmissionUrl}
                onChange={(e) =>
                  handleInputChange("projectSubmissionUrl", e.target.value)
                }
                placeholder="GitHub repository or Google Drive link"
                className={
                  validationErrors.projectSubmissionUrl ? "border-red-500" : ""
                }
              />
              {validationErrors.projectSubmissionUrl && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.projectSubmissionUrl}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Please provide a link to your completed project or assignment
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motivation">
                Why do you want this internship? *
              </Label>
              <Textarea
                id="motivation"
                value={formData.motivation}
                onChange={(e) =>
                  handleInputChange("motivation", e.target.value)
                }
                rows={5}
                placeholder="Tell us about your motivation and what you hope to achieve..."
                className={validationErrors.motivation ? "border-red-500" : ""}
              />
              {validationErrors.motivation && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.motivation}
                </p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Minimum 20 characters ({formData.motivation.length}/20)
              </p>
            </div>

            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full md:w-auto"
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting Application...
                  </>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

const SuccessPage: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedInternship } = useSelector(
    (state: RootState) => state.application
  );

  const handleApplyAnother = () => {
    dispatch(resetApplication());
  };

  if (!selectedInternship) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="text-center">
        <CardContent className="pt-12 pb-12">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Application Submitted Successfully!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for applying to the{" "}
              <strong>{selectedInternship.title}</strong> position.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Application Review</h3>
                  <p className="text-gray-600">
                    Our team will review your application and project
                    submission.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Initial Screening</h3>
                  <p className="text-gray-600">
                    Qualified candidates will be contacted for a phone/video
                    interview.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Final Decision</h3>
                  <p className="text-gray-600">
                    We'll notify you of our decision within 1-2 weeks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              We'll send updates to your email address. Please check your spam
              folder if you don't hear from us.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleApplyAnother} variant="outline">
                Go Back
              </Button>
              <Button asChild>
                <a href="mailto:contact@getflytechnologies.com">
                  Contact Us
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Main App Component
const InternshipPortal: React.FC = () => {
  const { currentView } = useSelector((state: RootState) => state.application);

  const renderCurrentView = () => {
    switch (currentView) {
      case "internships":
        return <InternshipsList />;
      case "details":
        return <InternshipDetails />;
      case "application":
        return <ApplicationForm />;
      case "success":
        return <SuccessPage />;
      default:
        return <InternshipsList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Getfly Technologies
                </h1>
                <p className="text-sm text-gray-600">Internship Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span>Join our team</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pb-12">{renderCurrentView()}</main>

      <footer className="bg-white border-t mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; Getfly Technologies. All rights reserved.</p>
            <p className="mt-2 text-sm">
              Questions? Contact us at{" "}
              <a
                href="mailto:contact@getflytechnologies.com"
                className="text-blue-600 hover:underline"
              >
                contact@getflytechnologies.com
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Root App with Provider
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <InternshipPortal />
    </Provider>
  );
};

export default App;
