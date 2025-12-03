import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConnectDatabase from "../../../lib/ConnectDatabase";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  KeyIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

export const EditPerson = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [hasUserAccount, setHasUserAccount] = useState(false);
  const [userId, setUserId] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [journals, setJournals] = useState([]);
  const [personJournals, setPersonJournals] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [currentCVUrl, setCurrentCVUrl] = useState(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    // Basic person data
    first_name: "",
    last_name: "",
    middle_name: "",
    title: "",
    suffix: "",
    email: "",
    phone: "",
    affiliation: "",
    position: "",
    department: "",
    specialization: "",
    orcid: "",
    bio: "",
    photo_url: "",
    is_admin: false,
    is_active: true,

    // User account data (if linked)
    userRole: "user",
    userIsActive: true,
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Fetch person data on mount
  useEffect(() => {
    fetchCurrentUser();
    fetchPersonData();
    fetchJournals();
  }, [id]);

  const fetchCurrentUser = async () => {
    try {
      const {
        data: { user },
      } = await ConnectDatabase.auth.getUser();
      if (user) {
        const { data: profile } = await ConnectDatabase.from("user_profiles")
          .select("role")
          .eq("id", user.id)
          .single();
        setCurrentUserRole(profile?.role);
      }
    } catch (error) {
      console.error("Error fetching current user:", error);
    }
  };

  const fetchPersonData = async () => {
    try {
      setFetchingData(true);

      // Get person data
      const { data: personData, error: personError } =
        await ConnectDatabase.from("people").select("*").eq("id", id).single();

      if (personError) throw personError;
      if (!personData) {
        setError("Person not found");
        return;
      }

      // Check if person has a user account
      if (personData.user_id) {
        setHasUserAccount(true);
        setUserId(personData.user_id);

        // Get user_profiles data
        const { data: profileData, error: profileError } =
          await ConnectDatabase.from("user_profiles")
            .select("role, is_active")
            .eq("id", personData.user_id)
            .single();

        if (!profileError && profileData) {
          setFormData((prev) => ({
            ...prev,
            userRole: profileData.role || "user",
            userIsActive:
              profileData.is_active !== undefined
                ? profileData.is_active
                : true,
          }));
        }
      }

      // Get person's journal assignments
      const { data: journalData, error: journalError } =
        await ConnectDatabase.from("journal_editorial_team")
          .select(
            `
          id,
          journal_id,
          role,
          role_type,
          start_date,
          end_date,
          is_active,
          journals:journal_id (
            id,
            full_title
          )
        `
          )
          .eq("person_id", id);

      if (!journalError && journalData) {
        setPersonJournals(journalData);
      }

      // Set current CV URL
      setCurrentCVUrl(personData.cv_url);

      // Pre-populate form with existing data
      setFormData((prev) => ({
        ...prev,
        first_name: personData.first_name || "",
        last_name: personData.last_name || "",
        middle_name: personData.middle_name || "",
        title: personData.title || "",
        suffix: personData.suffix || "",
        email: personData.email || "",
        phone: personData.phone || "",
        affiliation: personData.affiliation || "",
        position: personData.position || "",
        department: personData.department || "",
        specialization: Array.isArray(personData.specialization)
          ? personData.specialization.join(", ")
          : personData.specialization || "",
        orcid: personData.orcid || "",
        bio: personData.bio || "",
        photo_url: personData.photo_url || "",
        is_admin: personData.is_admin || false,
        is_active:
          personData.is_active !== undefined ? personData.is_active : true,
      }));
    } catch (error) {
      console.error("Error fetching person:", error);
      setError("Failed to load person data");
    } finally {
      setFetchingData(false);
    }
  };

  const fetchJournals = async () => {
    try {
      const { data, error } = await ConnectDatabase.from("journals")
        .select("id, full_title")
        .is("deleted_at", null)
        .order("full_title");

      if (error) throw error;
      setJournals(data || []);
    } catch (error) {
      console.error("Error fetching journals:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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
      return true; // Allow empty passwords (no change)
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

  // Change password for user
  const handlePasswordUpdate = async () => {
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      return true; // No password change requested
    }

    if (!validatePassword()) {
      return false;
    }

    try {
      setChangingPassword(true);

      // Use admin API to update user password
      const { error } = await ConnectDatabase.auth.admin.updateUserById(
        userId,
        { password: passwordData.newPassword }
      );

      if (error) throw error;

      // Clear password fields
      setPasswordData({
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

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      setError("First name is required");
      return false;
    }
    if (!formData.last_name.trim()) {
      setError("Last name is required");
      return false;
    }

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate ORCID format if provided
    if (
      formData.orcid &&
      !/^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/.test(formData.orcid)
    ) {
      setError("ORCID must be in format: XXXX-XXXX-XXXX-XXXX");
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
      // Handle password change if requested and user has account
      if (
        hasUserAccount &&
        (passwordData.newPassword || passwordData.confirmPassword)
      ) {
        const passwordSuccess = await handlePasswordUpdate();
        if (!passwordSuccess) {
          setLoading(false);
          return;
        }
      }

      // Upload CV if selected
      let cvUrl = currentCVUrl;
      if (cvFile && userId) {
        cvUrl = await uploadCV();
      }

      // Construct full name
      const fullName = [
        formData.title,
        formData.first_name,
        formData.middle_name,
        formData.last_name,
        formData.suffix,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();

      // Update people table
      const personData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        middle_name: formData.middle_name.trim() || null,
        full_name: fullName,
        title: formData.title.trim() || null,
        suffix: formData.suffix.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        affiliation: formData.affiliation.trim() || null,
        position: formData.position.trim() || null,
        department: formData.department.trim() || null,
        specialization: formData.specialization
          ? formData.specialization.split(",").map((s) => s.trim())
          : null,
        orcid: formData.orcid.trim() || null,
        bio: formData.bio.trim() || null,
        photo_url: formData.photo_url.trim() || null,
        cv_url: cvUrl,
        is_admin: formData.is_admin,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      const { error: personError } = await ConnectDatabase.from("people")
        .update(personData)
        .eq("id", id);

      if (personError) throw personError;

      // Update user_profiles if person has a user account
      if (hasUserAccount && userId) {
        const profileData = {
          role: formData.userRole,
          is_active: formData.userIsActive,
          cv_url: cvUrl,
          updated_at: new Date().toISOString(),
        };

        const { error: profileError } = await ConnectDatabase.from(
          "user_profiles"
        )
          .update(profileData)
          .eq("id", userId);

        if (profileError) {
          console.warn("Profile update warning:", profileError);
        }
      }

      // Update current CV URL
      if (cvUrl) {
        setCurrentCVUrl(cvUrl);
        setCvFile(null);
        const fileInput = document.getElementById("cv-upload");
        if (fileInput) fileInput.value = "";
      }

      // Navigate back with success
      navigate("/adm/people", {
        state: { message: "Person updated successfully" },
      });
    } catch (error) {
      console.error("Error updating person:", error);
      setError(error.message || "Failed to update person. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Determine available roles based on current user's role
  const getAvailableRoles = () => {
    if (currentUserRole === "superuser") {
      return [
        { value: "public", label: "Public User" },
        { value: "viewer", label: "Viewer" },
        { value: "contributor", label: "Contributor" },
        { value: "reviewer", label: "Reviewer" },
        { value: "editor", label: "Editor" },
        { value: "admin", label: "Admin" },
        { value: "superuser", label: "Superuser" },
      ];
    } else if (currentUserRole === "admin" || currentUserRole === "editor") {
      return [
        { value: "editor", label: "Editor" },
        { value: "reviewer", label: "Reviewer" },
      ];
    }
    return [];
  };

  if (fetchingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading person data...</p>
        </div>
      </div>
    );
  }

  const availableRoles = getAvailableRoles();

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/adm/people")}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to People
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Edit Person</h1>
          <p className="mt-1 text-sm text-gray-500">
            Update person information and manage their account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-8 p-6">
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Dr., Prof."
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Juan"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="middle_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Middle Name
                    </label>
                    <input
                      type="text"
                      name="middle_name"
                      id="middle_name"
                      value={formData.middle_name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Santos"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Dela Cruz"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="suffix"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Suffix
                    </label>
                    <input
                      type="text"
                      name="suffix"
                      id="suffix"
                      value={formData.suffix}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Jr., Sr., III"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="flex items-center h-5 mt-6">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="is_active"
                      className="font-medium text-gray-700"
                    >
                      Person Active
                    </label>
                    <p className="text-gray-500">
                      Can be assigned to journals and editorial teams
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
                Contact Information
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={hasUserAccount}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                      placeholder="juan.delacruz@example.com"
                    />
                    {hasUserAccount && (
                      <p className="mt-1 text-xs text-gray-500">
                        Email is managed through the user account
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="+63 XXX XXX XXXX"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
                Professional Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="affiliation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Affiliation / Institution
                  </label>
                  <input
                    type="text"
                    name="affiliation"
                    id="affiliation"
                    value={formData.affiliation}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="University of the Philippines Manila"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="position"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Position
                    </label>
                    <input
                      type="text"
                      name="position"
                      id="position"
                      value={formData.position}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Professor, Associate Dean"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="department"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Department
                    </label>
                    <input
                      type="text"
                      name="department"
                      id="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Department of Internal Medicine"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="specialization"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Specialization
                    </label>
                    <input
                      type="text"
                      name="specialization"
                      id="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Cardiology, Nephrology"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Separate multiple specializations with commas
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="orcid"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ORCID
                    </label>
                    <input
                      type="text"
                      name="orcid"
                      id="orcid"
                      value={formData.orcid}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="0000-0000-0000-0000"
                      maxLength="19"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Format: XXXX-XXXX-XXXX-XXXX
                    </p>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Biography
                  </label>
                  <textarea
                    name="bio"
                    id="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Brief biography or professional summary..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Professional background, expertise, and achievements
                  </p>
                </div>
              </div>
            </div>

            {/* User Account Section (if linked) */}
            {hasUserAccount && (
              <>
                {/* Role Management */}
                <div>
                  <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                    <ShieldCheckIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">
                      User Account & Permissions
                    </h2>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      This person has a linked user account. You can manage
                      their role and account status here.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="userRole"
                        className="block text-sm font-medium text-gray-700"
                      >
                        User Role
                      </label>
                      <select
                        name="userRole"
                        id="userRole"
                        value={formData.userRole}
                        onChange={handleChange}
                        disabled={availableRoles.length === 0}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
                      >
                        {availableRoles.length > 0 ? (
                          availableRoles.map((role) => (
                            <option key={role.value} value={role.value}>
                              {role.label}
                            </option>
                          ))
                        ) : (
                          <option value={formData.userRole}>
                            {formData.userRole.charAt(0).toUpperCase() +
                              formData.userRole.slice(1)}{" "}
                            (Current Role)
                          </option>
                        )}
                      </select>
                      {currentUserRole === "superuser" && (
                        <p className="mt-1 text-sm text-gray-500">
                          As a superuser, you can assign any role
                        </p>
                      )}
                      {(currentUserRole === "admin" ||
                        currentUserRole === "editor") && (
                        <p className="mt-1 text-sm text-gray-500">
                          You can only assign Editor and Reviewer roles
                        </p>
                      )}
                      {availableRoles.length === 0 && (
                        <p className="mt-1 text-sm text-red-500">
                          You don't have permission to change this user's role
                        </p>
                      )}
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex items-center h-5 mt-1">
                        <input
                          id="userIsActive"
                          name="userIsActive"
                          type="checkbox"
                          checked={formData.userIsActive}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="userIsActive"
                          className="font-medium text-gray-700"
                        >
                          Account Active
                        </label>
                        <p className="text-gray-500">
                          User can login and access the system
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Change Section */}
                <div>
                  <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                    <KeyIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h2 className="text-lg font-medium text-gray-900">
                      Change Password
                    </h2>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Leave blank if you don't want to change the user's password
                  </p>
                  <div className="space-y-4">
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
                          disabled={loading || changingPassword}
                          className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
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
                          disabled={loading || changingPassword}
                          className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100"
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

                {/* CV Upload/Update Section */}
                <div>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
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
                        className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-all"
                      >
                        <div className="text-center">
                          <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-600">
                            {currentCVUrl
                              ? "Upload new CV"
                              : "Click to upload CV"}
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
                          disabled={loading || uploadingCV}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-300 rounded-lg">
                        <div className="flex items-center flex-1 min-w-0">
                          <DocumentArrowUpIcon className="h-8 w-8 text-blue-600 shrink-0" />
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
                          disabled={loading || uploadingCV}
                          className="ml-3 p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Remove file"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate("/adm/people")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || uploadingCV || changingPassword}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? uploadingCV
                    ? "Uploading CV..."
                    : changingPassword
                    ? "Changing Password..."
                    : "Updating..."
                  : "Update Person"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
