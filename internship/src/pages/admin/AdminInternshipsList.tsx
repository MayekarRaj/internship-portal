import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Plus, Edit, Trash2, Eye, EyeOff, Loader2, AlertCircle, Calendar, MapPin, Clock, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { RootState } from '@/store';
import { adminInternshipService } from '@/services';
import type { Internship } from '@/types';

const AdminInternshipsList: React.FC = () => {
  const { token } = useSelector((state: RootState) => state.adminAuth);
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    fetchInternships();
  }, [token]);

  const fetchInternships = async () => {
    try {
      setIsLoading(true);
      const data = await adminInternshipService.getAll();
      setInternships(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this internship? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      await adminInternshipService.delete(id);
      // Remove from list
      setInternships(internships.filter((internship) => internship.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete internship');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: number, currentStatus: boolean) => {
    try {
      setTogglingId(id);
      await adminInternshipService.toggleStatus(id, !currentStatus);
      // Update in list
      setInternships(
        internships.map((internship) =>
          internship.id === id ? { ...internship, is_active: !currentStatus } : internship
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update internship status');
    } finally {
      setTogglingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      remote: 'bg-green-100 text-green-800',
      onsite: 'bg-blue-100 text-blue-800',
      hybrid: 'bg-purple-100 text-purple-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Internships</h1>
          <p className="text-gray-600 mt-1">Manage all internship postings</p>
        </div>
        <Button onClick={() => (window.location.hash = '#admin/internships/new')}>
          <Plus className="w-4 h-4 mr-2" />
          Create Internship
        </Button>
      </div>

      {/* Internships List */}
      {internships.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No internships found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first internship posting.</p>
            <Button onClick={() => (window.location.hash = '#admin/internships/new')}>
              <Plus className="w-4 h-4 mr-2" />
              Create Internship
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {internships.map((internship) => (
            <Card key={internship.id} className={!internship.is_active ? 'opacity-75' : ''}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{internship.title}</h3>
                      {!internship.is_active && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          Inactive
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(internship.type)}`}>
                        {internship.type.charAt(0).toUpperCase() + internship.type.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Building2 className="w-4 h-4 mr-1" />
                      {internship.department}
                    </div>
                    <p className="text-gray-700 line-clamp-2 mb-4">{internship.description}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {internship.location}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        {internship.duration}
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        Deadline: {formatDate(internship.application_deadline)}
                      </div>
                      <div className="text-gray-600">
                        Start: {formatDate(internship.start_date)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(internship.created_at)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleStatus(internship.id, internship.is_active)}
                      disabled={togglingId === internship.id}
                    >
                      {togglingId === internship.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : internship.is_active ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-1" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-1" />
                          Activate
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (window.location.hash = `#admin/internships/edit/${internship.id}`)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(internship.id)}
                      disabled={deletingId === internship.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === internship.id ? (
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
      )}
    </div>
  );
};

export default AdminInternshipsList;

