import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { applicationService } from '@/services';
import {
  updateFormData,
  setValidationErrors,
  setSubmitting,
  setSubmitSuccess,
  setError,
  setCurrentView,
} from '@/store';
import type { RootState } from '@/store';
import type { InternshipApplication } from '@/types';

const ApplicationForm: React.FC = () => {
  const dispatch = useDispatch();
  const {
    formData,
    selectedInternship,
    isSubmitting,
    validationErrors,
    error,
  } = useSelector((state: RootState) => state.application);

  const handleInputChange = (field: string, value: string) => {
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
    if (!formData.motivation.trim())
      errors.motivation = "Motivation is required";
    if (formData.motivation.length < 20)
      errors.motivation = "Motivation must be at least 20 characters";
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

    dispatch(setSubmitting(true));
    try {
      const applicationData: InternshipApplication = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        university: formData.university,
        graduationYear: parseInt(formData.graduationYear),
        major: formData.major,
        gpa: formData.gpa ? parseFloat(formData.gpa) : undefined,
        motivation: formData.motivation,
        projectSubmissionUrl: formData.projectSubmissionUrl,
        internshipId: formData.internshipId,
      };

      await applicationService.submit(applicationData);
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

export default ApplicationForm;

