import { Switch, Route } from "wouter";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import UserDashboard from "@/pages/user/dashboard";
import NGODashboard from "@/pages/ngo/dashboard";
import ReportAnimal from "@/pages/user/report-animal";
import FindVets from "@/pages/user/find-vets";
import Adoptions from "@/pages/user/adoptions";
import ReportedAnimals from "@/pages/ngo/reported-animals";
import ManageAdoptions from "@/pages/ngo/manage-adoptions";
import { ProtectedRoute } from "@/lib/protected-route";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function Router() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/auth" component={AuthPage} />
          
          {/* User routes */}
          <ProtectedRoute path="/dashboard" component={UserDashboard} />
          <ProtectedRoute path="/report-animal" component={ReportAnimal} />
          <ProtectedRoute path="/find-vets" component={FindVets} />
          <ProtectedRoute path="/adoptions" component={Adoptions} />
          
          {/* NGO routes */}
          <ProtectedRoute path="/ngo/dashboard" component={NGODashboard} />
          <ProtectedRoute path="/ngo/reported-animals" component={ReportedAnimals} />
          <ProtectedRoute path="/ngo/manage-adoptions" component={ManageAdoptions} />
          
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
      {/* Footer removed as requested */}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
