import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ReportedAnimal } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ReportedAnimalTable from "@/components/reported-animal-table";
import { Loader2 } from "lucide-react";

export default function ReportedAnimals() {
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState<string | null>(null);
  
  const { data: reportedAnimals, isLoading, refetch } = useQuery<ReportedAnimal[]>({
    queryKey: ["/api/reported-animals"],
  });
  
  // Apply filters
  const filteredAnimals = reportedAnimals?.filter(animal => {
    if (statusFilter && animal.status !== statusFilter) return false;
    if (urgencyFilter && animal.urgency !== urgencyFilter) return false;
    return true;
  });
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Reported Animals</h1>
      
      <Card className="shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={statusFilter === null ? "default" : "outline"}
              onClick={() => setStatusFilter(null)}
            >
              All
            </Button>
            <Button
              variant={urgencyFilter === "urgent" ? "destructive" : "outline"}
              className={urgencyFilter === "urgent" ? "" : "border-red-500 text-red-500"}
              onClick={() => setUrgencyFilter(urgencyFilter === "urgent" ? null : "urgent")}
            >
              Urgent
            </Button>
            <Button
              variant={urgencyFilter === "non-urgent" ? "secondary" : "outline"}
              onClick={() => setUrgencyFilter(urgencyFilter === "non-urgent" ? null : "non-urgent")}
            >
              Non-urgent
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter(statusFilter === "pending" ? null : "pending")}
            >
              Pending
            </Button>
            <Button
              variant={statusFilter === "in-progress" ? "secondary" : "outline"}
              onClick={() => setStatusFilter(statusFilter === "in-progress" ? null : "in-progress")}
            >
              In Progress
            </Button>
            <Button
              variant={statusFilter === "resolved" ? "default" : "outline"}
              className={statusFilter === "resolved" ? "bg-green-600" : "border-green-500 text-green-600"}
              onClick={() => setStatusFilter(statusFilter === "resolved" ? null : "resolved")}
            >
              Resolved
            </Button>
            <Button
              variant={statusFilter === "adoptable" ? "default" : "outline"}
              className={statusFilter === "adoptable" ? "bg-purple-600" : "border-purple-500 text-purple-600"}
              onClick={() => setStatusFilter(statusFilter === "adoptable" ? null : "adoptable")}
            >
              Adoptable
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ReportedAnimalTable 
              animals={filteredAnimals || []} 
              onStatusUpdate={() => refetch()}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
