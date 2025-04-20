import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../../hooks/use-auth";

export default function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link href="/" className="nav-logo">
          AnimalSOS
        </Link>
        
        {user ? (
          <div className="nav-links">
            {user.role === "ngo" ? (
              // NGO navigation links
              <>
                <Link href="/ngo/dashboard">Dashboard</Link>
                <Link href="/ngo/reported-animals">Reported Animals</Link>
                <Link href="/ngo/manage-adoptions">Manage Adoptions</Link>
              </>
            ) : (
              // Regular user navigation links
              <>
                <Link href="/dashboard">Dashboard</Link>
                <Link href="/report-animal">Report Animal</Link>
                <Link href="/find-vets">Find Vets</Link>
                <Link href="/adoptions">Adoptions</Link>
              </>
            )}
            <button onClick={handleLogout} className="btn">
              Logout
            </button>
          </div>
        ) : (
          <div className="nav-links">
            <Link href="/auth">
              <button className="btn">Login / Register</button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}