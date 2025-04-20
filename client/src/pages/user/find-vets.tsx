import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import VetFinder from "@/components/vet-finder";

export default function FindVets() {
  const [searchCompleted, setSearchCompleted] = useState(false);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-primary mb-6">Find Nearby Veterinarians</h1>
      
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <VetFinder 
            onSearchComplete={() => setSearchCompleted(true)} 
          />
        </CardContent>
      </Card>
      
      {!searchCompleted && (
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 text-blue-800">
          <h3 className="font-semibold mb-2">Emergency Animal Care Tips</h3>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li>Keep the animal calm and minimize movement if injured</li>
            <li>For bleeding, apply gentle pressure with a clean cloth</li>
            <li>Do not give human medication to animals</li>
            <li>For heat stroke, move to shade and offer small amounts of water</li>
            <li>Transport carefully, supporting the body to prevent further injury</li>
            <li>Avoid feeding an injured animal until advised by a vet</li>
          </ul>
        </div>
      )}
    </div>
  );
}
