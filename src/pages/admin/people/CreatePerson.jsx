import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ConnectDatabase from "../../../lib/ConnectDatabase";
import {
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

export const CreatePerson = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    // User Account Section
    createUserAccount: false,
    email: "",
    accountPassword: "",
    confirmAccountPassword: "",
    userRole: "user",
    is_admin: false,
    is_active: true,

    // Personal Information
    first_name: "",
    last_name: "",
    middle_name: "",
    title: "", // Dr., Prof., etc.
    suffix: "", // Jr., Sr., III
    phone: "",
    affiliation: "",
    position: "",
    department: "",
    specialization: "",
    orcid: "",
    bio: "",
    photo_url: "",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
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

    // If creating user account, validate account-related fields
    if (formData.createUserAccount) {
      if (!formData.email.trim()) {
        setError("Email is required when creating a user account");
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        setError("Please enter a valid email address");
        return false;
      }

      if (!formData.accountPassword) {
        setError("Password is required when creating a user account");
        return false;
      }

      if (formData.accountPassword.length < 8) {
        setError("Password must be at least 8 characters");
        return false;
      }

      if (formData.accountPassword !== formData.confirmAccountPassword) {
        setError("Passwords do not match");
        return false;
      }
    }

    // Validate email format if provided (even if not creating account)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate ORCID format if provided (XXXX-XXXX-XXXX-XXXX)
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
      let userId = null;

      // Step 1: Create user account if requested
      if (formData.createUserAccount) {
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

        // Create auth.user
        const { data: authData, error: signUpError } =
          await ConnectDatabase.auth.signUp({
            email: formData.email.trim().toLowerCase(),
            password: formData.accountPassword,
            options: {
              data: {
                first_name: formData.first_name,
                last_name: formData.last_name,
                full_name: fullName,
              },
              emailRedirectTo: `${window.location.origin}/login`,
            },
          });

        if (signUpError) throw signUpError;

        if (!authData.user) {
          throw new Error("Failed to create user account");
        }

        userId = authData.user.id;

        // Update user_profiles with role and settings
        await ConnectDatabase.from("user_profiles")
          .update({
            phone: formData.phone || null,
            role: formData.userRole,
            is_active: formData.is_active,
          })
          .eq("id", userId);
      }

      // Step 2: Construct full name
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

      // Step 3: Create people record
      const personData = {
        user_id: userId, // Will be null if no account created
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
          ? [formData.specialization.trim()]
          : null,
        orcid: formData.orcid.trim() || null,
        bio: formData.bio.trim() || null,
        photo_url: formData.photo_url.trim() || null,
        is_admin: formData.is_admin,
        is_active: true,
        is_verified: formData.createUserAccount ? false : true, // Verified if no account
      };

      const { data: person, error: insertError } = await ConnectDatabase.from(
        "people"
      )
        .insert([personData])
        .select()
        .single();

      if (insertError) throw insertError;

      // Step 4: Link person_id back to user_profiles if account was created
      if (userId && person) {
        await ConnectDatabase.from("user_profiles")
          .update({ person_id: person.id })
          .eq("id", userId);
      }

      navigate("/adm/people", {
        state: {
          message: formData.createUserAccount
            ? "Person and user account created successfully! Verification email sent."
            : "Person created successfully!",
          personId: person.id,
        },
      });
    } catch (error) {
      console.error("Error creating person:", error);
      setError(
        error.message || "An error occurred while creating the person profile"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/adm/people")}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to People
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Create New Person
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Add a new editor, researcher, or contributor to the database
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* User Account Section */}
            <div className="bg-indigo-50 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                User Account (Optional)
              </h2>

              <div className="space-y-4">
                {/* Create Account Toggle */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="createUserAccount"
                      name="createUserAccount"
                      type="checkbox"
                      checked={formData.createUserAccount}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="createUserAccount"
                      className="font-medium text-gray-700"
                    >
                      Create user account for this person
                    </label>
                    <p className="text-gray-500">
                      This will allow them to log in to the system
                    </p>
                  </div>
                </div>

                {/* Account Fields (shown only if createUserAccount is true) */}
                {formData.createUserAccount && (
                  <div className="space-y-4 mt-4 pt-4 border-t border-indigo-200">
                    {/* Email (required for account) */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        required={formData.createUserAccount}
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="juan.delacruz@example.com"
                      />
                    </div>

                    {/* Password */}
                    <div>
                      <label
                        htmlFor="accountPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Password *
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="accountPassword"
                          id="accountPassword"
                          required={formData.createUserAccount}
                          value={formData.accountPassword}
                          onChange={handleChange}
                          className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? (
                            <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                          ) : (
                            <EyeIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Minimum 8 characters
                      </p>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label
                        htmlFor="confirmAccountPassword"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Confirm Password *
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="confirmAccountPassword"
                        id="confirmAccountPassword"
                        required={formData.createUserAccount}
                        value={formData.confirmAccountPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="••••••••"
                      />
                    </div>

                    {/* User Role */}
                    <div>
                      <label
                        htmlFor="userRole"
                        className="block text-sm font-medium text-gray-700"
                      >
                        User Role
                      </label>
                      <select
                        id="userRole"
                        name="userRole"
                        value={formData.userRole}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="user">User (Just a role)</option>
                        <option value="researcher">
                          Researcher (Has Access to People database)
                        </option>
                        <option value="reviewer">
                          Reviewer (Has Access to People database)
                        </option>
                        <option value="editor">Editor (Just a role)</option>
                        <option value="admin">Admin (Dashboard Access)</option>
                        <option value="super_admin">
                          Super Admin (Full Access)
                        </option>
                      </select>
                    </div>

                    {/* Is Admin Toggle */}
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="is_admin"
                          name="is_admin"
                          type="checkbox"
                          checked={formData.is_admin}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="is_admin"
                          className="font-medium text-gray-700"
                        >
                          Mark as Admin in People table
                        </label>
                        <p className="text-gray-500">
                          This is separate from the user role and affects
                          journal editorial permissions
                        </p>
                      </div>
                    </div>

                    {/* Is Active Toggle */}
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="is_active"
                          name="is_active"
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={handleChange}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="is_active"
                          className="font-medium text-gray-700"
                        >
                          Account Active
                        </label>
                        <p className="text-gray-500">
                          Uncheck to create the account in disabled state
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
                Personal Information
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
                      placeholder="Dr., Prof., MD"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      First Name *
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
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                  <div>
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Last Name *
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
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                  <div>
                    <label
                      htmlFor="photo_url"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Photo URL
                    </label>
                    <input
                      type="url"
                      name="photo_url"
                      id="photo_url"
                      value={formData.photo_url}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://example.com/photo.jpg"
                    />
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
                  {!formData.createUserAccount && (
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
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="juan.delacruz@example.com"
                      />
                    </div>
                  )}

                  <div
                    className={formData.createUserAccount ? "col-span-2" : ""}
                  >
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
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? "Creating..."
                  : formData.createUserAccount
                  ? "Create Person & Account"
                  : "Create Person"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
