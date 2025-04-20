import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { ReportedAnimal } from "@shared/schema";
import { Loader2 } from "lucide-react";

export default function UserDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: reportedAnimals, isLoading } = useQuery<ReportedAnimal[]>({
    queryKey: ["/api/reported-animals"],
    staleTime: 30000, // 30 seconds
  });

  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary mb-2">Hello, {user.fullName}</h1>
        <p className="text-gray-600">Help an animal in need or find resources nearby.</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-primary mb-2">Report Injured Animal</h2>
            <p className="text-gray-600 mb-4">Report an animal in distress to get immediate help.</p>
            <Button 
              className="w-full bg-orange-500 hover:bg-orange-600"
              onClick={() => setLocation("/report-animal")}
            >
              Report Now
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-primary mb-2">Find Veterinarians</h2>
            <p className="text-gray-600 mb-4">Locate nearby vets for emergency animal care.</p>
            <Button 
              className="w-full bg-blue-500 hover:bg-blue-600"
              onClick={() => setLocation("/find-vets")}
            >
              Find Vets
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-primary mb-2">View Adoptable Animals</h2>
            <p className="text-gray-600 mb-4">See animals available for adoption from local NGOs.</p>
            <Button 
              className="w-full"
              onClick={() => setLocation("/adoptions")}
            >
              View Adoptions
            </Button>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Reports Section */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold text-primary mb-4">Your Recent Reports</h2>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : reportedAnimals && reportedAnimals.length > 0 ? (
            <div className="space-y-4">
              {reportedAnimals.slice(0, 3).map((animal) => (
                <div 
                  key={animal.id} 
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary transition-colors"
                >
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{animal.animalType}</h3>
                        <span 
                          className={`text-xs px-2 py-0.5 rounded-full 
                            ${animal.urgency === 'urgent' 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-500 text-white'}`}
                        >
                          {animal.urgency === 'urgent' ? 'Urgent' : 'Non-urgent'}
                        </span>
                        <span 
                          className={`text-xs px-2 py-0.5 rounded-full ml-2
                            ${animal.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                              : animal.status === 'in-progress'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : animal.status === 'resolved'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-purple-100 text-purple-800 border border-purple-200'}`}
                        >
                          {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{animal.description}</p>
                    </div>
                    {animal.photoUrl && (
                      <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={animal.photoUrl} 
                          alt={animal.animalType} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(animal.reportedAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-600">{animal.location}</span>
                  </div>
                </div>
              ))}
              
              {reportedAnimals.length > 3 && (
                <div className="text-center mt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => setLocation('/view-reports')}
                  >
                    View All Reports
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">You haven't reported any animals yet.</p>
              <Button 
                onClick={() => setLocation('/report-animal')}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Report an Animal Now
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
