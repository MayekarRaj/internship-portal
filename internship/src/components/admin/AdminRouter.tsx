import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import AdminLayout from './AdminLayout';
import AdminLogin from '../../pages/admin/AdminLogin';
import AdminDashboard from '../../pages/admin/AdminDashboard';
import AdminInternshipsList from '../../pages/admin/AdminInternshipsList';
import AdminInternshipForm from '../../pages/admin/AdminInternshipForm';
import AdminApplicationsList from '../../pages/admin/AdminApplicationsList';
import AdminApplicationDetail from '../../pages/admin/AdminApplicationDetail';
import { verifyAdmin } from '../../store/adminAuthSlice';
import type { RootState } from '@/store';

const AdminRouter: React.FC = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.adminAuth);
  const [currentPage, setCurrentPage] = useState('dashboard');

  useEffect(() => {
    // Check authentication on mount
    const token = localStorage.getItem('adminToken');
    if (token && !isAuthenticated) {
      dispatch(verifyAdmin() as any);
    }
  }, [dispatch, isAuthenticated]);

  // Handle hash-based routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#admin/', '').replace('#admin', '') || 'dashboard';
      setCurrentPage(hash || 'dashboard');
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const renderPage = () => {
    // Handle nested routes like internships/new, internships/edit/:id
    if (currentPage.startsWith('internships/new') || currentPage.startsWith('internships/edit')) {
      return <AdminInternshipForm />;
    }

    // Handle application detail route
    if (currentPage.startsWith('applications/')) {
      return <AdminApplicationDetail />;
    }

    switch (currentPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'internships':
        return <AdminInternshipsList />;
      case 'applications':
        return <AdminApplicationsList />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout currentPage={currentPage}>
      {renderPage()}
    </AdminLayout>
  );
};

export default AdminRouter;

