import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConnectDatabase } from "../../../lib/ConnectDatabase";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const EditOrganization = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    org_name: "",
    org_type: "publisher",
    org_acronym: "",
    description: "",
    website_url: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Philippines",
    logo_url: "",
  });

  // Fetch organization data on mount
  useEffect(() => {
    fetchOrganizationData();
  }, [id]);

  const fetchOrganizationData = async () => {
    try {
      setFetchingData(true);
      const { data, error } = await ConnectDatabase.from("organizations")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) {
        setError("Organization not found");
        return;
      }

      // Pre-populate form with existing data
      setFormData({
        org_name: data.org_name || "",
        org_type: data.org_type || "publisher",
        org_acronym: data.org_acronym || "",
        description: data.description || "",
        website_url: data.website_url || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || "Philippines",
        logo_url: data.logo_url || "",
      });
    } catch (error) {
      console.error("Error fetching organization:", error);
      setError("Failed to load organization data");
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
    if (!formData.org_name.trim()) {
      setError("Organization name is required");
      return false;
    }

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
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
      const orgData = {
        org_name: formData.org_name.trim(),
        org_type: formData.org_type,
        org_acronym: formData.org_acronym.trim() || null,
        description: formData.description.trim() || null,
        website_url: formData.website_url.trim() || null,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        country: formData.country.trim() || "Philippines",
        logo_url: formData.logo_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await ConnectDatabase.from("organizations")
        .update(orgData)
        .eq("id", id);

      if (updateError) throw updateError;

      navigate("/adm/organizations", {
        state: {
          message: "Organization updated successfully!",
          orgId: id,
        },
      });
    } catch (error) {
      console.error("Error updating organization:", error);
      setError(
        error.message || "An error occurred while updating the organization"
      );
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">
                Loading organization data...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/adm/organizations")}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Organizations
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Organization
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Update organization information
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
            {/* Basic Information */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
                Basic Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="org_name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="org_name"
                    id="org_name"
                    required
                    value={formData.org_name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="e.g., Philippine Medical Association"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="org_type"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Organization Type *
                    </label>
                    <select
                      name="org_type"
                      id="org_type"
                      value={formData.org_type}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="publisher">Publisher</option>
                      <option value="society">Society</option>
                      <option value="institution">Institution</option>
                    </select>
                    <p className="mt-1 text-sm text-gray-500">
                      Select the type that best describes this organization
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="org_acronym"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Acronym
                    </label>
                    <input
                      type="text"
                      name="org_acronym"
                      id="org_acronym"
                      value={formData.org_acronym}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="PMA"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Brief description of the organization..."
                  />
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
                      htmlFor="website_url"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Website URL
                    </label>
                    <input
                      type="url"
                      name="website_url"
                      id="website_url"
                      value={formData.website_url}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="https://example.com"
                    />
                  </div>

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
                      placeholder="contact@example.com"
                    />
                  </div>
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

                <div>
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="city"
                      className="block text-sm font-medium text-gray-700"
                    >
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Manila"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      id="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Philippines"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Logo */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
                Branding
              </h2>

              <div>
                <label
                  htmlFor="logo_url"
                  className="block text-sm font-medium text-gray-700"
                >
                  Logo URL
                </label>
                <input
                  type="url"
                  name="logo_url"
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="https://example.com/logo.png"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Optional: Provide a URL to the organization's logo
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate("/adm/organizations")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Organization"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
