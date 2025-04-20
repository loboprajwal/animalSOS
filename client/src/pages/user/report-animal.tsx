import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent } from "@/components/ui/card";
import ReportForm from "@/components/report-form";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function ReportAnimal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSuccess = () => {
    toast({
      title: "Report Submitted",
      description: "Your animal report has been submitted successfully. NGOs in the area have been notified.",
    });
    setLocation("/dashboard");
  };
  
  const handleError = (error: Error) => {
    toast({
      title: "Error Submitting Report",
      description: error.message || "There was a problem submitting your report. Please try again.",
      variant: "destructive",
    });
    setIsSubmitting(false);
  };
  
  if (!user) return null;
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">Report an Injured Animal</h1>
      
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <ReportForm 
            onSuccess={handleSuccess}
            onError={handleError}
            isSubmitting={isSubmitting}
            setIsSubmitting={setIsSubmitting}
          />
        </CardContent>
      </Card>
    </div>
  );
}
