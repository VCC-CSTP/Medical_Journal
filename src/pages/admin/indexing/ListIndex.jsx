import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ConnectDatabase } from "../../../lib/ConnectDatabase";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BookmarkIcon,
  ArrowPathIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export const ListIndex = () => {
  const [indexingServices, setIndexingServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    withUrls: 0,
    withDescription: 0,
  });
  const [journalCounts, setJournalCounts] = useState({});

  // Fetch indexing services from ConnectDatabase
  useEffect(() => {
    fetchIndexingServices();
    fetchJournalCounts();
  }, []);

  // Apply filters when services or search term changes
  useEffect(() => {
    applyFilters();
  }, [indexingServices, searchTerm]);

  const fetchIndexingServices = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await ConnectDatabase.from(
        "indexing_services"
      )
        .select("*")
        .order("service_name", { ascending: true });

      if (fetchError) throw fetchError;

      setIndexingServices(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error("Error fetching indexing services:", err);
      setError("Failed to load indexing services. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchJournalCounts = async () => {
    try {
      // Get count of journals for each indexing service
      const { data, error: fetchError } = await ConnectDatabase.from(
        "journal_indexing"
      ).select("service_id, journal_id");

      if (fetchError) throw fetchError;

      // Count journals per indexing service
      const counts = {};
      data.forEach((item) => {
        counts[item.service_id] = (counts[item.service_id] || 0) + 1;
      });

      setJournalCounts(counts);
    } catch (err) {
      console.error("Error fetching journal counts:", err);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      withUrls: data.filter((service) => service.service_url).length,
      withDescription: data.filter((service) => service.description).length,
    });
  };

  const applyFilters = () => {
    let filtered = [...indexingServices];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.service_name?.toLowerCase().includes(searchLower) ||
          service.description?.toLowerCase().includes(searchLower) ||
          service.coverage?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredServices(filtered);
  };

  const handleDelete = async (serviceId, serviceName) => {
    // Check if service is linked to any journals
    const journalCount = journalCounts[serviceId] || 0;

    if (journalCount > 0) {
      if (
        !window.confirm(
          `"${serviceName}" is linked to ${journalCount} journal(s). Deleting it will remove these associations. Are you sure?`
        )
      ) {
        return;
      }
    } else {
      if (
        !window.confirm(
          `Are you sure you want to delete "${serviceName}"? This action cannot be undone.`
        )
      ) {
        return;
      }
    }

    try {
      // First delete journal_indexing associations
      const { error: deleteAssocError } = await ConnectDatabase.from(
        "journal_indexing"
      )
        .delete()
        .eq("service_id", serviceId);

      if (deleteAssocError) throw deleteAssocError;

      // Then delete the indexing service
      const { error: deleteError } = await ConnectDatabase.from(
        "indexing_services"
      )
        .delete()
        .eq("id", serviceId);

      if (deleteError) throw deleteError;

      // Refresh the lists
      fetchIndexingServices();
      fetchJournalCounts();
    } catch (err) {
      console.error("Error deleting indexing service:", err);
      alert("Failed to delete indexing service. Please try again.");
    }
  };

  const getServiceIcon = (serviceName) => {
    const name = serviceName?.toLowerCase() || "";
    if (name.includes("pubmed") || name.includes("medline")) return "🏥";
    if (name.includes("scopus")) return "🔬";
    if (name.includes("web of science")) return "🌐";
    if (name.includes("scholar")) return "🎓";
    if (name.includes("doaj")) return "📖";
    if (name.includes("asean")) return "🌏";
    return "📚";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading indexing services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div className="flex items-center">
            <BookmarkIcon className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Indexing Services
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage databases that index journals
              </p>
            </div>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/adm/indexing/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Indexing Service
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookmarkIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Services
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {stats.total}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <GlobeAltIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    With URLs
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-blue-600">
                    {stats.withUrls}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-2xl">📝</div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    With Descriptions
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    {stats.withDescription}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search indexing services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {searchTerm && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-500">Active filter:</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Search: {searchTerm}
              </span>
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear
              </button>
            </div>
          )}
        </div>

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

        {/* Indexing Services Grid */}
        {filteredServices.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <BookmarkIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No indexing services found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {indexingServices.length === 0
                ? "Get started by adding your first indexing service."
                : "Try adjusting your search term."}
            </p>
            {indexingServices.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/adm/indexing/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Indexing Service
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Card Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    {/* Header with Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="text-3xl mr-3">
                          {getServiceIcon(service.service_name)}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900">
                            {service.service_name}
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      {service.service_url && (
                        <div className="flex items-center text-sm text-gray-500">
                          <GlobeAltIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <a
                            href={service.service_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 truncate"
                          >
                            {service.service_url.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}

                      {service.coverage && (
                        <div className="flex items-start text-sm text-gray-500">
                          <span className="font-medium mr-2">Coverage:</span>
                          <span className="line-clamp-1">
                            {service.coverage}
                          </span>
                        </div>
                      )}

                      {service.impact_factor && (
                        <div className="flex items-start text-sm text-gray-500">
                          <span className="font-medium mr-2">Ranking:</span>
                          <span className="line-clamp-1">
                            {service.impact_factor}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Journal Count Badge */}
                    <div className="mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {journalCounts[service.id] || 0} journal
                        {journalCounts[service.id] !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <Link
                        to={`/adm/indexing/${service.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <div className="flex gap-2">
                        <Link
                          to={`/adm/indexing/${service.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(service.id, service.service_name)
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Results Count */}
            <div className="mt-6 text-sm text-gray-500 text-center">
              Showing {filteredServices.length} of {indexingServices.length}{" "}
              services
            </div>
          </>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                  Indexing services are databases that track and categorize
                  academic journals. Being indexed by reputable services
                  increases a journal's visibility and credibility.
                </p>
                <p className="mt-2">
                  After adding services here, you can link them to journals to
                  show which databases index each journal.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
