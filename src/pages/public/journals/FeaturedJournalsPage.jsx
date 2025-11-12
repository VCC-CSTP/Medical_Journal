import React from "react";
import { Link } from "react-router-dom";
import { useJournals } from "../../hooks/useJournals";
import { StarIcon } from "@heroicons/react/24/solid";

export const FeaturedJournalsPage = () => {
  const { journals, loading, error } = useJournals({
    featuredOnly: true,
    status: "active",
    sortBy: "views_count",
    ascending: false,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading featured journals...</p>
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
        {/* Header Section sync */}
        <div className="mx-auto max-w-2xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <StarIcon className="h-8 w-8 text-yellow-500" />
            <h2 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
              Featured Journals
            </h2>
          </div>
          <p className="mt-2 text-lg text-gray-600">
            Discover the most prominent medical journals in the Philippines
          </p>
        </div>

        {/* No Featured Journals Message */}
        {journals.length === 0 ? (
          <div className="mt-16 text-center">
            <p className="text-gray-500">No featured journals at the moment.</p>
            <Link
              to="/journals/browse"
              className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
            >
              Browse all journals →
            </Link>
          </div>
        ) : (
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
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-50 px-3 py-1.5 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                      <StarIcon className="h-4 w-4" />
                      Featured
                    </span>
                  </div>
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
                      className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                    >
                      {journal.category.title}
                    </Link>
                  </div>

                  {/* Title and Description */}
                  <div className="group relative grow">
                    <h3 className="mt-3 text-lg font-semibold text-gray-900 group-hover:text-gray-600 line-clamp-2">
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
                    {journal.publisherLogo && (
                      <img
                        src={journal.publisherLogo}
                        alt={journal.publisher}
                        className="h-10 w-10 rounded-full bg-gray-100 object-contain p-1"
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

                  {/* Stats */}
                  <div className="mt-4 flex items-center gap-4 text-xs text-gray-500">
                    {journal.viewsCount > 0 && (
                      <span>{journal.viewsCount.toLocaleString()} views</span>
                    )}
                    {journal.isIndexed && (
                      <span className="inline-flex items-center gap-1">
                        <svg
                          className="h-3 w-3 text-green-500"
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
                </div>
              </article>
            ))}
          </div>
        )}

        {/* View All Link */}
        {journals.length > 0 && (
          <div className="mt-16 text-center">
            <Link
              to="/journals/browse"
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Browse all journals <span aria-hidden="true">→</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
