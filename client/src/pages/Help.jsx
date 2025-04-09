import React, { useContext } from "react";
import EventChat from "../components/EventChat";
import { ThemeContext } from "../ThemeContext";

const Help = () => {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div
      className={`min-h-screen w-full ${darkMode ? "bg-gray-900" : "bg-white"}`}
    >
      <EventChat />
    </div>
  );
};

export default Help;
