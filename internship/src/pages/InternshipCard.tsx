import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, MapPin, Clock, Calendar } from "lucide-react";
import type { Internship } from "@/types";

interface InternshipCardProps {
  internship: Internship;
  onSelect: () => void;
}

const InternshipCard: React.FC<InternshipCardProps> = ({ internship, onSelect }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "remote":
        return "bg-green-100 text-green-800";
      case "onsite":
        return "bg-blue-100 text-blue-800";
      case "hybrid":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card
      className="h-full hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{internship.title}</CardTitle>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
              internship.type
            )}`}
          >
            {internship.type.charAt(0).toUpperCase() + internship.type.slice(1)}
          </span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Building2 className="w-4 h-4 mr-1" />
          {internship.department}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-gray-700 line-clamp-3">{internship.description}</p>

        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            {internship.location}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            {internship.duration}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            Apply by {formatDate(internship.application_deadline)}
          </div>
        </div>

        <div className="pt-2">
          <Button className="w-full">View Details & Apply</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InternshipCard;

