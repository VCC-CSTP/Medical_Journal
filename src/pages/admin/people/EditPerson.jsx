import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConnectDatabase } from "../../../lib/ConnectDatabase";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const EditPerson = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
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
  });

  // Fetch person data on mount
  useEffect(() => {
    fetchPersonData();
  }, [id]);

  const fetchPersonData = async () => {
    try {
      setFetchingData(true);
      const { data, error } = await ConnectDatabase.from("people")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) {
        setError("Person not found");
        return;
      }

      // Pre-populate form with existing data
      setFormData({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        middle_name: data.middle_name || "",
        title: data.title || "",
        suffix: data.suffix || "",
        email: data.email || "",
        phone: data.phone || "",
        affiliation: data.affiliation || "",
        position: data.position || "",
        department: data.department || "",
        specialization: Array.isArray(data.specialization)
          ? data.specialization.join(", ")
          : data.specialization || "",
        orcid: data.orcid || "",
        bio: data.bio || "",
        photo_url: data.photo_url || "",
      });
    } catch (error) {
      console.error("Error fetching person:", error);
      setError("Failed to load person data");
    } finally {
      setFetchingData(false);
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
          ? [formData.specialization.trim()]
          : null,
        orcid: formData.orcid.trim() || null,
        bio: formData.bio.trim() || null,
        photo_url: formData.photo_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await ConnectDatabase.from("people")
        .update(personData)
        .eq("id", id);

      if (updateError) throw updateError;

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

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">Loading person data...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">
            View / Edit Person
          </h1>
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