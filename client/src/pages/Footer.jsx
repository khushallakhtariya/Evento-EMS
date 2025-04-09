// import React from 'react'
import { FaCopyright } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bottom-0 w-full">
      <div className="flex justify-center py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md">
        <p className="text-sm font-medium tracking-wide">
          Thank you for visiting our website!
        </p>
      </div>
      <div className="w-full bg-black py-3 flex flex-col md:flex-row justify-between items-center text-white px-6">
        <div className="flex items-center gap-2">
          <FaCopyright className="h-4" aria-label="Copyright" />
          <span className="text-sm">
            {currentYear} Khushal Team Members. All rights reserved.
          </span>
        </div>
        <div className="flex items-center gap-6 mt-2 md:mt-0">
          <Link
            to="/privacy-policy"
            className="text-sm font-medium hover:text-blue-400 transition-colors duration-200 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
              />
            </svg>
            Privacy Policy
          </Link>
          {/* <Link
            to="/terms"
            className="text-sm font-medium hover:text-blue-400 transition-colors duration-200 flex items-center gap-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            Terms of Service
          </Link> */}
          <div className="text-xs text-gray-400">
            EventoEMS - Event Management System
          </div>
        </div>
      </div>
    </footer>
  );
}
