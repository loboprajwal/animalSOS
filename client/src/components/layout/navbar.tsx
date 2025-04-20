import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [location, setLocation] = useLocation();
  const { user, isLoading, logoutMutation } = useAuth();
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          AnimalSOS
        </Link>
        
        {!isLoading && (
          <>
            {!user ? (
              // Not logged in
              <div className="flex space-x-4">
                <Button 
                  variant="outline" 
                  className="border-white text-white hover:bg-primary-foreground hover:text-primary"
                  onClick={() => setLocation("/auth")}
                >
                  Login
                </Button>
                <Button 
                  className="bg-white text-primary hover:bg-gray-100"
                  onClick={() => setLocation("/auth")}
                >
                  Register
                </Button>
              </div>
            ) : user.role === "user" ? (
              // Logged in as User
              <div className="flex items-center space-x-4">
                <Link 
                  href="/report-animal" 
                  className={`text-white hover:text-neutral-100 ${location === "/report-animal" ? "font-bold" : ""}`}
                >
                  Report Animal
                </Link>
                <Link 
                  href="/find-vets" 
                  className={`text-white hover:text-neutral-100 ${location === "/find-vets" ? "font-bold" : ""}`}
                >
                  Find Vets
                </Link>
                <Link 
                  href="/adoptions" 
                  className={`text-white hover:text-neutral-100 ${location === "/adoptions" ? "font-bold" : ""}`}
                >
                  Adoptions
                </Link>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-primary-foreground hover:text-primary"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            ) : (
              // Logged in as NGO
              <div className="flex items-center space-x-4">
                <Link 
                  href="/ngo/reported-animals" 
                  className={`text-white hover:text-neutral-100 ${location === "/ngo/reported-animals" ? "font-bold" : ""}`}
                >
                  Reported Animals
                </Link>
                <Link 
                  href="/ngo/manage-adoptions" 
                  className={`text-white hover:text-neutral-100 ${location === "/ngo/manage-adoptions" ? "font-bold" : ""}`}
                >
                  Manage Adoptions
                </Link>
                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-primary-foreground hover:text-primary"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
