// Common types used across the application

// Internship types
export interface Internship {
  id: number;
  title: string;
  department: string;
  description: string;
  requirements: string;
  duration: string;
  stipend: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid';
  application_deadline: string;
  start_date: string;
  skills_required: string;
  task_sheet_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Application types
export interface InternshipApplication {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  graduationYear: number;
  major: string;
  gpa?: number;
  motivation: string;
  projectSubmissionUrl: string;
  internshipId: number;
}

export interface Application {
  id: number;
  internship_id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  university: string;
  graduation_year: number;
  major: string;
  gpa?: number;
  motivation: string;
  project_submission_url: string;
  application_status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  created_at: string;
  updated_at: string;
  internship_title?: string;
  department?: string;
  internship_description?: string;
}

// Admin types
export interface Admin {
  id: number;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Note types
export interface Note {
  id: number;
  application_id: number;
  admin_id: number;
  note: string;
  created_at: string;
  updated_at: string;
  admin_name: string;
  admin_email: string;
}

// Dashboard types
export interface DashboardMetrics {
  totalActiveInternships: number;
  totalApplications: number;
  pendingApplications: number;
  thisWeekApplications: number;
  thisMonthApplications: number;
  statusBreakdown: Array<{ application_status: string; count: number }>;
}

export interface RecentApplication {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  internship_title: string;
  application_status: string;
  created_at: string;
}

