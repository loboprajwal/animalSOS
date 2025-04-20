import { useAuth } from "@/hooks/use-auth";
import { ReportedAnimal } from "@shared/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Phone, Edit } from "lucide-react";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface ReportedAnimalTableProps {
  animals: ReportedAnimal[];
  onStatusUpdate: () => void;
}

export default function ReportedAnimalTable({ animals, onStatusUpdate }: ReportedAnimalTableProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  
  if (!animals.length) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No animals reported yet.</p>
      </div>
    );
  }
  
  const handleStatusChange = async (id: number, status: string) => {
    setIsUpdating(id);
    try {
      await apiRequest("PATCH", `/api/reported-animals/${id}/status`, { status });
      toast({
        title: "Status Updated",
        description: `Animal status has been updated to ${status}`,
      });
      onStatusUpdate();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update animal status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(null);
    }
  };
  
  const formatTimeSince = (dateString: Date) => {
    const now = new Date();
    const reportedDate = new Date(dateString);
    const diffInMillis = now.getTime() - reportedDate.getTime();
    
    const diffInMinutes = Math.floor(diffInMillis / (1000 * 60));
    const diffInHours = Math.floor(diffInMillis / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMillis / (1000 * 60 * 60 * 24));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };
  
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th className="p-3 text-left">Animal</th>
            <th className="p-3 text-left">Description</th>
            <th className="p-3 text-left">Location</th>
            <th className="p-3 text-left">Reported By</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {animals.map((animal) => (
            <tr key={animal.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-3">
                <div>
                  <span className="font-medium capitalize">{animal.animalType}</span>
                  <span className={`inline-block ml-2 px-2 py-0.5 text-xs rounded ${
                    animal.urgency === 'urgent' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {animal.urgency === 'urgent' ? 'Urgent' : 'Non-urgent'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatTimeSince(animal.reportedAt)}</span>
              </td>
              <td className="p-3">
                <div className="text-sm">{animal.description}</div>
                {animal.photoUrl && (
                  <button 
                    className="text-xs text-blue-500 hover:underline mt-1"
                    onClick={() => setSelectedPhoto(animal.photoUrl || null)}
                  >
                    View photo
                  </button>
                )}
              </td>
              <td className="p-3 text-sm">{animal.location}</td>
              <td className="p-3 text-sm">
                {/* In a real app, we would fetch the reporter's name */}
                Rescuer ID: {animal.reportedById}
              </td>
              <td className="p-3">
                <Select
                  disabled={isUpdating === animal.id}
                  defaultValue={animal.status}
                  onValueChange={(value) => handleStatusChange(animal.id, value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue>
                      <span className={`
                        ${animal.status === 'pending' ? 'text-yellow-600' : ''}
                        ${animal.status === 'in-progress' ? 'text-blue-600' : ''}
                        ${animal.status === 'resolved' ? 'text-green-600' : ''}
                        ${animal.status === 'adoptable' ? 'text-purple-600' : ''}
                      `}>
                        {animal.status.charAt(0).toUpperCase() + animal.status.slice(1)}
                      </span>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="adoptable">Mark as Adoptable</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="p-3">
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 text-blue-500"
                  >
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-9 w-9 text-primary"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Photo Dialog */}
      <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Animal Photo</DialogTitle>
            <DialogDescription>
              Photo of the reported animal
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center">
            {selectedPhoto && (
              <img 
                src={selectedPhoto} 
                alt="Reported animal" 
                className="max-w-full max-h-[500px] object-contain rounded-md"
              />
            )}
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setSelectedPhoto(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
