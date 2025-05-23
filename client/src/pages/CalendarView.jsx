// import React from 'react'
import axios from "axios";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  isSameDay,
  isWeekend,
  isPast,
  parseISO,
  set,
} from "date-fns";
import { useEffect, useState } from "react";
import {
  BsCaretLeftFill,
  BsFillCaretRightFill,
  BsCalendarEvent,
  BsListUl,
  BsGrid,
  BsClockHistory,
  BsExclamationCircle,
} from "react-icons/bs";
import { Link } from "react-router-dom";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animation, setAnimation] = useState("slide-right");
  const [viewMode, setViewMode] = useState("month"); // 'month' or 'agenda'
  const [initialLoading, setInitialLoading] = useState(true);

  // Helper function to create a full date with time
  const createEventDateTime = (eventDate, eventTime) => {
    const date = new Date(eventDate);

    if (!eventTime) return date;

    try {
      // Parse time (assuming format like "10:00", "14:30", "10:00 AM" or "2:30 PM")
      const timeParts = eventTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const ampm = timeParts[3] ? timeParts[3].toUpperCase() : null;

        // Convert to 24-hour format if needed
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;

        // Set the time components
        return set(date, { hours, minutes, seconds: 0, milliseconds: 0 });
      }
    } catch (error) {
      console.error("Error parsing event time:", error);
    }

    return date;
  };

  // Check if event is expired
  const isEventExpired = (eventDate, eventTime) => {
    const eventDateTime = createEventDateTime(eventDate, eventTime);
    return isPast(eventDateTime);
  };

  //! Fetch events from the server -------------------------------------------------------
  useEffect(() => {
    setIsLoading(true);
    axios
      .get("/events")
      .then((response) => {
        setEvents(response.data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
        setIsLoading(false);
      });
  }, []);

  // Initial loading effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });

  const firstDayOfWeek = firstDayOfMonth.getDay();

  //! Create an array of empty cells to align days correctly-----------------------------------------
  const emptyCells = Array.from({ length: firstDayOfWeek }, (_, index) => (
    <div
      key={`empty-${index}`}
      className="aspect-square p-2 bg-gradient-to-br from-gray-50 to-white shadow-inner rounded-lg transform transition-all duration-300"
    ></div>
  ));

  const changeMonth = (direction) => {
    setAnimation(direction > 0 ? "slide-left" : "slide-right");
    setTimeout(() => {
      setCurrentMonth((prevMonth) => addMonths(prevMonth, direction));
    }, 150);
  };

  const today = new Date();

  // Filter events for the current month for agenda view
  const currentMonthEvents = events.filter((event) => {
    const eventDate = new Date(event.eventDate);
    return eventDate >= firstDayOfMonth && eventDate <= lastDayOfMonth;
  });

  // Toggle between calendar and agenda view
  const toggleViewMode = () => {
    setViewMode(viewMode === "month" ? "agenda" : "month");
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-700 dark:border-blue-400"></div>
          <p className="text-xl font-semibold mt-4 dark:text-gray-200">
            Loading Your Calendar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center py-6 px-4 sm:px-6 md:px-8 lg:px-10">
      <div className="w-full max-w-7xl mx-auto">
        <div className="rounded-xl shadow-2xl overflow-hidden bg-background/30 backdrop-blur-sm p-4 md:p-6">
          <h1 className="text-center text-3xl md:text-4xl font-bold mb-8 text-primary flex items-center justify-center gap-3">
            <BsCalendarEvent className="animate-pulse" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-600 to-primary">
              Event Calendar
            </span>
          </h1>

          <div className="flex items-center mb-8 justify-between">
            <button
              className="primary hover:scale-110 transition-transform duration-300 flex items-center justify-center p-3 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-600 text-white"
              onClick={() => changeMonth(-1)}
            >
              <BsCaretLeftFill className="w-auto h-5" />
            </button>

            <span
              className={`text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 ${
                animation === "slide-left"
                  ? "animate-slide-left"
                  : "animate-slide-right"
              }`}
            >
              {format(currentMonth, "MMMM yyyy")}
            </span>

            <div className="flex items-center gap-4">
              <div className="toggle-container" onClick={toggleViewMode}>
                <div
                  className={`toggle-switch ${
                    viewMode === "agenda" ? "active" : ""
                  }`}
                >
                  <div className="toggle-button"></div>
                </div>
                <div className="toggle-labels flex items-center gap-1">
                  <BsGrid
                    className={
                      viewMode === "month" ? "text-primary" : "text-gray-400"
                    }
                  />
                  <BsListUl
                    className={
                      viewMode === "agenda" ? "text-primary" : "text-gray-400"
                    }
                  />
                </div>
              </div>

              <button
                className="primary hover:scale-110 transition-transform duration-300 flex items-center justify-center p-3 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-600 text-white"
                onClick={() => changeMonth(1)}
              >
                <BsFillCaretRightFill className="w-auto h-5" />
              </button>
            </div>
          </div>

          {/* Month View */}
          {viewMode === "month" && (
            <>
              <div className="grid grid-cols-7 text-center mb-4 gap-1 md:gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, index) => (
                    <div
                      key={day}
                      className={`py-2 md:py-3 font-bold rounded-lg m-1 shadow-md ${
                        index === 0 || index === 6
                          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white"
                          : "bg-gradient-to-r from-primary/90 to-primary text-white"
                      }`}
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div
                className={`grid grid-cols-7 gap-1 md:gap-2 ${
                  animation === "slide-left"
                    ? "animate-fade-slide-left"
                    : "animate-fade-slide-right"
                }`}
              >
                {emptyCells.concat(
                  daysInMonth.map((date) => {
                    const isCurrentDay = isSameDay(today, date);
                    const isWeekendDay = isWeekend(date);
                    const dayEvents = events.filter(
                      (event) =>
                        format(new Date(event.eventDate), "yyyy-MM-dd") ===
                        format(date, "yyyy-MM-dd")
                    );

                    return (
                      <div
                        key={date.toISOString()}
                        className={`aspect-square sm:aspect-auto p-2 relative sm:min-h-[100px] md:min-h-[120px] lg:min-h-[150px] rounded-lg transition-all duration-300 hover:shadow-xl hover:z-10 ${
                          isCurrentDay
                            ? "ring-2 ring-primary shadow-lg bg-gradient-to-br from-primary/5 to-primary/10"
                            : isWeekendDay
                            ? "bg-gradient-to-br from-pink-50 to-white shadow-md hover:transform hover:-translate-y-1"
                            : "bg-white shadow-md hover:transform hover:-translate-y-1"
                        }`}
                      >
                        <div
                          className={`font-bold text-base sm:text-lg mb-1 sm:mb-2 ${
                            isCurrentDay
                              ? "text-primary"
                              : isWeekendDay
                              ? "text-pink-600"
                              : ""
                          }`}
                        >
                          {format(date, "dd")}
                        </div>
                        <div className="overflow-y-auto h-[calc(100%-25px)] sm:max-h-[70px] md:max-h-[90px] scrollbar-thin scrollbar-thumb-primary scrollbar-track-gray-100">
                          {isLoading ? (
                            <div className="space-y-2">
                              <div className="animate-pulse h-4 sm:h-5 bg-gray-200 rounded"></div>
                              <div className="animate-pulse h-4 sm:h-5 bg-gray-200 rounded w-3/4"></div>
                            </div>
                          ) : dayEvents.length > 0 ? (
                            dayEvents.map((event) => {
                              const expired = isEventExpired(
                                event.eventDate,
                                event.eventTime
                              );

                              return (
                                <div
                                  key={event._id}
                                  className="mb-1 transform transition-all duration-300 hover:scale-105"
                                >
                                  <Link
                                    to={"/event/" + event._id}
                                    className="block"
                                  >
                                    <div
                                      className={`text-white rounded-lg px-1.5 py-1 text-xs sm:text-sm truncate shadow-md hover:shadow-lg flex items-center justify-between ${
                                        expired
                                          ? "bg-gradient-to-r from-gray-500 to-gray-600"
                                          : "bg-gradient-to-r from-primary to-purple-600"
                                      }`}
                                    >
                                      <span className="truncate">
                                        {event.title.toUpperCase()}
                                      </span>
                                      {expired && (
                                        <BsExclamationCircle className="flex-shrink-0 ml-1" />
                                      )}
                                    </div>
                                    <div className="text-[10px] text-gray-500 pl-1 flex items-center">
                                      <BsClockHistory className="mr-1" />
                                      {event.eventTime || "No time specified"}
                                    </div>
                                  </Link>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-[10px] sm:text-xs text-gray-400 italic">
                              No events
                            </div>
                          )}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-primary animate-ping"></div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}

          {/* Agenda View */}
          {viewMode === "agenda" && (
            <div
              className={`${
                animation === "slide-left"
                  ? "animate-fade-slide-left"
                  : "animate-fade-slide-right"
              }`}
            >
              <div className="bg-white rounded-xl shadow-lg p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="h-16 w-16 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : currentMonthEvents.length > 0 ? (
                  <div className="space-y-3">
                    {currentMonthEvents
                      .sort(
                        (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
                      )
                      .map((event) => {
                        const expired = isEventExpired(
                          event.eventDate,
                          event.eventTime
                        );

                        return (
                          <Link to={"/event/" + event._id} key={event._id}>
                            <div
                              className={`flex gap-4 p-3 rounded-lg shadow hover:shadow-md transition-all duration-300 hover:translate-x-1 ${
                                expired
                                  ? "bg-gradient-to-r from-gray-100 to-gray-200"
                                  : "bg-gradient-to-r from-white to-gray-50"
                              }`}
                            >
                              <div
                                className={`flex flex-col items-center justify-center min-w-[60px] h-[60px] text-white rounded-lg shadow-md ${
                                  expired
                                    ? "bg-gradient-to-br from-gray-500 to-gray-600"
                                    : "bg-gradient-to-br from-primary to-purple-600"
                                }`}
                              >
                                <span className="text-sm font-bold">
                                  {format(new Date(event.eventDate), "MMM")}
                                </span>
                                <span className="text-xl font-bold">
                                  {format(new Date(event.eventDate), "dd")}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h3
                                    className={`font-bold text-lg ${
                                      expired ? "text-gray-600" : "text-primary"
                                    }`}
                                  >
                                    {event.title}
                                  </h3>
                                  {expired && (
                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full flex items-center">
                                      <BsExclamationCircle className="mr-1" />
                                      Expired
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <BsClockHistory className="mr-1" />
                                  {event.eventTime || "No time specified"}
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-1 mt-1">
                                  {event.description ||
                                    "No description available"}
                                </p>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-500">
                    <BsCalendarEvent className="mx-auto text-4xl mb-2 text-gray-400" />
                    <p>No events scheduled for this month</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Hover over an event and click to see details</p>
          <div className="mt-2 flex flex-col sm:flex-row justify-center items-center gap-2 sm:gap-6 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-purple-600"></div>
              <span>Current Events</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-500 to-gray-600"></div>
              <span>Expired Events</span>
            </div>
          </div>
          <p className="mt-2 text-xs">
            © {new Date().getFullYear()} Event Calendar - All rights reserved
          </p>
        </div>

        <style jsx>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .animate-fadeIn {
            animation: fadeIn 0.5s ease-in-out;
          }

          @keyframes slideRight {
            from {
              transform: translateX(-20px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideLeft {
            from {
              transform: translateX(20px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-slide-right {
            animation: slideRight 0.3s ease-out forwards;
          }

          .animate-slide-left {
            animation: slideLeft 0.3s ease-out forwards;
          }

          @keyframes fadeSlideRight {
            from {
              transform: translateX(-40px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes fadeSlideLeft {
            from {
              transform: translateX(40px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          .animate-fade-slide-right {
            animation: fadeSlideRight 0.4s ease-out forwards;
          }

          .animate-fade-slide-left {
            animation: fadeSlideLeft 0.4s ease-out forwards;
          }

          .scrollbar-thin::-webkit-scrollbar {
            width: 4px;
          }

          .scrollbar-thin::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 10px;
          }

          .scrollbar-thin::-webkit-scrollbar-thumb:hover {
            background: #555;
          }

          /* Toggle Switch Styles */
          .toggle-container {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
          }

          .toggle-switch {
            position: relative;
            width: 50px;
            height: 24px;
            background: linear-gradient(to right, #e2e8f0, #cbd5e1);
            border-radius: 12px;
            padding: 2px;
            transition: all 0.3s ease;
          }

          .toggle-switch.active {
            background: linear-gradient(to right, #9333ea, #7e22ce);
          }

          .toggle-button {
            position: absolute;
            left: 2px;
            top: 2px;
            width: 20px;
            height: 20px;
            background: white;
            border-radius: 50%;
            transition: all 0.3s ease;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          }

          .toggle-switch.active .toggle-button {
            left: calc(100% - 22px);
          }

          .toggle-labels {
            display: flex;
            font-size: 14px;
            font-weight: bold;
          }
        `}</style>
      </div>
    </div>
  );
}
