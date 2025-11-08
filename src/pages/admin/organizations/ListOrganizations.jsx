import React from 'react'
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ConnectDatabase } from "../../../lib/ConnectDatabase";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

export const ListOrganizations = () => {
  const [organizations, setOrganizations] = useState([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    societies: 0,
    publishers: 0,
    institutions: 0,
  });

  // Fetch organizations from ConnectDatabase
  useEffect(() => {
    fetchOrganizations();
  }, []);

  // Apply filters when organizations or filters change
  useEffect(() => {
    applyFilters();
  }, [organizations, searchTerm, typeFilter]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await ConnectDatabase
        .from("organizations")
        .select("*")
        .order("org_name", { ascending: true });

      if (fetchError) throw fetchError;

      setOrganizations(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error("Error fetching organizations:", err);
      setError("Failed to load organizations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      societies: data.filter((org) => org.org_type === "society").length,
      publishers: data.filter((org) => org.org_type === "publisher").length,
      institutions: data.filter((org) => org.org_type === "institution").length,
    });
  };

  const applyFilters = () => {
    let filtered = [...organizations];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter((org) =>
        org.org_name?.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((org) => org.org_type === typeFilter);
    }

    setFilteredOrganizations(filtered);
  };

  const handleDelete = async (orgId, orgName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${orgName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const { error: deleteError } = await ConnectDatabase
        .from("organizations")
        .delete()
        .eq("id", orgId);

      if (deleteError) throw deleteError;

      // Refresh the list
      fetchOrganizations();
    } catch (err) {
      console.error("Error deleting organization:", err);
      alert(
        "Failed to delete organization. It may be referenced by journals or other records."
      );
    }
  };

  const getTypeBadge = (type) => {
    const badges = {
      society: "bg-blue-100 text-blue-800",
      publisher: "bg-green-100 text-green-800",
      institution: "bg-purple-100 text-purple-800",
    };
    return badges[type] || "bg-gray-100 text-gray-800";
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "society":
        return "👥";
      case "publisher":
        return "📚";
      case "institution":
        return "🏛️";
      default:
        return "🏢";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading organizations...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Organizations</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage societies, publishers, and institutions
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/adm/organizations/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Organization
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Organizations
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
                <div className="flex-shrink-0 text-2xl">👥</div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Societies
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-blue-600">
                    {stats.societies}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-2xl">📚</div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Publishers
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    {stats.publishers}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-2xl">🏛️</div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Institutions
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-purple-600">
                    {stats.institutions}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Search */}
            <div>
              <label htmlFor="search" className="sr-only">
                Search organizations
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search organizations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label htmlFor="type-filter" className="sr-only">
                Filter by type
              </label>
              <select
                id="type-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="society">Societies</option>
                <option value="publisher">Publishers</option>
                <option value="institution">Institutions</option>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || typeFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: {searchTerm}
                </span>
              )}
              {typeFilter !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Type: {typeFilter}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTypeFilter("all");
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

        {/* Organizations Grid */}
        {filteredOrganizations.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No organizations found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {organizations.length === 0
                ? "Get started by creating a new organization."
                : "Try adjusting your search or filters."}
            </p>
            {organizations.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/adm/organizations/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Organization
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOrganizations.map((org) => (
                <div
                  key={org.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl">
                        {getTypeIcon(org.org_type)}
                      </div>
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadge(
                          org.org_type
                        )}`}
                      >
                        {org.org_type}
                      </span>
                    </div>

                    {org.logo_url && (
                      <div className="mb-4 flex justify-center">
                        <img
                          src={org.logo_url}
                          alt={org.org_name}
                          className="h-16 w-auto object-contain"
                        />
                      </div>
                    )}

                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {org.org_name}
                    </h3>

                    <div className="text-xs text-gray-500 mb-4">
                      Added {new Date(org.created_at).toLocaleDateString()}
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <Link
                        to={`/adm/organizations/${org.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <div className="flex gap-2">
                        <Link
                          to={`/adm/organizations/${org.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(org.id, org.org_name)}
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
              Showing {filteredOrganizations.length} of {organizations.length}{" "}
              organizations
            </div>
          </>
        )}

        {/* Table View Alternative (Commented out - can be toggled) */}
        {/* 
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Added
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrganizations.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {org.logo_url ? (
                            <img className="h-10 w-10 rounded-full object-cover" src={org.logo_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                              {getTypeIcon(org.org_type)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {org.org_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadge(org.org_type)}`}>
                        {org.org_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(org.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/adm/organizations/${org.id}`} className="text-blue-600 hover:text-blue-900" title="View">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link to={`/adm/organizations/${org.id}/edit`} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button onClick={() => handleDelete(org.id, org.org_name)} className="text-red-600 hover:text-red-900" title="Delete">
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
        */}
      </div>
    </div>
  );
};