import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2, AlertCircle, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { internshipService } from "@/services";
import { setInternships, setLoading, setError, setSelectedInternship, setCurrentView } from "@/store";
import type { RootState } from "@/store";
import type { Internship } from "@/types";
import InternshipCard from "./InternshipCard";

const InternshipsList: React.FC = () => {
  const dispatch = useDispatch();
  const { internships, isLoading, error } = useSelector(
    (state: RootState) => state.application
  );

  useEffect(() => {
    const loadInternships = async () => {
      dispatch(setLoading(true));
      try {
        const data = await internshipService.getAll();
        dispatch(setInternships(data));
      } catch (err) {
        dispatch(
          setError(
            err instanceof Error ? err.message : "Failed to load internships"
          )
        );
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadInternships();
  }, [dispatch]);

  const handleSelectInternship = async (internship: Internship) => {
    try {
      const details = await internshipService.getById(internship.id);
      dispatch(setSelectedInternship(details));
      dispatch(setCurrentView("details"));
    } catch (err) {
      dispatch(
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load internship details"
        )
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Available Internships
        </h1>
        <p className="text-gray-600">
          Discover exciting opportunities to grow your career
        </p>
      </div>

      {internships.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-semibold mb-2">
              No internships available
            </h3>
            <p className="text-gray-600">
              Check back later for new opportunities
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              onSelect={() => handleSelectInternship(internship)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InternshipsList;

