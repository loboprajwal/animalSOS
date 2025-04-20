import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdoptableAnimal } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AdoptionCard from "@/components/adoption-card";
import { Loader2, Search } from "lucide-react";

export default function Adoptions() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const { data: animals, isLoading } = useQuery<AdoptableAnimal[]>({
    queryKey: ["/api/adoptable-animals"],
  });
  
  // Filter animals based on search term
  const filteredAnimals = animals?.filter(animal => {
    const searchLower = searchTerm.toLowerCase();
    return (
      animal.name.toLowerCase().includes(searchLower) ||
      animal.animalType.toLowerCase().includes(searchLower) ||
      animal.description.toLowerCase().includes(searchLower)
    );
  });
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-primary mb-6">Animals Available for Adoption</h1>
      
      <Card className="shadow-sm mb-8">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search by animal type, location..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredAnimals && filteredAnimals.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnimals.map(animal => (
            <AdoptionCard key={animal.id} animal={animal} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-500">
            {searchTerm 
              ? "No animals match your search criteria. Please try a different search." 
              : "No animals are currently available for adoption."}
          </p>
        </div>
      )}
    </div>
  );
}
