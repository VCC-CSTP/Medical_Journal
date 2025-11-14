import React from "react";
import { useHomeStats } from "../hooks/useHomeStats";
import {
  BookOpenIcon,
  DocumentTextIcon,
  AcademicCapIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

export const StatsSection = () => {
  const { stats, loading, error } = useHomeStats();

  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-b from-gray-50 to-white py-15 sm:py-15">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              By the Numbers
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Building the future of Philippine medical publishing
            </p>
          </div>
          <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200"
              >
                <div className="animate-pulse">
                  <div className="h-12 w-12 bg-gray-200 rounded-full mb-4"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    );
  }

  // Error state (still show the layout with zeros or cached data)
  const displayStats = error
    ? [
        {
          id: 1,
          name: "Medical Journals",
          value: "0",
          icon: BookOpenIcon,
          color: "indigo",
        },
        {
          id: 2,
          name: "Published Resources",
          value: "0",
          icon: DocumentTextIcon,
          color: "blue",
        },
        {
          id: 3,
          name: "Peer Reviewers",
          value: "0",
          icon: AcademicCapIcon,
          color: "purple",
        },
        {
          id: 4,
          name: "Editorial Team",
          value: "0",
          icon: UserGroupIcon,
          color: "pink",
        },
      ]
    : [
        {
          id: 1,
          name: "Medical Journals",
          value: stats.journals.toLocaleString(),
          icon: BookOpenIcon,
          color: "indigo",
          description: "Active journals in our database",
        },
        {
          id: 2,
          name: "Published Resources",
          value: stats.resources.toLocaleString(),
          icon: DocumentTextIcon,
          color: "blue",
          description: "Research articles and publications",
        },
        {
          id: 3,
          name: "Peer Reviewers",
          value: stats.peerReviewers.toLocaleString(),
          icon: AcademicCapIcon,
          color: "purple",
          description: "Expert reviewers in our network",
        },
        {
          id: 4,
          name: "Editorial Team",
          value: stats.editors.toLocaleString(),
          icon: UserGroupIcon,
          color: "pink",
          description: "Editors and editorial board members",
        },
      ];

  // Color schemes for each stat
  const colorSchemes = {
    indigo: {
      bg: "bg-indigo-50",
      icon: "text-indigo-600",
      ring: "ring-indigo-100",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      ring: "ring-blue-100",
    },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      ring: "ring-purple-100",
    },
    pink: {
      bg: "bg-pink-50",
      icon: "text-pink-600",
      ring: "ring-pink-100",
    },
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-15 sm:py-15">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            By the Numbers
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Building the future of Philippine medical publishing
          </p>
        </div>

        {/* Stats Grid */}
        <dl className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {displayStats.map((stat) => {
            const colors = colorSchemes[stat.color];
            const IconComponent = stat.icon;

            return (
              <div
                key={stat.id}
                className="group relative flex flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-md hover:ring-gray-300"
              >
                {/* Icon */}
                <div
                  className={`mb-4 rounded-full ${colors.bg} p-3 ring-8 ${colors.ring} transition-transform group-hover:scale-110`}
                >
                  <IconComponent className={`h-8 w-8 ${colors.icon}`} />
                </div>

                {/* Value */}
                <dd className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                  {stat.value}
                </dd>

                {/* Label */}
                <dt className="mt-2 text-base font-semibold text-gray-900">
                  {stat.name}
                </dt>

                {/* Description (optional, shown on hover) */}
                {stat.description && (
                  <p className="mt-2 text-sm text-center text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {stat.description}
                  </p>
                )}
              </div>
            );
          })}
        </dl>

        {/* Error Message (if any) */}
        {error && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Statistics temporarily unavailable. Please refresh the page.
            </p>
          </div>
        )}

        {/* Call to Action */}
        {!error && stats.journals > 0 && (
          <div className="mt-16 text-center">
            <p className="text-base text-gray-600 mb-4">
              Join our growing community of medical professionals and
              researchers
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="/journals/browse"
                className="rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors"
              >
                Browse Journals
              </a>
              <a
                href="/about"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
              >
                Learn More
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
