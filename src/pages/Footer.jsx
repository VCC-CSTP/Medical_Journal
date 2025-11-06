import React from "react";
// src/components/Footer.jsx
import { Link } from 'react-router-dom'
import { 
  PhoneIcon, 
  DevicePhoneMobileIcon, 
  PrinterIcon,
  MapPinIcon 
} from '@heroicons/react/24/outline'

export const Footer = () => {
  return (
    <footer className="bg-footer-blue text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo Section */}
          <div className="lg:col-span-1">
            <div className="flex flex-col items-start">
              <Link to="/" className="block">
                <img
                  src="/src/assets/logo-central-white.png"
                  alt="CENTRAL Logo"
                  className="w-32 h-32 mb-2"
                />

              </Link>
            </div>
          </div>

          {/* About Us */}
          <div>
            <h4 className="text-xl font-semibold mb-4">About Us</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/pamje"
                  className="hover:text-blue-300 transition-colors block"
                >
                  PAMJE
                </Link>
              </li>
              <li>
                <Link
                  to="/team-central"
                  className="hover:text-blue-300 transition-colors block"
                >
                  Team Central
                </Link>
              </li>
              <li>
                <Link
                  to="/sponsor"
                  className="hover:text-blue-300 transition-colors block"
                >
                  Sponsor
                </Link>
              </li>
            </ul>
          </div>

          {/* Journals */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Journals</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/journals/alphabetical"
                  className="hover:text-blue-300 transition-colors block"
                >
                  Alphabetical
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Resources</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/resources/editors"
                  className="hover:text-blue-300 transition-colors block"
                >
                  For Editors
                </Link>
              </li>
              <li>
                <Link
                  to="/resources/researchers"
                  className="hover:text-blue-300 transition-colors block"
                >
                  For Researchers
                </Link>
              </li>
              <li>
                <Link
                  to="/resources/authors"
                  className="hover:text-blue-300 transition-colors block"
                >
                  For Authors
                </Link>
              </li>
              <li>
                <Link
                  to="/resources/peer-reviewers"
                  className="hover:text-blue-300 transition-colors block"
                >
                  for Peer Reviewers
                </Link>
              </li>
            </ul>
          </div>

          {/* Announcement */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Announcement</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/announcements/recent"
                  className="hover:text-blue-300 transition-colors block"
                >
                  What happened recently?
                </Link>
              </li>
              <li>
                <Link
                  to="/announcements/archives"
                  className="hover:text-blue-300 transition-colors block"
                >
                  Archives
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xl font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="https://m.me/yourpage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-blue-300 transition-colors flex items-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.477 2 2 6.145 2 11.243c0 2.898 1.445 5.482 3.707 7.161V22l3.493-1.92c.932.257 1.917.395 2.8.395 5.523 0 10-4.145 10-9.243C22 6.145 17.523 2 12 2zm.993 12.464l-2.548-2.717-4.973 2.717 5.467-5.798 2.61 2.717 4.912-2.717-5.468 5.798z" />
                  </svg>
                  Fb messenger
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Contact Information Bar */}
      <div className="border-t border-blue-800 bg-[#0a2f4d]">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-sm">
            <div className="flex items-start gap-2">
              <MapPinIcon className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-center md:text-left">
                G/F Administrative Office, Philippine Nurses Association Bldg.
                <br className="hidden md:block" />
                1663 F.T. Benitez St., Brgy. 695, Zone 75, Malate, Manila 1004
                Philippines
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm mt-4">
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-5 h-5" />
              <span>521-0937, 400-4430</span>
            </div>
            <div className="flex items-center gap-2">
              <DevicePhoneMobileIcon className="w-5 h-5" />
              <span>+639552652324 TM/Globe</span>
            </div>
            <div className="flex items-center gap-2">
              <PrinterIcon className="w-5 h-5" />
              <span>525-1596</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#082844] py-3">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-blue-200">
            © {new Date().getFullYear()} Philippine Association of Medical
            Journal Editors (PAMJE). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}