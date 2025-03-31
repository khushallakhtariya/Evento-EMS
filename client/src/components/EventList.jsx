import { useState, useEffect } from 'react';
import axios from 'axios';

export default function EventList() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch events when component mounts
    axios.get('/events')
      .then(response => {
        setEvents(response.data);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {events.map(event => (
        <div key={event._id} className="bg-white rounded-lg shadow-lg p-4">
          <img 
            src={event.image} 
            alt={event.title} 
            className="w-full h-48 object-cover rounded-lg"
          />
          <h2 className="text-xl font-bold mt-2">{event.title}</h2>
          <p className="text-gray-600">{event.description}</p>
          <div className="mt-2">
            <p>Date: {new Date(event.eventDate).toLocaleDateString()}</p>
            <p>Time: {event.eventTime}</p>
            <p>Location: {event.location}</p>
            <p>Price: ${event.ticketPrice}</p>
          </div>
        </div>
      ))}
    </div>
  );
} 