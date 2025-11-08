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
  UserIcon,
  ArrowPathIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

export const ListPeople = () => {
  const [people, setPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [titleFilter, setTitleFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    withTitles: 0,
    withPhotos: 0,
    linkedToAuth: 0,
  });

  // Fetch people from ConnectDatabase
  useEffect(() => {
    fetchPeople();
  }, []);

  // Apply filters when people or filters change
  useEffect(() => {
    applyFilters();
  }, [people, searchTerm, titleFilter]);

  const fetchPeople = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await ConnectDatabase.from("people")
        .select("*")
        .is("deleted_at", null)
        .order("full_name", { ascending: true });

      if (fetchError) throw fetchError;

      setPeople(data || []);
      calculateStats(data || []);
    } catch (err) {
      console.error("Error fetching people:", err);
      setError("Failed to load people. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      withTitles: data.filter((person) => person.title).length,
      withPhotos: data.filter((person) => person.photo_url).length,
      linkedToAuth: data.filter((person) => person.user_id).length,
    });
  };

  const applyFilters = () => {
    let filtered = [...people];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (person) =>
          person.full_name?.toLowerCase().includes(searchLower) ||
          person.first_name?.toLowerCase().includes(searchLower) ||
          person.last_name?.toLowerCase().includes(searchLower) ||
          person.title?.toLowerCase().includes(searchLower)
      );
    }

    // Title filter
    if (titleFilter !== "all") {
      if (titleFilter === "has_title") {
        filtered = filtered.filter((person) => person.title);
      } else if (titleFilter === "no_title") {
        filtered = filtered.filter((person) => !person.title);
      } else {
        filtered = filtered.filter((person) => person.title === titleFilter);
      }
    }

    setFilteredPeople(filtered);
  };

  const handleDelete = async (personId, personName) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${personName}"? This will soft-delete the record.`
      )
    ) {
      return;
    }

    try {
      const { error: deleteError } = await ConnectDatabase.from("people")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", personId);

      if (deleteError) throw deleteError;

      // Refresh the list
      fetchPeople();
    } catch (err) {
      console.error("Error deleting person:", err);
      alert("Failed to delete person. Please try again.");
    }
  };

  const getTitleBadge = (title) => {
    if (!title) return null;

    const badges = {
      Dr: "bg-blue-100 text-blue-800",
      MD: "bg-green-100 text-green-800",
      PhD: "bg-purple-100 text-purple-800",
      Prof: "bg-indigo-100 text-indigo-800",
    };

    const normalizedTitle = title.replace(".", "");
    return badges[normalizedTitle] || "bg-gray-100 text-gray-800";
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get unique titles for filter dropdown
  const uniqueTitles = [...new Set(people.map((p) => p.title).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading people...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">People</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage editors, contacts, and contributors
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/adm/people/create"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Person
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total People
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
                <div className="flex-shrink-0 text-2xl">🎓</div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    With Titles
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-blue-600">
                    {stats.withTitles}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-2xl">📸</div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    With Photos
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-green-600">
                    {stats.withPhotos}
                  </dd>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 text-2xl">🔑</div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    With Accounts
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-purple-600">
                    {stats.linkedToAuth}
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
                Search people
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Search by name or title..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Title Filter */}
            <div>
              <label htmlFor="title-filter" className="sr-only">
                Filter by title
              </label>
              <select
                id="title-filter"
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={titleFilter}
                onChange={(e) => setTitleFilter(e.target.value)}
              >
                <option value="all">All Titles</option>
                <option value="has_title">Has Title</option>
                <option value="no_title">No Title</option>
                <optgroup label="Specific Titles">
                  {uniqueTitles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {(searchTerm || titleFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2 flex-wrap">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchTerm && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Search: {searchTerm}
                </span>
              )}
              {titleFilter !== "all" && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Title: {titleFilter}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setTitleFilter("all");
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

        {/* People Grid */}
        {filteredPeople.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <UserCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No people found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {people.length === 0
                ? "Get started by adding a new person."
                : "Try adjusting your search or filters."}
            </p>
            {people.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/adm/people/create"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Person
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredPeople.map((person) => (
                <div
                  key={person.id}
                  className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    {/* Photo or Avatar */}
                    <div className="flex justify-center mb-4">
                      {person.photo_url ? (
                        <img
                          src={person.photo_url}
                          alt={person.full_name}
                          className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xl font-bold border-2 border-gray-200">
                          {getInitials(person.full_name)}
                        </div>
                      )}
                    </div>

                    {/* Name and Title */}
                    <div className="text-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {person.full_name}
                      </h3>
                      {person.title && (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTitleBadge(
                            person.title
                          )}`}
                        >
                          {person.title}
                        </span>
                      )}
                    </div>

                    {/* Additional Info */}
                    <div className="flex justify-center gap-3 mb-4 text-xs text-gray-500">
                      {person.user_id && (
                        <div
                          className="flex items-center"
                          title="Has user account"
                        >
                          <UserIcon className="h-4 w-4 mr-1" />
                          Account
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <Link
                        to={`/adm/people/${person.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                      <div className="flex gap-2">
                        <Link
                          to={`/adm/people/${person.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="Edit"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(person.id, person.full_name)
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
              Showing {filteredPeople.length} of {people.length} people
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
                    Person
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPeople.map((person) => (
                  <tr key={person.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {person.photo_url ? (
                            <img className="h-10 w-10 rounded-full" src={person.photo_url} alt="" />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                              {getInitials(person.full_name)}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {person.full_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {person.title && (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTitleBadge(person.title)}`}>
                          {person.title}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex gap-2">
                        {person.user_id && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Has Account
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/adm/people/${person.id}/edit`} className="text-blue-600 hover:text-blue-900" title="View">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        <Link to={`/adm/people/${person.id}/edit`} className="text-indigo-600 hover:text-indigo-900" title="Edit">
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button onClick={() => handleDelete(person.id, person.full_name)} className="text-red-600 hover:text-red-900" title="Delete">
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
