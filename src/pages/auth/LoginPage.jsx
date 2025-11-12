import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ConnectDatabase from "../../lib/ConnectDatabase";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  // Check user role from user_profiles table
  const checkUserRole = async (userId) => {
    try {
      const { data: profile, error } = await ConnectDatabase.from(
        "user_profiles"
      )
        .select("role, is_active")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
        return { role: "user", isActive: true }; // Default fallback
      }

      // Check if account is active
      if (!profile.is_active) {
        throw new Error(
          "Your account has been deactivated. Please contact support."
        );
      }

      return {
        role: profile.role || "user",
        isActive: profile.is_active,
      };
    } catch (err) {
      console.error("Error checking user role:", err);
      throw err;
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await ConnectDatabase.auth.getSession();

        if (session) {
          const { role } = await checkUserRole(session.user.id);

          // Redirect based on role
          console.log("ROLE: ", role);
          if (role === "super_admin" || role === "admin") {
            navigate("/adm/dashboard");
          } else {
            navigate("/");
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      }
    };

    checkSession();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError("Email address is required");
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Sign in with Supabase
      const { data, error: signInError } =
        await ConnectDatabase.auth.signInWithPassword({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
        });

      if (signInError) throw signInError;

      if (data.user) {
        // Update last_login_at in user_profiles
        await ConnectDatabase.from("user_profiles")
          .update({ last_login: new Date().toISOString() })
          .eq("id", data.user.id);

        setSuccess("Login successful! Redirecting...");

        // Store remember me preference
        if (formData.rememberMe) {
          localStorage.setItem("pamje_remember_user", data.user.email);
        } else {
          localStorage.removeItem("pamje_remember_user");
        }

        // Check user role and redirect accordingly
        const { role } = await checkUserRole(data.user.id);

        // Small delay to show success message
        setTimeout(() => {
          if (role === "super_admin" || role === "admin") {
            navigate("/adm/dashboard");
          } else {
            navigate("/");
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Login error:", err);

      // User-friendly error messages
      if (err.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (err.message.includes("Email not confirmed")) {
        setError(
          "Please verify your email address before logging in. Check your inbox for the verification link."
        );
      } else if (err.message.includes("deactivated")) {
        setError(err.message);
      } else if (err.message.includes("Too many requests")) {
        setError("Too many login attempts. Please try again in a few minutes.");
      } else {
        setError(
          err.message || "An error occurred during login. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await ConnectDatabase.auth.signInWithOAuth(
        {
          provider: "google",
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
          },
        }
      );

      if (signInError) throw signInError;
    } catch (err) {
      console.error("Google sign-in error:", err);
      setError("Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("pamje_remember_user");
    if (rememberedEmail) {
      setFormData((prev) => ({
        ...prev,
        email: rememberedEmail,
        rememberMe: true,
      }));
    }
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo and Title */}
          <div>
            {/* <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-indigo-600">PAMJE</h1>
              <p className="mt-2 text-sm text-gray-600">
                Philippine Association of Medical Journal Editors
              </p>
            </div> */}

            <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Or{" "}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                request access to the system
              </Link>
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mt-6 rounded-md bg-green-50 p-4">
              <div className="flex">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    {success}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-900"
                >
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading || success}
                    className="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm sm:leading-6"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading || success}
                    className="block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm sm:leading-6"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    disabled={loading || success}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:cursor-not-allowed"
                  />
                  <label
                    htmlFor="rememberMe"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    to="/forgot-password"
                    className="font-semibold text-indigo-600 hover:text-indigo-500"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                      Signing in...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Success!
                    </>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-gray-50 px-4 text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Google Sign In */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading || success}
                  className="flex w-full items-center justify-center gap-3 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:ring-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-5 w-5"
                  >
                    <path
                      d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                      fill="#EA4335"
                    />
                    <path
                      d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                      fill="#34A853"
                    />
                  </svg>
                  <span className="text-sm font-semibold">
                    Sign in with Google
                  </span>
                </button>
              </div>
            </div>

            {/* Register Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600">
                Need an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Request access
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          alt="Medical journals and research"
          src="https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1908&q=80"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900 opacity-20" />

        {/* Overlay Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="max-w-xl text-center px-8">
            <h2 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">
              Philippine Association of Medical Journal Editors
            </h2>
            <p className="text-xl text-white drop-shadow-lg">
              Comprehensive journal management system for medical publications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
