import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { insertUserSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

// This file is being converted to JavaScript

// Login schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Register schema
const registerSchema = insertUserSchema.extend({
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "ngo"]),
  fullName: z.string().min(2, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  // Form states for login
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<{username?: string, password?: string}>({});
  
  // Form states for registration
  const [registerData, setRegisterData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    role: "user" as "user" | "ngo",
    ngoName: "",
    ngoRegistration: "",
    contactPhone: "",
    location: ""
  });
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      if (user.role === "ngo") {
        setLocation("/ngo/dashboard");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, setLocation]);

  // Handle login form submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate login
    const validationResult = loginSchema.safeParse({
      username: loginUsername,
      password: loginPassword
    });
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setLoginErrors(errors);
      return;
    }
    
    setLoginErrors({});
    loginMutation.mutate({
      username: loginUsername,
      password: loginPassword
    });
  };

  // Handle registration form submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate registration
    const validationResult = registerSchema.safeParse(registerData);
    
    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.errors.forEach(err => {
        if (err.path[0]) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      setRegisterErrors(errors);
      return;
    }
    
    setRegisterErrors({});
    
    // Remove confirmPassword as it's not in the schema
    const { confirmPassword, ...userData } = registerData;
    registerMutation.mutate(userData);
  };
  
  // Handle registration input changes
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle radio button changes for role selection
  const handleRoleChange = (value: string) => {
    setRegisterData(prev => ({
      ...prev,
      role: value as "user" | "ngo"
    }));
  };

  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      <div>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            {isLogin ? (
              <>
                <h2 className="text-2xl font-bold text-primary mb-6">Login to AnimalSOS</h2>
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username"
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Enter your username"
                    />
                    {loginErrors.username && (
                      <p className="text-sm text-red-500">{loginErrors.username}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                    {loginErrors.password && (
                      <p className="text-sm text-red-500">{loginErrors.password}</p>
                    )}
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Logging in..." : "Login"}
                  </Button>
                </form>
                
                <p className="text-center text-sm mt-4">
                  Don't have an account?{" "}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(false)} 
                    className="text-blue-500 hover:underline"
                  >
                    Register
                  </button>
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-primary mb-6">Create an Account</h2>
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input 
                      id="fullName"
                      name="fullName"
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      placeholder="Enter your full name"
                    />
                    {registerErrors.fullName && (
                      <p className="text-sm text-red-500">{registerErrors.fullName}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-username">Username</Label>
                    <Input 
                      id="reg-username"
                      name="username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      placeholder="Choose a username"
                    />
                    {registerErrors.username && (
                      <p className="text-sm text-red-500">{registerErrors.username}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input 
                      id="reg-password"
                      name="password"
                      type="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      placeholder="Choose a password"
                    />
                    {registerErrors.password && (
                      <p className="text-sm text-red-500">{registerErrors.password}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input 
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      placeholder="Confirm your password"
                    />
                    {registerErrors.confirmPassword && (
                      <p className="text-sm text-red-500">{registerErrors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contactPhone">Contact Phone</Label>
                    <Input 
                      id="contactPhone"
                      name="contactPhone"
                      value={registerData.contactPhone}
                      onChange={handleRegisterChange}
                      placeholder="Enter your contact number"
                    />
                    {registerErrors.contactPhone && (
                      <p className="text-sm text-red-500">{registerErrors.contactPhone}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="location">Location (City/Town in Maharashtra)</Label>
                    <Input 
                      id="location"
                      name="location"
                      value={registerData.location}
                      onChange={handleRegisterChange}
                      placeholder="E.g., Pune, Mumbai, Nagpur"
                    />
                    {registerErrors.location && (
                      <p className="text-sm text-red-500">{registerErrors.location}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Account Type</Label>
                    <RadioGroup
                      value={registerData.role}
                      onValueChange={handleRoleChange}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="user" id="user-type" />
                        <Label htmlFor="user-type">Individual Rescuer</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="ngo" id="ngo-type" />
                        <Label htmlFor="ngo-type">NGO</Label>
                      </div>
                    </RadioGroup>
                    {registerErrors.role && (
                      <p className="text-sm text-red-500">{registerErrors.role}</p>
                    )}
                  </div>
                  
                  {registerData.role === "ngo" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="ngoName">NGO Name</Label>
                        <Input 
                          id="ngoName"
                          name="ngoName"
                          value={registerData.ngoName}
                          onChange={handleRegisterChange}
                          placeholder="Enter your NGO name"
                        />
                        {registerErrors.ngoName && (
                          <p className="text-sm text-red-500">{registerErrors.ngoName}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ngoRegistration">Registration Number</Label>
                        <Input 
                          id="ngoRegistration"
                          name="ngoRegistration"
                          value={registerData.ngoRegistration}
                          onChange={handleRegisterChange}
                          placeholder="Enter NGO registration number"
                        />
                        {registerErrors.ngoRegistration && (
                          <p className="text-sm text-red-500">{registerErrors.ngoRegistration}</p>
                        )}
                      </div>
                    </>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={registerMutation.isPending}
                  >
                    {registerMutation.isPending ? "Registering..." : "Register"}
                  </Button>
                </form>
                
                <p className="text-center text-sm mt-4">
                  Already have an account?{" "}
                  <button 
                    type="button"
                    onClick={() => setIsLogin(true)} 
                    className="text-blue-500 hover:underline"
                  >
                    Login
                  </button>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="bg-primary rounded-lg p-8 text-white flex flex-col justify-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to AnimalSOS</h2>
        <p className="mb-6">Join our mission to help injured animals across Maharashtra.</p>
        
        <div className="space-y-4">
          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Report Injured Animals</h3>
            <p className="text-sm">Alert nearby NGOs about animals in distress and track their progress.</p>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Find Veterinary Help</h3>
            <p className="text-sm">Quickly locate the nearest veterinarians in case of emergency.</p>
          </div>
          
          <div className="bg-white/10 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Support Animal Adoptions</h3>
            <p className="text-sm">Browse animals available for adoption from trusted NGOs.</p>
          </div>
        </div>
      </div>
    </div>
  );
}