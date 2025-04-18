import React, { useContext, useState, useEffect } from "react";
import EventChat from "../components/EventChat";
import { ThemeContext } from "../ThemeContext";

const Help = () => {
  const { darkMode } = useContext(ThemeContext);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`min-h-screen w-full ${darkMode ? "bg-gray-900" : "bg-white"}`}
    >
      {loading ? (
        <div className="flex flex-col justify-center items-center h-screen">
          <div
            className={`animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 ${
              darkMode ? "border-blue-500" : "border-blue-600"
            }`}
          ></div>
          <p
            className={`mt-4 text-lg font-medium ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Loading Help Center...
          </p>
        </div>
      ) : (
        <EventChat />
      )}
    </div>
  );
};

export default Help;
