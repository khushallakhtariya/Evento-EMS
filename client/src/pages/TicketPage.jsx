import { Link } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";

export default function TicketPage() {
  const { user } = useContext(UserContext);

  const [userTickets, setUserTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTickets, setActiveTickets] = useState([]);
  const [expiredTickets, setExpiredTickets] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    // Initial loading effect
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);

    // Cleanup timeout
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (user) {
      fetchTickets();
    }
  }, [user]);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/tickets/user/${user._id}`);
      setUserTickets(response.data);

      // Separate active and expired tickets
      const currentDate = new Date();
      const active = [];
      const expired = [];

      response.data.forEach((ticket) => {
        // Create date with both event date and time
        const eventDateStr = ticket.ticketDetails.eventdate.split("T")[0];
        const eventTimeStr = ticket.ticketDetails.eventtime;

        // Parse time (assuming format like "7:00 PM")
        let [hours, minutesPeriod] = eventTimeStr.split(":");
        let minutes = minutesPeriod.split(" ")[0];
        const period = minutesPeriod.split(" ")[1];

        // Convert to 24-hour format
        hours = parseInt(hours);
        if (period === "PM" && hours < 12) hours += 12;
        if (period === "AM" && hours === 12) hours = 0;

        // Create a date object with both date and time
        const eventDateTime = new Date(eventDateStr);
        eventDateTime.setHours(hours, parseInt(minutes), 0);

        // Check if event date and time are in the past
        if (eventDateTime < currentDate) {
          expired.push(ticket);
        } else {
          active.push(ticket);
        }
      });

      setActiveTickets(active);
      setExpiredTickets(expired);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      setError("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const renderTicket = (ticket) => {
    // Check if ticket is expired (recalculating to ensure consistency in display)
    const currentDate = new Date();
    const eventDateStr = ticket.ticketDetails.eventdate.split("T")[0];
    const eventTimeStr = ticket.ticketDetails.eventtime;

    // Parse time
    let [hours, minutesPeriod] = eventTimeStr.split(":");
    let minutes = minutesPeriod.split(" ")[0];
    const period = minutesPeriod.split(" ")[1];

    // Convert to 24-hour format
    hours = parseInt(hours);
    if (period === "PM" && hours < 12) hours += 12;
    if (period === "AM" && hours === 12) hours = 0;

    // Create a date object with both date and time
    const eventDateTime = new Date(eventDateStr);
    eventDateTime.setHours(hours, parseInt(minutes), 0);

    // Determine if expired
    const isExpired = eventDateTime < currentDate;

    return (
      <div key={ticket._id}>
        <div className="">
          <div className="h-48 mt-2 gap-2 p-5 bg-gray-100 dark:bg-gray-800 font-bold rounded-md relative shadow-md transition-colors">
            {/* Status Badge */}
            <div
              className={`absolute top-2 right-2 rounded-full px-3 py-1 text-sm font-bold ${
                isExpired
                  ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                  : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              }`}
            >
              {isExpired ? "Expired" : "Active"}
            </div>

            <div className="flex justify-start place-items-center text-sm md:text-base font-normal">
              <div className="h-148 w-148 bg-white rounded-md p-1">
                <img
                  src={ticket.ticketDetails.qr}
                  alt="QRCode"
                  className="aspect-square object-fill"
                />
              </div>
              <div className="ml-6 grid grid-cols-2 gap-x-6 gap-y-2">
                <div className="dark:text-gray-300">
                  Event Name : <br />
                  <span className="font-extrabold text-primarydark dark:text-blue-400">
                    {ticket.ticketDetails.eventname.toUpperCase()}
                  </span>
                </div>

                <div className="dark:text-gray-300">
                  Date & Time:
                  <br />{" "}
                  <span className="font-extrabold text-primarydark dark:text-blue-400">
                    {ticket.ticketDetails.eventdate.toUpperCase().split("T")[0]}
                    , {ticket.ticketDetails.eventtime}
                  </span>
                </div>
                <div className="dark:text-gray-300">
                  Name:{" "}
                  <span className="font-extrabold text-primarydark dark:text-blue-400">
                    {ticket.ticketDetails.name.toUpperCase()}
                  </span>
                </div>
                <div className="dark:text-gray-300">
                  Price:{" "}
                  <span className="font-extrabold text-primarydark dark:text-blue-400">
                    {" "}
                    Rs. {ticket.ticketDetails.ticketprice}
                  </span>
                </div>
                <div className="dark:text-gray-300">
                  Email:{" "}
                  <span className="font-extrabold text-primarydark dark:text-blue-400">
                    {ticket.ticketDetails.email}
                  </span>
                </div>
                <div className="dark:text-gray-300">
                  Ticket ID:
                  <br />
                  <span className="font-extrabold text-primarydark dark:text-blue-400">
                    {ticket._id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-grow dark:bg-gray-900 dark:text-white">
      {initialLoading ? (
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-700 dark:border-blue-400"></div>
          <p className="text-xl font-semibold mt-4 dark:text-gray-200">
            Loading Your Tickets...
          </p>
        </div>
      ) : (
        <>
          <div className="mb-5 flex justify-between place-items-center">
            <div>
              <Link to="/">
                <button
                  className="
                    inline-flex 
                    mt-12
                    gap-2
                    p-3 
                    ml-12
                    bg-gray-100
                    dark:bg-gray-800
                    justify-center 
                    items-center 
                    text-blue-700
                    dark:text-blue-400
                    font-bold
                    rounded-md
                    transition-colors"
                >
                  <IoMdArrowBack
                    className="
                  font-bold
                  w-6
                  h-6
                  gap-2"
                  />
                  Back
                </button>
                <div className="text-center">
                  <Link to="/wallet"></Link>
                </div>
              </Link>
            </div>
          </div>

          {loading && user ? (
            <div className="mx-12 flex flex-col items-center justify-center mt-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-700 dark:border-blue-400"></div>
              <p className="text-xl font-semibold mt-4 dark:text-gray-200">
                Loading tickets...
              </p>
            </div>
          ) : error ? (
            <p className="mx-12 text-red-600 dark:text-red-400 text-xl text-center font-semibold mt-12">
              {error}
            </p>
          ) : userTickets.length === 0 ? (
            <p className="mx-12 text-xl text-center font-semibold mt-12 dark:text-gray-200">
              You don't have any tickets yet. Please browse events and purchase
              tickets to see them here.
            </p>
          ) : (
            <>
              {/* Active Tickets Section */}
              {activeTickets.length > 0 && (
                <div className="mx-12 mb-8">
                  <h2 className="text-2xl font-bold mb-4 dark:text-blue-400">
                    Active Tickets
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {activeTickets.map(renderTicket)}
                  </div>
                </div>
              )}

              {/* Expired Tickets Section */}
              {expiredTickets.length > 0 && (
                <div className="mx-12 mt-4">
                  <h2 className="text-2xl font-bold mb-4 dark:text-gray-400">
                    Expired Tickets
                  </h2>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                    {expiredTickets.map((ticket) => (
                      <div key={ticket._id} className="opacity-70 relative">
                        <div className="absolute inset-0 bg-gray-800 bg-opacity-10 dark:bg-opacity-30 z-10 rounded-md"></div>
                        {renderTicket(ticket)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
