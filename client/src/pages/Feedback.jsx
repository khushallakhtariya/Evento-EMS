import React, { useState, useEffect, useRef } from "react";
import FeedbackList from "./FeedbackList"; // Import the new component
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation

const Feedback = () => {
  const navigate = useNavigate(); // Initialize navigate for routing
  // Predefined list of past and present events
  const eventOptions = [
    { id: 1, name: "Annual Tech Conference 2023", status: "past" },
    { id: 2, name: "Music Festival Summer Edition", status: "past" },
    { id: 3, name: "Web Development Workshop", status: "present" },
    { id: 4, name: "Startup Networking Event", status: "present" },
    { id: 5, name: "Product Launch Party", status: "present" },
    { id: 6, name: "Design Thinking Seminar", status: "past" },
    { id: 7, name: "AI & ML Conference", status: "present" },
    { id: 8, name: "Hackathon Challenge", status: "present" },
  ];

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

  useEffect(() => {
    const savedFeedback = localStorage.getItem("eventFeedback");
    if (savedFeedback) {
      setFeedbackList(JSON.parse(savedFeedback));
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields before submission
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    // Prepare the final event name for feedback
    const finalEventName =
      formData.event === "custom" ? formData.customEvent : formData.event;

    setTimeout(() => {
      const newFeedback = {
        ...formData,
        // Override event with the proper name
        event: finalEventName,
        id: Date.now(),
        date: new Date().toLocaleDateString(),
      };
      const updatedFeedbackList = [...feedbackList, newFeedback];
      setFeedbackList(updatedFeedbackList);
      localStorage.setItem(
        "eventFeedback",
        JSON.stringify(updatedFeedbackList)
      );
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

      // Show success toast
      setToast({
        visible: true,
        message: "Your feedback has been submitted successfully!",
        type: "success",
      });

      // Focus back to the first field for a new entry
      nameRef.current?.focus();
    }, 600);
  };

  const handleDelete = (index) => {
    const updatedFeedbackList = feedbackList.filter((_, i) => i !== index);
    setFeedbackList(updatedFeedbackList);
    localStorage.setItem("eventFeedback", JSON.stringify(updatedFeedbackList));

    // Show delete toast
    setToast({
      visible: true,
      message: "Feedback has been deleted",
      type: "error",
    });
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

      <div className="w-full p-8 bg-gray-100 shadow-lg rounded-lg flex flex-col lg:flex-row space-y-8 lg:space-y-0 lg:space-x-8 transition-all duration-500 relative min-h-screen">
        {/* Feedback Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 rounded-lg shadow-md transition-all duration-300 flex flex-col">
          <h1 className="text-3xl font-bold mb-6 text-gray-800 transition-transform duration-200">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-300">
              Event Feedback
            </span>
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6 flex-grow">
            <div className="transition-all duration-200 transform">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 transition-colors duration-200"
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
                  errors.name ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500">{errors.name}</p>
              )}
            </div>
            <div className="transition-all duration-200 transform">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 transition-colors duration-200"
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
                  errors.email ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Event Selection */}
            <div className="transition-all duration-200 transform">
              <label
                htmlFor="event"
                className="block text-sm font-medium text-gray-700 transition-colors duration-200"
              >
                Event <span className="text-red-500">*</span>
              </label>

              {/* Event Filter Tabs */}
              <div className="flex border-b border-gray-200 mb-3">
                <button
                  type="button"
                  onClick={() => setEventFilter("all")}
                  className={`py-2 px-4 text-sm font-medium ${
                    eventFilter === "all"
                      ? "text-indigo-600 border-b-2 border-indigo-600"
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
                      ? "text-indigo-600 border-b-2 border-indigo-600"
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
                      ? "text-indigo-600 border-b-2 border-indigo-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Past Events
                </button>
              </div>

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
                  errors.event ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
              >
                <option value="">Select an event</option>
                {filteredEvents.map((event) => (
                  <option key={event.id} value={event.name}>
                    {event.name}
                  </option>
                ))}
                <option value="custom">Other (not listed)</option>
              </select>
              {errors.event && (
                <p className="mt-1 text-sm text-red-500">{errors.event}</p>
              )}

              {/* Custom Event Input (shows only when "Other" is selected) */}
              {showCustomEvent && (
                <div className="mt-3">
                  <label
                    htmlFor="customEvent"
                    className="block text-sm font-medium text-gray-700"
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
                      errors.customEvent ? "border-red-500" : "border-gray-300"
                    } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
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
                className="block text-sm font-medium text-gray-700 transition-colors duration-200"
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
                  errors.message ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all duration-200`}
              />
              <p className="mt-1 text-xs text-gray-500">
                Press Ctrl+Enter to move to Rating
              </p>
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message}</p>
              )}
            </div>
            <div className="transition-all duration-200 transform">
              <label className="block text-sm font-medium text-gray-700 mb-3 transition-colors duration-200">
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
                className={`flex space-x-3 items-center bg-gray-50 p-3 rounded-md ${
                  errors.rating
                    ? "border border-red-500"
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
                        : "text-gray-300 bg-white"
                    } text-2xl transition-transform duration-200 shadow-sm border border-gray-200`}
                  >
                    ★
                  </button>
                ))}
                <span className="ml-3 text-gray-600 font-medium">
                  {formData.rating > 0
                    ? `${formData.rating} ${
                        formData.rating === 1 ? "Star" : "Stars"
                      }`
                    : "No Rating"}
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Use number keys 1-5 to select rating
              </p>
              {errors.rating && (
                <p className="mt-1 text-sm text-red-500">{errors.rating}</p>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={handleGoBack}
                type="button"
                className="w-1/2 py-3 px-4 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <span className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
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
                </span>
              </button>

              <button
                ref={submitRef}
                type="submit"
                disabled={submitting}
                className={`w-1/2 py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                  submitting
                    ? "bg-indigo-400 cursor-not-allowed"
                    : "bg-indigo-600"
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
        <FeedbackList feedbackList={feedbackList} handleDelete={handleDelete} />
      </div>
    </>
  );
};

export default Feedback;
