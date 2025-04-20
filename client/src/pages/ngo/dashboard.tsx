import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { ReportedAnimal } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function NGODashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect to reported animals page (as per requirement)
  const navigateToReportedAnimals = () => {
    setLocation("/ngo/reported-animals");
  };
  
  if (!user || user.role !== "ngo") {
    return null;
  }
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">Welcome, {user.ngoName || user.fullName}</h1>
        <p className="text-gray-600">Manage reported animals and adoption listings.</p>
      </div>
      
      <div className="flex justify-center">
        <Button
          onClick={navigateToReportedAnimals}
          className="px-8 py-6 text-lg"
        >
          View All Reported Animals
        </Button>
      </div>
    </div>
  );
}
