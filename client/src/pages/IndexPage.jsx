/* eslint-disable react/jsx-key */
import axios from "axios";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BsArrowRightShort } from "react-icons/bs";
import { BiLike } from "react-icons/bi";

export default function IndexPage() {
  const [events, setEvents] = useState([]);

  //! Fetch events from the server ---------------------------------------------------------------
  useEffect(() => {
    axios
      .get("/createEvent")
      .then((response) => {
        console.log("Fetched events:", response.data);
        setEvents(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, []);

  //! Like Functionality --------------------------------------------------------------
  const handleLike = (eventId) => {
    axios
      .post(`/event/${eventId}`)
      .then((response) => {
        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event._id === eventId ? { ...event, likes: event.likes + 1 } : event
          )
        );
        console.log("done", response);
      })
      .catch((error) => {
        console.error("Error liking event:", error);
      });
  };

  return (
    <>
      <div className="mt-1 flex flex-col">
        <div className="hidden sm:block">
          <div className="flex item-center inset-0">
            <img
              src="../src/assets/pexels-pixabay-433452.jpg"
              alt=""
              className="w-full h-80 object-cover rounded-lg shadow-lg transition-transform duration-300"
            />
          </div>
        </div>

        <div className="mx-10 my-5 grid gap-x-6 gap-y-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 sm:mx-5 ">
          {/*-------------------------- Checking whether there is a event or not-------------------  */}
          {events.length > 0 &&
            events.map((event) => {
              const eventDate = new Date(event.eventDate);
              const currentDate = new Date();

              //! Check the event date is passed or not ---------------------------------------------------------------------------------------
              if (
                eventDate > currentDate ||
                eventDate.toDateString() === currentDate.toDateString()
              ) {
                return (
                  <div
                    className="bg-white rounded-xl relative shadow-md hover:shadow-lg transition-shadow duration-300"
                    key={event._id}
                  >
                    <div className="rounded-tl-[0.75rem] rounded-tr-[0.75rem] rounded-br-[0] rounded-bl-[0] object-fill aspect-16:9">
                      {event.image && (
                        <img
                          src={`http://localhost:4000/${event.image}`}
                          alt={event.title}
                          style={{ width: "100%", height: "200px" }}
                          className="w-full h-full rounded-t-xl"
                        />
                      )}
                      <div className="absolute flex gap-4 bottom-[240px] right-8 md:bottom-[20px] md:right-3 lg:bottom-[250px] lg:right-4 sm:bottom-[260px] sm:right-3">
                        <button onClick={() => handleLike(event._id)}>
                          <BiLike className="w-auto h-12 lg:h-10 sm:h-12 md:h-10 bg-white p-2 rounded-full shadow-md transition-all hover:text-primary hover:scale-110" />
                        </button>
                      </div>
                    </div>

                    {/* <img src="../src/assets/paduru.png" alt="" className='rounded-tl-[0.75rem] rounded-tr-[0.75rem] rounded-br-[0] rounded-bl-[0] object-fill aspect-16:9'/>  */}
                    {/* FIXME: This is a demo image after completing the create event function delete this */}

                    <div className="m-4 grid gap-2">
                      <div className="flex justify-between items-center">
                        <h1 className="font-bold text-lg mt-2">
                          {event?.title?.toUpperCase()}
                        </h1>
                        <div className="flex gap-2 items-center mr-4 text-red-600">
                          {" "}
                          <BiLike /> {event?.likes}
                        </div>
                      </div>

                      <div className="flex text-sm flex-nowrap justify-between text-primarydark font-bold mr-4">
                        <div>
                          {event.eventDate.split("T")[0]}, {event.eventTime}
                        </div>
                        <div>
                          {event.ticketPrice === 0
                            ? "Free"
                            : "Rs. " + event.ticketPrice}
                        </div>
                      </div>

                      <div className="text-xs flex flex-col flex-wrap truncate-text">
                        {event.description}
                      </div>
                      <div className="flex justify-between items-center my-2 mr-4">
                        <div className="text-sm text-primarydark ">
                          Organized By:{" "}
                          <span className="font-bold">{event.organizedBy}</span>
                        </div>
                        {/* <div className="text-sm text-primarydark ">Created By: <br/> <span className="font-semibold">{event?.owner?.toUpperCase()}</span></div> */}
                      </div>
                      <Link
                        to={"/event/" + event._id}
                        className="flex justify-center"
                      >
                        <button className="primary flex items-center gap-2 transition-transform duration-300 hover:scale-105">
                          Book Ticket
                          <BsArrowRightShort className="w-6 h-6" />
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              }
              return null;
            })}
        </div>
      </div>
    </>
  );
}
