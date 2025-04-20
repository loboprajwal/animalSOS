import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function HomePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  
  // Redirect logged in users to their dashboard
  useEffect(() => {
    if (user) {
      if (user.role === "ngo") {
        setLocation("/ngo/dashboard");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, setLocation]);
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-primary mb-6">Help Rescue Animals in Need</h1>
      <p className="text-lg text-center mb-8">AnimalSOS connects rescuers with NGOs to provide timely assistance to injured animals across Maharashtra.</p>
      
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-primary mb-4">For Individual Rescuers</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Report injured animals quickly and easily</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Find nearby veterinarians for emergencies</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>View animals available for adoption</span>
              </li>
            </ul>
            <Button 
              className="mt-6 w-full py-2 bg-orange-500 hover:bg-orange-600" 
              onClick={() => setLocation("/auth")}
            >
              Register as Rescuer
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold text-primary mb-4">For Animal Welfare NGOs</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Get alerts about injured animals in your area</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Manage animal adoption listings</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">•</span>
                <span>Coordinate with individual rescuers</span>
              </li>
            </ul>
            <Button 
              className="mt-6 w-full py-2" 
              onClick={() => setLocation("/auth")}
            >
              Register as NGO
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
