import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ConnectDatabase from "../../lib/ConnectDatabase";
import { ArrowPathIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export const LogOut = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState("logging_out"); // logging_out, success, error

  useEffect(() => {
    handleLogout();
  }, []);

  const handleLogout = async () => {
    try {
      // Sign out from Supabase
      const { error } = await ConnectDatabase.auth.signOut();

      if (error) throw error;

      // Clear any local storage
      localStorage.removeItem("pamje_remember_user");

      setStatus("success");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (error) {
      console.error("Logout error:", error);
      setStatus("error");

      // Still redirect to login even if there's an error
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 3000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          {/* Logo */}
          <h1 className="text-4xl font-bold text-indigo-600 mb-2">PAMJE</h1>
          <p className="text-sm text-gray-600">
            Philippine Association of Medical Journal Editors
          </p>
        </div>

        <div className="bg-white px-8 py-12 shadow-lg ring-1 ring-gray-900/5 rounded-lg">
          <div className="text-center">
            {status === "logging_out" && (
              <>
                <ArrowPathIcon className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  Logging you out...
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Please wait while we securely log you out
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckCircleIcon className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  Logged out successfully
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Redirecting you to the login page...
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                  <span className="text-2xl">⚠️</span>
                </div>
                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  Logout issue detected
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Redirecting you to the login page...
                </p>
              </>
            )}
          </div>
        </div>

        {status === "success" && (
          <div className="text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Go to login now →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
