// Types
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

export interface InternshipApplication {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  university: string;
  graduationYear: number;
  major: string;
  gpa?: number;
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  preferredTechnologies?: string;
  motivation: string;
  availabilityStart: string;
  projectSubmissionUrl: string;
  internshipId: number;
}

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

// Extend Express Request to include admin
declare global {
  namespace Express {
    interface Request {
      admin?: Admin;
    }
  }
}

