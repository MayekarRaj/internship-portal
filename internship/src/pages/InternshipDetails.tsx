import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ArrowLeft, MapPin, Calendar, Clock, Download, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { setCurrentView } from '@/store';
import type { RootState } from '@/store';

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

export default InternshipDetails;

