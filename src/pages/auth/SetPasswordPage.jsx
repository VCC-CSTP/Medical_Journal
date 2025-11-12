import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ConnectDatabase from "../../lib/ConnectDatabase";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

export const SetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState(null);
  const [validatingToken, setValidatingToken] = useState(true);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    // Get token from URL
    const tokenFromUrl = searchParams.get("token");
    if (!tokenFromUrl) {
      setError("Invalid or missing activation link. Please contact support.");
      setValidatingToken(false);
      return;
    }

    setToken(tokenFromUrl);
    setValidatingToken(false);
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
    // Password validation
    if (!formData.password) {
      setError("Password is required");
      return false;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return false;
    }

    // Password strength check
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasLowerCase = /[a-z]/.test(formData.password);
    const hasNumbers = /\d/.test(formData.password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError("Password must contain uppercase, lowercase, and numbers");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setError("Invalid activation token. Please contact support.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Update user password using the recovery token
      const { error: updateError } = await ConnectDatabase.auth.updateUser({
        password: formData.password,
      });

      if (updateError) throw updateError;

      // Update user_profiles to mark as active
      const {
        data: { user },
      } = await ConnectDatabase.auth.getUser();

      if (user) {
        await ConnectDatabase.from("user_profiles")
          .update({
            is_active: true,
            approval_status: "approved",
          })
          .eq("id", user.id);

        // Also activate the people record
        await ConnectDatabase.from("people")
          .update({
            is_active: true,
            is_verified: true,
          })
          .eq("user_id", user.id);
      }

      setSuccess(true);
    } catch (err) {
      console.error("Set password error:", err);
      setError(
        err.message ||
          "An error occurred while setting your password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Show success message
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Password Set Successfully!
            </h2>
            <p className="mt-3 text-base text-gray-600">
              Your password has been set and your account is now active.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              You can now log in using your email and the password you just
              created.
            </p>

            <div className="mt-8">
              <button
                onClick={() => navigate("/login")}
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show validation loading
  if (validatingToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="mx-auto h-12 w-12 animate-spin text-indigo-600" />
          <p className="mt-4 text-sm text-gray-600">
            Validating activation link...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-indigo-600">PAMJE</h1>
            <p className="mt-2 text-sm text-gray-600">
              Philippine Association of Medical Journal Editors
            </p>
          </div>

          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
            <KeyIcon className="h-6 w-6 text-indigo-600" />
          </div>

          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Set Your Password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Your account has been approved! Please create a secure password to
            activate your account.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Set Password Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                New Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                placeholder="••••••••"
              />
              <p className="mt-1 text-xs text-gray-500">
                Must be at least 8 characters with uppercase, lowercase, and
                numbers
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading || !token}
              className="flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                  Setting Password...
                </>
              ) : (
                "Set Password & Activate Account"
              )}
            </button>
          </div>
        </form>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help?{" "}
            <a
              href="mailto:support@pamje.org"
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
