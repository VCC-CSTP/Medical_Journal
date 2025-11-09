import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ConnectDatabase from "../../lib/ConnectDatabase";
import {
  UserCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export const AccountEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [userId, setUserId] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [currentCVUrl, setCurrentCVUrl] = useState(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    title: "",
    affiliation: "",
    position: "",
  });

  // Check authentication and load user data
  useEffect(() => {
    checkUserAndLoadData();
  }, []);

  const checkUserAndLoadData = async () => {
    try {
      // Check if user is authenticated
      const {
        data: { user },
        error: authError,
      } = await ConnectDatabase.auth.getUser();

      if (authError || !user) {
        // Not authenticated, redirect to login
        navigate("/login");
        return;
      }

      setUserId(user.id);

      // Try to load user profile data with error handling
      try {
        const { data: profileData, error: profileError } =
          await ConnectDatabase.from("user_profiles")
            .select("id, email, role, phone, person_id, cv_url")
            .eq("id", user.id)
            .single();

        if (profileError) {
          // If RLS error, use minimal data from auth
          console.warn("Profile load warning:", profileError);

          // Try to load person data directly
          const { data: personData, error: personError } =
            await ConnectDatabase.from("people")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle();

          if (personData) {
            setFormData({
              firstName: personData.first_name || "",
              lastName: personData.last_name || "",
              middleName: personData.middle_name || "",
              email: personData.email || user.email || "",
              phone: personData.phone || "",
              title: personData.title || "",
              affiliation: personData.affiliation || "",
              position: personData.position || "",
            });
            setCurrentCVUrl(personData.cv_url);
          } else {
            // Use auth metadata as fallback
            setFormData({
              firstName: user.user_metadata?.first_name || "",
              lastName: user.user_metadata?.last_name || "",
              middleName: "",
              email: user.email || "",
              phone: "",
              title: "",
              affiliation: "",
              position: "",
            });
          }
          setLoading(false);
          return;
        }

        // Profile loaded successfully, now load person data
        const { data: personData, error: personError } =
          await ConnectDatabase.from("people")
            .select("*")
            .eq("user_id", user.id)
            .maybeSingle();

        // Populate form with existing data
        if (personData) {
          setFormData({
            firstName: personData.first_name || "",
            lastName: personData.last_name || "",
            middleName: personData.middle_name || "",
            email: personData.email || user.email || "",
            phone: personData.phone || profileData?.phone || "",
            title: personData.title || "",
            affiliation: personData.affiliation || "",
            position: personData.position || "",
          });
          setCurrentCVUrl(personData.cv_url || profileData?.cv_url);
        } else if (profileData) {
          setFormData({
            firstName: user.user_metadata?.first_name || "",
            lastName: user.user_metadata?.last_name || "",
            middleName: "",
            email: user.email || "",
            phone: profileData.phone || "",
            title: "",
            affiliation: "",
            position: "",
          });
          setCurrentCVUrl(profileData.cv_url);
        }

        setLoading(false);
      } catch (loadError) {
        console.error("Error loading data:", loadError);
        // Use fallback data from auth
        setFormData({
          firstName: user.user_metadata?.first_name || "",
          lastName: user.user_metadata?.last_name || "",
          middleName: "",
          email: user.email || "",
          phone: "",
          title: "",
          affiliation: "",
          position: "",
        });
        setLoading(false);
      }
    } catch (err) {
      console.error("Critical error loading user data:", err);
      setError("Failed to load user data. Please try refreshing the page.");
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  // Upload CV to Supabase Storage
  const uploadCVToStorage = async () => {
    if (!cvFile || !userId) return null;

    setUploadingCV(true);
    try {
      const fileExt = cvFile.name.split(".").pop();
      const fileName = `${userId}-cv-${Date.now()}.${fileExt}`;
      const filePath = `cvs/${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await ConnectDatabase.storage
        .from("user-documents")
        .upload(filePath, cvFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("CV upload error:", uploadError);
        return null;
      }

      // Get public URL
      const { data: urlData } = ConnectDatabase.storage
        .from("user-documents")
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error) {
      console.error("Error uploading CV:", error);
      return null;
    } finally {
      setUploadingCV(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      setError("User not authenticated");
      return;
    }

    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("First name and last name are required");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const fullName = `${formData.firstName} ${
        formData.middleName ? formData.middleName + " " : ""
      }${formData.lastName}`.trim();

      // Upload new CV if provided
      let cvUrl = currentCVUrl;
      if (cvFile) {
        const newCvUrl = await uploadCVToStorage();
        if (newCvUrl) cvUrl = newCvUrl;
      }

      // Update user_profiles with minimal fields to avoid RLS issues
      const profileUpdateData = {
        phone: formData.phone || null,
      };

      if (cvUrl) profileUpdateData.cv_url = cvUrl;

      try {
        const { error: profileError } = await ConnectDatabase.from(
          "user_profiles"
        )
          .update(profileUpdateData)
          .eq("id", userId);

        if (profileError) {
          console.warn("Profile update warning:", profileError);
          // Continue anyway - we'll try to update people table
        }
      } catch (profileUpdateError) {
        console.warn("Profile update failed:", profileUpdateError);
        // Continue to update people table
      }

      // Update or create people record
      const { data: existingPerson } = await ConnectDatabase.from("people")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      const peopleData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        middle_name: formData.middleName || null,
        full_name: fullName,
        title: formData.title || null,
        email: formData.email,
        phone: formData.phone || null,
        affiliation: formData.affiliation || null,
        position: formData.position || null,
      };

      if (cvUrl) peopleData.cv_url = cvUrl;

      if (existingPerson) {
        // Update existing person record
        const { error: updateError } = await ConnectDatabase.from("people")
          .update(peopleData)
          .eq("user_id", userId);

        if (updateError) {
          console.error("Error updating person:", updateError);
          throw updateError;
        }
      } else {
        // Create new person record
        const { error: insertError } = await ConnectDatabase.from(
          "people"
        ).insert({
          ...peopleData,
          user_id: userId,
          is_verified: false,
          is_active: true,
        });

        if (insertError) {
          console.error("Error creating person:", insertError);
          throw insertError;
        }
      }

      setSuccess(true);
      setCurrentCVUrl(cvUrl);
      setCvFile(null);

      // Reset file input
      const fileInput = document.getElementById("cv-upload");
      if (fileInput) fileInput.value = "";

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <ArrowPathIcon className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <UserCircleIcon className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          </div>
          <p className="text-gray-600">
            Update your personal information and professional details
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 border border-green-200">
            <div className="flex items-start">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5 shrink-0" />
              <p className="ml-3 text-sm text-green-700 font-medium">
                Profile updated successfully!
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
            <div className="flex items-start">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <p className="ml-3 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    name="title"
                    type="text"
                    value={formData.title}
                    onChange={handleChange}
                    disabled={saving}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Dr., Prof., MD, PhD"
                  />
                </div>

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
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={saving}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Juan"
                  />
                </div>

                <div>
                  <label
                    htmlFor="middleName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Middle Name
                  </label>
                  <input
                    id="middleName"
                    name="middleName"
                    type="text"
                    value={formData.middleName}
                    onChange={handleChange}
                    disabled={saving}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Cruz"
                  />
                </div>

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
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={saving}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Dela Cruz"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    value={formData.email}
                    onChange={handleChange}
                    disabled={true}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 bg-gray-100 cursor-not-allowed sm:text-sm"
                    placeholder="juan.delacruz@example.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Email cannot be changed from this page
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={saving}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="+63 912 345 6789"
                  />
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Professional Information
              </h2>
              <div className="space-y-6">
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
                    disabled={saving}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="University of the Philippines"
                  />
                </div>

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
                    disabled={saving}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Associate Professor"
                  />
                </div>
              </div>
            </div>

            {/* CV Upload/Update */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Curriculum Vitae
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload or Update CV
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Accepted formats: PDF, Word (DOC, DOCX) • Max size: 5MB
                </p>

                {/* Current CV Display */}
                {currentCVUrl && !cvFile && (
                  <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center flex-1 min-w-0">
                      <DocumentArrowUpIcon className="h-8 w-8 text-blue-600 shrink-0" />
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-blue-900">
                          Current CV on file
                        </p>
                        <a
                          href={currentCVUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          View current CV
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* File Upload */}
                {!cvFile ? (
                  <label
                    htmlFor="cv-upload"
                    className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="text-center">
                      <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        {currentCVUrl ? "Upload new CV" : "Click to upload CV"}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PDF or Word document
                      </p>
                    </div>
                    <input
                      id="cv-upload"
                      name="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                      disabled={saving || uploadingCV}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg">
                    <div className="flex items-center flex-1 min-w-0">
                      <DocumentArrowUpIcon className="h-8 w-8 text-primary shrink-0" />
                      <div className="ml-3 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {cvFile.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(cvFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      disabled={saving || uploadingCV}
                      className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors disabled:cursor-not-allowed"
                      title="Remove file"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={saving}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || uploadingCV}
                className="flex items-center px-6 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? (
                  <>
                    <ArrowPathIcon className="animate-spin h-5 w-5 mr-2" />
                    {uploadingCV ? "Uploading CV..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
