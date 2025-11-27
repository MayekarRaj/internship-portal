import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Search, Filter, Eye, Trash2, Loader2, AlertCircle, Calendar, Mail, Phone, GraduationCap, Download, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { RootState } from '@/store';
import { adminApplicationService, adminInternshipService } from '@/services';
import type { Application } from '@/types';


const AdminApplicationsList: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.adminAuth);
  const [applications, setApplications] = useState<Application[]>([]);
  const [internships, setInternships] = useState<Array<{ id: number; title: string }>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [showBulkStatusModal, setShowBulkStatusModal] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<string>('');

  // Filters
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    internship_id: '',
    date_from: '',
    date_to: '',
  });

  useEffect(() => {
    fetchInternships();
  }, [token]);

  useEffect(() => {
    fetchApplications();
  }, [token, page, filters]);

  const fetchInternships = async () => {
    try {
      const internships = await adminInternshipService.getAll();
      setInternships(internships.map(i => ({ id: i.id, title: i.title })));
    } catch (err) {
      console.error('Failed to fetch internships:', err);
    }
  };

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      const data = await adminApplicationService.getAll({
        page,
        limit: 10,
        status: filters.status || undefined,
        internship_id: filters.internship_id ? parseInt(filters.internship_id) : undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        search: filters.search || undefined,
      });

      setApplications(data.data || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setApplications([]); // Set empty array on error
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await adminApplicationService.delete(id);
      // Refresh list
      fetchApplications();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete application');
    } finally {
      setDeletingId(null);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      internship_id: '',
      date_from: '',
      date_to: '',
    });
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await adminApplicationService.export({
        status: filters.status || undefined,
        internship_id: filters.internship_id ? parseInt(filters.internship_id) : undefined,
        date_from: filters.date_from || undefined,
        date_to: filters.date_to || undefined,
        search: filters.search || undefined,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export applications');
    } finally {
      setIsExporting(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && applications) {
      setSelectedIds(new Set(applications.map(app => app.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectApplication = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus || selectedIds.size === 0) return;

    try {
      setIsBulkUpdating(true);
      const result = await adminApplicationService.bulkUpdateStatus(
        Array.from(selectedIds),
        bulkStatus
      );

      alert(`Successfully updated ${result.updated_count} application(s) to ${bulkStatus}`);
      setSelectedIds(new Set());
      setShowBulkStatusModal(false);
      setBulkStatus('');
      fetchApplications();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} application(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      setIsBulkDeleting(true);
      const result = await adminApplicationService.bulkDelete(Array.from(selectedIds));

      alert(`Successfully deleted ${result.deleted_count} application(s)`);
      setSelectedIds(new Set());
      fetchApplications();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete applications');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  if (error && !isLoading) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
          <p className="text-gray-600 mt-1">View and manage all internship applications</p>
        </div>
        <Button
          onClick={handleExport}
          disabled={isExporting}
          variant="outline"
        >
          {isExporting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </>
          )}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold">Filters</h3>
            </div>
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Name, email, university..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={filters.status || 'all'} 
                onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Internship</Label>
              <Select
                value={filters.internship_id || 'all'}
                onValueChange={(value) => handleFilterChange('internship_id', value === 'all' ? '' : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All internships" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All internships</SelectItem>
                  {internships.map((internship) => (
                    <SelectItem key={internship.id} value={internship.id.toString()}>
                      {internship.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date From</Label>
              <Input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Date To</Label>
              <Input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Applications List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : !applications || applications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-600">No applications found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Bulk Actions Toolbar */}
          {selectedIds.size > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">
                      {selectedIds.size} application(s) selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIds(new Set())}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowBulkStatusModal(true)}
                      disabled={isBulkUpdating}
                    >
                      Update Status
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBulkDelete}
                      disabled={isBulkDeleting}
                      className="text-red-600 hover:text-red-700"
                    >
                      {isBulkDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              Showing {applications?.length || 0} of {total} applications
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectAll(selectedIds.size !== (applications?.length || 0))}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                {selectedIds.size === (applications?.length || 0) ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                Select All
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {applications && applications.map((application) => (
              <Card key={application.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        onClick={() => handleSelectApplication(application.id, !selectedIds.has(application.id))}
                        className="mt-1"
                      >
                        {selectedIds.has(application.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                          {application.first_name} {application.last_name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            application.application_status
                          )}`}
                        >
                          {application.application_status.charAt(0).toUpperCase() +
                            application.application_status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          {application.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 mr-2" />
                          {application.phone}
                        </div>
                        <div className="flex items-center">
                          <GraduationCap className="w-4 h-4 mr-2" />
                          {application.university}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(application.created_at)}
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Internship:</span>{' '}
                          <span className="text-gray-600">{application.internship_title}</span>
                        </div>
                        <div>
                          <span className="font-medium">Major:</span>{' '}
                          <span className="text-gray-600">{application.major}</span>
                          {application.graduation_year && (
                            <>
                              {' • '}
                              <span className="font-medium">Graduation:</span>{' '}
                              <span className="text-gray-600">{application.graduation_year}</span>
                            </>
                          )}
                          {application.gpa && (
                            <>
                              {' • '}
                              <span className="font-medium">GPA:</span>{' '}
                              <span className="text-gray-600">{application.gpa}</span>
                            </>
                          )}
                        </div>
                        {application.project_submission_url && (
                          <div>
                            <span className="font-medium">Project:</span>{' '}
                            <a
                              href={application.project_submission_url?.startsWith("http")
                                ? application.project_submission_url
                                : `https://${application.project_submission_url}`
}                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              View Project
                            </a>
                          </div>
                        )}
                      </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => (window.location.hash = `#admin/applications/${application.id}`)}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(application.id)}
                        disabled={deletingId === application.id}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        {deletingId === application.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Bulk Status Update Modal */}
      {showBulkStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Update Status for {selectedIds.size} Application(s)</h3>
              <div className="space-y-4">
                <div>
                  <Label>New Status</Label>
                  <Select value={bulkStatus} onValueChange={setBulkStatus}>
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
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBulkStatusModal(false);
                      setBulkStatus('');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleBulkStatusUpdate}
                    disabled={!bulkStatus || isBulkUpdating}
                  >
                    {isBulkUpdating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Status'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AdminApplicationsList;

