import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ConnectDatabase } from "../../../lib/ConnectDatabase";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export const EditIndexPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    service_name: "",
    service_url: "",
    description: "",
    impact_factor: "",
    coverage: "",
  });

  // Fetch indexing service data on mount
  useEffect(() => {
    fetchIndexingServiceData();
  }, [id]);

  const fetchIndexingServiceData = async () => {
    try {
      setFetchingData(true);
      const { data, error } = await ConnectDatabase.from("indexing_services")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) {
        setError("Indexing service not found");
        return;
      }

      // Pre-populate form with existing data
      setFormData({
        service_name: data.service_name || "",
        service_url: data.service_url || "",
        description: data.description || "",
        impact_factor: data.impact_factor || "",
        coverage: data.coverage || "",
      });
    } catch (error) {
      console.error("Error fetching indexing service:", error);
      setError("Failed to load indexing service data");
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
    if (!formData.service_name.trim()) {
      setError("Service name is required");
      return false;
    }

    // Optional: Validate URL format if provided
    if (formData.service_url.trim()) {
      try {
        new URL(formData.service_url);
      } catch (e) {
        setError("Please enter a valid URL (e.g., https://example.com)" + e);
        return false;
      }
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
    setSuccess(false);

    try {
      const indexData = {
        service_name: formData.service_name.trim(),
        service_url: formData.service_url.trim() || null,
        description: formData.description.trim() || null,
        impact_factor: formData.impact_factor.trim() || null,
        coverage: formData.coverage.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await ConnectDatabase.from(
        "indexing_services"
      )
        .update(indexData)
        .eq("id", id);

      if (updateError) throw updateError;

      setSuccess(true);

      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate("/adm/indexing", {
          state: {
            message: "Indexing service updated successfully!",
            indexServiceId: id,
          },
        });
      }, 1500);
    } catch (err) {
      console.error("Error updating indexing service:", err);
      setError(
        err.message || "An error occurred while updating the indexing service"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset to original fetched data
    fetchIndexingServiceData();
    setError("");
    setSuccess(false);
  };

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">
                Loading indexing service data...
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
          <Link
            to="/adm/indexing"
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Indexing Services
          </Link>
          <div className="flex items-center">
            <BookmarkIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Indexing Service
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Update indexing service information
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-md bg-green-50 p-4">
            <div className="flex">
              <CheckCircleIcon className="h-5 w-5 text-green-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Success! Indexing service updated.
                </h3>
                <p className="mt-1 text-sm text-green-700">
                  Redirecting to list page...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
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
            {/* Service Name */}
            <div>
              <label
                htmlFor="service_name"
                className="block text-sm font-medium text-gray-700"
              >
                Service Name *
              </label>
              <input
                type="text"
                id="service_name"
                name="service_name"
                required
                value={formData.service_name}
                onChange={handleChange}
                placeholder="e.g., PubMed, Scopus, Web of Science"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                The official name of the indexing service
              </p>
            </div>

            {/* Service URL */}
            <div>
              <label
                htmlFor="service_url"
                className="block text-sm font-medium text-gray-700"
              >
                Service URL
              </label>
              <input
                type="url"
                id="service_url"
                name="service_url"
                value={formData.service_url}
                onChange={handleChange}
                placeholder="https://example.com"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Official website of the indexing service (optional)
              </p>
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                placeholder="Brief description of the service and its scope..."
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                What this service covers and its significance (optional)
              </p>
            </div>

            {/* Impact Factor */}
            <div>
              <label
                htmlFor="impact_factor"
                className="block text-sm font-medium text-gray-700"
              >
                Impact Factor / Ranking Info
              </label>
              <input
                type="text"
                id="impact_factor"
                name="impact_factor"
                value={formData.impact_factor}
                onChange={handleChange}
                placeholder="e.g., High impact, Q1 ranking"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Impact factor or ranking information (optional)
              </p>
            </div>

            {/* Coverage */}
            <div>
              <label
                htmlFor="coverage"
                className="block text-sm font-medium text-gray-700"
              >
                Coverage
              </label>
              <input
                type="text"
                id="coverage"
                name="coverage"
                value={formData.coverage}
                onChange={handleChange}
                placeholder="e.g., Medical sciences, All disciplines"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <p className="mt-1 text-sm text-gray-500">
                Subject areas or disciplines covered (optional)
              </p>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={loading}
              >
                Reset Changes
              </button>

              <div className="flex gap-3">
                <Link
                  to="/adm/indexing"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                      Updating...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Updated!
                    </>
                  ) : (
                    "Update Indexing Service"
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                About Indexing Services
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Indexing services are databases that track and index academic
                  journals. Common examples include:
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>PubMed - Medical and life sciences literature</li>
                  <li>Scopus - Multidisciplinary abstract database</li>
                  <li>Web of Science - Citation indexing service</li>
                  <li>Google Scholar - Academic search engine</li>
                  <li>DOAJ - Directory of Open Access Journals</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
