import React from "react";
import { Link } from "react-router-dom";
import { useJournals } from "../../../hooks/UseJournals";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

export const BrowseJournalsPage = () => {
  const { journals, loading, error } = useJournals({
    status: "active",
    sortBy: "full_title",
    ascending: true,
  });

  const [searchTerm, setSearchTerm] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("all");

  // Get unique categories sync
  const categories = React.useMemo(() => {
    const cats = new Set();
    journals.forEach((journal) => {
      if (journal.category?.title) {
        cats.add(journal.category.title);
      }
    });
    return ["all", ...Array.from(cats)].sort();
  }, [journals]);

  // Filter journals based on search and category
  const filteredJournals = React.useMemo(() => {
    return journals.filter((journal) => {
      const matchesSearch =
        searchTerm === "" ||
        journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        journal.publisher.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" ||
        journal.category?.title === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [journals, searchTerm, selectedCategory]);

  if (loading) {
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
    <div className="bg-white min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        {/* Header Section */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
            Browse Medical Journals
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Explore {journals.length} Philippine medical journals
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="mb-12 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search journals by title, description, or publisher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-lg border-0 py-3 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-gray-600">
          Showing {filteredJournals.length} of {journals.length} journals
        </div>

        {/* Journals Grid */}
        {filteredJournals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No journals found matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredJournals.map((journal) => (
              <Link
                key={journal.id}
                to={journal.href}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-gray-300"
              >
                {/* Journal Cover Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <img
                    src={journal.imageUrl}
                    alt={journal.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
                <div className="flex flex-1 flex-col p-6">
                  {/* Category Badge */}
                  <div className="mb-3">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                      {journal.category.title}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 line-clamp-2 mb-2">
                    {journal.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                    {journal.description}
                  </p>

                  {/* Publisher Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 border-t border-gray-100 pt-4">
                    {journal.publisherLogo && (
                      <img
                        src={journal.publisherLogo}
                        alt={journal.publisher}
                        className="h-6 w-6 rounded object-contain"
                      />
                    )}
                    <span className="font-medium">{journal.publisher}</span>
                  </div>

                  {/* Metadata */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-500">
                    {journal.issn && <span>ISSN: {journal.issn}</span>}
                    {journal.language && <span>• {journal.language}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
