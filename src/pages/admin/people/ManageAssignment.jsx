import React from "react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ConnectDatabase } from "../../../lib/ConnectDatabase";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  BookOpenIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

export const ManageAssignments = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [roleTypeFilter, setRoleTypeFilter] = useState(
    searchParams.get("roleType") || "all"
  );
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get("status") || "active"
  );
  const [journalFilter, setJournalFilter] = useState(
    searchParams.get("journal") || "all"
  );

  // Lists for filter dropdowns
  const [journals, setJournals] = useState([]);

  const roleTypes = [
    { value: "all", label: "All Role Types" },
    { value: "editor_in_chief", label: "Editor-in-Chief" },
    { value: "associate_editor", label: "Associate Editor" },
    { value: "managing_editor", label: "Managing Editor" },
    { value: "board_member", label: "Board Member" },
    { value: "reviewer", label: "Reviewer" },
  ];

  useEffect(() => {
    fetchAssignments();
    fetchJournals();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assignments, searchTerm, roleTypeFilter, statusFilter, journalFilter]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: fetchError } = await ConnectDatabase.from(
        "journal_editorial_team"
      )
        .select(
          `
          *,
          person:people(
            id,
            full_name,
            title,
            affiliation,
            photo_url,
            email
          ),
          journal:journals(
            id,
            full_title,
            acronym,
            status,
            cover_image_url
          )
        `
        )
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setAssignments(data || []);
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments");
    } finally {
      setLoading(false);
    }
  };

  const fetchJournals = async () => {
    try {
      const { data, error: fetchError } = await ConnectDatabase.from("journals")
        .select("id, full_title, acronym")
        .is("deleted_at", null)
        .order("full_title", { ascending: true });

      if (fetchError) throw fetchError;
      setJournals(data || []);
    } catch (err) {
      console.error("Error fetching journals:", err);
    }
  };

  const applyFilters = () => {
    let filtered = [...assignments];

    // Search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (assignment) =>
          assignment.person?.full_name?.toLowerCase().includes(searchLower) ||
          assignment.journal?.full_title?.toLowerCase().includes(searchLower) ||
          assignment.role?.toLowerCase().includes(searchLower)
      );
    }

    // Role type filter
    if (roleTypeFilter !== "all") {
      filtered = filtered.filter(
        (assignment) => assignment.role_type === roleTypeFilter
      );
    }

    // Status filter
    if (statusFilter === "active") {
      filtered = filtered.filter((assignment) => assignment.is_active === true);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter(
        (assignment) => assignment.is_active === false
      );
    }

    // Journal filter
    if (journalFilter !== "all") {
      filtered = filtered.filter(
        (assignment) => assignment.journal_id === journalFilter
      );
    }

    setFilteredAssignments(filtered);
  };

  const handleDelete = async (assignmentId, personName, journalTitle) => {
    if (
      !window.confirm(
        `Are you sure you want to remove ${personName} from ${journalTitle}?`
      )
    ) {
      return;
    }

    try {
      const { error: deleteError } = await ConnectDatabase.from(
        "journal_editorial_team"
      )
        .delete()
        .eq("id", assignmentId);

      if (deleteError) throw deleteError;

      fetchAssignments();
    } catch (err) {
      console.error("Error deleting assignment:", err);
      alert("Failed to delete assignment");
    }
  };

  const toggleActiveStatus = async (assignmentId, currentStatus) => {
    try {
      const { error: updateError } = await ConnectDatabase.from(
        "journal_editorial_team"
      )
        .update({ is_active: !currentStatus })
        .eq("id", assignmentId);

      if (updateError) throw updateError;

      fetchAssignments();
    } catch (err) {
      console.error("Error updating assignment:", err);
      alert("Failed to update assignment status");
    }
  };

  const getRoleTypeBadge = (roleType) => {
    const badges = {
      editor_in_chief: "bg-purple-100 text-purple-800 border-purple-200",
      associate_editor: "bg-blue-100 text-blue-800 border-blue-200",
      managing_editor: "bg-green-100 text-green-800 border-green-200",
      board_member: "bg-gray-100 text-gray-800 border-gray-200",
      reviewer: "bg-yellow-100 text-yellow-800 border-yellow-200",
    };
    return badges[roleType] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading assignments...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">
              Journal Assignments
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage people assigned to journal editorial teams
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              to="/adm/people/assign-journal"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Assignment
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total Assignments
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {assignments.length}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpenIcon className="h-8 w-8 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Active
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {assignments.filter((a) => a.is_active).length}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-8 w-8 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Editors-in-Chief
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {
                      assignments.filter(
                        (a) => a.role_type === "editor_in_chief"
                      ).length
                    }
                  </dd>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpenIcon className="h-8 w-8 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Journals Covered
                  </dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    {new Set(assignments.map((a) => a.journal_id)).size}
                  </dd>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex items-center mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Role Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role Type
              </label>
              <select
                value={roleTypeFilter}
                onChange={(e) => setRoleTypeFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {roleTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Journal Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Journal
              </label>
              <select
                value={journalFilter}
                onChange={(e) => setJournalFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Journals</option>
                {journals.map((journal) => (
                  <option key={journal.id} value={journal.id}>
                    {journal.full_title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredAssignments.length} of {assignments.length}{" "}
          assignments
        </div>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-12 text-center">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No assignments found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {assignments.length === 0
                ? "Get started by creating a new assignment."
                : "Try adjusting your search or filters."}
            </p>
            {assignments.length === 0 && (
              <div className="mt-6">
                <Link
                  to="/adm/people/assign-journal"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  New Assignment
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <li
                  key={assignment.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Person Photo */}
                      <div className="flex-shrink-0">
                        {assignment.person?.photo_url ? (
                          <img
                            src={assignment.person.photo_url}
                            alt={assignment.person.full_name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                            {getInitials(assignment.person?.full_name)}
                          </div>
                        )}
                      </div>

                      {/* Person & Role Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {assignment.person?.title &&
                              `${assignment.person.title} `}
                            {assignment.person?.full_name}
                          </p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleTypeBadge(
                              assignment.role_type
                            )}`}
                          >
                            {assignment.role}
                          </span>
                          {assignment.is_active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate">
                          {assignment.journal?.full_title}
                          {assignment.journal?.acronym &&
                            ` (${assignment.journal.acronym})`}
                        </p>
                        {assignment.person?.affiliation && (
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {assignment.person.affiliation}
                          </p>
                        )}
                        {assignment.start_date && (
                          <p className="text-xs text-gray-500 mt-1">
                            Since{" "}
                            {new Date(
                              assignment.start_date
                            ).toLocaleDateString()}
                            {assignment.end_date &&
                              ` - ${new Date(
                                assignment.end_date
                              ).toLocaleDateString()}`}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() =>
                          toggleActiveStatus(
                            assignment.id,
                            assignment.is_active
                          )
                        }
                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                          assignment.is_active
                            ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                        title={assignment.is_active ? "Deactivate" : "Activate"}
                      >
                        {assignment.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <Link
                        to={`/adm/people/${assignment.person_id}/edit`}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Person"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() =>
                          handleDelete(
                            assignment.id,
                            assignment.person?.full_name,
                            assignment.journal?.full_title
                          )
                        }
                        className="text-red-600 hover:text-red-900"
                        title="Delete Assignment"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
