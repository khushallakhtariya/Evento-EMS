import axios from "axios";

import { useEffect, useState, useContext } from "react";
import { Link, useParams } from "react-router-dom";
import { AiFillCalendar } from "react-icons/ai";
import { MdLocationPin, MdEmail, MdPeople } from "react-icons/md";
import {
  FaCopy,
  FaWhatsappSquare,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
} from "react-icons/fa";
import { ThemeContext } from "../ThemeContext";
import { BsMoonFill, BsSunFill, BsPeopleFill } from "react-icons/bs";
import { BiMessageDetail, BiArrowBack } from "react-icons/bi";

export default function EventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isEventPassed, setIsEventPassed] = useState(false);
  const { darkMode, toggleDarkMode } = useContext(ThemeContext);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviteSent, setInviteSent] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState(""); // "error", "success", etc.
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackList, setFeedbackList] = useState([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  //! Fetching the event data from server by ID ------------------------------------------
  useEffect(() => {
    if (!id) {
      return;
    }
    axios
      .get(`/event/${id}`)
      .then((response) => {
        setEvent(response.data);

        // Check if event is in the past
        if (response.data.eventDate) {
          const currentDateTime = new Date();
          const eventDate = new Date(response.data.eventDate);

          // Parse time (assuming format like "10:00 AM" or "14:30")
          if (response.data.eventTime) {
            const timeParts = response.data.eventTime.match(
              /(\d+):(\d+)\s*(AM|PM)?/i
            );
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
          setIsEventPassed(eventDate < currentDateTime);
        }
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, [id]);

  // Function to handle viewing feedback
  const handleViewFeedback = () => {
    setLoadingFeedback(true);
    // Get feedback for this event from localStorage
    const allFeedback = JSON.parse(
      localStorage.getItem("eventFeedback") || "[]"
    );
    // Filter feedback for this specific event
    const eventFeedback = allFeedback.filter(
      (feedback) => feedback.event === event.title
    );
    setFeedbackList(eventFeedback);
    setLoadingFeedback(false);
    setShowFeedbackModal(true);
  };

  //! Copy Functionalities -----------------------------------------------
  const handleCopyLink = () => {
    const linkToShare = window.location.href;
    navigator.clipboard.writeText(linkToShare).then(() => {
      alert("Link copied to clipboard!");
    });
  };

  const handleWhatsAppShare = () => {
    const linkToShare = window.location.href;
    const whatsappMessage = encodeURIComponent(
      `Check out this event: ${event.title} - ${linkToShare}`
    );
    window.open(`whatsapp://send?text=${whatsappMessage}`);
  };

  const handleFacebookShare = () => {
    const linkToShare = window.location.href;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      linkToShare
    )}`;
    window.open(facebookShareUrl);
  };

  const handleTwitterShare = () => {
    const linkToShare = window.location.href;
    const twitterMessage = encodeURIComponent(
      `Check out this event: ${event.title} ${linkToShare}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${twitterMessage}`);
  };

  const handleLinkedInShare = () => {
    const linkToShare = window.location.href;
    const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      linkToShare
    )}`;
    window.open(linkedinShareUrl);
  };

  const handleEmailShare = () => {
    const linkToShare = window.location.href;
    const subject = encodeURIComponent(`Join me at ${event.title}`);
    const body = encodeURIComponent(
      `Check out this event: ${event.title}\n\nDate: ${
        event.eventDate.split("T")[0]
      }\nTime: ${event.eventTime}\nLocation: ${
        event.location
      }\n\n${linkToShare}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const handleInviteFriends = () => {
    if (isEventPassed) {
      setToastMessage(
        "This event has already ended. You cannot send invitations anymore."
      );
      setToastType("error");
      setShowToast(true);

      // Hide toast after 3 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return;
    }
    setShowInviteModal(true);
  };

  const handleSendInvite = (e) => {
    e.preventDefault();

    // Call the API to send the invitation
    axios
      .post(`/event/${id}/invite`, {
        email: inviteEmail,
        message: inviteMessage,
      })
      .then((response) => {
        setInviteSent(true);

        // Reset form after 3 seconds
        setTimeout(() => {
          setInviteSent(false);
          setInviteEmail("");
          setInviteMessage("");
          setShowInviteModal(false);
        }, 3000);
      })
      .catch((error) => {
        console.error("Error sending invitation:", error);
        alert("Failed to send invitation. Please try again.");
      });
  };

  console.log(event?.image);

  if (!event) return "";
  return (
    <div
      className={`flex flex-col w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen transition-colors duration-300 ease-in-out main-container ${
        darkMode ? "bg-dark-background text-dark-text" : "bg-white"
      }`}
    >
      {/* Hero Image Section */}
      <div className="w-[90%] mx-auto mb-8 overflow-hidden rounded-xl shadow-xl relative">
        {event.image && (
          <div className="relative h-64 sm:h-80 md:h-96 lg:h-[500px] w-full">
            <img
              src={`http://localhost:4000/${event.image}`}
              alt={event.title}
              className="w-full h-full object-cover object-center transition-transform duration-700 ease-in-out hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-8 text-white">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-shadow">
                {event.title.toUpperCase()}
              </h2>
              <p className="text-lg sm:text-xl mt-2 opacity-90">
                {event.eventDate.split("T")[0]} • {event.eventTime}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="w-[90%] mx-auto">
        {/* Event Header Section */}
        <div
          className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b pb-8 w-full transition-colors duration-300 ${
            darkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="w-full md:w-auto">
            <h1
              className={`text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 break-words ${
                darkMode ? "text-dark-text" : "text-gray-800"
              }`}
            >
              {event.title.toUpperCase()}
            </h1>
            <h2
              className={`text-xl sm:text-2xl font-bold ${
                darkMode ? "text-dark-primary" : "text-blue-600"
              }`}
            >
              {event.ticketPrice === 0 ? "FREE EVENT" : `₹${event.ticketPrice}`}
            </h2>
          </div>
          <div className="flex flex-row items-center gap-4">
            <button
              onClick={handleViewFeedback}
              className={`py-2 sm:py-3 px-4 sm:px-6 rounded-lg shadow-lg transition duration-300 text-base font-bold flex items-center justify-center ${
                darkMode
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-indigo-500 hover:to-purple-600 text-white"
              }`}
            >
              <BiMessageDetail className="mr-2 text-sm" /> View Feedback
            </button>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
              {!isEventPassed ? (
                <>
                  {(() => {
                    // Calculate capacity
                    const capacity = event.Participants || 100;
                    const bookedCount = event.Count || 0;
                    const isSoldOut = bookedCount >= capacity;
                    const availablePercentage = Math.max(
                      0,
                      Math.min(100, ((capacity - bookedCount) / capacity) * 100)
                    );

                    // Determine button style based on capacity
                    let buttonText = "Book Ticket";
                    let buttonClass = darkMode
                      ? "bg-dark-primary hover:bg-blue-700"
                      : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-600 hover:to-blue-700";

                    // Show different states based on availability
                    if (isSoldOut) {
                      buttonText = "Sold Out";
                      buttonClass = darkMode
                        ? "bg-gray-600 cursor-not-allowed"
                        : "bg-gray-500 cursor-not-allowed";
                    } else if (availablePercentage <= 10) {
                      buttonText = "Limited Spots - Book Now!";
                      buttonClass = darkMode
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-600";
                    } else if (availablePercentage <= 30) {
                      buttonText = "Going Fast - Book Now";
                      buttonClass = darkMode
                        ? "bg-orange-600 hover:bg-orange-700"
                        : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-500";
                    }

                    return (
                      <>
                        {isSoldOut ? (
                          <div className="w-full">
                            <button
                              disabled
                              className={`w-full text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg text-lg font-bold opacity-90 ${buttonClass}`}
                            >
                              {buttonText}
                            </button>
                            <p className="text-center text-sm text-red-500 mt-2 font-medium">
                              All {capacity} spots have been filled
                            </p>
                          </div>
                        ) : (
                          <Link
                            to={`/event/${event._id}/ordersummary`}
                            className="w-full"
                          >
                            <button
                              className={`w-full text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg transition duration-300 transform hover:-translate-y-1 text-lg font-bold ${buttonClass}`}
                            >
                              {buttonText}
                            </button>
                            <p className="text-center text-sm mt-1">
                              <span
                                className={
                                  availablePercentage <= 30
                                    ? "text-red-500 font-medium"
                                    : darkMode
                                    ? "text-gray-400"
                                    : "text-gray-600"
                                }
                              >
                                {capacity - bookedCount} of {capacity} spots
                                remaining
                              </span>
                            </p>
                          </Link>
                        )}
                      </>
                    );
                  })()}
                </>
              ) : (
                <>
                  <div className="w-full">
                    <span className="inline-block py-3 px-6 bg-red-100 text-red-700 rounded-lg font-medium">
                      This event has ended
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Event Description */}
        <div className="mb-12 w-[90%] mx-auto">
          <div
            className={`text-base sm:text-lg md:text-xl leading-relaxed mb-6 ${
              darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {event.description}
          </div>
          <div
            className={`text-base sm:text-lg md:text-xl font-bold ${
              darkMode ? "text-dark-primary" : "text-blue-700"
            }`}
          >
            Organized By{" "}
            <span className={darkMode ? "text-gray-300" : "text-gray-800"}>
              {event.organizedBy}
            </span>
          </div>
        </div>

        {/* Event Details Section */}
        <div
          className={`rounded-xl p-4 sm:p-6 md:p-8 mb-12 shadow-md w-[90%] mx-auto transition-colors duration-300 ${
            darkMode ? "bg-dark-surface" : "bg-gray-50"
          }`}
        >
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-bold mb-6 ${
              darkMode ? "text-dark-text" : "text-gray-800"
            }`}
          >
            When and Where
          </h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div
              className={`flex items-start gap-4 p-4 sm:p-6 rounded-lg shadow-sm transition-colors duration-300 ${
                darkMode ? "bg-dark-background" : "bg-white"
              }`}
            >
              <AiFillCalendar
                className={`text-2xl sm:text-3xl flex-shrink-0 ${
                  darkMode ? "text-dark-primary" : "text-blue-600"
                }`}
              />
              <div className="w-full">
                <h3
                  className={`text-lg sm:text-xl font-bold mb-2 ${
                    darkMode ? "text-dark-text" : "text-gray-800"
                  }`}
                >
                  Date and Time
                </h3>
                <p
                  className={`text-base sm:text-lg ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="font-medium">Date:</span>{" "}
                  {event.eventDate.split("T")[0]}
                </p>
                <p
                  className={`text-base sm:text-lg ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  <span className="font-medium">Time:</span> {event.eventTime}
                </p>
              </div>
            </div>
            <div
              className={`flex items-start gap-4 p-4 sm:p-6 rounded-lg shadow-sm transition-colors duration-300 ${
                darkMode ? "bg-dark-background" : "bg-white"
              }`}
            >
              <MdLocationPin
                className={`text-2xl sm:text-3xl flex-shrink-0 ${
                  darkMode ? "text-dark-primary" : "text-blue-600"
                }`}
              />
              <div className="w-full">
                <h3
                  className={`text-lg sm:text-xl font-bold mb-2 ${
                    darkMode ? "text-dark-text" : "text-gray-800"
                  }`}
                >
                  Location
                </h3>
                <p
                  className={`text-base sm:text-lg break-words ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  {event.location}
                </p>
              </div>
            </div>

            {/* Capacity Indicator */}
            {!isEventPassed && (
              <div
                className={`flex items-start gap-4 p-4 sm:p-6 rounded-lg shadow-sm transition-colors duration-300 ${
                  darkMode ? "bg-dark-background" : "bg-white"
                }`}
              >
                <BsPeopleFill
                  className={`text-2xl sm:text-3xl flex-shrink-0 ${
                    darkMode ? "text-dark-primary" : "text-blue-600"
                  }`}
                />
                <div className="w-full">
                  <h3
                    className={`text-lg sm:text-xl font-bold mb-2 ${
                      darkMode ? "text-dark-text" : "text-gray-800"
                    }`}
                  >
                    Event Capacity
                  </h3>

                  {/* Calculate capacity usage */}
                  {(() => {
                    const capacity = event.Participants || 100;
                    const bookedCount = event.Count || 0;
                    const availablePercentage = Math.max(
                      0,
                      Math.min(100, ((capacity - bookedCount) / capacity) * 100)
                    );

                    // Determine capacity status text and color
                    let capacityStatus = "Available";
                    let capacityColor = darkMode
                      ? "text-green-400"
                      : "text-green-600";
                    let capacityBgColor = darkMode
                      ? "bg-green-900/20"
                      : "bg-green-100/60";

                    if (availablePercentage <= 10) {
                      capacityStatus = "Almost Full";
                      capacityColor = darkMode
                        ? "text-red-400"
                        : "text-red-600";
                      capacityBgColor = darkMode
                        ? "bg-red-900/20"
                        : "bg-red-100/60";
                    } else if (availablePercentage <= 30) {
                      capacityStatus = "Filling Fast";
                      capacityColor = darkMode
                        ? "text-orange-400"
                        : "text-orange-600";
                      capacityBgColor = darkMode
                        ? "bg-orange-900/20"
                        : "bg-orange-100/60";
                    }

                    if (bookedCount >= capacity) {
                      capacityStatus = "Sold Out";
                      capacityColor = darkMode
                        ? "text-red-400 font-bold"
                        : "text-red-600 font-bold";
                      capacityBgColor = darkMode
                        ? "bg-red-900/30"
                        : "bg-red-100/80";
                    }

                    return (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <p
                            className={`text-base sm:text-lg ${capacityColor} font-medium`}
                          >
                            {capacityStatus}
                          </p>
                          <p
                            className={`text-sm ${
                              darkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            {bookedCount} / {capacity} spots filled
                          </p>
                        </div>
                        <div
                          className={`p-0.5 rounded-lg mb-2 ${capacityBgColor}`}
                        >
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${
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
                        <p
                          className={`text-sm mt-2 ${
                            darkMode ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {capacity - bookedCount <= 0
                            ? "No spots available. Please check back later for ticket releases."
                            : capacity - bookedCount === 1
                            ? "Only 1 spot left! Book now to secure your place."
                            : availablePercentage <= 10
                            ? `Only ${
                                capacity - bookedCount
                              } spots left! Book now before they're gone.`
                            : `${
                                capacity - bookedCount
                              } spots available for this event.`}
                        </p>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Share Section */}
        <div
          className={`rounded-xl p-4 sm:p-6 border w-[90%] mx-auto shadow-sm hover:shadow-md transition-all duration-300 ${
            darkMode
              ? "bg-dark-surface border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <h2
            className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center ${
              darkMode ? "text-dark-text" : "text-gray-800"
            }`}
          >
            Share with friends
          </h2>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            <button
              onClick={handleCopyLink}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all duration-300 group ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <FaCopy
                className={`text-xl sm:text-2xl transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-blue-500"
                    : "text-gray-700 group-hover:text-blue-600"
                }`}
              />
              <span
                className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-blue-500"
                    : "group-hover:text-blue-600"
                }`}
              >
                Copy Link
              </span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all duration-300 group ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <FaWhatsappSquare
                className={`text-xl sm:text-2xl transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-green-500"
                    : "text-gray-700 group-hover:text-green-600"
                }`}
              />
              <span
                className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-green-500"
                    : "group-hover:text-green-600"
                }`}
              >
                WhatsApp
              </span>
            </button>
            <button
              onClick={handleFacebookShare}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all duration-300 group ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <FaFacebook
                className={`text-xl sm:text-2xl transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-blue-500"
                    : "text-gray-700 group-hover:text-blue-700"
                }`}
              />
              <span
                className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-blue-500"
                    : "group-hover:text-blue-700"
                }`}
              >
                Facebook
              </span>
            </button>
            <button
              onClick={handleTwitterShare}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all duration-300 group ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <FaTwitter
                className={`text-xl sm:text-2xl transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-sky-500"
                    : "text-gray-700 group-hover:text-sky-600"
                }`}
              />
              <span
                className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-sky-500"
                    : "group-hover:text-sky-600"
                }`}
              >
                Twitter
              </span>
            </button>
            <button
              onClick={handleLinkedInShare}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all duration-300 group ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <FaLinkedin
                className={`text-xl sm:text-2xl transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-blue-500"
                    : "text-gray-700 group-hover:text-blue-600"
                }`}
              />
              <span
                className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-blue-500"
                    : "group-hover:text-blue-600"
                }`}
              >
                LinkedIn
              </span>
            </button>
            <button
              onClick={handleEmailShare}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all duration-300 group ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <MdEmail
                className={`text-xl sm:text-2xl transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-red-500"
                    : "text-gray-700 group-hover:text-red-600"
                }`}
              />
              <span
                className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-red-500"
                    : "group-hover:text-red-600"
                }`}
              >
                Email
              </span>
            </button>
            <button
              onClick={handleInviteFriends}
              className={`flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg transition-all duration-300 group ${
                darkMode ? "hover:bg-gray-800" : "hover:bg-gray-100"
              }`}
            >
              <MdPeople
                className={`text-xl sm:text-2xl transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-purple-500"
                    : "text-gray-700 group-hover:text-purple-600"
                }`}
              />
              <span
                className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
                  darkMode
                    ? "text-gray-400 group-hover:text-purple-500"
                    : "group-hover:text-purple-600"
                }`}
              >
                Invite Friends
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div
            className={`w-full max-w-4xl p-6 rounded-xl shadow-xl max-h-[90vh] overflow-y-auto ${
              darkMode
                ? "bg-dark-surface text-dark-text"
                : "bg-white text-gray-800"
            }`}
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className={`p-1.5 mr-2 rounded-full ${
                    darkMode
                      ? "hover:bg-gray-600 text-gray-300"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <BiArrowBack className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold">
                  Feedback for {event.title}
                </h3>
              </div>
              <button
                onClick={() => setShowFeedbackModal(false)}
                className={`p-1.5 rounded-full ${
                  darkMode ? "hover:bg-gray-600" : "hover:bg-gray-100"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  ></path>
                </svg>
              </button>
            </div>

            {loadingFeedback ? (
              <div className="flex justify-center items-center py-12">
                <svg
                  className="animate-spin h-8 w-8 text-indigo-500"
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
              </div>
            ) : feedbackList.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 max-h-[60vh] overflow-y-auto feedback-list pr-2">
                {feedbackList.map((feedback, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-md shadow-sm ${
                      darkMode
                        ? "bg-gray-700 border-gray-600"
                        : "bg-gray-50 border-gray-200"
                    } hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center">
                        <div
                          className={`font-bold text-lg ${
                            darkMode ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {feedback.name}
                        </div>
                        <div
                          className={`ml-2 text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-500"
                          }`}
                        >
                          {feedback.date}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div
                          className={`mr-2 text-sm font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Rating:
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`w-5 h-5 text-xl ${
                                feedback.rating >= star
                                  ? "text-yellow-500"
                                  : darkMode
                                  ? "text-gray-500"
                                  : "text-gray-300"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div
                      className={`text-sm mb-4 ${
                        darkMode
                          ? "bg-gray-600 border-gray-500"
                          : "bg-white border-gray-100"
                      } p-3 rounded border ${
                        darkMode ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      {feedback.message}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                className={`text-center py-10 ${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                } rounded-lg`}
              >
                <svg
                  className={`mx-auto h-12 w-12 ${
                    darkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p
                  className={`mt-2 text-sm ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  No feedback submitted for this event yet.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-fadeIn">
          <div
            className={`px-6 py-3 rounded-lg shadow-lg ${
              toastType === "error"
                ? "bg-red-600 text-white"
                : toastType === "success"
                ? "bg-green-600 text-white"
                : "bg-blue-600 text-white"
            }`}
          >
            <p className="font-medium">{toastMessage}</p>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div
            className={`w-full max-w-md p-6 rounded-xl shadow-xl ${
              darkMode
                ? "bg-dark-surface text-dark-text"
                : "bg-white text-gray-800"
            }`}
          >
            <h3 className="text-xl font-bold mb-4">Invite Friends</h3>
            {inviteSent ? (
              <div className="text-center py-4">
                <p
                  className={`text-lg font-medium ${
                    darkMode ? "text-green-400" : "text-green-600"
                  }`}
                >
                  Invitation sent successfully!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite}>
                <div className="mb-4">
                  <label
                    htmlFor="inviteEmail"
                    className="block text-sm font-medium mb-1"
                  >
                    Friend's Email
                  </label>
                  <input
                    type="email"
                    id="inviteEmail"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    className={`w-full p-2 rounded border ${
                      darkMode
                        ? "bg-dark-background border-gray-700"
                        : "bg-white border-gray-300"
                    }`}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="mb-4">
                  <label
                    htmlFor="inviteMessage"
                    className="block text-sm font-medium mb-1"
                  >
                    Message (Optional)
                  </label>
                  <textarea
                    id="inviteMessage"
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className={`w-full p-2 rounded border ${
                      darkMode
                        ? "bg-dark-background border-gray-700"
                        : "bg-white border-gray-300"
                    }`}
                    rows="3"
                    placeholder="Hey! Check out this event I found..."
                  ></textarea>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className={`px-4 py-2 rounded ${
                      darkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-800"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 rounded ${
                      darkMode
                        ? "bg-dark-primary hover:bg-blue-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .main-container {
          scrollbar-width: thin;
          scrollbar-color: rgba(59, 130, 246, 0.5) rgba(0, 0, 0, 0.1);
        }

        .main-container::-webkit-scrollbar {
          width: 12px;
        }

        .main-container::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .main-container::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }

        .main-container::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }

        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Smooth hover transitions */
        button,
        a {
          transition: all 0.2s ease-in-out;
        }

        /* Event image zoom effect */
        .event-image {
          overflow: hidden;
        }
        .event-image img {
          transition: transform 0.7s ease;
        }
        .event-image:hover img {
          transform: scale(1.05);
        }

        /* Toast animations */
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

        .toast-notification {
          animation: slideIn 0.4s forwards, fadeOut 0.4s 2.5s forwards;
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }

        /* Modal animations */
        .modal-overlay {
          animation: fadeIn 0.3s forwards;
        }

        .modal-content {
          animation: scaleIn 0.3s forwards;
        }

        @keyframes scaleIn {
          from {
            transform: scale(0.9);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Button hover effects */
        .share-button:hover {
          transform: translateY(-3px);
        }

        /* Custom scrollbar for the feedback list */
        .feedback-list::-webkit-scrollbar {
          width: 8px;
        }

        .feedback-list::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        .feedback-list::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }

        .feedback-list::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }

        /* Dark mode toggle animation */
        .theme-toggle {
          position: relative;
          transition: all 0.3s ease;
        }

        .theme-toggle:hover {
          transform: rotate(12deg);
        }
      `}</style>
    </div>
  );
}
