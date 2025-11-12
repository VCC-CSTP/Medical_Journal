import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ConnectDatabase from "../../../lib/ConnectDatabase";
import {
  ArrowLeftIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export const EditPerson = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [hasUserAccount, setHasUserAccount] = useState(false);
  const [userId, setUserId] = useState(null);
  const [journals, setJournals] = useState([]);
  const [personJournals, setPersonJournals] = useState([]);

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

  // Fetch person data on mount
  useEffect(() => {
    fetchPersonData();
    fetchJournals();
  }, [id]);

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
        is_admin: formData.is_admin,
        is_active: formData.is_active,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await ConnectDatabase.from("people")
        .update(personData)
        .eq("id", id);

      if (updateError) throw updateError;

      // Update user_profiles if person has a user account
      if (hasUserAccount && userId) {
        const { error: profileUpdateError } = await ConnectDatabase.from(
          "user_profiles"
        )
          .update({
            role: formData.userRole,
            is_active: formData.userIsActive,
            first_name: formData.first_name.trim(),
            last_name: formData.last_name.trim(),
            full_name: fullName,
            phone: formData.phone.trim() || null,
          })
          .eq("id", userId);

        if (profileUpdateError) {
          console.error("Error updating user profile:", profileUpdateError);
        }
      }

      navigate("/adm/people", {
        state: {
          message: "Person updated successfully!",
          personId: id,
        },
      });
    } catch (error) {
      console.error("Error updating person:", error);
      setError(
        error.message || "An error occurred while updating the person profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveJournalAssignment = async (assignmentId) => {
    if (!confirm("Are you sure you want to remove this journal assignment?")) {
      return;
    }

    try {
      const { error } = await ConnectDatabase.from("journal_editorial_team")
        .delete()
        .eq("id", assignmentId);

      if (error) throw error;

      // Refresh journal assignments
      setPersonJournals((prev) => prev.filter((j) => j.id !== assignmentId));
    } catch (error) {
      console.error("Error removing journal assignment:", error);
      setError("Failed to remove journal assignment");
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">
                Loading person data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Edit Person</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update information for this person
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
            {hasUserAccount && (
              <div className="bg-indigo-50 rounded-lg p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  User Account Settings
                </h2>

                <div className="space-y-4">
                  <div className="bg-white p-3 rounded border border-indigo-200">
                    <p className="text-sm text-gray-600">
                      This person has a linked user account:{" "}
                      <span className="font-medium text-gray-900">
                        {formData.email}
                      </span>
                    </p>
                  </div>

                  {/* User Role */}
                  <div>
                    <label
                      htmlFor="userRole"
                      className="block text-sm font-medium text-gray-700"
                    >
                      System Role
                    </label>
                    <select
                      id="userRole"
                      name="userRole"
                      value={formData.userRole}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="user">User (Basic Access)</option>
                      <option value="researcher">
                        Researcher (Has Access to People database)
                      </option>
                      <option value="reviewer">
                        Reviewer (Has Access to People database)
                      </option>
                      <option value="editor">Editor (Can Edit Content)</option>
                      <option value="admin">Admin (Dashboard Access)</option>
                      <option value="super_admin">
                        Super Admin (Full Access)
                      </option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Controls what the user can access in the system
                    </p>
                  </div>

                  {/* Account Active Toggle */}
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="userIsActive"
                        name="userIsActive"
                        type="checkbox"
                        checked={formData.userIsActive}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="userIsActive"
                        className="font-medium text-gray-700"
                      >
                        User Account Active
                      </label>
                      <p className="text-gray-500">
                        User can log in and access the system
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!hasUserAccount && (
              <div className="bg-yellow-50 rounded-lg p-4">
                <h2 className="text-sm font-medium text-yellow-800 mb-2">
                  No User Account Linked
                </h2>
                <p className="text-sm text-yellow-700 mb-3">
                  This person does not have a user account. They cannot log in
                  to the system.
                </p>
                <button
                  type="button"
                  onClick={() => navigate(`/adm/people/${id}/create-account`)}
                  className="inline-flex items-center px-3 py-2 border border-yellow-800 rounded-md shadow-sm text-sm font-medium text-yellow-800 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create User Account
                </button>
              </div>
            )}

            {/* Journal Assignments */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Journal Editorial Assignments
              </h2>

              {personJournals.length > 0 ? (
                <div className="space-y-3">
                  {personJournals.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-white p-4 rounded border border-gray-200 flex justify-between items-start"
                    >
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">
                          {assignment.journals?.full_title || "Unknown Journal"}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Role:</span>{" "}
                          {assignment.role || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {assignment.start_date && (
                            <>
                              Started:{" "}
                              {new Date(
                                assignment.start_date
                              ).toLocaleDateString()}
                            </>
                          )}
                          {assignment.end_date && (
                            <>
                              {" "}
                              • Ended:{" "}
                              {new Date(
                                assignment.end_date
                              ).toLocaleDateString()}
                            </>
                          )}
                          {!assignment.is_active && (
                            <span className="ml-2 text-red-600">
                              (Inactive)
                            </span>
                          )}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveJournalAssignment(assignment.id)
                        }
                        className="ml-4 text-red-600 hover:text-red-800"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  No journal assignments yet.
                </p>
              )}

              <button
                type="button"
                onClick={() => navigate(`/adm/people/${id}/assign-journal`)}
                className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Assign to Journal
              </button>
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

                {/* Is Admin Toggle */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="is_admin"
                      name="is_admin"
                      type="checkbox"
                      checked={formData.is_admin}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="is_admin"
                      className="font-medium text-gray-700"
                    >
                      Mark as Admin (in People table)
                    </label>
                    <p className="text-gray-500">
                      Affects journal editorial permissions
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
                {loading ? "Updating..." : "Update Person"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
