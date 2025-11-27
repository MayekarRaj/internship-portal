import React from 'react';
import { useSelector } from 'react-redux';
import { Building2, Users } from 'lucide-react';
import type { RootState } from '@/store';
import InternshipsList from './InternshipsList';
import InternshipDetails from './InternshipDetails';
import ApplicationForm from './ApplicationForm';
import SuccessPage from './SuccessPage';

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

export default InternshipPortal;

