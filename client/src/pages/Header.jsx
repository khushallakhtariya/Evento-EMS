import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { UserContext } from "../UserContext";
import { ThemeContext } from "../ThemeContext";
import { RxExit } from "react-icons/rx";
import { BsFillCaretDownFill, BsMoonFill, BsSunFill } from "react-icons/bs";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Header() {
  const { user, setUser } = useContext(UserContext);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [isMenuOpen, setisMenuOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef();
  const [storedUserData, setStoredUserData] = useState(null);
  //! Fetch events from the server -------------------------------------------------
  useEffect(() => {
    axios
      .get("/events")
      .then((response) => {
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });

    const getUserData = async () => {
      const userDataString = await localStorage.getItem("user");
      const userData = JSON.parse(userDataString);
      setStoredUserData(userData);
    };
    getUserData();
  }, []);

  //! Search bar functionality----------------------------------------------------
  useEffect(() => {
    const handleDocumentClick = (event) => {
      // Check if the clicked element is the search input or its descendant
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setSearchQuery("");
      }
    };

    // Listen for click events on the entire document
    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  //! Logout Function --------------------------------------------------------
  async function logout() {
    try {
      await axios.post("/logout");
      setUser(null);
      localStorage.removeItem("user");
      setStoredUserData(null);
      toast.success("Logged out successfully!");
    } catch (error) {
      toast.error("Failed to log out. Please try again.");
    }
  }
  //! Search input ----------------------------------------------------------------
  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className={darkMode ? "bg-dark-surface text-dark-text" : ""}>
      <ToastContainer />
      <header
        className={`flex py-2 px-6 sm:px-6 justify-between place-items-center ${
          darkMode ? "bg-dark-surface text-dark-text" : ""
        }`}
      >
        <Link
          to={"/"}
          className="flex item-center hover:opacity-80 transition-opacity duration-300"
        >
          <img src="../src/assets/logo.png" alt="" className="w-26 h-9" />
        </Link>
        <div
          className={`flex rounded py-2.5 px-4 w-1/3 gap-4 items-center shadow-md hover:shadow-lg transition-all duration-300 border border-transparent hover:border-gray-200 ${
            darkMode
              ? "bg-dark-surface shadow-gray-800 hover:border-gray-700"
              : "bg-white shadow-gray-200"
          }`}
        >
          <button className="text-gray-400 hover:text-primary transition-colors duration-300">
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
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
          <div ref={searchInputRef} className="w-full">
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchInputChange}
              className={`text-sm outline-none w-full transition-all duration-300 focus:font-medium ${
                darkMode ? "bg-dark-surface text-dark-text" : "text-black"
              }`}
            />
          </div>
          {/* <div className='text-sm text-gray-300 font-semibold'>Search</div> */}
        </div>

        {/* Dark Mode Toggle Button */}
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full transition-all duration-300 flex items-center justify-center hover:scale-110 ${
            darkMode
              ? "bg-gray-700 text-yellow-300 hover:bg-gray-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? <BsSunFill size={20} /> : <BsMoonFill size={20} />}
        </button>

        {/*------------------------- Search Functionality -------------------  */}
        {searchQuery && (
          <div
            className={`p-2 w-144 z-10 absolute rounded-lg left-[28.5%] top-14 md:w-[315px] md:left-[17%] md:top-16 lg:w-[540px] lg:left-[12%] lg:top-16 shadow-xl border transition-all duration-300 animate-fadeIn ${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-100"
            }`}
          >
            {/* Filter events based on the search query */}
            {events
              .filter((event) =>
                event.title.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map((event) => (
                <div
                  key={event._id}
                  className="p-1 transition-all duration-200"
                >
                  {/* Display event details */}
                  <Link to={"/event/" + event._id}>
                    <div
                      className={`w-full p-2 rounded-md transition-all duration-300 flex items-center ${
                        darkMode
                          ? "text-gray-200 hover:bg-gray-700 hover:text-primary"
                          : "text-black hover:bg-gray-100 hover:text-primary"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2 text-gray-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                        />
                      </svg>
                      {event.title}
                    </div>
                  </Link>
                </div>
              ))}
            {events.filter((event) =>
              event.title.toLowerCase().includes(searchQuery.toLowerCase())
            ).length === 0 && (
              <div
                className={`p-4 text-center ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                No events found matching "{searchQuery}"
              </div>
            )}
          </div>
        )}

        {storedUserData?.role === "admin" && (
          <Link to={"/createEvent"}>
            {" "}
            {/*TODO:Route create event page after creating it */}
            <div
              className={`hidden md:flex flex-col place-items-center py-1 px-2 rounded cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ${
                darkMode
                  ? "text-primary hover:bg-gray-800"
                  : "text-primary hover:text-primarydark hover:bg-white hover:shadow-md"
              }`}
            >
              <button>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 stroke-3 py-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </button>
              <div className="font-bold color-primary text-sm">
                Create Event
              </div>
            </div>
          </Link>
        )}

        <div className="hidden lg:flex gap-5 text-sm">
          <Link to={"/help"}>
            <div
              className={`flex flex-col place-items-center py-1 px-3 rounded cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ${
                darkMode
                  ? "hover:bg-gray-800 hover:text-primary"
                  : "hover:text-primarydark hover:bg-white hover:shadow-md"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 py-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
                />
              </svg>
              <div>Help</div>
            </div>
          </Link>

          <Link to={"/feedback"}>
            {" "}
            {/*TODO:Route feedback page after creating it */}
            <div
              className={`flex flex-col place-items-center py-1 px-3 rounded cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ${
                darkMode
                  ? "hover:bg-gray-800 hover:text-primary"
                  : "hover:text-primarydark hover:bg-white hover:shadow-md"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                className="w-5 py-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.657 0-3.204-.402-4.5-1.1L3 21l1.1-4.5C3.402 15.204 3 13.657 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <div>Feedback</div>
            </div>
          </Link>

          <Link to={"/wallet"}>
            {" "}
            {/*TODO:Route wallet page after creating it */}
            <div
              className={`flex flex-col place-items-center py-1 px-3 rounded cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ${
                darkMode
                  ? "hover:bg-gray-800 hover:text-primary"
                  : "hover:text-primarydark hover:bg-white hover:shadow-md"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 py-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
                />
              </svg>
              <div>Wallet</div>
            </div>
          </Link>

          <Link to={"/calendar"}>
            {" "}
            {/*TODO:Route calendar page after creating it */}
            <div
              className={`flex flex-col place-items-center py-1 px-3 rounded cursor-pointer transform hover:-translate-y-1 transition-all duration-300 ${
                darkMode
                  ? "hover:bg-gray-800 hover:text-primary"
                  : "hover:text-primarydark hover:bg-white hover:shadow-md"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 py-1"
              >
                <path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" />
                <path
                  fillRule="evenodd"
                  d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z"
                  clipRule="evenodd"
                />
              </svg>
              <div>Calendar</div>
            </div>
          </Link>
        </div>

        {/* -------------------IF user is Logged DO this Main-------------------- */}
        {!!user && (
          <div className="flex flex-row items-center gap-2 sm:gap-8 ">
            <div className="flex items-center gap-2">
              <Link
                to={"/useraccount"}
                className="hover:text-primary transition-colors duration-300"
              >
                {" "}
                {/*TODO: Route user profile page after creating it -> 1.50*/}
                {user.name.toUpperCase()}
              </Link>

              <BsFillCaretDownFill
                className="h-5 w-5 cursor-pointer hover:rotate-180 hover:text-primary transition-all duration-300"
                onClick={() => setisMenuOpen(!isMenuOpen)}
              />
            </div>
            <div className="hidden md:flex">
              <button
                onClick={logout}
                className="secondary hover:bg-red-100 hover:text-red-600 transition-colors duration-300"
              >
                <div>Log out</div>
                <RxExit />
              </button>
            </div>
          </div>
        )}

        {/* -------------------IF user is not Logged in DO this MAIN AND MOBILE-------------------- */}
        {!user && (
          <div>
            <Link to={"/login"} className=" ">
              <button className="primary hover:opacity-90 hover:scale-105 transform transition-all duration-300">
                <div>Sign in </div>
              </button>
            </Link>
          </div>
        )}

        {/* -------------------IF user is Logged DO this Mobile -------------------- */}
        {!!user && (
          //w-auto flex flex-col absolute bg-white pl-2 pr-6 py-5 gap-4 rounded-xl
          <div
            className={`absolute z-10 mt-64 flex flex-col w-48 right-2 md:right-[160px] rounded-lg shadow-lg ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            {/* TODO: */}
            <nav className={`block ${isMenuOpen ? "block" : "hidden"} `}>
              <div className="flex flex-col font-semibold text-[16px]">
                <Link
                  className={`flex py-2 pt-3 pl-6 pr-8 rounded-lg transition-all duration-300 ${
                    darkMode
                      ? "hover:bg-gray-700 hover:text-primary"
                      : "hover:bg-gray-100 hover:text-primary hover:shadow"
                  }`}
                  to={"/createEvent"}
                >
                  Create Event
                </Link>

                <Link
                  className={`flex py-2 pl-6 pr-8 rounded-lg transition-all duration-300 ${
                    darkMode
                      ? "hover:bg-gray-700 hover:text-primary"
                      : "hover:bg-gray-100 hover:text-primary hover:shadow"
                  }`}
                  to={"/help"}
                >
                  <div>Help</div>
                </Link>

                <Link
                  className={`flex py-2 pl-6 pr-8 rounded-lg transition-all duration-300 ${
                    darkMode
                      ? "hover:bg-gray-700 hover:text-primary"
                      : "hover:bg-gray-100 hover:text-primary hover:shadow"
                  }`}
                  to={"/wallet"}
                >
                  <div>Wallet</div>
                </Link>

                {/* <Link className="flex hover:bg-background hover:shadow py-2 pl-6 pr-8 rounded-lg" to={'/verification'}>
                  <div>Center</div>
                </Link> */}

                <Link
                  className={`flex py-2 pl-6 pr-8 rounded-lg transition-all duration-300 ${
                    darkMode
                      ? "hover:bg-gray-700 hover:text-primary"
                      : "hover:bg-gray-100 hover:text-primary hover:shadow"
                  }`}
                  to={"/calendar"}
                >
                  <div>Calendar</div>
                </Link>

                <Link
                  className={`flex py-2 pl-6 pb-3 pr-8 rounded-lg transition-all duration-300 ${
                    darkMode
                      ? "hover:bg-red-900 hover:text-red-400"
                      : "hover:bg-red-100 hover:text-red-600 hover:shadow"
                  }`}
                  onClick={logout}
                >
                  Log out
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
