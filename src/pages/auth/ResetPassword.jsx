import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ConnectDatabase from "../../lib/ConnectDatabase";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  // Check if user came from valid reset link
  useEffect(() => {
    const checkResetToken = async () => {
      try {
        const {
          data: { session },
        } = await ConnectDatabase.auth.getSession();

        if (!session) {
          setError(
            "Invalid or expired reset link. Please request a new password reset."
          );
          setValidatingToken(false);
          return;
        }

        setValidatingToken(false);
      } catch (err) {
        console.error("Token validation error:", err);
        setError("Unable to validate reset link. Please try again.");
        setValidatingToken(false);
      }
    };

    checkResetToken();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const validateForm = () => {
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

    setLoading(true);
    setError("");

    try {
      // Update password using Supabase auth
      const { error: updateError } = await ConnectDatabase.auth.updateUser({
        password: formData.password,
      });

      if (updateError) throw updateError;

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error("Password reset error:", err);

      if (err.message.includes("same as the old password")) {
        setError("New password must be different from your old password");
      } else if (err.message.includes("Password")) {
        setError(err.message);
      } else {
        setError(
          "Failed to reset password. Please try again or request a new reset link."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while validating token
  if (validatingToken) {
    return (
      <div className="flex min-h-screen flex-col justify-center items-center bg-gray-50 py-12 sm:px-6 lg:px-8">
        <ArrowPathIcon className="h-12 w-12 animate-spin text-indigo-600" />
        <p className="mt-4 text-sm text-gray-600">Validating reset link...</p>
      </div>
    );
  }

  // Show success message
  if (success) {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-6 py-12 shadow-lg ring-1 ring-gray-900/5 sm:rounded-lg sm:px-12">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Password Reset Successful!
              </h3>
              <p className="mt-4 text-sm text-gray-600">
                Your password has been successfully updated. Redirecting you to
                the login page...
              </p>
              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-indigo-600">PAMJE</h1>
          <p className="mt-2 text-sm text-gray-600">
            Philippine Association of Medical Journal Editors
          </p>
        </div>

        {/* Page Title */}
        <h2 className="mt-8 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Set New Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Choose a strong password for your account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-12 shadow-lg ring-1 ring-gray-900/5 sm:rounded-lg sm:px-12">
          {/* Error Message */}
          {error && (
            <div className="mb-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              Your new password must be at least 8 characters and contain
              uppercase letters, lowercase letters, and numbers.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                New Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  autoFocus
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className="block w-full rounded-md border-0 py-2.5 px-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm sm:leading-6"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-xs">
                    <span
                      className={`mr-2 ${
                        formData.password.length >= 8
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {formData.password.length >= 8 ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        formData.password.length >= 8
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      At least 8 characters
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span
                      className={`mr-2 ${
                        /[A-Z]/.test(formData.password)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {/[A-Z]/.test(formData.password) ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        /[A-Z]/.test(formData.password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      Contains uppercase letter
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span
                      className={`mr-2 ${
                        /[a-z]/.test(formData.password)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {/[a-z]/.test(formData.password) ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        /[a-z]/.test(formData.password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      Contains lowercase letter
                    </span>
                  </div>
                  <div className="flex items-center text-xs">
                    <span
                      className={`mr-2 ${
                        /\d/.test(formData.password)
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {/\d/.test(formData.password) ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        /\d/.test(formData.password)
                          ? "text-green-600"
                          : "text-gray-500"
                      }
                    >
                      Contains number
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Confirm New Password
              </label>
              <div className="mt-2 relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className="block w-full rounded-md border-0 py-2.5 px-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm sm:leading-6"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                  )}
                </button>
              </div>
              {formData.confirmPassword && (
                <p className="mt-1 text-xs">
                  {formData.password === formData.confirmPassword ? (
                    <span className="text-green-600">✓ Passwords match</span>
                  ) : (
                    <span className="text-red-600">
                      ✗ Passwords do not match
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center items-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                    Resetting Password...
                  </>
                ) : (
                  "Reset Password"
                )}
              </button>
            </div>
          </form>

          {/* Back to Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-gray-500">
                  Remember your password?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Back to login
              </Link>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <p className="mt-6 text-center text-xs text-gray-500">
          For your security, this link will expire after one use.
          <br />
          Never share your password with anyone.
        </p>
      </div>
    </div>
  );
};
