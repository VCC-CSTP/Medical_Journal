import React from "react";
import { Link } from "react-router-dom";
import { useJournals } from "../hooks/UseJournals";
import { StarIcon } from "@heroicons/react/24/solid";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export const FeaturedJournalsSection = () => {
  const { journals, loading, error } = useJournals({
    featuredOnly: true,
    status: "active",
    sortBy: "created_at",
    ascending: false,
    limit: 3,
  });

  if (loading) {
    return (
      <div className="bg-white py-10 sm:py-15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Featured Journals
            </h2>
          </div>
          <div className="mx-auto mt-16 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading featured journals...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-10 sm:py-15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Featured Journals
            </h2>
            <p className="mt-4 text-gray-600">
              Unable to load featured journals at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-10 sm:py-15">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <StarIcon className="h-8 w-8 text-yellow-500" />
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              Featured Journals
            </h2>
          </div>
          <p className="mt-2 text-lg text-gray-600">
            Discover the latest featured medical journals from the Philippines
          </p>
        </div>

        {/* Journals Grid */}
        {journals.length === 0 ? (
          <div className="mx-auto mt-16 max-w-2xl text-center">
            <p className="text-gray-500">
              No featured journals available at the moment.
            </p>
            <Link
              to="/journals/browse"
              className="mt-4 inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Browse all journals
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <>
            <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
              {journals.map((journal) => (
                <article
                  key={journal.id}
                  className="flex flex-col items-start justify-between"
                >
                  {/* Journal Image */}
                  <div className="relative w-full">
                    <img
                      src={journal.imageUrl}
                      alt={journal.title}
                      className="aspect-video w-full rounded-2xl bg-gray-100 object-cover sm:aspect-[2/1] lg:aspect-[3/2]"
                    />
                    <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10" />

                    {/* Featured Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20 shadow-sm">
                        <StarIcon className="h-4 w-4" />
                        Featured
                      </span>
                    </div>

                    {/* Indexed Badge (if applicable) */}
                    {journal.isIndexed && (
                      <div className="absolute top-4 right-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20 shadow-sm">
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
                      </div>
                    )}
                  </div>

                  {/* Journal Content */}
                  <div className="flex max-w-xl grow flex-col justify-between">
                    {/* Metadata */}
                    <div className="mt-8 flex items-center gap-x-4 text-xs">
                      <span className="text-gray-500">
                        {journal.language || "English"}
                      </span>
                      <Link
                        to={journal.category.href}
                        className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        {journal.category.title}
                      </Link>
                    </div>

                    {/* Title and Description */}
                    <div className="group relative grow">
                      <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-2 transition-colors">
                        <Link to={journal.href}>
                          <span className="absolute inset-0" />
                          {journal.title}
                        </Link>
                      </h3>
                      <p className="mt-5 line-clamp-3 text-sm text-gray-600">
                        {journal.description}
                      </p>
                    </div>

                    {/* Publisher Info */}
                    <div className="relative mt-8 flex items-center gap-x-4">
                      {journal.publisherLogo ? (
                        <img
                          src={journal.publisherLogo}
                          alt={journal.publisher}
                          className="h-10 w-10 rounded-full bg-gray-100 object-contain p-1"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center">
                          <span className="text-indigo-600 font-semibold text-sm">
                            {journal.publisher?.charAt(0) || "J"}
                          </span>
                        </div>
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

                    {/* Stats Footer */}
                    {(journal.viewsCount > 0 ||
                      journal.issn ||
                      journal.frequency) && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500 pt-4 border-t border-gray-100">
                        {journal.viewsCount > 0 && (
                          <span className="flex items-center gap-1">
                            <svg
                              className="h-3 w-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            {journal.viewsCount.toLocaleString()}
                          </span>
                        )}
                        {journal.issn && <span>ISSN: {journal.issn}</span>}
                        {journal.frequency && <span>{journal.frequency}</span>}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* View All Link */}
            <div className="mt-16 text-center">
              <Link
                to="/journals/featured"
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                View all featured journals
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
