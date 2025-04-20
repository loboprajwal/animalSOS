import { Card, CardContent } from "@/components/ui/card";
import { AdoptableAnimal } from "@shared/schema";
import { Phone } from "lucide-react";

interface AdoptionCardProps {
  animal: AdoptableAnimal;
}

export default function AdoptionCard({ animal }: AdoptionCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow overflow-hidden">
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
        <h3 className="font-medium text-primary">{animal.name} ({animal.animalType})</h3>
        <p className="text-sm text-gray-600 mb-2">
          {animal.gender.charAt(0).toUpperCase() + animal.gender.slice(1)}, {animal.age}, 
          {animal.vaccinated === "yes" 
            ? " Vaccinated" 
            : animal.vaccinated === "partial" 
              ? " Partially Vaccinated" 
              : " Not Vaccinated"}
        </p>
        <p className="text-sm mb-3">{animal.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
              animal.status === 'available' 
                ? 'bg-green-500' 
                : animal.status === 'pending' 
                  ? 'bg-yellow-500' 
                  : 'bg-red-500'
            }`}></span>
            {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
          </span>
          <a href="tel:+919876543210" className="text-blue-500 hover:underline flex items-center">
            <Phone className="h-4 w-4 mr-1" />
            Contact NGO
          </a>
        </div>
      </CardContent>
    </Card>
  );
}
