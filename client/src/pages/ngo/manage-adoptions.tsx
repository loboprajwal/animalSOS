import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdoptableAnimal } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdoptionForm from "@/components/adoption-form";
import { Loader2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";

export default function ManageAdoptions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  
  const { data: adoptableAnimals, isLoading, refetch } = useQuery<AdoptableAnimal[]>({
    queryKey: ["/api/ngo/adoptable-animals"],
  });
  
  const handleStatusChange = async (id: number, status: string) => {
    try {
      await apiRequest("PATCH", `/api/adoptable-animals/${id}/status`, { status });
      toast({
        title: "Status Updated",
        description: `Animal status changed to ${status}`,
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update animal status",
        variant: "destructive",
      });
    }
  };
  
  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this adoption listing?")) {
      try {
        await apiRequest("DELETE", `/api/adoptable-animals/${id}`);
        toast({
          title: "Listing Deleted",
          description: "The adoption listing has been deleted successfully",
        });
        refetch();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete adoption listing",
          variant: "destructive",
        });
      }
    }
  };
  
  if (!user || user.role !== "ngo") {
    return null;
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Manage Adoptable Animals</h1>
      
      <div className="mb-6">
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          {showForm ? "Cancel" : "Add New Adoption Listing"}
        </Button>
      </div>
      
      {showForm && (
        <Card className="shadow-sm mb-8">
          <CardContent className="p-6">
            <h3 className="font-medium mb-4">Add New Adoption Listing</h3>
            <AdoptionForm 
              onSuccess={() => {
                refetch();
                setShowForm(false);
                toast({
                  title: "Success",
                  description: "New adoption listing added successfully",
                });
              }}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : adoptableAnimals && adoptableAnimals.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">
          {adoptableAnimals.map(animal => (
            <Card key={animal.id} className="shadow-sm overflow-hidden">
              {animal.photoUrl && (
                <div className="h-48 bg-gray-100">
                  <img 
                    src={animal.photoUrl} 
                    alt={animal.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-primary">{animal.name} ({animal.animalType})</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="ghost" 
                      className="p-1 text-primary h-auto"
                      onClick={() => {
                        // Edit functionality would go here
                        toast({
                          title: "Feature Coming Soon",
                          description: "Editing listings will be available in a future update",
                        });
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="p-1 text-red-500 h-auto"
                      onClick={() => handleDelete(animal.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {animal.gender}, {animal.age}, {animal.vaccinated === "yes" ? "Vaccinated" : animal.vaccinated === "partial" ? "Partially Vaccinated" : "Not Vaccinated"}
                </p>
                <p className="text-sm mb-3">{animal.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Status: <span className="font-medium">{animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}</span>
                  </span>
                  <select 
                    className="px-2 py-1 border border-gray-200 rounded text-sm"
                    value={animal.status}
                    onChange={(e) => handleStatusChange(animal.id, e.target.value)}
                  >
                    <option value="available">Available</option>
                    <option value="pending">Pending Adoption</option>
                    <option value="adopted">Adopted</option>
                  </select>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 mb-4">You don't have any animals listed for adoption yet.</p>
          <Button onClick={() => setShowForm(true)}>Add Your First Listing</Button>
        </div>
      )}
    </div>
  );
}
