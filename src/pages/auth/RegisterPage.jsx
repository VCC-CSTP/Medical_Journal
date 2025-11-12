import React, { useState } from "react";
import { Link } from "react-router-dom";
import ConnectDatabase from "../../lib/ConnectDatabase";
import {
  ExclamationCircleIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  InformationCircleIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [cvFile, setCvFile] = useState(null);

  const [formData, setFormData] = useState({
    // Basic Info
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",

    // Professional Info (for people table)
    title: "",
    affiliation: "",
    position: "",

    // Agreement
    agreeToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  // Handle CV file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file type
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid CV file (PDF or Word document)");
        e.target.value = "";
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("CV file size must be less than 5MB");
        e.target.value = "";
        return;
      }

      setCvFile(file);
      setError("");
    }
  };

  // Remove selected CV file
  const removeFile = () => {
    setCvFile(null);
    const fileInput = document.getElementById("cv-upload");
    if (fileInput) fileInput.value = "";
  };

  const validateForm = () => {
    // Required fields
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return false;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Email address is required");
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // CV is required
    if (!cvFile) {
      setError("Please upload your CV/Resume (PDF or Word document)");
      return false;
    }

    if (!formData.agreeToTerms) {
      setError("You must agree to the terms and conditions");
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
      // Construct full name
      const fullName = `${formData.firstName} ${
        formData.middleName ? formData.middleName + " " : ""
      }${formData.lastName}`.trim();

      // Step 1: Create a temporary user ID for the pending registration
      // We'll use a placeholder auth account that will be activated later
      const tempPassword = Math.random().toString(36).slice(-16) + "Aa1!"; // Temporary password

      const { data: authData, error: signUpError } =
        await ConnectDatabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: tempPassword, // Temporary password
          options: {
            data: {
              first_name: formData.firstName,
              last_name: formData.lastName,
              full_name: fullName,
              pending_approval: true,
            },
            emailRedirectTo: `${window.location.origin}/set-password`,
          },
        });

      if (signUpError) throw signUpError;

      if (authData.user) {
        const userId = authData.user.id;

        // Step 1.5: Sign in with the temporary credentials to get authenticated session
        const { error: signInError } =
          await ConnectDatabase.auth.signInWithPassword({
            email: formData.email.trim().toLowerCase(),
            password: tempPassword,
          });

        if (signInError) {
          console.error("Sign in error:", signInError);
          // Continue anyway - we'll try to upload without full auth
        }

        // Step 2: Upload CV to Supabase Storage
        let cvUrl = null;
        if (cvFile) {
          const fileExt = cvFile.name.split(".").pop();
          const fileName = `${userId}/cv_${Date.now()}.${fileExt}`;

          const { data: uploadData, error: uploadError } =
            await ConnectDatabase.storage.from("cvs").upload(fileName, cvFile, {
              cacheControl: "3600",
              upsert: false,
            });

          if (uploadError) {
            console.error("CV upload error:", uploadError);
            throw new Error("Failed to upload CV. Please try again.");
          }

          // Get public URL for the CV
          const { data: urlData } = ConnectDatabase.storage
            .from("cvs")
            .getPublicUrl(fileName);

          cvUrl = urlData.publicUrl;
        }

        // Step 3: Update user_profiles with CV URL and approval status
        const { error: profileUpdateError } = await ConnectDatabase.from(
          "user_profiles"
        )
          .update({
            phone: formData.phone || null,
            cv_url: cvUrl,
            approval_status: "pending",
            is_active: false, // Not active until approved
          })
          .eq("id", userId);

        if (profileUpdateError) {
          console.error("Profile update error:", profileUpdateError);
        }

        // Step 4: Create people record (for journal editorial activities)
        const { error: peopleError } = await ConnectDatabase.from(
          "people"
        ).insert({
          user_id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          middle_name: formData.middleName || null,
          full_name: fullName,
          title: formData.title || null,
          email: formData.email.trim().toLowerCase(),
          phone: formData.phone || null,
          affiliation: formData.affiliation || null,
          position: formData.position || null,
          cv_url: cvUrl,
          is_verified: false,
          is_active: false, // Not active until approved
        });

        if (peopleError) {
          console.error("Error creating people record:", peopleError);
        }

        // Step 5: Link person_id to user_profiles
        if (!peopleError) {
          const { data: personData } = await ConnectDatabase.from("people")
            .select("id")
            .eq("user_id", userId)
            .single();

          if (personData) {
            await ConnectDatabase.from("user_profiles")
              .update({ person_id: personData.id })
              .eq("id", userId);
          }
        }

        // Step 6: Send registration received notification email
        // Note: This would typically be handled by a Supabase Edge Function
        // For now, we'll just show success message

        // Step 7: Sign out the user so they don't remain logged in
        // They should only log in after admin approval and password setup
        await ConnectDatabase.auth.signOut();

        setSuccess(true);
      }
    } catch (err) {
      console.error("Registration error:", err);

      // User-friendly error messages
      if (err.message.includes("already registered")) {
        setError(
          "This email is already registered. Please use a different email or try logging in."
        );
      } else if (err.message.includes("Invalid email")) {
        setError("Please enter a valid email address.");
      } else {
        setError(
          err.message ||
            "An error occurred during registration. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // If registration successful, show success message
  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircleIcon className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Registration Received!
            </h2>
            <div className="mt-4 rounded-md bg-blue-50 p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="ml-3 flex-1 text-left">
                  <h3 className="text-sm font-medium text-blue-800">
                    What happens next?
                  </h3>
                  <div className="mt-2 text-sm text-blue-700 space-y-2">
                    <p>
                      <strong>1.</strong> You will receive a confirmation email
                      shortly.
                    </p>
                    <p>
                      <strong>2.</strong> Our administrators will review your
                      registration.
                    </p>
                    <p>
                      <strong>3.</strong> Once approved, you'll receive an email
                      with instructions to set your password.
                    </p>
                    <p>
                      <strong>4.</strong> After setting your password, you can
                      log in and access the platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-md bg-yellow-50 p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div className="ml-3 text-left">
                  <p className="text-sm text-yellow-700">
                    <strong>Please note:</strong> The approval process typically
                    takes 1-3 business days. You will receive an email
                    notification once your account has been approved.
                  </p>
                </div>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              Don't forget to check your spam folder if you don't see the email.
            </p>

            <div className="mt-8">
              <Link
                to="/login"
                className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              >
                Return to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Logo and Title */}
          <div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-indigo-600">PAMJE</h1>
              <p className="mt-2 text-sm text-gray-600">
                Philippine Association of Medical Journal Editors
              </p>
            </div>

            <h2 className="text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Request Access
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
              >
                Sign in instead
              </Link>
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-6 rounded-md bg-red-50 p-4">
              <div className="flex">
                <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Info Banner */}
          <div className="mt-6 rounded-md bg-blue-50 p-4">
            <div className="flex">
              <InformationCircleIcon className="h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <p className="text-sm text-blue-700">
                  Your registration will be reviewed by our administrators.
                  You'll receive an email once approved, with instructions to
                  set your password.
                </p>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Personal Information
                </h3>

                {/* First Name */}
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    autoComplete="given-name"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Juan"
                  />
                </div>

                {/* Middle Name */}
                <div>
                  <label
                    htmlFor="middleName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Middle Name (Optional)
                  </label>
                  <input
                    id="middleName"
                    name="middleName"
                    type="text"
                    autoComplete="additional-name"
                    value={formData.middleName}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Santos"
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Dela Cruz"
                  />
                </div>

                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title (Optional)
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Dr., Prof., etc."
                  />
                </div>
              </div>

              {/* Contact Information Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  Contact Information
                </h3>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="juan.delacruz@example.com"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number (Optional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>

              {/* Professional Information Section */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900">
                  Professional Information (Optional)
                </h3>

                {/* Affiliation */}
                <div>
                  <label
                    htmlFor="affiliation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Affiliation/Institution
                  </label>
                  <input
                    id="affiliation"
                    name="affiliation"
                    type="text"
                    value={formData.affiliation}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="University of the Philippines"
                  />
                </div>

                {/* Position */}
                <div>
                  <label
                    htmlFor="position"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Position/Role
                  </label>
                  <input
                    id="position"
                    name="position"
                    type="text"
                    value={formData.position}
                    onChange={handleChange}
                    disabled={loading}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Associate Professor"
                  />
                </div>
              </div>

              {/* CV Upload Section */}
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Curriculum Vitae <span className="text-red-500">*</span>
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  Accepted formats: PDF, Word (DOC, DOCX) • Max size: 5MB
                </p>

                {/* File Upload */}
                {!cvFile ? (
                  <label
                    htmlFor="cv-upload"
                    className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-gray-50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="text-center">
                      <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        Click to upload your CV
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PDF or Word document (required)
                      </p>
                    </div>
                    <input
                      id="cv-upload"
                      name="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      disabled={loading}
                      className="hidden"
                      required
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-300 rounded-lg">
                    <div className="flex items-center flex-1 min-w-0">
                      <DocumentArrowUpIcon className="h-8 w-8 text-green-600 shrink-0" />
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-900 truncate">
                          {cvFile.name}
                        </p>
                        <p className="text-xs text-green-700">
                          {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={loading}
                      className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors disabled:cursor-not-allowed"
                      title="Remove file"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start pt-4">
                <div className="flex h-6 items-center">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    disabled={loading}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="text-gray-600">
                    I agree to the{" "}
                    <a
                      href="/terms"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a
                      href="/privacy"
                      className="font-medium text-indigo-600 hover:text-indigo-500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Privacy Policy
                    </a>
                  </label>
                </div>
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
                      <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                      Submitting Registration...
                    </>
                  ) : (
                    "Submit Registration"
                  )}
                </button>
              </div>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-500"
                >
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Info */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <img
          alt="Medical professionals reviewing research"
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1908&q=80"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-indigo-900 opacity-30" />

        {/* Overlay Content */}
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-white mb-6 drop-shadow-lg">
              Join the PAMJE Community
            </h2>
            <div className="space-y-4 text-lg text-white drop-shadow-md">
              <p>✓ Access comprehensive journal management tools</p>
              <p>
                ✓ Connect with medical journal editors across the Philippines
              </p>
              <p>✓ Discover and submit to indexed medical journals</p>
              <p>✓ Stay updated with the latest in medical publishing</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
