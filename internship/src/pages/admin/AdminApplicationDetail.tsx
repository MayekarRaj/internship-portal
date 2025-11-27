import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2, AlertCircle, Mail, Phone, GraduationCap, Calendar, ExternalLink, MessageSquare, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { adminApplicationService, notesService } from '@/services';
import type { Application, Note } from '@/types';

const AdminApplicationDetail: React.FC = () => {
  // Token is handled by API client automatically
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editNoteText, setEditNoteText] = useState('');

  useEffect(() => {
    // Extract application ID from hash
    const hash = window.location.hash;
    const match = hash.match(/applications\/(\d+)/);
    if (match && match[1]) {
      fetchApplication(parseInt(match[1]));
    } else {
      setError('Invalid application ID');
      setIsLoading(false);
    }
  }, []);

  const fetchApplication = async (id: number) => {
    try {
      setIsLoading(true);
      const app = await adminApplicationService.getById(id);
      setApplication(app);
      setStatus(app.application_status);
      
      // Fetch notes
      fetchNotes(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch application');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async (applicationId: number) => {
    try {
      const notesData = await notesService.getByApplication(applicationId);
      setNotes(notesData);
    } catch (err) {
      console.error('Error fetching notes:', err);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !application) return;

    try {
      setIsAddingNote(true);
      await notesService.create(application.id, newNote);
      setNewNote('');
      await fetchNotes(application.id);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleUpdateNote = async (noteId: number) => {
    if (!editNoteText.trim()) return;

    try {
      await notesService.update(noteId, editNoteText);
      setEditingNoteId(null);
      setEditNoteText('');
      if (application) {
        await fetchNotes(application.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!confirm('Are you sure you want to delete this note?')) return;

    try {
      await notesService.delete(noteId);
      if (application) {
        await fetchNotes(application.id);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete note');
    }
  };

  const handleStatusUpdate = async () => {
    if (!application || status === application.application_status) {
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      setSuccess(false);

      await adminApplicationService.updateStatus(application.id, status);
      setSuccess(true);
      if (application) {
        setApplication({ ...application, application_status: status as any });
      }
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application status');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    window.location.hash = '#admin/applications';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
      shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && !application) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Applications
        </Button>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Button variant="outline" onClick={handleBack} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Applications
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Application Details
          </h1>
          <p className="text-gray-600 mt-1">View and manage application information</p>
        </div>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            Application status updated successfully!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Applicant Information */}
          <Card>
            <CardHeader>
              <CardTitle>Applicant Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-600">Full Name</Label>
                  <p className="text-lg font-medium">
                    {application.first_name} {application.last_name}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    <a
                      href={`mailto:${application.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {application.email}
                    </a>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Phone</Label>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <a
                      href={`tel:${application.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {application.phone}
                    </a>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">University</Label>
                  <div className="flex items-center">
                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                    {application.university}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-600">Major/Field of Study</Label>
                  <p>{application.major}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Graduation Year</Label>
                  <p>{application.graduation_year}</p>
                </div>
                {application.gpa && (
                  <div>
                    <Label className="text-gray-600">GPA</Label>
                    <p>{application.gpa}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Internship Information */}
          <Card>
            <CardHeader>
              <CardTitle>Internship Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-600">Internship Title</Label>
                <p className="text-lg font-medium">{application.internship_title}</p>
              </div>
              <div>
                <Label className="text-gray-600">Department</Label>
                <p>{application.department}</p>
              </div>
              <div>
                <Label className="text-gray-600">Description</Label>
                <p className="text-gray-700 whitespace-pre-wrap">{application.internship_description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Motivation */}
          <Card>
            <CardHeader>
              <CardTitle>Motivation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{application.motivation}</p>
            </CardContent>
          </Card>

          {/* Project Submission */}
          {application.project_submission_url && (
            <Card>
              <CardHeader>
                <CardTitle>Project Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={application.project_submission_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:underline"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Project Submission
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <Card>
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Status</Label>
                <div className="mt-2">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                      application.application_status
                    )}`}
                  >
                    {application.application_status.charAt(0).toUpperCase() +
                      application.application_status.slice(1)}
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="status">Update Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="reviewed">Reviewed</SelectItem>
                    <SelectItem value="shortlisted">Shortlisted</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {status !== application.application_status && (
                <Button
                  onClick={handleStatusUpdate}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Update Status
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Application Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Application Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <Label className="text-gray-600">Application ID</Label>
                <p className="font-mono">#{application.id}</p>
              </div>
              <div>
                <Label className="text-gray-600">Submitted</Label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {formatDate(application.created_at)}
                </div>
              </div>
              <div>
                <Label className="text-gray-600">Last Updated</Label>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  {formatDate(application.updated_at)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Notes ({notes.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Note Form */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Add a note about this application..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={3}
                />
                <Button
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || isAddingNote}
                  size="sm"
                  className="w-full"
                >
                  {isAddingNote ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Note
                    </>
                  )}
                </Button>
              </div>

              {/* Notes List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No notes yet</p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      {editingNoteId === note.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editNoteText}
                            onChange={(e) => setEditNoteText(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleUpdateNote(note.id)}
                              size="sm"
                              disabled={!editNoteText.trim()}
                            >
                              Save
                            </Button>
                            <Button
                              onClick={() => {
                                setEditingNoteId(null);
                                setEditNoteText('');
                              }}
                              variant="outline"
                              size="sm"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                            {note.note}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div>
                              <span className="font-medium">{note.admin_name}</span>
                              <span className="mx-2">•</span>
                              <span>{formatDate(note.created_at)}</span>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingNoteId(note.id);
                                  setEditNoteText(note.note);
                                }}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteNote(note.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminApplicationDetail;

