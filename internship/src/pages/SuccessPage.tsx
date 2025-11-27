import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { resetApplication } from '@/store';
import type { RootState } from '@/store';

const SuccessPage: React.FC = () => {
  const dispatch = useDispatch();
  const { selectedInternship } = useSelector(
    (state: RootState) => state.application
  );

  const handleApplyAnother = () => {
    dispatch(resetApplication());
  };

  if (!selectedInternship) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card className="text-center">
        <CardContent className="pt-12 pb-12">
          <div className="mb-6">
            <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Application Submitted Successfully!
            </h1>
            <p className="text-gray-600 text-lg">
              Thank you for applying to the{" "}
              <strong>{selectedInternship.title}</strong> position.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">What happens next?</h2>
            <div className="space-y-3 text-left">
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Application Review</h3>
                  <p className="text-gray-600">
                    Our team will review your application and project
                    submission.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Initial Screening</h3>
                  <p className="text-gray-600">
                    Qualified candidates will be contacted for a phone/video
                    interview.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium mr-3 mt-0.5">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Final Decision</h3>
                  <p className="text-gray-600">
                    We'll notify you of our decision within 1-2 weeks.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-600">
              We'll send updates to your email address. Please check your spam
              folder if you don't hear from us.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button onClick={handleApplyAnother} variant="outline">
                Go Back
              </Button>
              <Button asChild>
                <a href="mailto:contact@getflytechnologies.com">
                  Contact Us
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessPage;

