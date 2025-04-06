import Footer from "./pages/Footer";
import Header from "./pages/Header";
import { Outlet } from "react-router-dom";
import { useContext } from "react";
import { ThemeContext } from "./ThemeContext";

export default function Layout() {
  const { darkMode } = useContext(ThemeContext);

  return (
    <div
      className={`flex flex-col min-h-screen ${
        darkMode ? "bg-dark-background text-dark-text" : ""
      }`}
    >
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}
