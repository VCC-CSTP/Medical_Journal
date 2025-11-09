import { useState } from "react";
import { Link } from "react-router-dom";
import ConnectDatabase from "../../lib/ConnectDatabase";
import {
  EnvelopeIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(""); // Clear error when user types
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Validate email format
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    try {
      const { error: resetError } =
        await ConnectDatabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });

      if (resetError) {
        // Don't reveal if email exists or not for security
        console.error("Password reset error:", resetError);
      }

      // Always show success message (security best practice - don't reveal if email exists)
      setSuccess(true);
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

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
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link
            to="/login"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            return to sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white px-6 py-12 shadow-lg ring-1 ring-gray-900/5 sm:rounded-lg sm:px-12">
          {/* Success Message */}
          {success ? (
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">
                Check your email
              </h3>
              <div className="mt-4 text-sm text-gray-600 space-y-3">
                <p>
                  If an account exists with{" "}
                  <span className="font-medium text-gray-900">{email}</span>,
                  you'll receive password reset instructions shortly.
                </p>
                <p>The link will expire in 1 hour for security purposes.</p>
                <p className="text-gray-500">
                  Don't forget to check your spam folder if you don't see it in
                  your inbox.
                </p>
              </div>
              <div className="mt-8 space-y-3">
                <Link
                  to="/login"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Return to sign in
                </Link>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail("");
                  }}
                  className="flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Send another email
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Enter your email address and we'll send you a link to reset
                  your password.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 rounded-md bg-red-50 p-4">
                  <div className="flex">
                    <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium leading-6 text-gray-900"
                  >
                    Email address
                  </label>
                  <div className="mt-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      autoFocus
                      value={email}
                      onChange={handleEmailChange}
                      disabled={loading}
                      className="block w-full rounded-md border-0 py-2.5 pl-10 pr-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm sm:leading-6"
                      placeholder="you@example.com"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    We'll send a password reset link to this email address
                  </p>
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
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending reset link...
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </button>
                </div>
              </form>

              {/* Additional Help */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-white px-4 text-gray-500">
                      Need help?
                    </span>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-indigo-600 hover:text-indigo-500"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Security Note */}
        <p className="mt-6 text-center text-xs text-gray-500">
          For security reasons, we don't disclose whether an email exists in our
          system.
          <br />
          If you don't receive an email, please check your spam folder or
          contact support.
        </p>
      </div>
    </div>
  );
};
