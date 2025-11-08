import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConnectDatabase } from "../../../lib/ConnectDatabase";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const EditJournalPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    full_title: "",
    short_title: "",
    acronym: "",
    description: "",
    aims_scope: "",
    website_url: "",
    email: "",
    issn_print: "",
    issn_online: "",
    publication_frequency: "",
    journal_type: "open_access",
    peer_review_type: "double_blind",
    publisher_org_id: "",
    society_org_id: "",
    status: "active",
  });

  // Fetch journal data and organizations on mount
  useEffect(() => {
    fetchOrganizations();
    fetchJournalData();
  }, [id]);

  async function fetchOrganizations() {
    try {
      const { data, error } = await ConnectDatabase.from("organizations")
        .select("id, org_name, org_type")
        .eq("is_active", true)
        .order("org_name");

      if (error) throw error;
      setOrganizations(data || []);
    } catch (error) {
      console.error("Error fetching organizations:", error);
    }
  }

  const fetchJournalData = async () => {
    try {
      setFetchingData(true);
      const { data, error } = await ConnectDatabase.from("journals")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) {
        setError("Journal not found");
        return;
      }

      // Pre-populate form with existing data
      setFormData({
        full_title: data.full_title || "",
        short_title: data.short_title || "",
        acronym: data.acronym || "",
        description: data.description || "",
        aims_scope: data.aims_scope || "",
        website_url: data.website_url || "",
        email: data.email || "",
        issn_print: data.issn_print || "",
        issn_online: data.issn_online || "",
        publication_frequency: data.publication_frequency || "",
        journal_type: data.journal_type || "open_access",
        peer_review_type: data.peer_review_type || "double_blind",
        publisher_org_id: data.publisher_org_id || "",
        society_org_id: data.society_org_id || "",
        status: data.status || "active",
      });
    } catch (error) {
      console.error("Error fetching journal:", error);
      setError("Failed to load journal data");
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
    if (!formData.full_title.trim()) {
      setError("Full title is required");
      return false;
    }

    // Validate email format if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate ISSN format if provided (XXXX-XXXX)
    const issnRegex = /^\d{4}-\d{3}[\dX]$/;
    if (formData.issn_print && !issnRegex.test(formData.issn_print)) {
      setError("Print ISSN must be in format: XXXX-XXXX (e.g., 1234-5678)");
      return false;
    }
    if (formData.issn_online && !issnRegex.test(formData.issn_online)) {
      setError("Online ISSN must be in format: XXXX-XXXX (e.g., 1234-567X)");
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
      const journalData = {
        full_title: formData.full_title.trim(),
        short_title: formData.short_title.trim() || null,
        acronym: formData.acronym.trim() || null,
        description: formData.description.trim() || null,
        aims_scope: formData.aims_scope.trim() || null,
        website_url: formData.website_url.trim() || null,
        email: formData.email.trim() || null,
        issn_print: formData.issn_print.trim() || null,
        issn_online: formData.issn_online.trim() || null,
        publication_frequency: formData.publication_frequency || null,
        journal_type: formData.journal_type,
        peer_review_type: formData.peer_review_type,
        publisher_org_id: formData.publisher_org_id || null,
        society_org_id: formData.society_org_id || null,
        status: formData.status,
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await ConnectDatabase.from("journals")
        .update(journalData)
        .eq("id", id);

      if (updateError) throw updateError;

      navigate("/adm/journals", {
        state: {
          message: "Journal updated successfully!",
          journalId: id,
        },
      });
    } catch (error) {
      console.error("Error updating journal:", error);
      setError(error.message || "An error occurred while updating the journal");
    } finally {
      setLoading(false);
    }
  };

  const publishers = organizations.filter(
    (org) => org.org_type === "publisher"
  );
  const societies = organizations.filter((org) => org.org_type === "society");

  if (fetchingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-sm text-gray-600">
                Loading journal data...
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
            onClick={() => navigate("/adm/journals")}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Journals
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Edit Journal</h1>
          <p className="mt-2 text-sm text-gray-600">
            Update journal information
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
                    htmlFor="full_title"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Title *
                  </label>
                  <input
                    type="text"
                    name="full_title"
                    id="full_title"
                    required
                    value={formData.full_title}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Philippine Journal of Internal Medicine"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="short_title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Short Title
                    </label>
                    <input
                      type="text"
                      name="short_title"
                      id="short_title"
                      value={formData.short_title}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="PJIM"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="acronym"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Acronym
                    </label>
                    <input
                      type="text"
                      name="acronym"
                      id="acronym"
                      value={formData.acronym}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="PJIM"
                    />
                  </div>
                </div>

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
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="editor@journal.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="issn_print"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ISSN (Print)
                    </label>
                    <input
                      type="text"
                      name="issn_print"
                      id="issn_print"
                      value={formData.issn_print}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="1234-5678"
                      maxLength="9"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="issn_online"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ISSN (Online)
                    </label>
                    <input
                      type="text"
                      name="issn_online"
                      id="issn_online"
                      value={formData.issn_online}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="1234-567X"
                      maxLength="9"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="publication_frequency"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Publication Frequency
                    </label>
                    <select
                      name="publication_frequency"
                      id="publication_frequency"
                      value={formData.publication_frequency}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select frequency</option>
                      <option value="monthly">Monthly</option>
                      <option value="bimonthly">Bimonthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="biannual">Biannual</option>
                      <option value="annual">Annual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="journal_type"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Journal Type *
                    </label>
                    <select
                      name="journal_type"
                      id="journal_type"
                      value={formData.journal_type}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="open_access">Open Access</option>
                      <option value="subscription">Subscription</option>
                      <option value="hybrid">Hybrid</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="peer_review_type"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Peer Review Type *
                    </label>
                    <select
                      name="peer_review_type"
                      id="peer_review_type"
                      value={formData.peer_review_type}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="double_blind">Double Blind</option>
                      <option value="single_blind">Single Blind</option>
                      <option value="open">Open</option>
                      <option value="post_publication">Post Publication</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="status"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Status *
                    </label>
                    <select
                      name="status"
                      id="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="pending">Pending</option>
                      <option value="discontinued">Discontinued</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="publisher_org_id"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Publisher
                    </label>
                    <select
                      name="publisher_org_id"
                      id="publisher_org_id"
                      value={formData.publisher_org_id}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a publisher</option>
                      {publishers.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.org_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="society_org_id"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Associated Society
                    </label>
                    <select
                      name="society_org_id"
                      id="society_org_id"
                      value={formData.society_org_id}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select a society (optional)</option>
                      {societies.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.org_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
                Description
              </h2>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    About the Journal
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Brief description of the journal..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Provide a brief overview of the journal
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="aims_scope"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Aims & Scope
                  </label>
                  <textarea
                    name="aims_scope"
                    id="aims_scope"
                    rows={4}
                    value={formData.aims_scope}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="What topics does the journal cover?"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Describe the scope and focus areas of the journal
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate("/adm/journals")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Updating..." : "Update Journal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
