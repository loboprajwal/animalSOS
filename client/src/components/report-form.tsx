import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { getCurrentLocation } from "@/lib/geolocation";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loader2, MapPin } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface ReportFormProps {
  onSuccess: () => void;
  onError: (error: Error) => void;
  isSubmitting: boolean;
  setIsSubmitting: (isSubmitting: boolean) => void;
}

// Form schema
const formSchema = z.object({
  animalType: z.string().min(1, "Please select an animal type"),
  urgency: z.enum(["urgent", "non-urgent"], {
    required_error: "Please select the urgency level",
  }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  location: z.string().min(3, "Please provide a location"),
});

type FormValues = z.infer<typeof formSchema>;

export default function ReportForm({ onSuccess, onError, isSubmitting, setIsSubmitting }: ReportFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      animalType: "",
      urgency: "non-urgent",
      description: "",
      location: "",
    },
  });

  const handleGetLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location.error) {
        toast({
          title: "Location Error",
          description: location.error,
          variant: "destructive",
        });
        form.setValue("location", "");
      } else {
        form.setValue("location", location.address);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const onSubmit = async (values: FormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      // Create FormData
      const formData = new FormData();
      
      // Add form fields
      formData.append('animalType', values.animalType);
      formData.append('urgency', values.urgency);
      formData.append('description', values.description);
      formData.append('location', values.location);
      formData.append('reportedById', user.id.toString());
      
      // Add photo if selected
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }
      
      // Submit the form
      const response = await fetch('/api/reported-animals', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      onSuccess();
    } catch (error) {
      onError(error as Error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="animalType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Animal Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select animal type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="bird">Bird</SelectItem>
                  <SelectItem value="cow">Cow</SelectItem>
                  <SelectItem value="monkey">Monkey</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="urgency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Urgency</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-6"
                >
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="urgent" id="urgent" />
                    </FormControl>
                    <FormLabel htmlFor="urgent" className="text-red-500 font-medium">Urgent</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-2">
                    <FormControl>
                      <RadioGroupItem value="non-urgent" id="non-urgent" />
                    </FormControl>
                    <FormLabel htmlFor="non-urgent">Non-urgent</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormDescription>
                Select "Urgent" if the animal needs immediate medical attention
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe the animal's condition and any visible injuries" 
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Provide as much detail as possible about the animal's condition
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Input
                    placeholder="Current location" 
                    {...field}
                    readOnly
                  />
                </FormControl>
                <Button 
                  type="button" 
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
              <FormDescription>
                Click the location icon to use your current location
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel htmlFor="photo">Upload Photo</FormLabel>
          <div className="flex items-center space-x-2 mt-1">
            <input 
              type="file" 
              id="photo" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5 mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              Choose photo
            </Button>
            <span className="text-sm text-gray-600">
              {selectedFile ? selectedFile.name : "No file chosen"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Upload a clear photo of the injured animal
          </p>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-orange-500 hover:bg-orange-600"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Report"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
