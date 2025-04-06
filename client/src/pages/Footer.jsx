// import React from 'react'
import { FaCopyright } from "react-icons/fa";

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
        <div className="text-xs text-gray-400 mt-1 md:mt-0">
          EventoEMS - Event Management System
        </div>
      </div>
    </footer>
  );
}
