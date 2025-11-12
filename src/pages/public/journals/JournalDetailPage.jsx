import React from "react";
import { useParams, Link } from "react-router-dom";
import { useJournal } from "../../../hooks/useJournals";
import {
  GlobeAltIcon,
  EnvelopeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  CheckBadgeIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";

export const JournalDetailPage = () => {
  const { id } = useParams();
  const { journal, loading, error } = useJournal(id);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading journal details...</p>
        </div>
      </div>
    );
  }

  if (error || !journal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Journal not found</p>
          <p className="text-gray-600 mt-2">
            {error || "The journal you are looking for does not exist."}
          </p>
          <Link
            to="/journals"
            className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
          >
            ← Back to journals
          </Link>
        </div>
      </div>
    );
  }

  // Get active editorial team members sync
  const activeEditorialTeam =
    journal.editorial_team?.filter((member) => member.is_active) || [];

  // Group by role type
  const editorsInChief = activeEditorialTeam.filter(
    (m) => m.role_type === "editor_in_chief"
  );
  const associateEditors = activeEditorialTeam.filter(
    (m) => m.role_type === "associate_editor"
  );
  const boardMembers = activeEditorialTeam.filter(
    (m) => m.role_type === "board_member"
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 to-indigo-800 pb-32">
        <div className="absolute inset-0">
          {journal.banner_image_url && (
            <img
              src={journal.banner_image_url}
              alt=""
              className="w-full h-full object-cover opacity-20"
            />
          )}
        </div>
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-indigo-200 mb-4">
            <Link to="/journals" className="hover:text-white">
              Journals
            </Link>
            <span>/</span>
            <span className="text-white">{journal.full_title}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            {journal.full_title}
          </h1>
          {journal.acronym && (
            <p className="mt-2 text-xl text-indigo-200">{journal.acronym}</p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="relative -mt-32 mx-auto max-w-7xl px-6 pb-24 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Info Card */}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
              <div className="flex items-start gap-6">
                {journal.cover_image_url && (
                  <img
                    src={journal.cover_image_url}
                    alt={journal.full_title}
                    className="w-32 h-40 object-cover rounded-lg shadow-md flex-shrink-0"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {journal.is_featured && (
                      <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                        Featured
                      </span>
                    )}
                    {journal.is_indexed && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        <CheckBadgeIcon className="h-4 w-4" />
                        Indexed
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                      {journal.journal_type?.replace("_", " ") || "Journal"}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                      {journal.status}
                    </span>
                  </div>

                  {journal.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {journal.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    {journal.language && (
                      <div>
                        <span className="font-medium text-gray-900">
                          Language:
                        </span>{" "}
                        {journal.language}
                      </div>
                    )}
                    {journal.publication_frequency && (
                      <div>
                        <span className="font-medium text-gray-900">
                          Frequency:
                        </span>{" "}
                        {journal.publication_frequency}
                      </div>
                    )}
                    {journal.first_publication_year && (
                      <div>
                        <span className="font-medium text-gray-900">
                          Since:
                        </span>{" "}
                        {journal.first_publication_year}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Aims and Scope */}
            {journal.aims_scope && (
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpenIcon className="h-6 w-6 text-indigo-600" />
                  Aims and Scope
                </h2>
                <div className="prose prose-sm max-w-none text-gray-600">
                  <p>{journal.aims_scope}</p>
                </div>
              </div>
            )}

            {/* Subject Areas */}
            {journal.subject_area && journal.subject_area.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AcademicCapIcon className="h-6 w-6 text-indigo-600" />
                  Subject Areas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {journal.subject_area.map((area, index) => (
                    <Link
                      key={index}
                      to={`/journals/category/${area}`}
                      className="inline-flex items-center rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-100"
                    >
                      {area}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Indexing Services */}
            {journal.indexing && journal.indexing.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Indexing & Abstracting
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {journal.indexing
                    .filter((idx) => idx.status === "active")
                    .map((idx, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 rounded-lg bg-gray-50"
                      >
                        {idx.service?.logo_url && (
                          <img
                            src={idx.service.logo_url}
                            alt={idx.service.service_name}
                            className="h-8 w-8 object-contain flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {idx.service?.service_name}
                          </p>
                          {idx.indexed_since && (
                            <p className="text-xs text-gray-500">
                              Since {new Date(idx.indexed_since).getFullYear()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Editorial Team */}
            {activeEditorialTeam.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Editorial Team
                </h2>

                {/* Editors in Chief */}
                {editorsInChief.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Editor{editorsInChief.length > 1 ? "s" : ""} in Chief
                    </h3>
                    <div className="space-y-3">
                      {editorsInChief.map((member) => (
                        <div key={member.id} className="flex items-start gap-4">
                          {member.person?.photo_url && (
                            <img
                              src={member.person.photo_url}
                              alt={member.person.full_name}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.person?.title} {member.person?.full_name}
                            </p>
                            {member.person?.affiliation && (
                              <p className="text-sm text-gray-600">
                                {member.person.affiliation}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Associate Editors */}
                {associateEditors.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Associate Editors
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {associateEditors.map((member) => (
                        <div key={member.id} className="text-sm">
                          <p className="font-medium text-gray-900">
                            {member.person?.full_name}
                          </p>
                          {member.person?.affiliation && (
                            <p className="text-xs text-gray-600">
                              {member.person.affiliation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Board Members */}
                {boardMembers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                      Editorial Board
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {boardMembers.map((member) => (
                        <div key={member.id} className="text-sm text-gray-700">
                          {member.person?.full_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Publisher Info */}
            {journal.publisher && (
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Publisher
                </h3>
                <div className="space-y-4">
                  {journal.publisher.logo_url && (
                    <img
                      src={journal.publisher.logo_url}
                      alt={journal.publisher.org_name}
                      className="h-16 object-contain"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {journal.publisher.org_name}
                    </p>
                    {journal.publisher.website_url && (
                      <a
                        href={journal.publisher.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1 mt-1"
                      >
                        Visit website
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Society Info */}
            {journal.society && (
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">
                  Associated Society
                </h3>
                <div className="space-y-4">
                  {journal.society.logo_url && (
                    <img
                      src={journal.society.logo_url}
                      alt={journal.society.org_name}
                      className="h-16 object-contain"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {journal.society.org_name}
                    </p>
                    {journal.society.website_url && (
                      <a
                        href={journal.society.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-500 flex items-center gap-1 mt-1"
                      >
                        Visit website
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Journal Details */}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Journal Information
              </h3>
              <dl className="space-y-3 text-sm">
                {journal.issn_print && (
                  <div>
                    <dt className="font-medium text-gray-900">ISSN (Print)</dt>
                    <dd className="text-gray-600">{journal.issn_print}</dd>
                  </div>
                )}
                {journal.issn_online && (
                  <div>
                    <dt className="font-medium text-gray-900">ISSN (Online)</dt>
                    <dd className="text-gray-600">{journal.issn_online}</dd>
                  </div>
                )}
                {journal.e_issn && (
                  <div>
                    <dt className="font-medium text-gray-900">eISSN</dt>
                    <dd className="text-gray-600">{journal.e_issn}</dd>
                  </div>
                )}
                {journal.peer_review_type && (
                  <div>
                    <dt className="font-medium text-gray-900">Peer Review</dt>
                    <dd className="text-gray-600 capitalize">
                      {journal.peer_review_type.replace("_", " ")}
                    </dd>
                  </div>
                )}
                {journal.views_count > 0 && (
                  <div>
                    <dt className="font-medium text-gray-900">Views</dt>
                    <dd className="text-gray-600">
                      {journal.views_count.toLocaleString()}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Quick Links
              </h3>
              <div className="space-y-2">
                {journal.website_url && (
                  <a
                    href={journal.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    <GlobeAltIcon className="h-5 w-5" />
                    Journal Website
                  </a>
                )}
                {journal.email && (
                  <a
                    href={`mailto:${journal.email}`}
                    className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    <EnvelopeIcon className="h-5 w-5" />
                    Contact Journal
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
