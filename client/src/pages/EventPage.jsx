import axios from "axios";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AiFillCalendar } from "react-icons/ai";
import { MdLocationPin } from "react-icons/md";
import { FaCopy, FaWhatsappSquare, FaFacebook } from "react-icons/fa";

export default function EventPage() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isEventPassed, setIsEventPassed] = useState(false);

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
          const eventDate = new Date(response.data.eventDate);
          const today = new Date();
          // Reset time part for today to compare only dates
          today.setHours(0, 0, 0, 0);
          setIsEventPassed(eventDate < today);
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
    const whatsappMessage = encodeURIComponent(`${linkToShare}`);
    window.open(`whatsapp://send?text=${whatsappMessage}`);
  };

  const handleFacebookShare = () => {
    const linkToShare = window.location.href;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      linkToShare
    )}`;
    window.open(facebookShareUrl);
  };

  console.log(event?.image);

  if (!event) return "";
  return (
    <div className="flex flex-col w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white min-h-screen">
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 border-b border-gray-200 pb-8 w-full">
          <div className="w-full md:w-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 mb-4 break-words">
              {event.title.toUpperCase()}
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-blue-600">
              {event.ticketPrice === 0 ? "FREE EVENT" : `₹${event.ticketPrice}`}
            </h2>
          </div>
          {!isEventPassed ? (
            <Link
              to={`/event/${event._id}/ordersummary`}
              className="w-full md:w-auto"
            >
              <button className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 sm:py-4 px-6 sm:px-8 rounded-lg shadow-lg hover:from-indigo-600 hover:to-blue-700 transition duration-300 transform hover:-translate-y-1 text-lg font-bold">
                Book Ticket
              </button>
            </Link>
          ) : (
            <div className="w-full md:w-auto">
              <span className="inline-block py-3 px-6 bg-gray-200 text-gray-700 rounded-lg font-medium">
                Event has passed
              </span>
            </div>
          )}
        </div>

        {/* Event Description */}
        <div className="mb-12 w-full">
          <div className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed mb-6">
            {event.description}
          </div>
          <div className="text-base sm:text-lg md:text-xl font-bold text-blue-700">
            Organized By{" "}
            <span className="text-gray-800">{event.organizedBy}</span>
          </div>
        </div>

        {/* Event Details Section */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 md:p-8 mb-12 shadow-md w-full">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-6">
            When and Where
          </h2>
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            <div className="flex items-start gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <AiFillCalendar className="text-blue-600 text-2xl sm:text-3xl flex-shrink-0" />
              <div className="w-full">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  Date and Time
                </h3>
                <p className="text-base sm:text-lg text-gray-600">
                  <span className="font-medium">Date:</span>{" "}
                  {event.eventDate.split("T")[0]}
                </p>
                <p className="text-base sm:text-lg text-gray-600">
                  <span className="font-medium">Time:</span> {event.eventTime}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 bg-white p-4 sm:p-6 rounded-lg shadow-sm">
              <MdLocationPin className="text-blue-600 text-2xl sm:text-3xl flex-shrink-0" />
              <div className="w-full">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                  Location
                </h3>
                <p className="text-base sm:text-lg text-gray-600 break-words">
                  {event.location}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-white rounded-xl p-4 sm:p-6 border border-gray-200 w-full shadow-sm hover:shadow-md transition-shadow duration-300">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 text-center">
            Share with friends
          </h2>
          <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
            <button
              onClick={handleCopyLink}
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg hover:bg-gray-100 transition duration-300"
            >
              <FaCopy className="text-gray-700 text-xl sm:text-2xl hover:text-blue-600" />
              <span className="text-xs sm:text-sm font-medium">Copy Link</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg hover:bg-gray-100 transition duration-300"
            >
              <FaWhatsappSquare className="text-gray-700 text-xl sm:text-2xl hover:text-green-600" />
              <span className="text-xs sm:text-sm font-medium">WhatsApp</span>
            </button>
            <button
              onClick={handleFacebookShare}
              className="flex flex-col items-center gap-2 p-3 sm:p-4 rounded-lg hover:bg-gray-100 transition duration-300"
            >
              <FaFacebook className="text-gray-700 text-xl sm:text-2xl hover:text-blue-700" />
              <span className="text-xs sm:text-sm font-medium">Facebook</span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .text-shadow {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
      `}</style>
    </div>
  );
}
