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
import { BsMoonFill, BsSunFill } from "react-icons/bs";

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
      className={`flex flex-col w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen transition-colors duration-300 ease-in-out ${
        darkMode ? "bg-dark-background text-dark-text" : "bg-white"
      }`}
    >
      {/* Hero Image Section */}
      <div className="w-full mb-8 overflow-hidden rounded-xl shadow-xl relative">
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

      <div className="max-w-6xl mx-auto w-full">
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
          {!isEventPassed ? (
            <Link
              to={`/event/${event._id}/ordersummary`}
              className="w-full md:w-auto"
            >
              <button
                className={`w-full md:w-auto text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg transition duration-300 transform hover:-translate-y-1 text-lg font-bold ${
                  darkMode
                    ? "bg-dark-primary hover:bg-blue-700"
                    : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-indigo-600 hover:to-blue-700"
                }`}
              >
                Book Ticket
              </button>
            </Link>
          ) : (
            <div className="w-full md:w-auto">
              <span className="inline-block py-3 px-6 bg-red-100 text-red-700 rounded-lg font-medium">
                This event has ended
              </span>
            </div>
          )}
        </div>

        {/* Event Description */}
        <div className="mb-12 w-full">
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
          className={`rounded-xl p-4 sm:p-6 md:p-8 mb-12 shadow-md w-full transition-colors duration-300 ${
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
          </div>
        </div>

        {/* Share Section */}
        <div
          className={`rounded-xl p-4 sm:p-6 border w-full shadow-sm hover:shadow-md transition-all duration-300 ${
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
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}
