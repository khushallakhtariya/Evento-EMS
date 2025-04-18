/* eslint-disable react/jsx-key */
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ThemeContext } from "../ThemeContext";
import {
  BsArrowRightShort,
  BsCalendarCheck,
  BsCalendarX,
  BsClockHistory,
  BsPeopleFill,
  BsBookmark,
  BsBookmarkFill,
  BsPencilSquare,
  BsTrash,
} from "react-icons/bs";
import { BiLike } from "react-icons/bi";

export default function IndexPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [bookmarkedEvents, setBookmarkedEvents] = useState([]);
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false);
  const { darkMode } = useContext(ThemeContext);
  const [countdowns, setCountdowns] = useState({});
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "info",
  });
  const [filteredBookmarks, setFilteredBookmarks] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lastDeletedEvent, setLastDeletedEvent] = useState(null);

  // Check if user is admin on component mount
  useEffect(() => {
    const checkAdminStatus = () => {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          setIsAdmin(userData?.role === "admin");
        } catch (error) {
          console.error("Error parsing user data:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    // Create a custom event listener for logout
    const handleLogout = () => {
      setBookmarkedEvents([]);
      setFilteredBookmarks([]);
      setShowOnlyBookmarked(false);
      localStorage.removeItem("bookmarkedEvents");
      localStorage.removeItem("showOnlyBookmarked");
      setIsAdmin(false);
    };

    // Listen for custom logout event
    window.addEventListener("app-logout", handleLogout);

    checkAdminStatus();

    return () => {
      window.removeEventListener("app-logout", handleLogout);
    };
  }, []);

  // Helper function to check if an event is a past event
  const isPastEvent = (event) => {
    if (!event) return false;

    const eventDate = new Date(event.eventDate);
    const currentDateTime = new Date();

    // Parse time
    if (event.eventTime) {
      const timeParts = event.eventTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (timeParts) {
        let hours = parseInt(timeParts[1]);
        const minutes = parseInt(timeParts[2]);
        const ampm = timeParts[3] ? timeParts[3].toUpperCase() : null;

        // Convert to 24-hour format if needed
        if (ampm === "PM" && hours < 12) hours += 12;
        if (ampm === "AM" && hours === 12) hours = 0;

        // Set the time components
        eventDate.setHours(hours, minutes, 0, 0);
      }
    }

    return eventDate < currentDateTime;
  };

  // Define CSS for animations
  useEffect(() => {
    // Create style element
    const style = document.createElement("style");
    style.innerHTML = `
      @keyframes bookmarkPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.15); }
        100% { transform: scale(1); }
      }
      .animate-bookmark-pulse {
        animation: bookmarkPulse 0.5s ease-in-out;
      }
      
      @keyframes fadeInUp {
        from { 
          opacity: 0;
          transform: translate(-50%, 20px);
        }
        to { 
          opacity: 1;
          transform: translate(-50%, 0);
        }
      }
      .animate-fade-in-up {
        animation: fadeInUp 0.3s ease-out forwards;
      }
      
      @keyframes deleteToastShake {
        0%, 100% { transform: translate(-50%, 0); }
        10%, 30%, 50% { transform: translate(-52%, 0); }
        20%, 40%, 60% { transform: translate(-48%, 0); }
        70% { transform: translate(-50%, 0); }
      }
      
      @keyframes pulseDelete {
        0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); }
        70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
        100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
      }
      
      .toast-delete-animation {
        animation: fadeInUp 0.3s ease-out forwards, deleteToastShake 0.5s ease-in-out 0.3s;
      }
      
      .toast-delete-animation > div {
        animation: pulseDelete 2s infinite;
      }
      
      .undo-button-pulse {
        animation: bookmarkPulse 1.5s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);

    // Clean up
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Load bookmarked events from localStorage on component mount
  useEffect(() => {
    const savedBookmarks = localStorage.getItem("bookmarkedEvents");
    if (savedBookmarks) {
      try {
        const parsedBookmarks = JSON.parse(savedBookmarks);
        setBookmarkedEvents(parsedBookmarks);
        // If user had filtered view active before, restore that state
        const wasShowingBookmarked = localStorage.getItem("showOnlyBookmarked");
        if (wasShowingBookmarked === "true") {
          setShowOnlyBookmarked(true);
        }
      } catch (error) {
        console.error("Error parsing bookmarked events:", error);
        localStorage.removeItem("bookmarkedEvents");
      }
    }

    // Check if user is logged in
    const handleStorageChange = () => {
      const userDataString = localStorage.getItem("user");
      // If user isn't logged in, clear bookmarks
      if (!userDataString) {
        setBookmarkedEvents([]);
        setFilteredBookmarks([]);
        setShowOnlyBookmarked(false);
        localStorage.removeItem("bookmarkedEvents");
        localStorage.removeItem("showOnlyBookmarked");
      }
    };

    // Listen for storage changes (logout clears localStorage)
    window.addEventListener("storage", handleStorageChange);

    // Also check on page refresh/load
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Save bookmarked events to localStorage whenever they change
  useEffect(() => {
    if (bookmarkedEvents.length > 0) {
      localStorage.setItem(
        "bookmarkedEvents",
        JSON.stringify(bookmarkedEvents)
      );
    } else {
      // If no bookmarks, remove the item completely
      localStorage.removeItem("bookmarkedEvents");
    }

    // Also store the filter state
    localStorage.setItem("showOnlyBookmarked", showOnlyBookmarked);
  }, [bookmarkedEvents, showOnlyBookmarked]);

  //! Fetch events from the server ---------------------------------------------------------------
  useEffect(() => {
    setLoading(true);

    // Reset bookmark state if user is not logged in
    const checkUserLoggedIn = () => {
      const userDataString = localStorage.getItem("user");
      if (!userDataString) {
        setBookmarkedEvents([]);
        setFilteredBookmarks([]);
        setShowOnlyBookmarked(false);
      }
    };

    // Check login status before fetching events
    checkUserLoggedIn();

    axios
      .get("/createEvent")
      .then((response) => {
        console.log("Fetched events:", response.data);
        setEvents(response.data);

        // Separate events into live and past
        const currentDateTime = new Date();
        const live = [];
        const past = [];

        response.data.forEach((event) => {
          // Create a date object combining event date and time
          const eventDate = new Date(event.eventDate);

          // Parse time (assuming format like "10:00 AM" or "14:30")
          if (event.eventTime) {
            const timeParts = event.eventTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
            if (timeParts) {
              let hours = parseInt(timeParts[1]);
              const minutes = parseInt(timeParts[2]);
              const ampm = timeParts[3] ? timeParts[3].toUpperCase() : null;

              // Convert to 24-hour format if needed
              if (ampm === "PM" && hours < 12) hours += 12;
              if (ampm === "AM" && hours === 12) hours = 0;

              // Set the time components
              eventDate.setHours(hours, minutes, 0, 0);
            }
          }

          // Compare full date and time
          if (eventDate >= currentDateTime) {
            live.push(event);
          } else {
            // Mark as a past event initially
            past.push({ ...event, wasPastEvent: true });
          }
        });

        setLiveEvents(live);
        setPastEvents(past);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Filter bookmarked events when events or bookmarks change
  useEffect(() => {
    if (events.length && bookmarkedEvents.length) {
      // Get only upcoming bookmarked events
      const upcomingBookmarked = events.filter(
        (event) => bookmarkedEvents.includes(event._id) && !isPastEvent(event)
      );

      setFilteredBookmarks(upcomingBookmarked);

      // If we're only showing bookmarked events, but there are none, maybe turn off the filter
      if (
        showOnlyBookmarked &&
        upcomingBookmarked.length === 0 &&
        liveEvents.length > 0
      ) {
        // Only auto-disable if we have actual events to show
        setShowOnlyBookmarked(false);
        showToast("No bookmarked events found, showing all events", "info");
      }
    } else {
      setFilteredBookmarks([]);
    }
  }, [events, bookmarkedEvents, liveEvents.length, showOnlyBookmarked]);

  // Clean up bookmarks of past events when events data is loaded
  useEffect(() => {
    // Only run cleanup if both events are loaded and we have bookmarks
    if (events.length > 0 && bookmarkedEvents.length > 0 && !loading) {
      // Add a small delay to ensure everything is properly loaded
      const timer = setTimeout(() => {
        // Check if any bookmarked events are now past events and need to be removed
        const outdatedBookmarks = bookmarkedEvents.filter((bookmarkId) => {
          const event = events.find((e) => e._id === bookmarkId);
          return isPastEvent(event);
        });

        // If found any past events in bookmarks, remove them
        if (outdatedBookmarks.length > 0) {
          const updatedBookmarks = bookmarkedEvents.filter(
            (id) => !outdatedBookmarks.includes(id)
          );
          setBookmarkedEvents(updatedBookmarks);

          if (outdatedBookmarks.length === 1) {
            const eventName =
              events.find((e) => e._id === outdatedBookmarks[0])?.title ||
              "event";
            showToast(
              `Removed past event "${eventName}" from bookmarks`,
              "info"
            );
          } else {
            showToast(
              `Removed ${outdatedBookmarks.length} past events from bookmarks`,
              "info"
            );
          }
        }
      }, 1000); // 1 second delay to ensure events are properly loaded

      return () => clearTimeout(timer);
    }
  }, [events, bookmarkedEvents, loading]);

  // Countdown timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const newCountdowns = {};

      liveEvents.forEach((event) => {
        const eventDate = new Date(event.eventDate);

        // Parse time (assuming format like "10:00 AM" or "14:30")
        if (event.eventTime) {
          const timeParts = event.eventTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
          if (timeParts) {
            let hours = parseInt(timeParts[1]);
            const minutes = parseInt(timeParts[2]);
            const ampm = timeParts[3] ? timeParts[3].toUpperCase() : null;

            // Convert to 24-hour format if needed
            if (ampm === "PM" && hours < 12) hours += 12;
            if (ampm === "AM" && hours === 12) hours = 0;

            // Set the time components
            eventDate.setHours(hours, minutes, 0, 0);
          }
        }

        const timeDifference = eventDate - currentTime;

        if (timeDifference > 0) {
          const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
          const hours = Math.floor(
            (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          const minutes = Math.floor(
            (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
          );
          const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

          newCountdowns[event._id] = { days, hours, minutes, seconds };
        } else {
          newCountdowns[event._id] = null;
        }
      });

      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [liveEvents]);

  //! Like Functionality --------------------------------------------------------------
  const handleLike = (eventId) => {
    axios
      .post(`/event/${eventId}`)
      .then((response) => {
        // Update both live and past events lists
        const updateEvent = (list) => {
          return list.map((event) =>
            event._id === eventId ? { ...event, likes: event.likes + 1 } : event
          );
        };

        setLiveEvents(updateEvent(liveEvents));
        setPastEvents(updateEvent(pastEvents));
        setEvents(updateEvent(events)); // Also update the main events array
        console.log("Liked event:", response);
      })
      .catch((error) => {
        console.error("Error liking event:", error);
      });
  };

  //! Bookmark Functionality ------------------------------------------------------------
  const handleBookmark = (eventId) => {
    // Check if event is already in past events
    const event = events.find((e) => e._id === eventId);
    if (!event) return;

    // Check if this is a past event
    if (isPastEvent(event) && !bookmarkedEvents.includes(eventId)) {
      showToast("Past events cannot be bookmarked", "error");
      return;
    }

    if (bookmarkedEvents.includes(eventId)) {
      // Remove from bookmarks
      const updatedBookmarks = bookmarkedEvents.filter((id) => id !== eventId);
      setBookmarkedEvents(updatedBookmarks);

      // Directly update localStorage to ensure persistence
      localStorage.setItem(
        "bookmarkedEvents",
        JSON.stringify(updatedBookmarks)
      );

      // Show a visual feedback message
      const eventName = event?.title || "Event";
      showToast(`Removed ${eventName} from bookmarks`, "info");
    } else {
      // Add to bookmarks
      const updatedBookmarks = [...bookmarkedEvents, eventId];
      setBookmarkedEvents(updatedBookmarks);

      // Directly update localStorage to ensure persistence
      localStorage.setItem(
        "bookmarkedEvents",
        JSON.stringify(updatedBookmarks)
      );

      // Show a visual feedback message
      const eventName = event?.title || "Event";
      showToast(`Added ${eventName} to bookmarks`, "success");
    }
  };

  //! Delete Event Functionality --------------------------------------------------------------
  const handleDeleteEvent = (eventId) => {
    // Find the event details before trying to delete
    const eventToDelete = events.find((event) => event._id === eventId);
    if (!eventToDelete) return;

    const eventTitle = eventToDelete.title || "this event";

    // Check if this event was bookmarked before deletion
    const wasBookmarked = bookmarkedEvents.includes(eventId);

    // Create a clean copy of the event data for the database restoration
    // Remove properties that might cause issues when re-creating
    const { _id, __v, createdAt, updatedAt, ...cleanEventData } = eventToDelete;
    const eventDataForUndo = {
      ...cleanEventData,
      wasBookmarked,
      originalId: _id, // Store original ID for reference
    };

    // Remove confirmation dialog and proceed directly with deletion
    axios
      .delete(`/createEvent/${eventId}`)
      .then(() => {
        // Remove event from all lists
        setEvents(events.filter((event) => event._id !== eventId));
        setLiveEvents(liveEvents.filter((event) => event._id !== eventId));
        setPastEvents(pastEvents.filter((event) => event._id !== eventId));

        // Also remove from bookmarks if it exists there
        if (bookmarkedEvents.includes(eventId)) {
          const updatedBookmarks = bookmarkedEvents.filter(
            (id) => id !== eventId
          );
          setBookmarkedEvents(updatedBookmarks);
          localStorage.setItem(
            "bookmarkedEvents",
            JSON.stringify(updatedBookmarks)
          );
        }

        // Use the special delete toast with event data for potential recovery
        showDeleteToast(eventTitle, eventDataForUndo);
      })
      .catch((error) => {
        console.error("Error deleting event:", error);
        showToast("Failed to delete event. Please try again.", "error");
      });
  };

  // Simple toast notification handler (visual feedback)
  const showToast = (message, type = "info") => {
    setToast({ visible: true, message, type });

    // Hide after 3 seconds
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "info" });
    }, 3000);
  };

  // Special toast for delete operations with more emphasis
  const showDeleteToast = (eventTitle, eventData = null) => {
    // Store the deleted event data for potential recovery
    if (eventData) {
      setLastDeletedEvent(eventData);
    }

    setToast({
      visible: true,
      message: `"${eventTitle}" has been deleted`,
      type: "delete",
      showUndo: true,
    });

    // Hide after 5 seconds (longer display to allow for undo)
    setTimeout(() => {
      setToast({ visible: false, message: "", type: "info", showUndo: false });
      // Clear the last deleted event data after the toast is gone
      setLastDeletedEvent(null);
    }, 5000);
  };

  // Undo delete function
  const handleUndoDelete = () => {
    if (!lastDeletedEvent) return;

    // Show a temporary "restoring" toast
    showToast("Restoring event...", "info");

    // Create a new FormData object to handle the event restoration
    const formData = new FormData();

    // Add all fields from lastDeletedEvent to the FormData
    Object.keys(lastDeletedEvent).forEach((key) => {
      // Skip image field - we'll handle it specially
      if (key !== "image" && key !== "wasBookmarked" && key !== "originalId") {
        formData.append(key, lastDeletedEvent[key]);
      }
    });

    // If we have an image path, we need to tell the server to keep using this path
    if (lastDeletedEvent.image) {
      // Add a special field to indicate this is a restore operation with an existing image
      formData.append("existingImage", lastDeletedEvent.image);
    }

    // We need to re-create the event in the database
    axios
      .post("/createEvent", formData)
      .then((response) => {
        // Get the newly created event with its new ID
        const restoredEvent = response.data;

        // Add the event back to the lists with the NEW ID
        setEvents((prev) => [...prev, restoredEvent]);

        // Determine if it should go to live or past events
        if (isPastEvent(restoredEvent)) {
          setPastEvents((prev) => [...prev, restoredEvent]);
        } else {
          setLiveEvents((prev) => [...prev, restoredEvent]);
        }

        // If it was bookmarked, restore the bookmark with the new ID
        if (lastDeletedEvent.wasBookmarked) {
          const updatedBookmarks = [...bookmarkedEvents, restoredEvent._id];
          setBookmarkedEvents(updatedBookmarks);
          localStorage.setItem(
            "bookmarkedEvents",
            JSON.stringify(updatedBookmarks)
          );
        }

        // Show confirmation toast
        showToast(
          `"${restoredEvent.title}" has been restored successfully`,
          "success"
        );
      })
      .catch((error) => {
        console.error("Error restoring event:", error);
        showToast("Failed to restore event. Please try again.", "error");
      })
      .finally(() => {
        // Clear the toast and last deleted event
        setToast({
          visible: false,
          message: "",
          type: "info",
          showUndo: false,
        });
        setLastDeletedEvent(null);
      });
  };

  // Event card component for reuse
  const EventCard = ({ event, isPast }) => {
    // Check if event is expired based on current time
    const isExpired = () => {
      const currentDateTime = new Date();
      const eventDate = new Date(event.eventDate);

      // Parse time (assuming format like "10:00 AM" or "14:30")
      if (event.eventTime) {
        const timeParts = event.eventTime.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeParts) {
          let hours = parseInt(timeParts[1]);
          const minutes = parseInt(timeParts[2]);
          const ampm = timeParts[3] ? timeParts[3].toUpperCase() : null;

          // Convert to 24-hour format if needed
          if (ampm === "PM" && hours < 12) hours += 12;
          if (ampm === "AM" && hours === 12) hours = 0;

          // Set the time components
          eventDate.setHours(hours, minutes, 0, 0);
        }
      }

      return eventDate < currentDateTime;
    };

    const expired = isExpired();

    // Force isPast to be true if the event is expired
    isPast = isPast || expired;

    // Get countdown for this event
    const countdown = countdowns[event._id];

    // Calculate capacity usage
    const capacity = event.Participants || 100; // Default capacity of 100 if not specified
    const bookedCount = event.Count || 0; // How many tickets have been booked
    const availablePercentage = Math.max(
      0,
      Math.min(100, ((capacity - bookedCount) / capacity) * 100)
    );

    // Determine capacity status text and color
    let capacityStatus = "Available";
    let capacityColor = "text-green-500";
    let capacityBgColor = darkMode ? "bg-gray-700" : "bg-gray-100";

    if (availablePercentage <= 10) {
      capacityStatus = "Almost Full";
      capacityColor = "text-red-500";
      capacityBgColor = darkMode ? "bg-red-900/20" : "bg-red-100";
    } else if (availablePercentage <= 30) {
      capacityStatus = "Filling Fast";
      capacityColor = "text-orange-500";
      capacityBgColor = darkMode ? "bg-orange-900/20" : "bg-orange-100";
    }

    if (bookedCount >= capacity) {
      capacityStatus = "Sold Out";
      capacityColor = "text-red-600 font-bold";
      capacityBgColor = darkMode ? "bg-red-900/30" : "bg-red-100";
    }

    // Check if this event is bookmarked
    const isBookmarked = bookmarkedEvents.includes(event._id);

    return (
      <div
        className={`rounded-xl overflow-hidden shadow-md ${
          darkMode
            ? isPast
              ? "bg-gray-800 opacity-80"
              : "bg-gray-800"
            : isPast
            ? "bg-white opacity-80"
            : "bg-white"
        }`}
        key={event._id}
      >
        <div className="relative h-52 overflow-hidden">
          {event.image && (
            <img
              src={`http://localhost:4000/${event.image}`}
              alt={event.title}
              className={`w-full h-full object-cover ${
                isPast ? "grayscale-[30%]" : ""
              }`}
              loading="lazy"
              onError={(e) => {
                e.target.src = "../src/assets/placeholder.jpg";
                e.target.onerror = null;
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute top-4 right-4 flex items-center gap-3">
            {isAdmin && (
              <>
                <div className="flex flex-col items-center">
                  <Link
                    to={`/edit-event/${event._id}`}
                    className="p-2 bg-blue-500/90 rounded-full shadow-md text-white transition-colors hover:bg-blue-600 mb-1"
                    title="Edit Event"
                  >
                    <BsPencilSquare className="w-5 h-5" />
                  </Link>
                </div>
                <div className="flex flex-col items-center">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteEvent(event._id);
                    }}
                    className="p-2 bg-red-500/90 rounded-full shadow-md text-white transition-colors hover:bg-red-600 hover:scale-105 mb-1"
                    title="Delete Event (No confirmation)"
                  >
                    <BsTrash className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}

            <div className="flex flex-col items-center">
              <button
                onClick={() => handleLike(event._id)}
                className="flex items-center gap-1 p-2 bg-white/90 rounded-full shadow-md text-gray-700 transition-colors hover:bg-white mb-1"
              >
                <BiLike className="w-5 h-5" />
                <span className="text-sm font-medium">{event?.likes}</span>
              </button>
            </div>

            {/* Only show bookmark button for non-past events */}
            {!isPast && (
              <div className="flex flex-col items-center">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleBookmark(event._id);
                  }}
                  className={`p-2 rounded-full shadow-md transition-all mb-1 ${
                    isBookmarked
                      ? "bg-yellow-400 text-white hover:bg-yellow-500 hover:scale-105"
                      : "bg-white/90 text-gray-700 hover:bg-white hover:scale-105"
                  } ${isBookmarked ? "animate-bookmark-pulse" : ""}`}
                  title={
                    isBookmarked ? "Remove from bookmarks" : "Add to bookmarks"
                  }
                >
                  {isBookmarked ? (
                    <BsBookmarkFill className="w-5 h-5" />
                  ) : (
                    <BsBookmark className="w-5 h-5" />
                  )}
                </button>
              </div>
            )}
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-4 py-2 bg-gradient-to-t from-black/80 to-transparent">
            <div className="flex justify-between text-white text-xs font-medium">
              <span>{new Date(event.eventDate).toLocaleDateString()}</span>
              <span>
                {event.ticketPrice === 0 ? "Free" : "Rs. " + event.ticketPrice}
              </span>
            </div>
          </div>
          {isPast && (
            <div className="absolute top-0 left-0 bg-red-500/80 text-white text-xs font-bold py-1 px-3 rounded-br-lg">
              {expired && !event.wasPastEvent ? "Expired Event" : "Past Event"}
            </div>
          )}
        </div>

        <div className="p-5">
          <h2
            className={`font-bold text-lg mb-2 line-clamp-1 ${
              darkMode ? "text-gray-200" : "text-gray-800"
            }`}
          >
            {event?.title?.toUpperCase()}
          </h2>

          <div
            className={`text-sm line-clamp-2 mb-3 min-h-[40px] ${
              darkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            {event.description}
          </div>

          <div className="flex justify-between items-center mb-4">
            <div
              className={`text-sm ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              <span className="font-medium">By:</span> {event.organizedBy}
            </div>
            <div
              className={`flex items-center gap-1 ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              <span className="text-sm">{event.eventTime}</span>
            </div>
          </div>

          {/* Capacity Indicator - Show for all events */}
          {!isPast && (
            <div className={`mb-4 rounded-lg p-2 ${capacityBgColor}`}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <BsPeopleFill className={capacityColor} />
                  <p className={`text-xs font-medium ${capacityColor}`}>
                    {capacityStatus}
                  </p>
                </div>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {bookedCount} / {capacity} spots
                </p>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    bookedCount >= capacity
                      ? "bg-red-500"
                      : availablePercentage <= 30
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${100 - availablePercentage}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Countdown Timer - Only show for upcoming events */}
          {!isPast && countdown && (
            <div
              className={`mb-4 border ${
                darkMode ? "border-gray-700" : "border-gray-200"
              } rounded-lg p-2`}
            >
              <div className="flex items-center justify-center gap-1 mb-1">
                <BsClockHistory
                  className={darkMode ? "text-blue-400" : "text-blue-500"}
                />
                <p
                  className={`text-xs font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Event starts in:
                </p>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center">
                <div
                  className={`p-1 rounded ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <div
                    className={`text-lg font-bold ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {countdown.days}
                  </div>
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Days
                  </div>
                </div>
                <div
                  className={`p-1 rounded ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <div
                    className={`text-lg font-bold ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {countdown.hours}
                  </div>
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Hrs
                  </div>
                </div>
                <div
                  className={`p-1 rounded ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <div
                    className={`text-lg font-bold ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {countdown.minutes}
                  </div>
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Min
                  </div>
                </div>
                <div
                  className={`p-1 rounded ${
                    darkMode ? "bg-gray-700" : "bg-gray-100"
                  }`}
                >
                  <div
                    className={`text-lg font-bold ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    {countdown.seconds}
                  </div>
                  <div
                    className={`text-xs ${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Sec
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conditional rendering based on event status */}
          {isPast ? (
            <Link to={"/event/" + event._id} className="block">
              <button
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium ${
                  darkMode ? "bg-gray-600 text-white" : "bg-gray-500 text-white"
                }`}
              >
                View Details
                <BsArrowRightShort className="w-6 h-6" />
              </button>
            </Link>
          ) : (
            <Link to={"/event/" + event._id} className="block">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium primary">
                Book Ticket
                <BsArrowRightShort className="w-6 h-6" />
              </button>
            </Link>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`mt-1 flex flex-col min-h-screen ${
        darkMode ? "bg-dark-background" : "bg-gray-50"
      }`}
    >
      {/* Toast Notification */}
      {toast.visible && (
        <div
          className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 ${
            toast.type === "delete"
              ? "toast-delete-animation"
              : "animate-fade-in-up"
          }`}
        >
          <div
            className={`px-4 py-3 rounded-lg shadow-lg flex items-center transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "error"
                ? "bg-red-500 text-white"
                : toast.type === "delete"
                ? "bg-purple-600 text-white border-l-4 border-red-500"
                : "bg-blue-500 text-white"
            }`}
          >
            {toast.type === "success" && (
              <svg
                className="w-5 h-5 mr-2 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            )}
            {toast.type === "error" && (
              <svg
                className="w-5 h-5 mr-2 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            )}
            {toast.type === "delete" && (
              <div className="relative">
                <svg
                  className="w-6 h-6 mr-3 animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  ></path>
                </svg>
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  !
                </span>
              </div>
            )}
            {toast.type === "info" && (
              <svg
                className="w-5 h-5 mr-2 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
            )}
            <div className="flex justify-between items-center w-full">
              <span
                className={`font-medium ${
                  toast.type === "delete" ? "text-lg" : ""
                }`}
              >
                {toast.message}
              </span>

              {toast.showUndo && (
                <button
                  onClick={handleUndoDelete}
                  className="ml-4 px-2 py-1 bg-white text-purple-600 text-sm font-bold rounded hover:bg-gray-100 transition-colors undo-button-pulse"
                >
                  UNDO
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hero section with improved styling */}
      <div className="w-full px-4 sm:px-6 mb-8">
        <div className="relative w-full h-60 sm:h-80 md:h-96 overflow-hidden rounded-xl shadow-lg">
          <img
            src="../src/assets/pexels-pixabay-433452.jpg"
            alt="Event Hero"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end pb-8 px-6">
            {/* Date display */}
            <div className="absolute top-4 right-6">
              <div className=" backdrop-blur-md px-5 py-3 rounded-lg shadow-lg border-l-4 border-blue-500 transform transition-transform duration-300 hover:scale-105">
                <p className="text-gray-800 font-semibold">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Discover Amazing Events
            </h1>
            <p className="text-white text-lg opacity-90 mb-4">
              Find and book tickets for the best events near you
            </p>

            {/* Filter Toggle Button */}
            {bookmarkedEvents.length > 0 && (
              <div className="flex">
                <button
                  onClick={() => {
                    const newState = !showOnlyBookmarked;
                    setShowOnlyBookmarked(newState);
                    // Store this preference in localStorage
                    localStorage.setItem("showOnlyBookmarked", newState);
                  }}
                  className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors ${
                    showOnlyBookmarked
                      ? "bg-yellow-500 text-white"
                      : "bg-white/80 text-gray-800 hover:bg-white"
                  }`}
                >
                  {showOnlyBookmarked ? (
                    <BsBookmarkFill className="w-4 h-4" />
                  ) : (
                    <BsBookmark className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {showOnlyBookmarked
                      ? "Showing Bookmarked Events"
                      : `Show Only Bookmarked Events${
                          filteredBookmarks.length > 0
                            ? ` (${filteredBookmarks.length})`
                            : ""
                        }`}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div
            className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${
              darkMode ? "border-dark-primary" : "border-blue-500"
            }`}
          ></div>
        </div>
      )}

      {!loading && liveEvents.length === 0 && pastEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          {/* <img
            src="../src/assets/no-events.svg"
            alt="No events"
            className="w-40 h-40 mb-4 opacity-60"
          /> */}
          <h3
            className={`text-xl font-medium mb-2 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            No events available
          </h3>
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
            Check back later for upcoming events
          </p>
        </div>
      )}

      {/* BOOKMARKED EVENTS SECTION */}
      {!loading && filteredBookmarks.length > 0 && !showOnlyBookmarked && (
        <div className="mb-12">
          <div className="px-4 sm:px-6 mb-6">
            <div className="flex items-center gap-3">
              <BsBookmarkFill
                className={
                  darkMode
                    ? "text-yellow-400 text-xl"
                    : "text-yellow-500 text-xl"
                }
              />
              <h2
                className={`text-2xl font-bold uppercase ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Your Bookmarked Events
              </h2>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mt-2"></div>
          </div>

          <div className="px-4 sm:px-6 pb-6 grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredBookmarks.map((event) => (
              <EventCard event={event} isPast={false} key={event._id} />
            ))}
          </div>
        </div>
      )}

      {/* LIVE EVENTS SECTION */}
      {liveEvents.length > 0 && !showOnlyBookmarked && (
        <div className="mb-12">
          <div className="px-4 sm:px-6 mb-6">
            <div className="flex items-center gap-3">
              <BsCalendarCheck
                className={
                  darkMode ? "text-green-400 text-xl" : "text-green-600 text-xl"
                }
              />
              <h2
                className={`text-2xl font-bold uppercase ${
                  darkMode ? "text-gray-200" : "text-gray-800"
                }`}
              >
                Live & Upcoming Events
              </h2>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-green-500 to-blue-500 rounded-full mt-2"></div>
          </div>

          <div className="px-4 sm:px-6 pb-6 grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {liveEvents.map((event) => (
              <EventCard event={event} isPast={false} key={event._id} />
            ))}
          </div>
        </div>
      )}

      {/* PAST EVENTS SECTION */}
      {pastEvents.length > 0 && !showOnlyBookmarked && (
        <div className="mb-12">
          <div className="px-4 sm:px-6 mb-6">
            <div className="flex items-center gap-3">
              <BsCalendarX
                className={
                  darkMode ? "text-red-400 text-xl" : "text-red-500 text-xl"
                }
              />
              <h2
                className={`text-2xl font-bold uppercase ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Past Events
              </h2>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-red-500 to-purple-500 rounded-full mt-2"></div>
          </div>

          <div className="px-4 sm:px-6 pb-6 grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {pastEvents.map((event) => (
              <EventCard event={event} isPast={true} key={event._id} />
            ))}
          </div>
        </div>
      )}

      {/* ALL BOOKMARKED EVENTS (when filter is active) */}
      {showOnlyBookmarked && filteredBookmarks.length > 0 && (
        <div className="mb-12">
          <div className="px-4 sm:px-6 mb-6">
            <div className="flex items-center gap-3">
              <BsBookmarkFill
                className={
                  darkMode
                    ? "text-yellow-400 text-xl"
                    : "text-yellow-500 text-xl"
                }
              />
              <h2
                className={`text-2xl font-bold uppercase ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                }`}
              >
                Your Bookmarked Events
              </h2>
            </div>
            <div className="h-1 w-24 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mt-2"></div>
          </div>

          <div className="px-4 sm:px-6 pb-6 grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredBookmarks.map((event) => (
              <EventCard event={event} isPast={false} key={event._id} />
            ))}
          </div>
        </div>
      )}

      {/* Show message when filter is active but no bookmarks */}
      {showOnlyBookmarked && filteredBookmarks.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <BsBookmark className="w-16 h-16 mb-4 opacity-50 text-gray-400" />
          <h3
            className={`text-xl font-medium mb-2 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {bookmarkedEvents.length > 0
              ? "No upcoming bookmarked events"
              : "No bookmarked events"}
          </h3>
          <p className={darkMode ? "text-gray-400" : "text-gray-500"}>
            {bookmarkedEvents.length > 0
              ? "Your bookmarked events have passed"
              : "Save events you're interested in to find them here"}
          </p>
          <button
            onClick={() => {
              setShowOnlyBookmarked(false);
              localStorage.setItem("showOnlyBookmarked", false);
            }}
            className="mt-4 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Show All Events
          </button>
        </div>
      )}
    </div>
  );
}
