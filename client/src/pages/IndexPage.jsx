/* eslint-disable react/jsx-key */
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BsArrowRightShort,
  BsCalendarCheck,
  BsCalendarX,
} from "react-icons/bs";
import { BiLike } from "react-icons/bi";

export default function IndexPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveEvents, setLiveEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);

  //! Fetch events from the server ---------------------------------------------------------------
  useEffect(() => {
    setLoading(true);
    axios
      .get("/createEvent")
      .then((response) => {
        console.log("Fetched events:", response.data);
        setEvents(response.data);

        // Separate events into live and past
        const currentDate = new Date();
        const live = [];
        const past = [];

        response.data.forEach((event) => {
          const eventDate = new Date(event.eventDate);
          if (
            eventDate >= currentDate ||
            eventDate.toDateString() === currentDate.toDateString()
          ) {
            live.push(event);
          } else {
            past.push(event);
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
        console.log("Liked event:", response);
      })
      .catch((error) => {
        console.error("Error liking event:", error);
      });
  };

  // Event card component for reuse
  const EventCard = ({ event, isPast }) => (
    <div
      className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:translate-y-[-5px] group ${
        isPast ? "opacity-80" : ""
      }`}
      key={event._id}
    >
      <div className="relative h-52 overflow-hidden">
        {event.image && (
          <img
            src={`http://localhost:4000/${event.image}`}
            alt={event.title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              isPast ? "grayscale-[30%]" : ""
            }`}
            loading="lazy"
            onError={(e) => {
              e.target.src = "../src/assets/placeholder.jpg";
              e.target.onerror = null;
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="absolute top-4 right-4 flex items-center gap-2 p-2 bg-white/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transform translate-y-3 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={() => handleLike(event._id)}
            className="flex items-center gap-1 text-gray-700 hover:text-blue-600 transition-colors"
          >
            <BiLike className="w-5 h-5" />
            <span className="text-sm font-medium">{event?.likes}</span>
          </button>
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
            Past Event
          </div>
        )}
      </div>

      <div className="p-5">
        <h2 className="font-bold text-gray-800 text-lg mb-2 line-clamp-1">
          {event?.title?.toUpperCase()}
        </h2>

        <div className="text-sm text-gray-600 line-clamp-2 mb-3 min-h-[40px]">
          {event.description}
        </div>

        <div className="flex justify-between items-center mb-4">
          <div className="text-sm text-gray-700">
            <span className="font-medium">By:</span> {event.organizedBy}
          </div>
          <div className="flex items-center gap-1 text-gray-500">
            <span className="text-sm">{event.eventTime}</span>
          </div>
        </div>

        <Link to={"/event/" + event._id} className="block">
          <button
            className={`w-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 py-2.5 rounded-lg font-medium ${
              isPast ? "bg-gray-500 text-white" : "primary"
            }`}
          >
            {isPast ? "View Details" : "Book Ticket"}
            <BsArrowRightShort className="w-6 h-6" />
          </button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="mt-1 flex flex-col bg-gray-50 min-h-screen">
      {/* Hero section with improved styling */}
      <div className="w-full px-4 sm:px-6 mb-8">
        <div className="relative w-full h-60 sm:h-80 md:h-96 overflow-hidden rounded-xl shadow-lg">
          <img
            src="../src/assets/pexels-pixabay-433452.jpg"
            alt="Event Hero"
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end pb-8 px-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Discover Amazing Events
            </h1>
            <p className="text-white text-lg opacity-90">
              Find and book tickets for the best events near you
            </p>
          </div>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!loading && liveEvents.length === 0 && pastEvents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <img
            src="../src/assets/no-events.svg"
            alt="No events"
            className="w-40 h-40 mb-4 opacity-60"
          />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            No events available
          </h3>
          <p className="text-gray-500">Check back later for upcoming events</p>
        </div>
      )}

      {/* LIVE EVENTS SECTION */}
      {liveEvents.length > 0 && (
        <div className="mb-12">
          <div className="px-4 sm:px-6 mb-6">
            <div className="flex items-center gap-3">
              <BsCalendarCheck className="text-green-600 text-xl" />
              <h2 className="text-2xl font-bold text-gray-800 uppercase">
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
      {pastEvents.length > 0 && (
        <div className="mb-12">
          <div className="px-4 sm:px-6 mb-6">
            <div className="flex items-center gap-3">
              <BsCalendarX className="text-red-500 text-xl" />
              <h2 className="text-2xl font-bold text-gray-700 uppercase">
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
    </div>
  );
}
