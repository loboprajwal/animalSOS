import React from "react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="container flex flex-col items-center justify-center">
      <h1>404 - Page Not Found</h1>
      <p className="mb-4">The page you're looking for doesn't exist.</p>
      <Link href="/">
        <button className="btn">Return to Home</button>
      </Link>
    </div>
  );
}