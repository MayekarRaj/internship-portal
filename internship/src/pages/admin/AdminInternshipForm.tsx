import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ArrowLeft, Save, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { RootState } from '@/App';

const API_BASE_URL = 'http://localhost:3011/api';

interface InternshipFormData {
  title: string;
  department: string;
  description: string;
  requirements: string;
  duration: string;
  stipend: string;
  location: string;
  type: 'remote' | 'onsite' | 'hybrid' | '';
  application_deadline: string;
  start_date: string;
  skills_required: string;
  task_sheet_url: string;
  is_active: boolean;
}

const AdminInternshipForm: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.adminAuth);
  const [isEditMode, setIsEditMode] = useState(false);
  const [internshipId, setInternshipId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState<InternshipFormData>({
    title: '',
    department: '',
    description: '',
    requirements: '',
    duration: '',
    stipend: '',
    location: '',
    type: '',
    application_deadline: '',
    start_date: '',
    skills_required: '',
    task_sheet_url: '',
    is_active: true,
  });

  useEffect(() => {
    // Check if we're editing
    const hash = window.location.hash;
    const editMatch = hash.match(/edit\/(\d+)/);
    if (editMatch) {
      setIsEditMode(true);
      setInternshipId(parseInt(editMatch[1]));
      fetchInternship(parseInt(editMatch[1]));
    }
  }, []);

  const fetchInternship = async (id: number) => {
    try {
      setIsFetching(true);
      const response = await fetch(`${API_BASE_URL}/admin/internships/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch internship');
      }

      const internship = data.data;
      setFormData({
        title: internship.title || '',
        department: internship.department || '',
        description: internship.description || '',
        requirements: internship.requirements || '',
        duration: internship.duration || '',
        stipend: internship.stipend || '',
        location: internship.location || '',
        type: internship.type || '',
        application_deadline: internship.application_deadline || '',
        start_date: internship.start_date || '',
        skills_required: internship.skills_required || '',
        task_sheet_url: internship.task_sheet_url || '',
        is_active: internship.is_active !== undefined ? internship.is_active : true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch internship');
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (field: keyof InternshipFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.department.trim()) {
      setError('Department is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.requirements.trim()) {
      setError('Requirements is required');
      return false;
    }
    if (!formData.duration.trim()) {
      setError('Duration is required');
      return false;
    }
    if (!formData.stipend.trim()) {
      setError('Stipend is required');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    if (!formData.type) {
      setError('Type is required');
      return false;
    }
    if (!formData.application_deadline) {
      setError('Application deadline is required');
      return false;
    }
    if (!formData.start_date) {
      setError('Start date is required');
      return false;
    }
    if (!formData.skills_required.trim()) {
      setError('Skills required is required');
      return false;
    }
    if (new Date(formData.application_deadline) >= new Date(formData.start_date)) {
      setError('Start date must be after application deadline');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(false);

      const url = isEditMode
        ? `${API_BASE_URL}/admin/internships/${internshipId}`
        : `${API_BASE_URL}/admin/internships`;

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save internship');
      }

      setSuccess(true);
      setTimeout(() => {
        window.location.hash = '#admin/internships';
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save internship');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.location.hash = '#admin/internships';
  };

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Internships
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEditMode ? 'Edit Internship' : 'Create New Internship'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditMode ? 'Update internship details' : 'Fill in the details to create a new internship posting'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Internship Details</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                Internship {isEditMode ? 'updated' : 'created'} successfully! Redirecting...
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Mobile App Developer Intern"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="e.g., Engineering"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the internship opportunity..."
                  rows={4}
                  required
                />
              </div>

              <div className="mt-4 space-y-2">
                <Label htmlFor="requirements">Requirements *</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => handleInputChange('requirements', e.target.value)}
                  placeholder="List the requirements for this internship..."
                  rows={4}
                  required
                />
              </div>
            </div>

            {/* Details */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration *</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 3 months"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stipend">Stipend *</Label>
                  <Input
                    id="stipend"
                    value={formData.stipend}
                    onChange={(e) => handleInputChange('stipend', e.target.value)}
                    placeholder="e.g., Rs. 0 or $800-1200/month"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Sion, Mumbai"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => handleInputChange('type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="remote">Remote</SelectItem>
                      <SelectItem value="onsite">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="application_deadline">Application Deadline *</Label>
                  <Input
                    id="application_deadline"
                    type="date"
                    value={formData.application_deadline}
                    onChange={(e) => handleInputChange('application_deadline', e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="skills_required">Skills Required *</Label>
                  <Input
                    id="skills_required"
                    value={formData.skills_required}
                    onChange={(e) => handleInputChange('skills_required', e.target.value)}
                    placeholder="e.g., Flutter, React, JavaScript (comma-separated)"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="task_sheet_url">Task Sheet URL (Optional)</Label>
                  <Input
                    id="task_sheet_url"
                    type="url"
                    value={formData.task_sheet_url}
                    onChange={(e) => handleInputChange('task_sheet_url', e.target.value)}
                    placeholder="https://docs.google.com/document/..."
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active (visible to applicants)
                  </Label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={handleBack}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {isEditMode ? 'Update Internship' : 'Create Internship'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInternshipForm;

