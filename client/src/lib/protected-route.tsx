import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: () => React.JSX.Element | null;
}) {
  const { user, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        if (isLoading) {
          return (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          );
        }

        if (!user) {
          return <Redirect to="/auth" />;
        }

        // Check if path is an NGO route and user is not an NGO
        if (path.startsWith("/ngo") && user.role !== "ngo") {
          return <Redirect to="/dashboard" />;
        }
        
        // Check if path is a user route and user is an NGO
        if (!path.startsWith("/ngo") && user.role === "ngo" && path !== "/") {
          return <Redirect to="/ngo/dashboard" />;
        }

        return <Component />;
      }}
    </Route>
  );
}
