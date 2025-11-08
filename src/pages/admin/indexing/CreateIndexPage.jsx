import React from 'react'
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ConnectDatabase } from "../../../lib/ConnectDatabase";
import {
  ArrowLeftIcon,
  BookmarkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export const CreateIndexPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    service_name: "",
    service_url: "",
    description: "",
    impact_factor: "",
    coverage: "",
  });

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
      };

      const { data: indexService, error: insertError } = await ConnectDatabase.from("indexing_services")
        .insert([indexData])
        .select()
        .single();

      if (insertError) throw insertError;

      setSuccess(true);

      // Redirect after short delay to show success message
      setTimeout(() => {
        navigate("/adm/indexing", {
          state: {
            message: "Indexing service created successfully!",
            indexServiceId: indexService.id,
          },
        });
      }, 1500);
    } catch (err) {
      console.error("Error creating indexing service:", err);
      setError(
        err.message || "An error occurred while creating the indexing service"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      service_name: "",
      service_url: "",
      description: "",
      impact_factor: "",
      coverage: "",
    });
    setError("");
    setSuccess(false);
  };

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
                Add Indexing Service
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Create a new indexing or abstracting service
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
                  Success! Indexing service created.
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
                Reset Form
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
                      Creating...
                    </>
                  ) : success ? (
                    <>
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Created!
                    </>
                  ) : (
                    "Create Indexing Service"
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
                <p className="mt-2">
                  After creating an indexing service, you can link it to
                  journals to show which services index them.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Common Services Reference */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Common Indexing Services
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
            <div>
              <strong>International:</strong>
              <ul className="mt-1 space-y-1">
                <li>• PubMed / MEDLINE</li>
                <li>• Scopus</li>
                <li>• Web of Science</li>
                <li>• Google Scholar</li>
                <li>• DOAJ</li>
              </ul>
            </div>
            <div>
              <strong>Regional:</strong>
              <ul className="mt-1 space-y-1">
                <li>• ASEAN Citation Index</li>
                <li>• WPRIM</li>
                <li>• Index Copernicus</li>
                <li>• EMBASE</li>
                <li>• ProQuest</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};