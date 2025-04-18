import React, { useState, useEffect, useRef, useContext } from "react";
import FeedbackList from "./FeedbackList"; // Import the new component
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { ThemeContext } from "../ThemeContext"; // Import ThemeContext
import { UserContext } from "../UserContext"; // Import UserContext
import axios from "axios"; // Import axios for API calls

const Feedback = () => {
  const navigate = useNavigate(); // Initialize navigate for routing
  const { darkMode, toggleDarkMode } = useContext(ThemeContext); // Get darkMode and toggleDarkMode from context
  const { user } = useContext(UserContext); // Get user from UserContext
  const [isUserAdmin, setIsUserAdmin] = useState(false); // Track admin status
  const [eventOptions, setEventOptions] = useState([]); // State for events from backend
  const [loading, setLoading] = useState(true); // Loading state
  const [pageLoading, setPageLoading] = useState(true); // Initial page loading state

  // Show page loader for 1 second
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Check if user is admin from context
    if (user && user.role === "admin") {
      setIsUserAdmin(true);
    }
    // Try from localStorage if not in context
    else {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser.role === "admin") {
            setIsUserAdmin(true);
          }
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, [user]);

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          "http://localhost:4000/events/for-feedback"
        );
        console.log("Event options from API:", response.data);
        setEventOptions(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching events:", error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    event: "",
    customEvent: "",
    message: "",
    rating: 0,
  });

  const [showCustomEvent, setShowCustomEvent] = useState(false);
  const [errors, setErrors] = useState({});
  const [feedbackList, setFeedbackList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({
    visible: false,
    message: "",
    type: "success",
  });
  const [eventFilter, setEventFilter] = useState("all"); // "all", "past", "present"

  // Create refs for form fields
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const eventRef = useRef(null);
  const customEventRef = useRef(null);
  const messageRef = useRef(null);
  const ratingRef = useRef(null);
  const submitRef = useRef(null);

  // Fetch feedback from the backend
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await axios.get("http://localhost:4000/feedback");
        setFeedbackList(response.data);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      }
    };

    fetchFeedback();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (toast.visible) {
      const timer = setTimeout(() => {
        setToast({ visible: false, message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.visible]);

  // Filter events based on selection
  const filteredEvents = eventOptions.filter((event) => {
    if (eventFilter === "all") return true;
    return event.status === eventFilter;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Handle special case for event dropdown
    if (name === "event") {
      if (value === "custom") {
        setShowCustomEvent(true);
        // Focus the custom event input after a short delay
        setTimeout(() => {
          customEventRef.current?.focus();
        }, 10);
      } else {
        setShowCustomEvent(false);
      }
    }

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const handleKeyDown = (e, nextFieldRef) => {
    // If Enter key is pressed and not in the message textarea
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
      e.preventDefault(); // Prevent form submission
      if (nextFieldRef && nextFieldRef.current) {
        nextFieldRef.current.focus();
      }
    }
  };

  const handleRatingChange = (rating) => {
    setFormData({
      ...formData,
      rating,
    });

    // Clear rating error if it exists
    if (errors.rating) {
      setErrors({
        ...errors,
        rating: "",
      });
    }

    // Move focus to submit button after selecting rating
    if (submitRef.current) {
      submitRef.current.focus();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Check for empty required fields
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    // Check event - either dropdown selection or custom event input
    if (formData.event === "") {
      newErrors.event = "Please select an event";
    } else if (formData.event === "custom" && !formData.customEvent.trim()) {
      newErrors.customEvent = "Please enter the event name";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Feedback message is required";
    }

    if (formData.rating === 0) {
      newErrors.rating = "Please provide a rating";
    }

    setErrors(newErrors);

    // If we have any errors, show a toast and focus the first field with error
    if (Object.keys(newErrors).length > 0) {
      setToast({
        visible: true,
        message: "Please fill in all required fields",
        type: "warning",
      });

      // Focus the first field with an error
      if (newErrors.name) nameRef.current?.focus();
      else if (newErrors.email) emailRef.current?.focus();
      else if (newErrors.event) eventRef.current?.focus();
      else if (newErrors.customEvent) customEventRef.current?.focus();
      else if (newErrors.message) messageRef.current?.focus();
      else if (newErrors.rating) ratingRef.current?.focus();

      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields before submission
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    // Prepare the final event name for feedback
    const finalEventName =
      formData.event === "custom" ? formData.customEvent : formData.event;

    try {
      // Send feedback to the backend
      const feedbackData = {
        ...formData,
        event: finalEventName,
      };

      const response = await axios.post(
        "http://localhost:4000/feedback",
        feedbackData
      );

      // Add the new feedback to the list
      setFeedbackList([response.data, ...feedbackList]);

      // Save to localStorage for EventPage's view feedback feature
      const today = new Date();
      const formattedDate = today.toISOString().split("T")[0]; // Format: YYYY-MM-DD

      // Get the selected event object if not using custom event
      const selectedEvent =
        formData.event !== "custom"
          ? eventOptions.find((event) => event.name === formData.event)
          : null;

      // Create the feedback to save in localStorage
      // This needs to match what EventPage.jsx expects
      const localFeedback = {
        name: formData.name,
        // EventPage.jsx filters by event.title, so we need to use the right property
        // If we have a selected event with title, use that; otherwise use the name directly
        event: selectedEvent?.title || finalEventName,
        message: formData.message,
        rating: formData.rating,
        date: formattedDate,
      };

      console.log("Selected event:", selectedEvent);
      console.log(
        "Event name being saved to localStorage:",
        localFeedback.event
      );

      // Get existing feedback from localStorage
      const existingFeedback = JSON.parse(
        localStorage.getItem("eventFeedback") || "[]"
      );

      // Add new feedback
      existingFeedback.push(localFeedback);

      // Save back to localStorage
      localStorage.setItem("eventFeedback", JSON.stringify(existingFeedback));

      // Show success toast
      setToast({
        visible: true,
        message: "Your feedback has been submitted successfully!",
        type: "success",
      });

      // Just reset the form without any redirects
      resetForm();
    } catch (error) {
      console.error("Error submitting feedback:", error);

      setSubmitting(false);
      setToast({
        visible: true,
        message: "Failed to submit feedback. Please try again.",
        type: "error",
      });
    }
  };

  // Helper function to reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      event: "",
      customEvent: "",
      message: "",
      rating: 0,
    });
    setShowCustomEvent(false);
    setSubmitting(false);
    // Focus back to the first field for a new entry
    nameRef.current?.focus();
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/feedback/${id}`);

      // Get the feedback that's being deleted to match with localStorage
      const feedbackToDelete = feedbackList.find(
        (feedback) => feedback._id === id
      );

      // Remove from state
      const updatedFeedbackList = feedbackList.filter(
        (feedback) => feedback._id !== id
      );
      setFeedbackList(updatedFeedbackList);

      // Also remove from localStorage if it exists there
      if (feedbackToDelete) {
        // Get existing feedback
        const storedFeedback = JSON.parse(
          localStorage.getItem("eventFeedback") || "[]"
        );

        // Filter out the deleted feedback (match by name, event and message)
        const updatedStoredFeedback = storedFeedback.filter(
          (item) =>
            !(
              item.name === feedbackToDelete.name &&
              item.event === feedbackToDelete.event &&
              item.message === feedbackToDelete.message
            )
        );

        // Save back to localStorage
        localStorage.setItem(
          "eventFeedback",
          JSON.stringify(updatedStoredFeedback)
        );
      }

      // Show delete toast
      setToast({
        visible: true,
        message: "Feedback has been deleted",
        type: "error",
      });
    } catch (error) {
      console.error("Error deleting feedback:", error);
      setToast({
        visible: true,
        message: "Failed to delete feedback",
        type: "error",
      });
    }
  };

  const toastStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: "none",
      zIndex: 9999,
    },
    container: {
      position: "absolute",
      top: "20px",
      right: "20px",
      minWidth: "300px",
      maxWidth: "400px",
      transition: "all 0.3s ease-in-out",
      animation: "slideIn 0.3s ease-out forwards",
      pointerEvents: "auto",
    },
    success: {
      backgroundColor: "#EDF7ED",
      color: "#1E4620",
      borderLeft: "4px solid #4CAF50",
    },
    error: {
      backgroundColor: "#FDEDED",
      color: "#5F2120",
      borderLeft: "4px solid #EF5350",
    },
    warning: {
      backgroundColor: "#FFF4E5",
      color: "#663C00",
      borderLeft: "4px solid #FF9800",
    },
    content: {
      padding: "16px",
      borderRadius: "4px",
      boxShadow: "0 3px 10px rgba(0, 0, 0, 0.1)",
      display: "flex",
      alignItems: "center",
    },
    icon: {
      marginRight: "12px",
      flexShrink: 0,
    },
    message: {
      margin: 0,
      fontWeight: 500,
    },
  };

  // Combine base styles with type-specific styles
  const getToastTypeStyles = () => {
    if (toast.type === "success") return toastStyles.success;
    if (toast.type === "warning") return toastStyles.warning;
    return toastStyles.error;
  };

  // Get toast icon based on type
  const getToastIcon = () => {
    if (toast.type === "success") {
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z"
            fill="#4CAF50"
          />
        </svg>
      );
    }

    if (toast.type === "warning") {
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 5.99L19.53 19H4.47L12 5.99ZM12 2L1 21H23L12 2ZM13 16H11V18H13V16ZM13 10H11V14H13V10Z"
            fill="#FF9800"
          />
        </svg>
      );
    }

    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z"
          fill="#EF5350"
        />
      </svg>
    );
  };

  // Define keyframes style in head once
  useEffect(() => {
    if (!document.getElementById("toast-animation-style")) {
      const style = document.createElement("style");
      style.id = "toast-animation-style";
      style.innerHTML = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const style = document.getElementById("toast-animation-style");
      if (style) {
        document.head.removeChild(style);
      }
    };
  }, []);

  // Add a function to handle going back
  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };

  return (
    <>
      {/* Page Loading Spinner */}
      {pageLoading && (
        <div className="min-h-screen w-full flex items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-700 dark:border-blue-400"></div>
            <p className="text-xl font-semibold mt-4 dark:text-gray-200">
              Loading Your Feedback...
            </p>
          </div>
        </div>
      )}

      {/* Toast Container - Completely separate from the main layout */}
      {toast.visible && (
        <div style={toastStyles.overlay}>
          <div style={toastStyles.container}>
            <div style={{ ...toastStyles.content, ...getToastTypeStyles() }}>
              <div style={toastStyles.icon}>{getToastIcon()}</div>
              <p style={toastStyles.message}>{toast.message}</p>
            </div>
          </div>
        </div>
      )}

      <div
        className={`w-full p-8 ${
          darkMode ? "bg-gray-800" : "bg-gray-100"
        } shadow-lg rounded-lg flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8 transition-all duration-500 relative min-h-screen ${
          pageLoading ? "hidden" : ""
        }`}
      >
        {/* Feedback Form */}
        <div
          className={`w-full lg:w-1/2 ${
            darkMode ? "bg-gray-700" : "bg-white"
          } p-8 rounded-lg shadow-md transition-all duration-300 flex flex-col`}
        >
          <div className="flex justify-between items-center mb-6">
            <h1
              className={`text-3xl font-bold ${
                darkMode ? "text-white" : "text-gray-800"
              } transition-transform duration-200`}
            >
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-indigo-600 transition-all duration-300">
                Event Feedback
              </span>
            </h1>

            {/* Back Button */}
            <button
              onClick={handleGoBack}
              className={`py-2 px-4 flex items-center text-sm rounded-lg ${
                darkMode
                  ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              } transition-all duration-200`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
            <div className="transition-all duration-200 transform">
              <label
                htmlFor="name"
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } transition-colors duration-200`}
              >
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                ref={nameRef}
                value={formData.name}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, emailRef)}
                className={`mt-1 block w-full px-4 py-2 border ${
                  errors.name
                    ? "border-red-500"
                    : darkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ${
                  darkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900"
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="transition-all duration-200 transform">
              <label
                htmlFor="email"
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } transition-colors duration-200`}
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                ref={emailRef}
                value={formData.email}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, eventRef)}
                className={`mt-1 block w-full px-4 py-2 border ${
                  errors.email
                    ? "border-red-500"
                    : darkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ${
                  darkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900"
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Event Selection */}
            <div className="transition-all duration-200 transform">
              <label
                htmlFor="event"
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } transition-colors duration-200`}
              >
                Event <span className="text-red-500">*</span>
              </label>

              {/* Event Filter Tabs */}
              <div
                className={`flex border-b ${
                  darkMode ? "border-gray-600" : "border-gray-200"
                } mb-3`}
              >
                <button
                  type="button"
                  onClick={() => setEventFilter("all")}
                  className={`py-2 px-4 text-sm font-medium ${
                    eventFilter === "all"
                      ? "text-indigo-500 border-b-2 border-indigo-500"
                      : darkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  All Events
                </button>
                <button
                  type="button"
                  onClick={() => setEventFilter("present")}
                  className={`py-2 px-4 text-sm font-medium ${
                    eventFilter === "present"
                      ? "text-indigo-500 border-b-2 border-indigo-500"
                      : darkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Current Events
                </button>
                <button
                  type="button"
                  onClick={() => setEventFilter("past")}
                  className={`py-2 px-4 text-sm font-medium ${
                    eventFilter === "past"
                      ? "text-indigo-500 border-b-2 border-indigo-500"
                      : darkMode
                      ? "text-gray-400 hover:text-gray-300"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Past Events
                </button>
              </div>

              {loading ? (
                <div
                  className={`flex items-center justify-center py-4 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading events...
                </div>
              ) : (
                <select
                  id="event"
                  name="event"
                  ref={eventRef}
                  value={formData.event}
                  onChange={handleChange}
                  onKeyDown={(e) =>
                    handleKeyDown(
                      e,
                      showCustomEvent ? customEventRef : messageRef
                    )
                  }
                  className={`mt-1 block w-full px-4 py-2 border ${
                    errors.event
                      ? "border-red-500"
                      : darkMode
                      ? "border-gray-600"
                      : "border-gray-300"
                  } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ${
                    darkMode
                      ? "bg-gray-600 text-white"
                      : "bg-white text-gray-900"
                  }`}
                >
                  <option value="">Select an event</option>
                  {filteredEvents.map((event) => (
                    <option key={event.id} value={event.name}>
                      {event.name}
                    </option>
                  ))}
                  <option value="custom">Other (not listed)</option>
                </select>
              )}
              {errors.event && (
                <p className="mt-1 text-sm text-red-500">{errors.event}</p>
              )}

              {/* Custom Event Input (shows only when "Other" is selected) */}
              {showCustomEvent && (
                <div className="mt-3">
                  <label
                    htmlFor="customEvent"
                    className={`block text-sm font-medium ${
                      darkMode ? "text-gray-200" : "text-gray-700"
                    }`}
                  >
                    Custom Event Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="customEvent"
                    name="customEvent"
                    ref={customEventRef}
                    value={formData.customEvent}
                    onChange={handleChange}
                    onKeyDown={(e) => handleKeyDown(e, messageRef)}
                    placeholder="Enter event name"
                    className={`mt-1 block w-full px-4 py-2 border ${
                      errors.customEvent
                        ? "border-red-500"
                        : darkMode
                        ? "border-gray-600"
                        : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                      darkMode
                        ? "bg-gray-600 text-white placeholder-gray-400"
                        : "bg-white text-gray-900"
                    }`}
                  />
                  {errors.customEvent && (
                    <p className="mt-1 text-sm text-red-500">
                      {errors.customEvent}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="transition-all duration-200 transform">
              <label
                htmlFor="message"
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } transition-colors duration-200`}
              >
                Feedback <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                ref={messageRef}
                value={formData.message}
                onChange={handleChange}
                onKeyDown={(e) => {
                  // Only if Ctrl+Enter is pressed in textarea, move to rating
                  if (e.key === "Enter" && e.ctrlKey) {
                    e.preventDefault();
                    ratingRef.current?.focus();
                  }
                }}
                rows="4"
                className={`mt-1 block w-full px-4 py-2 border ${
                  errors.message
                    ? "border-red-500"
                    : darkMode
                    ? "border-gray-600"
                    : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200 ${
                  darkMode ? "bg-gray-600 text-white" : "bg-white text-gray-900"
                }`}
              />
              <p
                className={`mt-1 text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Press Ctrl+Enter to move to Rating
              </p>
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>
            <div className="transition-all duration-200 transform">
              <label
                className={`block text-sm font-medium ${
                  darkMode ? "text-gray-200" : "text-gray-700"
                } mb-3 transition-colors duration-200`}
              >
                Rating <span className="text-red-500">*</span>
              </label>
              <div
                ref={ratingRef}
                tabIndex="0"
                onKeyDown={(e) => {
                  // Allow 1-5 number keys to select rating
                  if (e.key >= "1" && e.key <= "5") {
                    handleRatingChange(parseInt(e.key));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    submitRef.current?.focus();
                  }
                }}
                className={`flex space-x-3 items-center ${
                  darkMode ? "bg-gray-600" : "bg-gray-50"
                } p-3 rounded-md ${
                  errors.rating
                    ? "border border-red-500"
                    : darkMode
                    ? "border border-gray-500"
                    : "border border-gray-100"
                }`}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => handleRatingChange(star)}
                    className={`w-12 h-12 flex items-center justify-center rounded-full ${
                      formData.rating >= star
                        ? "text-yellow-500 bg-yellow-50"
                        : darkMode
                        ? "text-gray-400 bg-gray-700"
                        : "text-gray-300 bg-white"
                    } text-2xl transition-transform duration-200 shadow-sm border ${
                      darkMode ? "border-gray-500" : "border-gray-200"
                    }`}
                  >
                    ★
                  </button>
                ))}
                <span
                  className={`ml-3 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  } font-medium`}
                >
                  {formData.rating > 0
                    ? `${formData.rating} ${
                        formData.rating === 1 ? "Star" : "Stars"
                      }`
                    : "No Rating"}
                </span>
              </div>
              <p
                className={`mt-1 text-xs ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Use number keys 1-5 to select rating
              </p>
              {errors.rating && (
                <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
              )}
            </div>
            <div className="flex">
              <button
                ref={submitRef}
                type="submit"
                disabled={submitting}
                className={`w-full py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  submitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200`}
              >
                {submitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  "Submit Feedback"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Feedback Display */}
        <FeedbackList
          feedbackList={feedbackList}
          handleDelete={handleDelete}
          darkMode={darkMode}
          userIsAdmin={isUserAdmin}
        />
      </div>
    </>
  );
};

export default Feedback;
