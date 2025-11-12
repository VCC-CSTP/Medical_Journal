import { Outlet } from "react-router-dom";
import { useEffect } from "react";

export const AdminLayout = () => {
  useEffect(() => {
    // Add h-full classes for admin backend only
    document.documentElement.classList.add("h-full", "bg-gray-50");
    document.body.classList.add("h-full");

    // Cleanup when leaving admin area
    return () => {
      document.documentElement.classList.remove("h-full", "bg-gray-50");
      document.body.classList.remove("h-full");
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                <a href="/adm">Admin Dashboard</a>
              </h1>
            </div>
            <nav className="flex items-center gap-4">
              <a
                href="people/pending-approvals"
                className="text-sm text-gray-600 hover:text-gray-900 border-2 border-amber-500 p-1 rounded-md"
                target="_blank"
              >
                Pending Approvals
              </a>
              <a
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 border-2 border-green-500 p-1 rounded-md"
                target="_blank"
              >
                View Site
              </a>
              <a
                href="/logout"
                className="text-sm text-gray-600 hover:text-gray-900 border-2 border-orange-500 p-1 rounded-md"
                target="_blank"
              >
                Log Out
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Admin Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Admin Panel. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
