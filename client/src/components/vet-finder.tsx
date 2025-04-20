import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Phone } from "lucide-react";
import { getCurrentLocation } from "@/lib/geolocation";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Veterinarian } from "@shared/schema";

interface VetFinderProps {
  onSearchComplete: () => void;
}

export default function VetFinder({ onSearchComplete }: VetFinderProps) {
  const { toast } = useToast();
  const [location, setLocation] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { data: vets, isLoading, refetch } = useQuery<Veterinarian[]>({
    queryKey: ["/api/veterinarians", { location }],
    enabled: false,
  });
  
  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const locationData = await getCurrentLocation();
      if (locationData.error) {
        toast({
          title: "Location Error",
          description: locationData.error,
          variant: "destructive",
        });
        setLocation("");
      } else {
        setLocation(locationData.address);
      }
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Failed to get your location",
        variant: "destructive",
      });
    } finally {
      setIsGettingLocation(false);
    }
  };
  
  const handleSearch = () => {
    if (!location) {
      toast({
        title: "Location Required",
        description: "Please enter a location or use your current location",
        variant: "destructive",
      });
      return;
    }
    
    refetch();
    setHasSearched(true);
    onSearchComplete();
  };
  
  return (
    <div>
      <div className="mb-4">
        <label className="block text-gray-600 mb-1">Your Location</label>
        <div className="flex items-center space-x-2">
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter your location"
            className="flex-grow"
          />
          <Button 
            size="icon"
            variant="outline"
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600" 
            onClick={handleGetLocation}
            disabled={isGettingLocation}
          >
            {isGettingLocation ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <MapPin className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="mb-4">
        <Button 
          onClick={handleSearch}
          className="w-full bg-blue-500 hover:bg-blue-600"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            "Search Veterinarians"
          )}
        </Button>
      </div>
      
      {hasSearched && (
        <div>
          <h3 className="font-medium mb-3">Veterinarians Near You</h3>
          
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : vets && vets.length > 0 ? (
            <div className="space-y-3">
              {vets.map((vet) => (
                <div key={vet.id} className="border border-gray-200 rounded p-4">
                  <h4 className="font-medium text-primary">{vet.name}</h4>
                  <p className="text-sm text-gray-600">{vet.address}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm">
                      {vet.location.split(',')[0]}
                    </span>
                    <a 
                      href={`tel:${vet.phone}`} 
                      className="text-blue-500 hover:underline flex items-center"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      {vet.phone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded">
              <p className="text-gray-500">No veterinarians found near your location.</p>
              <p className="text-sm text-gray-400 mt-2">Try a different location or contact animal helpline: +91 98765 43210</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
