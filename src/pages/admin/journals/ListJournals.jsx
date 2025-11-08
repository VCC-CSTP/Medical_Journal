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
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export const ListJournals = () => {
  const [journals, setJournals] = useState([]);
  const [filteredJournals, setFilteredJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [policyFilter, setPolicyFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    discontinued: 0,
  });

  // Fetch journals from ConnectDatabase
  useEffect(() => {
    fetchJournals();
  }, []);

  // Apply filters when journals or filters change
  useEffect(() => {
    applyFilters();
  }, [journals, searchTerm, statusFilter, policyFilter]);

  const fetchJournals = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await ConnectDatabase.from("journals")
        .select(
          `
          *,
          publisher:publisher_org_id(id, org_name, org_type),
          society:society_org_id(id, org_name, org_type)
        `
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setJournals(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error("Error fetching journals:", err);
      setError("Failed to load journals. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      active: data.filter((j) => j.status === "active").length,
      inactive: data.filter((j) => j.status === "inactive").length,
      discontinued: data.filter((j) => j.status === "discontinued").length,
    });
  };

  const applyFilters = () => {
    let filtered = [...journals];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (journal) =>
          journal.full_title?.toLowerCase().includes(searchLower) ||
          journal.short_title?.toLowerCase().includes(searchLower) ||
          journal.acronym?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((journal) => journal.status === statusFilter);
    }

    // Publication policy filter
    if (policyFilter !== "all") {
      filtered = filtered.filter(
        (journal) => journal.publication_policy === policyFilter
      );
    }

    setFilteredJournals(filtered);
  };

  const handleDelete = async (journalId, journalTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${journalTitle}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { error: deleteError } = await ConnectDatabase.from("journals")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", journalId);

      if (deleteError) throw deleteError;

      // Refresh the list
      fetchJournals();
    } catch (err) {
      console.error("Error deleting journal:", err);
      alert("Failed to delete journal. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-yellow-100 text-yellow-800",
      discontinued: "bg-red-100 text-red-800",
    };
    return badges[status] || "bg-gray-100 text-gray-800";
  };

  const getPolicyBadge = (policy) => {
    const badges = {
      open_access: "bg-blue-100 text-blue-800",
      subscription: "bg-purple-100 text-purple-800",
      hybrid: "bg-indigo-100 text-indigo-800",
    };
    return badges[policy] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading journals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Journals</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage medical journals in your system
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/adm/journals/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Journal
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Journals
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
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    {stats.active}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Inactive
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-yellow-600">
                    {stats.inactive}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Discontinued
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-red-600">
                    {stats.discontinued}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Search */}
            <div className="sm:col-span-1">
              <label htmlFor="search" className="sr-only">
                Search journals
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search journals..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="status-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discontinued">Discontinued</option>
              </select>
            </div>

            {/* Policy Filter */}
            <div>
              <label htmlFor="policy-filter" className="sr-only">
                Filter by publication policy
              </label>
              <select
                id="policy-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={policyFilter}
                onChange={(e) => setPolicyFilter(e.target.value)}
              >
                <option value="all">All Policies</option>
                <option value="open_access">Open Access</option>
                <option value="subscription">Subscription</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || statusFilter !== "all" || policyFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: {searchTerm}
                </span>
              )}
              {statusFilter !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Status: {statusFilter}
                </span>
              )}
              {policyFilter !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Policy: {policyFilter}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setPolicyFilter("all");
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
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

        {/* Journals Table */}
        {filteredJournals.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No journals found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {journals.length === 0
                ? "Get started by creating a new journal."
                : "Try adjusting your search or filters."}
            </p>
            {journals.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/adm/journals/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Journal
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Journal
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Organizations
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Policy
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredJournals.map((journal) => (
                    <tr key={journal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {journal.full_title}
                            </div>
                            {journal.short_title && (
                              <div className="text-sm text-gray-500">
                                {journal.short_title}
                              </div>
                            )}
                            {journal.acronym && (
                              <div className="text-xs text-gray-400">
                                {journal.acronym}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {journal.publisher && (
                            <div className="mb-1">
                              <span className="text-gray-500">Pub:</span>{" "}
                              {journal.publisher.org_name}
                            </div>
                          )}
                          {journal.society && (
                            <div>
                              <span className="text-gray-500">Soc:</span>{" "}
                              {journal.society.org_name}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(
                            journal.status
                          )}`}
                        >
                          {journal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {journal.publication_policy && (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPolicyBadge(
                              journal.publication_policy
                            )}`}
                          >
                            {journal.publication_policy.replace("_", " ")}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/adm/journals/${journal.id}/edit`}
                            className="text-blue-600 hover:text-blue-900"
                            title="View"
                          >
                            <EyeIcon className="h-5 w-5" />
                          </Link>
                          <Link
                            to={`/adm/journals/${journal.id}/edit`}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="Edit"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(journal.id, journal.full_title)
                            }
                            className="text-red-600 hover:text-red-900"
                            title="Delete"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Results Count */}
        {filteredJournals.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing {filteredJournals.length} of {journals.length} journals
          </div>
        )}
      </div>
    </div>
  );
};
