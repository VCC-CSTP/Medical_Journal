import React from "react";
import { Link } from "react-router-dom";
import { useJournals } from "../../hooks/useJournals";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const JournalsPage = () => {
  const { journals, loading, error } = useJournals({
    status: "active",
    sortBy: "full_title",
    ascending: true,
  });

  const [searchTerm, setSearchTerm] = React.useState("");

  // Filter journals based on search sync
  const filteredJournals = React.useMemo(() => {
    if (!searchTerm) return journals;

    const searchLower = searchTerm.toLowerCase();
    return journals.filter((journal) => {
      return (
        journal.title.toLowerCase().includes(searchLower) ||
        journal.description.toLowerCase().includes(searchLower) ||
        journal.publisher.toLowerCase().includes(searchLower) ||
        journal.category?.title.toLowerCase().includes(searchLower)
      );
    });
  }, [journals, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading journals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error loading journals</p>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:max-w-4xl">
          {/* Header */}
          <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Philippine Medical Journals
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            A comprehensive directory of {journals.length} medical journals
          </p>

          {/* Search Bar */}
          <div className="mt-8 mb-6">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search journals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Showing {filteredJournals.length} of {journals.length} journals
            </p>
          </div>

          {/* Journals List */}
          {filteredJournals.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No journals found matching "{searchTerm}"
              </p>
            </div>
          ) : (
            <div className="mt-16 space-y-20 lg:mt-20">
              {filteredJournals.map((journal) => (
                <article
                  key={journal.id}
                  className="relative isolate flex flex-col gap-8 lg:flex-row"
                >
                  {/* Journal Image */}
                  <div className="relative aspect-video sm:aspect-[2/1] lg:aspect-square lg:w-64 lg:shrink-0">
                    <img
                      src={journal.imageUrl}
                      alt={journal.title}
                      className="absolute inset-0 h-full w-full rounded-2xl bg-gray-50 object-cover"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                    {journal.isFeatured && (
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                          Featured
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Journal Content */}
                  <div className="flex-1">
                    {/* Metadata */}
                    <div className="flex items-center gap-x-4 text-xs mb-3">
                      <span className="text-gray-500">
                        {journal.language || "English"}
                      </span>
                      <Link
                        to={journal.category.href}
                        className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                      >
                        {journal.category.title}
                      </Link>
                      {journal.isIndexed && (
                        <span className="inline-flex items-center gap-1 text-green-700">
                          <svg
                            className="h-3 w-3"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Indexed
                        </span>
                      )}
                    </div>

                    {/* Title and Description */}
                    <div className="group relative max-w-xl">
                      <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-gray-600">
                        <Link to={journal.href}>
                          <span className="absolute inset-0" />
                          {journal.title}
                        </Link>
                      </h3>
                      <p className="mt-5 text-sm text-gray-600 line-clamp-3">
                        {journal.description}
                      </p>
                    </div>

                    {/* Additional Info */}
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-gray-500">
                      {journal.issn && <span>ISSN: {journal.issn}</span>}
                      {journal.eissn && <span>eISSN: {journal.eissn}</span>}
                      {journal.frequency && <span>• {journal.frequency}</span>}
                      {journal.firstYear && (
                        <span>• Since {journal.firstYear}</span>
                      )}
                    </div>

                    {/* Publisher Info */}
                    <div className="mt-6 flex border-t border-gray-900/5 pt-6">
                      <div className="relative flex items-center gap-x-4">
                        {journal.publisherLogo && (
                          <img
                            src={journal.publisherLogo}
                            alt={journal.publisher}
                            className="h-10 w-10 rounded-full bg-gray-50 object-contain p-1"
                          />
                        )}
                        <div className="text-sm">
                          <p className="font-semibold text-gray-900">
                            {journal.publisher}
                          </p>
                          {journal.society && (
                            <p className="text-gray-600">{journal.society}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Quick Links */}
          <div className="mt-16 border-t border-gray-200 pt-10">
            <h3 className="text-base font-semibold text-gray-900 mb-4">
              Explore More
            </h3>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/journals/browse"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Browse by Category
              </Link>
              <Link
                to="/journals/featured"
                className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Featured Journals
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
