import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { ConnectDatabase } from "../../lib/ConnectDatabase";

/**
 * ProtectedRoute Component
 * Protects admin routes by checking authentication status
 * Redirects to login page if user is not authenticated
 */
export const ProtectedRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await ConnectDatabase.auth.getSession();

        if (session) {
          setAuthenticated(true);
        } else {
          setAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = ConnectDatabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN") {
        setAuthenticated(true);
      } else if (event === "SIGNED_OUT") {
        setAuthenticated(false);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    // Redirect to login page while saving the attempted URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
