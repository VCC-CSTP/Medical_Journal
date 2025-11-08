import { useEffect, useState } from "react";
import { ConnectDatabase } from "../../lib/ConnectDatabase";
import { Link } from "react-router-dom";
import {
  NewspaperIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

export const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalJournals: 0,
    activeJournals: 0,
    totalOrganizations: 0,
    totalPeople: 0,
    totalIndexingServices: 0,
    recentJournals: [],
    loading: true,
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  async function fetchDashboardStats() {
    try {
      // Fetch journals count
      const { count: journalsCount } = await ConnectDatabase.from("journals")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);

      // Fetch active journals count
      const { count: activeCount } = await ConnectDatabase.from("journals")
        .select("*", { count: "exact", head: true })
        .eq("status", "active")
        .is("deleted_at", null);

      // Fetch organizations count
      const { count: orgsCount } = await ConnectDatabase.from(
        "organizations"
      ).select("*", { count: "exact", head: true });

      // Fetch people count
      const { count: peopleCount } = await ConnectDatabase.from("people")
        .select("*", { count: "exact", head: true })
        .is("deleted_at", null);

      // Fetch indexing services count
      const { count: indexingCount } = await ConnectDatabase.from(
        "indexing_services"
      ).select("*", { count: "exact", head: true });

      // Fetch recent journals
      const { data: recentJournals } = await ConnectDatabase.from("journals")
        .select(
          `
          id,
          full_title,
          short_title,
          status,
          created_at,
          publisher:organizations!publisher_org_id(org_name)
        `
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(5);

      setStats({
        totalJournals: journalsCount || 0,
        activeJournals: activeCount || 0,
        totalOrganizations: orgsCount || 0,
        totalPeople: peopleCount || 0,
        totalIndexingServices: indexingCount || 0,
        recentJournals: recentJournals || [],
        loading: false,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setStats((prev) => ({ ...prev, loading: false }));
    }
  }

  if (stats.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  const statCards = [
    {
      name: "Total Journals",
      value: stats.totalJournals,
      subtext: `${stats.activeJournals} active`,
      icon: NewspaperIcon,
      color: "bg-blue-500",
      link: "/adm/journals",
    },
    {
      name: "Organizations",
      value: stats.totalOrganizations,
      subtext: "Publishers & Societies",
      icon: BuildingOfficeIcon,
      color: "bg-green-500",
      link: "/adm/organizations",
    },
    {
      name: "People",
      value: stats.totalPeople,
      subtext: "Editors & Contributors",
      icon: UserGroupIcon,
      color: "bg-purple-500",
      link: "/adm/people",
    },
    {
      name: "Indexing Services",
      value: stats.totalIndexingServices,
      subtext: "Database services",
      icon: GlobeAltIcon,
      color: "bg-orange-500",
      link: "/adm/indexing",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-sm text-gray-600">
            Welcome to the PAMJE Journal Management System
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {statCards.map((stat) => (
            <Link
              key={stat.name}
              to={stat.link}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                      </dd>
                      <dd className="text-sm text-gray-500">{stat.subtext}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              to="/adm/journals/create"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Add Journal
            </Link>
            <Link
              to="/adm/organizations/create"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
            >
              Add Organization
            </Link>
            <Link
              to="/adm/people/create"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              Add Person
            </Link>
            <Link
              to="/adm/announcements/create"
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
            >
              Add Announcement
            </Link>
          </div>
        </div>

        {/* Recent Journals */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              Recently Added Journals
            </h2>
          </div>
          <ul className="divide-y divide-gray-200">
            {stats.recentJournals.length === 0 ? (
              <li className="px-6 py-4 text-sm text-gray-500">
                No journals added yet.
              </li>
            ) : (
              stats.recentJournals.map((journal) => (
                <li key={journal.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link
                        to={`/adm/journals/${journal.id}/edit`}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        {journal.full_title}
                      </Link>
                      {journal.publisher && (
                        <p className="text-sm text-gray-500">
                          Publisher: {journal.publisher.org_name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          journal.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {journal.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(journal.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
          {stats.recentJournals.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <Link
                to="/adm/journals"
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                View all journals →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
