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
} from "date-fns";
import { useEffect, useState } from "react";
import {
  BsCaretLeftFill,
  BsFillCaretRightFill,
  BsCalendarEvent,
} from "react-icons/bs";
import { Link } from "react-router-dom";

export default function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [animation, setAnimation] = useState("slide-right");

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

          <div className="flex items-center mb-8 justify-center gap-8">
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
            <button
              className="primary hover:scale-110 transition-transform duration-300 flex items-center justify-center p-3 rounded-full shadow-lg bg-gradient-to-r from-primary to-purple-600 text-white"
              onClick={() => changeMonth(1)}
            >
              <BsFillCaretRightFill className="w-auto h-5" />
            </button>
          </div>

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
                        dayEvents.map((event) => (
                          <div
                            key={event._id}
                            className="mb-1 transform transition-all duration-300 hover:scale-105"
                          >
                            <Link to={"/event/" + event._id} className="block">
                              <div className="text-white bg-gradient-to-r from-primary to-purple-600 rounded-lg px-1.5 py-1 text-xs sm:text-sm truncate shadow-md hover:shadow-lg">
                                {event.title.toUpperCase()}
                              </div>
                            </Link>
                          </div>
                        ))
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
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Hover over an event and click to see details</p>
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
        `}</style>
      </div>
    </div>
  );
}
