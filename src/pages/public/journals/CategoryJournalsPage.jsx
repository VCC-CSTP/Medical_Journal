import React from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useJournals, useJournalCategories } from "../../../hooks/UseJournals";
import { FunnelIcon } from "@heroicons/react/24/outline";

export const CategoryJournalsPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { journals, loading, error } = useJournals({
    category: category || null,
    status: "active",
  });
  const { categories, loading: categoriesLoading } = useJournalCategories();

  const handleCategoryChange = (newCategory) => {
    if (newCategory) {
      navigate(`/journals/category/${newCategory}`);
    } else {
      navigate("/journals/browse");
    }
  };

  if (loading || categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading journals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error loading journals</p>
          <p className="text-gray-600 mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        {/* Header Section  Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/journals" className="hover:text-gray-700">
              Journals
            </Link>
            <span>/</span>
            <Link to="/journals/browse" className="hover:text-gray-700">
              Browse
            </Link>
            {category && (
              <>
                <span>/</span>
                <span className="text-gray-900 font-medium capitalize">
                  {category}
                </span>
              </>
            )}
          </div>

          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl capitalize">
            {category ? `${category} Journals` : "Browse by Category"}
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            {category
              ? `Showing ${journals.length} journal${
                  journals.length !== 1 ? "s" : ""
                } in ${category}`
              : "Select a category to explore journals"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Categories
                </h2>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !category
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  All Categories
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between ${
                      category === cat.name
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span className="capitalize">{cat.name}</span>
                    <span className="text-xs text-gray-500">{cat.count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content - Journals */}
          <div className="lg:col-span-3">
            {journals.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200 p-12 text-center">
                <p className="text-gray-500 mb-4">
                  No journals found in this category.
                </p>
                <button
                  onClick={() => handleCategoryChange(null)}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  View all journals
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {journals.map((journal) => (
                  <Link
                    key={journal.id}
                    to={journal.href}
                    className="block bg-white rounded-xl shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md hover:ring-gray-300 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row">
                      {/* Journal Image */}
                      <div className="relative sm:w-64 sm:flex-shrink-0">
                        <img
                          src={journal.imageUrl}
                          alt={journal.title}
                          className="h-48 w-full object-cover sm:h-full"
                        />
                        {journal.isFeatured && (
                          <div className="absolute top-4 right-4">
                            <span className="inline-flex items-center rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                              Featured
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Journal Content */}
                      <div className="flex-1 p-6">
                        {/* Category Badge */}
                        <div className="mb-3">
                          <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                            {journal.category.title}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-semibold text-gray-900 hover:text-indigo-600 mb-2">
                          {journal.title}
                        </h3>

                        {/* Description */}
                        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                          {journal.description}
                        </p>

                        {/* Metadata */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mb-4">
                          {journal.issn && <span>ISSN: {journal.issn}</span>}
                          {journal.language && (
                            <span>• {journal.language}</span>
                          )}
                          {journal.frequency && (
                            <span>• {journal.frequency}</span>
                          )}
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

                        {/* Publisher */}
                        <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                          {journal.publisherLogo && (
                            <img
                              src={journal.publisherLogo}
                              alt={journal.publisher}
                              className="h-6 w-6 rounded object-contain"
                            />
                          )}
                          <span className="text-sm font-medium text-gray-700">
                            {journal.publisher}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
