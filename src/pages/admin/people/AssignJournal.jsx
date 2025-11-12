import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ConnectDatabase } from "../../../lib/ConnectDatabase";
import {
  ArrowLeftIcon,
  UserGroupIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

export const AssignJournal = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedPersonId = searchParams.get("person");
  const preselectedJournalId = searchParams.get("journal");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data lists
  const [people, setPeople] = useState([]);
  const [journals, setJournals] = useState([]);
  const [existingAssignments, setExistingAssignments] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    person_id: preselectedPersonId || "",
    journal_id: preselectedJournalId || "",
    role: "",
    role_type: "board_member",
    responsibilities: "",
    display_order: 0,
    start_date: "",
    end_date: "",
    is_active: true,
  });

  // Search/filter states
  const [personSearch, setPersonSearch] = useState("");
  const [journalSearch, setJournalSearch] = useState("");

  const roleTypes = [
    { value: "editor_in_chief", label: "Editor-in-Chief" },
    { value: "associate_editor", label: "Associate Editor" },
    { value: "managing_editor", label: "Managing Editor" },
    { value: "board_member", label: "Editorial Board Member" },
    { value: "reviewer", label: "Reviewer" },
  ];

  // Fetch initial data
  useEffect(() => {
    fetchPeople();
    fetchJournals();
  }, []);

  // Fetch existing assignments when person/journal selected
  useEffect(() => {
    if (formData.person_id && formData.journal_id) {
      checkExistingAssignment();
    }
  }, [formData.person_id, formData.journal_id]);

  const fetchPeople = async () => {
    try {
      const { data, error: fetchError } = await ConnectDatabase.from("people")
        .select("id, full_name, title, affiliation, photo_url, email")
        .is("deleted_at", null)
        .eq("is_active", true)
        .order("full_name", { ascending: true });

      if (fetchError) throw fetchError;
      setPeople(data || []);
    } catch (err) {
      console.error("Error fetching people:", err);
      setError("Failed to load people list");
    }
  };

  const fetchJournals = async () => {
    try {
      const { data, error: fetchError } = await ConnectDatabase.from("journals")
        .select("id, full_title, acronym, status, cover_image_url")
        .is("deleted_at", null)
        .in("status", ["active", "pending"])
        .order("full_title", { ascending: true });

      if (fetchError) throw fetchError;
      setJournals(data || []);
    } catch (err) {
      console.error("Error fetching journals:", err);
      setError("Failed to load journals list");
    }
  };

  const checkExistingAssignment = async () => {
    try {
      const { data, error: fetchError } = await ConnectDatabase.from(
        "journal_editorial_team"
      )
        .select(
          `
          *,
          journal:journals(full_title, acronym),
          person:people(full_name, title)
        `
        )
        .eq("person_id", formData.person_id)
        .eq("journal_id", formData.journal_id);

      if (fetchError) throw fetchError;
      setExistingAssignments(data || []);

      if (data && data.length > 0) {
        const activeAssignments = data.filter((a) => a.is_active);
        if (activeAssignments.length > 0) {
          setError(
            `This person is already assigned to this journal as ${activeAssignments[0].role}. You can still add another role if needed.`
          );
        }
      } else {
        setError("");
      }
    } catch (err) {
      console.error("Error checking existing assignments:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    // Validation
    if (!formData.person_id) {
      setError("Please select a person");
      setLoading(false);
      return;
    }

    if (!formData.journal_id) {
      setError("Please select a journal");
      setLoading(false);
      return;
    }

    if (!formData.role) {
      setError("Please enter a role title");
      setLoading(false);
      return;
    }

    try {
      // Prepare data for insertion
      const insertData = {
        person_id: formData.person_id,
        journal_id: formData.journal_id,
        role: formData.role,
        role_type: formData.role_type,
        responsibilities: formData.responsibilities || null,
        display_order: parseInt(formData.display_order) || 0,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
      };

      const { data, error: insertError } = await ConnectDatabase.from(
        "journal_editorial_team"
      )
        .insert(insertData)
        .select();

      if (insertError) throw insertError;

      setSuccess("Successfully assigned person to journal!");

      // Reset form or redirect after short delay
      setTimeout(() => {
        navigate("/adm/people");
      }, 2000);
    } catch (err) {
      console.error("Error creating assignment:", err);
      setError(err.message || "Failed to create assignment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getSelectedPerson = () => {
    return people.find((p) => p.id === formData.person_id);
  };

  const getSelectedJournal = () => {
    return journals.find((j) => j.id === formData.journal_id);
  };

  // Filter people based on search
  const filteredPeople = people.filter((person) =>
    person.full_name.toLowerCase().includes(personSearch.toLowerCase())
  );

  // Filter journals based on search
  const filteredJournals = journals.filter((journal) =>
    journal.full_title.toLowerCase().includes(journalSearch.toLowerCase())
  );

  const selectedPerson = getSelectedPerson();
  const selectedJournal = getSelectedJournal();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Back
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <UserGroupIcon className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Assign Person to Journal
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Link a person to a journal's editorial team
              </p>
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <XCircleIcon className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Person Selection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <UserGroupIcon className="h-5 w-5 mr-2 text-gray-500" />
                Select Person
              </h2>

              {/* Person Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search People
                </label>
                <input
                  type="text"
                  value={personSearch}
                  onChange={(e) => setPersonSearch(e.target.value)}
                  placeholder="Search by name..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Person Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Person <span className="text-red-500">*</span>
                </label>
                <select
                  name="person_id"
                  value={formData.person_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Person --</option>
                  {filteredPeople.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.title ? `${person.title} ` : ""}
                      {person.full_name}
                      {person.affiliation ? ` - ${person.affiliation}` : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {filteredPeople.length} people available
                </p>
              </div>

              {/* Selected Person Preview */}
              {selectedPerson && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    {selectedPerson.photo_url ? (
                      <img
                        src={selectedPerson.photo_url}
                        alt={selectedPerson.full_name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                        {selectedPerson.full_name.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {selectedPerson.title && `${selectedPerson.title} `}
                        {selectedPerson.full_name}
                      </p>
                      {selectedPerson.affiliation && (
                        <p className="text-sm text-gray-600">
                          {selectedPerson.affiliation}
                        </p>
                      )}
                      {selectedPerson.email && (
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedPerson.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Journal Selection */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BookOpenIcon className="h-5 w-5 mr-2 text-gray-500" />
                Select Journal
              </h2>

              {/* Journal Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Journals
                </label>
                <input
                  type="text"
                  value={journalSearch}
                  onChange={(e) => setJournalSearch(e.target.value)}
                  placeholder="Search by title..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Journal Dropdown */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Journal <span className="text-red-500">*</span>
                </label>
                <select
                  name="journal_id"
                  value={formData.journal_id}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select Journal --</option>
                  {filteredJournals.map((journal) => (
                    <option key={journal.id} value={journal.id}>
                      {journal.full_title}
                      {journal.acronym ? ` (${journal.acronym})` : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  {filteredJournals.length} journals available
                </p>
              </div>

              {/* Selected Journal Preview */}
              {selectedJournal && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start gap-3">
                    {selectedJournal.cover_image_url && (
                      <img
                        src={selectedJournal.cover_image_url}
                        alt={selectedJournal.full_title}
                        className="h-16 w-12 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {selectedJournal.full_title}
                      </p>
                      {selectedJournal.acronym && (
                        <p className="text-sm text-gray-600">
                          {selectedJournal.acronym}
                        </p>
                      )}
                      <span
                        className={`inline-block mt-2 px-2 py-1 text-xs rounded-full ${
                          selectedJournal.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {selectedJournal.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Role Details */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Role Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="e.g., Editor-in-Chief, Associate Editor"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  The specific title for this role
                </p>
              </div>

              {/* Role Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="role_type"
                  value={formData.role_type}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {roleTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-500">
                  Category of editorial role
                </p>
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Order
                </label>
                <input
                  type="number"
                  name="display_order"
                  value={formData.display_order}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Order to display in editorial board (0 = first)
                </p>
              </div>

              {/* Active Status */}
              <div className="flex items-center pt-8">
                <input
                  type="checkbox"
                  name="is_active"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="is_active"
                  className="ml-2 block text-sm text-gray-900"
                >
                  Active assignment
                </label>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Responsibilities */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Responsibilities
              </label>
              <textarea
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe the responsibilities and duties for this role..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Optional: Detailed description of responsibilities
              </p>
            </div>
          </div>

          {/* Existing Assignments Warning */}
          {existingAssignments.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Existing Assignments
                  </h3>
                  <p className="text-sm text-blue-800 mb-2">
                    This person already has the following assignment(s) to this
                    journal:
                  </p>
                  <ul className="list-disc list-inside text-sm text-blue-800 space-y-1">
                    {existingAssignments.map((assignment) => (
                      <li key={assignment.id}>
                        <strong>{assignment.role}</strong> (
                        {assignment.role_type.replace("_", " ")})
                        {assignment.is_active ? (
                          <span className="ml-2 text-green-600 font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="ml-2 text-gray-500">Inactive</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Assignment..." : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
