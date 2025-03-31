import  { useContext, useState, useRef } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AddEvent() {
  const {user} = useContext(UserContext);
  const [formData, setFormData] = useState({

    owner: user? user.name : "",
    title: "",
    optional:"",
    description: "",
    organizedBy: "",
    eventDate: "",
    eventTime: "",
    location: "",
    ticketPrice: 0,
    image: '',
    likes: 0
  });

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files;
    setFormData((prevState) => ({ ...prevState, image: file[0] }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prevState) => ({ ...prevState, [name]: files[0] }));
    } else {
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };
  console.log('formData', formData);
  
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation: Check if required fields are filled
    if (!formData.title || !formData.description || !formData.organizedBy || !formData.eventDate || !formData.eventTime || !formData.location) {
      toast.error("Please fill in all required fields.");
      return;
    }

    // Validation: Check if image is provided
    if (!formData.image) {
      toast.error("Please upload an image.");
      return;
    }

    const newFormData = new FormData();     
    newFormData.append("image", formData.image);
    newFormData.append("title", formData.title);
    newFormData.append("optional", formData.optional);
    newFormData.append("description", formData.description);
    newFormData.append("organizedBy", formData.organizedBy);
    newFormData.append("eventDate", formData.eventDate);
    newFormData.append("eventTime", formData.eventTime);
    newFormData.append("location", formData.location);
    newFormData.append("ticketPrice", formData.ticketPrice);

    axios
      .post("/createEvent", newFormData)
      .then((response) => {
        console.log("Event posted successfully:", response.data);
        toast.success("Event posted successfully!");
        // Reset form data after successful submission
        setFormData({
          owner: user ? user.name : "",
          title: "",
          optional: "",
          description: "",
          organizedBy: "",
          eventDate: "",
          eventTime: "",
          location: "",
          ticketPrice: 0,
          image: '',
          likes: 0
        });
        // Clear the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      })
      .catch((error) => {
        console.error("Error posting event:", error);
        toast.error("Error posting event.");
      });
  };

  return (
<div className='flex justify-center items-center min-h-screen'>
  <div className='flex flex-col max-w-4xl w-full p-8 bg-white shadow-lg rounded-lg transition-shadow duration-300 hover:shadow-2xl'>
    <ToastContainer />
    <h1 className='font-bold text-[36px] mb-6 text-center text-gray-800'>Post An Event</h1>
    
    <form onSubmit={handleSubmit} className='grid grid-cols-1 md:grid-cols-2 gap-6'>
      <div className='flex flex-col gap-5'>
        <label className='flex flex-col text-gray-700 font-medium'>
          Title:
          <input type='text' name='title' className='input-field border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500' value={formData.title} onChange={handleChange} placeholder='Enter event title' aria-label='Event Title' />
        </label>
        <label className='flex flex-col text-gray-700 font-medium'>
          Description:      
          <textarea name='description' className='input-field border border-gray-300 p-2 rounded-lg h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500' value={formData.description} onChange={handleChange} placeholder='Describe your event' aria-label='Event Description'></textarea>
        </label>
        <label className='flex flex-col text-gray-700 font-medium'>
          Event Date:
          <input type='date' name='eventDate' className='input-field border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500' value={formData.eventDate} onChange={handleChange} aria-label='Event Date' />
        </label>
        <label className='flex flex-col text-gray-700 font-medium'>
          Location:
          <input type='text' name='location' className='input-field border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500' value={formData.location} onChange={handleChange} placeholder='Event location' aria-label='Event Location' />
        </label>
      </div>
      
      <div className='flex flex-col gap-5'>
        <label className='flex flex-col text-gray-700 font-medium'>
          Optional:
          <input type='text' name='optional' className='input-field border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500' value={formData.optional} onChange={handleChange} placeholder='Optional information' aria-label='Optional Information' />
        </label>
        <label className='flex flex-col text-gray-700 font-medium'>
          Organized By:
          <input type='text' name='organizedBy' className='input-field border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500' value={formData.organizedBy} onChange={handleChange} placeholder="Organizer's name" aria-label='Organized By' />
        </label>
        <label className='flex flex-col text-gray-700 font-medium'>
          Event Time:
          <input type='time' name='eventTime' className='input-field border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500' value={formData.eventTime} onChange={handleChange} aria-label='Event Time' />
        </label>
        <label className='flex flex-col text-gray-700 font-medium'>
          Ticket Price:
          <input type='number' name='ticketPrice' className='input-field border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500' value={formData.ticketPrice} onChange={handleChange} placeholder='Price in USD' aria-label='Ticket Price' />
        </label>
        <label className='flex flex-col text-gray-700 font-medium'>
          Image:
          <input type='file' name='image' className='input-field border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 hover:border-blue-500' onChange={handleImageUpload} ref={fileInputRef} aria-label='Upload Image' />
        </label>
      </div>

      <div className='col-span-2 flex justify-center'>
        <button className='primary bg-blue-600 text-white py-3 px-8 rounded-lg mt-4 hover:bg-blue-700 transition duration-300 transform hover:scale-105 shadow-md hover:shadow-lg'>
          Submit
        </button>
      </div>
    </form>
  </div>
</div>
);
}

//     <div className='flex justify-center items-center min-h-screen'>
//       <div className='flex flex-col max-w-lg p-6 bg-white shadow-lg rounded-lg transition-shadow duration-300 hover:shadow-xl'>
//         <ToastContainer />
//         <div><h1 className='font-bold text-[36px] mb-5 text-center'>Post an Event</h1></div>
        
//         <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
//           <div className='flex flex-col gap-5'>
//             <label className='flex flex-col'>
//               Title:
//               <input
//                 type="text"
//                 name="title"
//                 className='rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-10 border-none focus:ring-4 focus:ring-sky-300 transition duration-300 hover:ring-sky-500'
//                 value={formData.title}
//                 onChange={handleChange}
//                 placeholder="Enter event title"
//               />
//             </label>
//             <label className='flex flex-col'>
//               Optional:
//               <input
//                 type="text"
//                 name="optional"
//                 className='rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-10 border-none focus:ring-4 focus:ring-sky-300 transition duration-300 hover:ring-sky-500'
//                 value={formData.optional}
//                 onChange={handleChange}
//                 placeholder="Optional information"
//               />
//             </label>
//             <label className='flex flex-col'>
//               Description:
//               <textarea
//                 name="description"
//                 className='rounded mt-2 pl-5 px-4 py-2 ring-sky-700 ring-2 h-24 border-none focus:ring-4 focus:ring-sky-300 transition duration-300 hover:ring-sky-500'
//                 value={formData.description}
//                 onChange={handleChange}
//                 placeholder="Describe your event"
//               />
//             </label>
//             <label className='flex flex-col'>
//               Organized By:
//               <input
//                 type="text"
//                 className='rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-10 border-none focus:ring-4 focus:ring-sky-300 transition duration-300 hover:ring-sky-500'
//                 name="organizedBy"
//                 value={formData.organizedBy}
//                 onChange={handleChange}
//                 placeholder="Organizer's name"
//               />
//             </label>
//             <label className='flex flex-col'>
//               Event Date:
//               <input
//                 type="date"
//                 className='rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-10 border-none focus:ring-4 focus:ring-sky-300 transition duration-300 hover:ring-sky-500'
//                 name="eventDate"
//                 value={formData.eventDate}
//                 onChange={handleChange}
//               />
//             </label>
//             <label className='flex flex-col'>
//               Event Time:
//               <input
//                 type="time"
//                 name="eventTime"
//                 className='rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-10 border-none focus:ring-4 focus:ring-sky-300 transition duration-300 hover:ring-sky-500'
//                 value={formData.eventTime}
//                 onChange={handleChange}
//               />
//             </label>
//             <label className='flex flex-col'>
//               Location:
//               <input
//                 type="text"
//                 name="location"
//                 className='rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-10 border-none focus:ring-4 focus:ring-sky-300 transition duration-300 hover:ring-sky-500'
//                 value={formData.location}
//                 onChange={handleChange}
//                 placeholder="Event location"
//               />
//             </label>
//             <label className='flex flex-col'>
//               Ticket Price:
//               <input
//                 type="number"
//                 name="ticketPrice"
//                 className='rounded mt-2 pl-5 px-4 ring-sky-700 ring-2 h-10 border-none focus:ring-4 focus:ring-sky-300 transition duration-300 hover:ring-sky-500'
//                 value={formData.ticketPrice}
//                 onChange={handleChange}
//                 placeholder="Price in USD"
//               />
//             </label>
//             <label className='flex flex-col'>
//               Image:
//               <input
//                 type="file"
//                 name="image"
//                 className='rounded mt-2 pl-5 px-4 py-2 ring-sky-700 ring-2 h-10 border-none focus:ring-4 focus:ring-sky-300 transition duration-300 hover:ring-sky-500'
//                 onChange={handleImageUpload}
//                 ref={fileInputRef}
//               />
//             </label>
//             <button className='primary bg-sky-700 text-white py-2 rounded mt-4 hover:bg-sky-800 transition duration-300 transform hover:scale-105' type="submit">Submit</button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
