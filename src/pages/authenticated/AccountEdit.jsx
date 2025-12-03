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
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
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
  const [changingPassword, setChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
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

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
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
  const uploadCV = async () => {
    if (!cvFile || !userId) return null;

    try {
      setUploadingCV(true);

      // Get file extension
      const fileExt = cvFile.name.split(".").pop();
      const fileName = `cv_${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      // Delete old CV if exists
      if (currentCVUrl) {
        const oldPath = currentCVUrl.split("/cvs/")[1];
        if (oldPath) {
          await ConnectDatabase.storage.from("cvs").remove([oldPath]);
        }
      }

      // Upload new CV
      const { error: uploadError } = await ConnectDatabase.storage
        .from("cvs")
        .upload(filePath, cvFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = ConnectDatabase.storage.from("cvs").getPublicUrl(filePath);

      return publicUrl;
    } catch (err) {
      console.error("Error uploading CV:", err);
      throw err;
    } finally {
      setUploadingCV(false);
    }
  };

  // Validate password change
  const validatePassword = () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setError("Please fill in all password fields");
      return false;
    }

    if (passwordData.newPassword.length < 8) {
      setError("New password must be at least 8 characters long");
      return false;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return false;
    }

    return true;
  };

  // Change password
  const handlePasswordUpdate = async () => {
    if (!validatePassword()) {
      return false;
    }

    try {
      setChangingPassword(true);

      const { error } = await ConnectDatabase.auth.updateUser({
        password: passwordData.newPassword,
      });

      if (error) throw error;

      // Clear password fields
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      return true;
    } catch (err) {
      console.error("Error changing password:", err);
      setError(err.message || "Failed to change password");
      return false;
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      // Handle password change if requested
      let passwordChanged = false;
      if (passwordData.newPassword || passwordData.confirmPassword) {
        passwordChanged = await handlePasswordUpdate();
        if (
          !passwordChanged &&
          (passwordData.newPassword || passwordData.confirmPassword)
        ) {
          setSaving(false);
          return;
        }
      }

      // Upload CV if selected
      let cvUrl = currentCVUrl;
      if (cvFile) {
        cvUrl = await uploadCV();
      }

      // Construct full name
      const fullName = [
        formData.title,
        formData.firstName,
        formData.middleName,
        formData.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      // First, check if person record exists
      const { data: existingPerson } = await ConnectDatabase.from("people")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();

      if (existingPerson) {
        // Update existing person record
        const { error: personError } = await ConnectDatabase.from("people")
          .update({
            first_name: formData.firstName,
            last_name: formData.lastName,
            middle_name: formData.middleName || null,
            full_name: fullName,
            title: formData.title || null,
            phone: formData.phone || null,
            affiliation: formData.affiliation || null,
            position: formData.position || null,
            cv_url: cvUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        if (personError) throw personError;
      } else {
        // Create new person record
        const { error: personError } = await ConnectDatabase.from(
          "people"
        ).insert({
          user_id: userId,
          first_name: formData.firstName,
          last_name: formData.lastName,
          middle_name: formData.middleName || null,
          full_name: fullName,
          title: formData.title || null,
          email: formData.email,
          phone: formData.phone || null,
          affiliation: formData.affiliation || null,
          position: formData.position || null,
          cv_url: cvUrl,
        });

        if (personError) throw personError;
      }

      // Update user_profiles table
      const { error: profileError } = await ConnectDatabase.from(
        "user_profiles"
      )
        .update({
          phone: formData.phone || null,
          cv_url: cvUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (profileError) {
        console.warn("Profile update warning:", profileError);
      }

      // Update current CV URL
      if (cvUrl) {
        setCurrentCVUrl(cvUrl);
        setCvFile(null);
        const fileInput = document.getElementById("cv-upload");
        if (fileInput) fileInput.value = "";
      }

      setSuccess(true);

      // Show success message
      const successMessages = [];
      if (passwordChanged) successMessages.push("password updated");
      if (cvFile) successMessages.push("CV uploaded");
      successMessages.push("profile information updated");

      setTimeout(() => {
        setSuccess(false);
        navigate(-1);
      }, 2000);
    } catch (err) {
      console.error("Error updating account:", err);
      setError(err.message || "Failed to update account. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="animate-spin h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <UserCircleIcon className="h-8 w-8 mr-3 text-primary" />
            Edit Account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Update your personal information, change password, and manage your
            CV
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-3 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="mt-1 text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-3 shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-green-800">Success!</h3>
              <p className="mt-1 text-sm text-green-700">
                Your account has been updated successfully.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
            {/* Personal Information */}
            <div className="p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
                    disabled={saving}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Dr., Prof., Engr."
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
                    Middle Name (Optional)
                  </label>
                  <input
                    id="middleName"
                    name="middleName"
                    type="text"
                    value={formData.middleName}
                    onChange={handleChange}
                    disabled={saving}
                    className="mt-1 block w-full rounded-md border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                    placeholder="Santos"
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
            <div className="p-6 space-y-6">
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

            {/* Password Change Section */}
            <div className="p-6 space-y-6">
              <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                <KeyIcon className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Change Password
                </h2>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Leave blank if you don't want to change your password
              </p>
              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      disabled={saving || changingPassword}
                      className="block w-full rounded-md border-0 px-3 py-2 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      disabled={saving || changingPassword}
                      className="block w-full rounded-md border-0 px-3 py-2 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed sm:text-sm"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* CV Upload/Update */}
            <div className="p-6 space-y-6">
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
            <div className="p-6">
              <div className="flex items-center justify-end gap-4">
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
                      {uploadingCV
                        ? "Uploading CV..."
                        : changingPassword
                        ? "Changing Password..."
                        : "Saving..."}
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
