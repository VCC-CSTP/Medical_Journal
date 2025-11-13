// src/components/Header2.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import ConnectDatabase from "../lib/ConnectDatabase";

export const Header2 = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Check authentication status
  useEffect(() => {
    checkUser();

    // Listen for auth changes
    const { data: authListener } = ConnectDatabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      const {
        data: { user },
      } = await ConnectDatabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error("Error checking user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  const toggleDropdown = (menu) => {
    setActiveDropdown(activeDropdown === menu ? null : menu);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setActiveDropdown(null);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top Section - Logo and Search */}
        <div className="flex items-center justify-between py-4 gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 shrink-0">
            <div className="size-20 bg-primary flex items-center justify-center">
              <img
                src="/src/assets/central-logo.svg"
                alt="CENTRAL Logo"
                className="w-32 h-32 mb-2"
              />
            </div>
          </Link>

          {/* Center Search Box */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search journals, articles, authors..."
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-full 
                                outline-none ring-primary/50 focus:ring-2 focus:border-transparent
                                transition-all duration-200"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 
                                text-gray-500 hover:text-primary transition-colors"
                aria-label="Search"
              >
                <MagnifyingGlassIcon className="size-5" />
              </button>
            </div>
          </form>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-primary transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <XMarkIcon className="size-6" />
            ) : (
              <Bars3Icon className="size-6" />
            )}
          </button>
        </div>

        {/* Navigation Menu - Desktop */}
        <nav
          className="hidden lg:block border-t border-gray-200"
          ref={dropdownRef}
        >
          <ul className="flex items-center justify-center gap-1 py-0 text-xs xl:text-sm">
            {/* HOME */}
            <li>
              <Link
                to="/"
                className="block px-4 py-3 text-gray-700 hover:text-primary 
                                hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                HOME
              </Link>
            </li>

            {/* ABOUT US */}
            <li>
              <Link
                to="/about"
                className="block px-4 py-3 text-gray-700 hover:text-primary 
                                hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                ABOUT US
              </Link>
            </li>

            {/* PAMJE */}
            <li>
              <Link
                to="/pamje"
                className="block px-4 py-3 text-gray-700 hover:text-primary 
                                hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                PAMJE
              </Link>
            </li>

            {/* JOURNALS - Dropdown */}
            <li className="relative">
              <button
                onClick={() => toggleDropdown("journals")}
                className="flex items-center px-4 py-3 text-gray-700 hover:text-primary 
                                hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                JOURNALS
                <ChevronDownIcon
                  className={`size-4 ml-1 transition-transform duration-200 
                                ${
                                  activeDropdown === "journals"
                                    ? "rotate-180"
                                    : ""
                                }`}
                />
              </button>
              {activeDropdown === "journals" && (
                <div
                  className="absolute top-full start-0 mt-0 w-56 bg-white shadow-dropdown 
                                    rounded-b-lg border border-gray-200 py-2 animate-fade-in"
                >
                  <Link
                    to="/journals"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                    hover:text-primary transition-colors"
                  >
                    All Journals
                  </Link>
                  <Link
                    to="/journals/browse"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                    hover:text-primary transition-colors"
                  >
                    Browse by Category
                  </Link>
                  <Link
                    to="/journals/featured"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                    hover:text-primary transition-colors"
                  >
                    Featured Journals
                  </Link>
                  {/* <Link
                    to="/journals/category"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                    hover:text-primary transition-colors"
                  >
                    Category Journals
                  </Link> 
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link
                    to="/journals/submit"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-4 py-2 text-primary font-medium hover:bg-blue-50 
                                    transition-colors"
                  >
                    Submit a Journal
                  </Link>*/}
                </div>
              )}
            </li>

            {/* RESOURCES - Dropdown */}
            <li className="relative">
              <button
                onClick={() => toggleDropdown("resources")}
                className="flex items-center px-4 py-3 text-gray-700 hover:text-primary 
                                hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                RESOURCES
                <ChevronDownIcon
                  className={`size-4 ml-1 transition-transform duration-200 
                                ${
                                  activeDropdown === "resources"
                                    ? "rotate-180"
                                    : ""
                                }`}
                />
              </button>
              {activeDropdown === "resources" && (
                <div
                  className="absolute top-full start-0 mt-0 w-56 bg-white shadow-dropdown 
                                    rounded-b-lg border border-gray-200 py-2 animate-fade-in"
                >
                  <Link
                    to="/resources/editors"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                    hover:text-primary transition-colors"
                  >
                    For Editors
                  </Link>
                  <Link
                    to="/resources/researchers"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                    hover:text-primary transition-colors"
                  >
                    For Researchers
                  </Link>
                  <Link
                    to="/resources/guidelines"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                    hover:text-primary transition-colors"
                  >
                    Publishing Guidelines
                  </Link>
                  <Link
                    to="/resources/templates"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                    hover:text-primary transition-colors"
                  >
                    Templates & Forms
                  </Link>
                  <Link
                    to="/resources/faq"
                    onClick={() => setActiveDropdown(null)}
                    className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                    hover:text-primary transition-colors"
                  >
                    FAQ
                  </Link>
                </div>
              )}
            </li>

            {/* NEWS & ANNOUNCEMENTS */}
            <li>
              <Link
                to="/news"
                className="block px-4 py-3 text-gray-700 hover:text-primary 
                                hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                NEWS & ANNOUNCEMENTS
              </Link>
            </li>

            {/* CONTACT US */}
            <li>
              <Link
                to="/contact"
                className="block px-4 py-3 text-gray-700 hover:text-primary 
                                hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                CONTACT US
              </Link>
            </li>

            {/* Conditional Menu Items - Desktop */}
            {!loading && (
              <>
                {!user ? (
                  <>
                    {/* This should show up only when NOT logged in */}

                    {/* Divider */}
                    <li className="h-8 w-px bg-gray-300 mx-2"></li>

                    {/* LOG IN */}
                    <li>
                      <Link
                        to="/login"
                        className="block px-4 py-3 text-gray-700 hover:text-primary 
                                hover:bg-blue-50 transition-all duration-200 font-medium"
                      >
                        LOG IN
                      </Link>
                    </li>

                    {/* REGISTER */}
                    <li>
                      <Link
                        to="/register"
                        className="block px-4 py-2 mx-2 bg-primary text-white rounded-lg 
                                hover:bg-primary-hover transition-all duration-200 font-medium"
                      >
                        REGISTER
                      </Link>
                    </li>

                    {/* This should show up only when NOT logged in */}
                  </>
                ) : (
                  <>
                    {/* This should show up only when logged in */}

                    {/* Divider */}
                    <li className="h-8 w-px bg-gray-300 mx-2"></li>

                    {/* ACCOUNT - This should have access to user UID and loads a public profile edit page */}
                    <li>
                      <Link
                        to="/user-account"
                        className="block px-4 py-3 text-gray-700 hover:text-primary 
                                hover:bg-blue-50 transition-all duration-200 font-medium"
                      >
                        ACCOUNT
                      </Link>
                    </li>

                    {/* LOGOUT */}
                    <li>
                      <Link
                        to="/logout"
                        className="block px-4 py-3 text-gray-700 hover:text-primary 
                                hover:bg-blue-50 transition-all duration-200 font-medium"
                      >
                        LOGOUT
                      </Link>
                    </li>

                    {/* This should show up only when logged in */}
                  </>
                )}
              </>
            )}
          </ul>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden border-t border-gray-200">
            <ul className="flex flex-col gap-2 py-4">
              <li>
                <Link
                  to="/"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                hover:text-primary transition-colors rounded"
                >
                  HOME
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                hover:text-primary transition-colors rounded"
                >
                  ABOUT US
                </Link>
              </li>
              <li>
                <Link
                  to="/pamje"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                hover:text-primary transition-colors rounded"
                >
                  PAMJE
                </Link>
              </li>

              {/* JOURNALS - Mobile Dropdown */}
              <li>
                <button
                  onClick={() => toggleDropdown("journals-mobile")}
                  className="w-full flex items-center justify-between px-4 py-2 
                                text-gray-700 hover:bg-blue-50 hover:text-primary 
                                transition-colors rounded"
                >
                  JOURNALS
                  <ChevronDownIcon
                    className={`size-4 transition-transform duration-200 
                                    ${
                                      activeDropdown === "journals-mobile"
                                        ? "rotate-180"
                                        : ""
                                    }`}
                  />
                </button>
                {activeDropdown === "journals-mobile" && (
                  <ul className="ms-4 mt-2 flex flex-col gap-2 border-s-2 border-primary ps-4">
                    <li>
                      <Link
                        to="/journals"
                        onClick={closeMenu}
                        className="block py-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        All Journals
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/journals/browse"
                        onClick={closeMenu}
                        className="block py-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        Browse by Category
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/journals/featured"
                        onClick={closeMenu}
                        className="block py-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        Featured Journals
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/journals/indexed"
                        onClick={closeMenu}
                        className="block py-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        Indexed Journals
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/journals/submit"
                        onClick={closeMenu}
                        className="block py-2 text-primary font-medium hover:underline"
                      >
                        Submit a Journal
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* RESOURCES - Mobile Dropdown */}
              <li>
                <button
                  onClick={() => toggleDropdown("resources-mobile")}
                  className="w-full flex items-center justify-between px-4 py-2 
                                text-gray-700 hover:bg-blue-50 hover:text-primary 
                                transition-colors rounded"
                >
                  RESOURCES
                  <ChevronDownIcon
                    className={`size-4 transition-transform duration-200 
                                    ${
                                      activeDropdown === "resources-mobile"
                                        ? "rotate-180"
                                        : ""
                                    }`}
                  />
                </button>
                {activeDropdown === "resources-mobile" && (
                  <ul className="ms-4 mt-2 flex flex-col gap-2 border-s-2 border-primary ps-4">
                    <li>
                      <Link
                        to="/resources/editors"
                        onClick={closeMenu}
                        className="block py-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        For Editors
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/resources/researchers"
                        onClick={closeMenu}
                        className="block py-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        For Researchers
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/resources/guidelines"
                        onClick={closeMenu}
                        className="block py-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        Publishing Guidelines
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/resources/templates"
                        onClick={closeMenu}
                        className="block py-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        Templates & Forms
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/resources/faq"
                        onClick={closeMenu}
                        className="block py-2 text-gray-600 hover:text-primary transition-colors"
                      >
                        FAQ
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <Link
                  to="/news"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                hover:text-primary transition-colors rounded"
                >
                  NEWS & ANNOUNCEMENTS
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  onClick={closeMenu}
                  className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                hover:text-primary transition-colors rounded"
                >
                  CONTACT US
                </Link>
              </li>

              {/* Conditional Menu Items - Mobile */}
              {!loading && (
                <>
                  {/* Divider */}
                  <li className="border-t border-gray-200 my-2"></li>

                  {!user ? (
                    <>
                      {/* Show when NOT logged in */}
                      <li>
                        <Link
                          to="/login"
                          onClick={closeMenu}
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                hover:text-primary transition-colors rounded"
                        >
                          LOG IN
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/register"
                          onClick={closeMenu}
                          className="block px-4 py-2 mx-4 bg-primary text-white rounded-lg 
                                hover:bg-primary-hover transition-colors text-center font-medium"
                        >
                          REGISTER
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      {/* Show when logged in */}

                      <li>
                        <Link
                          to="/user-account"
                          onClick={closeMenu}
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                hover:text-primary transition-colors rounded"
                        >
                          ACCOUNT
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/logout"
                          onClick={closeMenu}
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                hover:text-primary transition-colors rounded"
                        >
                          LOGOUT
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/peer-reviewers"
                          onClick={closeMenu}
                          className="block px-4 py-2 text-gray-700 hover:bg-blue-50 
                                hover:text-primary transition-colors rounded"
                        >
                          REVIEWERS
                        </Link>
                      </li>
                    </>
                  )}
                </>
              )}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};
