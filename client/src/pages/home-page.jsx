import React, { useEffect } from "react";
import { useAuth } from "../hooks/use-auth";
import { useLocation } from "wouter";

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
    <div className="container">
      <h1>Help Rescue Animals in Need</h1>
      <p className="text-center mb-8">AnimalSOS connects rescuers with NGOs to provide timely assistance to injured animals across Maharashtra.</p>
      
      <div className="grid mb-8">
        <div className="card">
          <div className="card-content">
            <h2>For Individual Rescuers</h2>
            <ul>
              <li className="list-item">
                <span className="list-bullet">•</span>
                <span>Report injured animals quickly and easily</span>
              </li>
              <li className="list-item">
                <span className="list-bullet">•</span>
                <span>Find nearby veterinarians for emergencies</span>
              </li>
              <li className="list-item">
                <span className="list-bullet">•</span>
                <span>View animals available for adoption</span>
              </li>
            </ul>
            <button 
              className="btn btn-secondary btn-full mt-6" 
              onClick={() => setLocation("/auth")}
            >
              Register as Rescuer
            </button>
          </div>
        </div>
        
        <div className="card">
          <div className="card-content">
            <h2>For Animal Welfare NGOs</h2>
            <ul>
              <li className="list-item">
                <span className="list-bullet">•</span>
                <span>Get alerts about injured animals in your area</span>
              </li>
              <li className="list-item">
                <span className="list-bullet">•</span>
                <span>Manage animal adoption listings</span>
              </li>
              <li className="list-item">
                <span className="list-bullet">•</span>
                <span>Coordinate with individual rescuers</span>
              </li>
            </ul>
            <button 
              className="btn btn-full mt-6" 
              onClick={() => setLocation("/auth")}
            >
              Register as NGO
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}