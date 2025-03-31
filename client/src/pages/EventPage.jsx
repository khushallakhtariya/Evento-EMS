import axios from "axios";

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom"
import { AiFillCalendar } from "react-icons/ai";
import { MdLocationPin } from "react-icons/md";
import { FaCopy, FaWhatsappSquare, FaFacebook } from "react-icons/fa";

export default function EventPage() {
  const {id} = useParams();
  const [event, setEvent] = useState(null);

  //! Fetching the event data from server by ID ------------------------------------------
  useEffect(()=>{
    if(!id){
      return;
    }
    axios.get(`/event/${id}`).then(response => {
      setEvent(response.data)
    }).catch((error) => {
      console.error("Error fetching events:", error);
    });
  }, [id])

  //! Copy Functionalities -----------------------------------------------
  const handleCopyLink = () => {
    const linkToShare = window.location.href;
    navigator.clipboard.writeText(linkToShare).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  const handleWhatsAppShare = () => {
    const linkToShare = window.location.href;
    const whatsappMessage = encodeURIComponent(`${linkToShare}`);
    window.open(`whatsapp://send?text=${whatsappMessage}`);
  };

  const handleFacebookShare = () => {
    const linkToShare = window.location.href;
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(linkToShare)}`;
    window.open(facebookShareUrl);
  };
  
  console.log(event?.image);

  if (!event) return '';
  return (
    <div className="flex flex-col mx-5 xl:mx-32 md:mx-10 mt-5 flex-grow space-y-8">
      <div className="w-full">
        {event.image && (
          <img src={`http://localhost:4000/${event.image}`} alt={event.title} className="rounded-lg object-cover w-full h-72 shadow-md" />
        )}
      </div>

      {/* <img src="../src/assets/paduru.png" alt="" className='rounded object-fill aspect-16:9'/>  */}
      {/* FIXME: This is a demo image after completing the create event function delete this */}

      <div className="flex justify-between items-center mt-8 mx-2">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-800">{event.title.toUpperCase()}</h1>
        <Link to={`/event/${event._id}/ordersummary`}>
          <button className="primary bg-gradient-to-r from-blue-500 to-blue-400 text-white py-3 px-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-blue-800 transition duration-300">
            Book Ticket
          </button>
        </Link>
      </div>
      <div className="mx-2">
        <h2 className="text-lg md:text-2xl font-bold mt-3 text-primarydark">
          {event.ticketPrice === 0 ? 'Free' : `MRP. ${event.ticketPrice}`}
        </h2>
      </div>
      <div className="mx-2 mt-5 text-lg md:text-xl text-gray-700 leading-relaxed">
        {event.description}
      </div>
      <div className="mx-2 mt-5 text-lg md:text-xl font-bold text-primarydark">
        Organized By {event.organizedBy}
      </div>
      <div className="mx-2 mt-5">
        <h1 className="text-lg md:text-2xl font-extrabold text-gray-800">When and Where</h1>
        <div className="sm:mx-5 lg:mx-32 mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <AiFillCalendar className="w-auto h-6 text-primarydark" />
            <div className="flex flex-col gap-1">
              <h1 className="text-lg md:text-xl font-extrabold text-gray-800">Date and Time</h1>
              <div className="text-sm md:text-lg text-gray-600">
                Date: {event.eventDate.split("T")[0]} <br />Time: {event.eventTime}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <MdLocationPin className="w-auto h-6 text-primarydark" />
            <div className="flex flex-col gap-1">
              <h1 className="text-lg md:text-xl font-extrabold text-gray-800">Location</h1>
              <div className="text-sm md:text-lg text-gray-600">
                {event.location}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-2 mt-5 text-lg md:text-xl font-extrabold text-gray-800">
        Share with friends
        <div className="mt-10 flex gap-5 mx-10 md:mx-32">
          <button onClick={handleCopyLink} className="hover:text-blue-500 transition duration-300">
            <FaCopy className="w-auto h-6" />
          </button>
          <button onClick={handleWhatsAppShare} className="hover:text-green-500 transition duration-300">
            <FaWhatsappSquare className="w-auto h-6" />
          </button>
          <button onClick={handleFacebookShare} className="hover:text-blue-700 transition duration-300">
            <FaFacebook className="w-auto h-6" />
          </button>
        </div>
      </div>
    </div>
  )
}
