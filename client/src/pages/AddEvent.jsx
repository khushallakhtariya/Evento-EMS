import { useContext, useState, useRef } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import { ThemeContext } from "../ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AddEvent() {
  const { user } = useContext(UserContext);
  const { darkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    owner: user ? user.name : "",
    title: "",
    optional: "",
    description: "",
    organizedBy: "",
    eventDate: "",
    eventTime: "",
    location: "",
    ticketPrice: 0,
    image: "",
    likes: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const inputRefs = {
    title: useRef(null),
    description: useRef(null),
    organizedBy: useRef(null),
    eventDate: useRef(null),
    location: useRef(null),
    optional: useRef(null),
    eventTime: useRef(null),
    ticketPrice: useRef(null),
    image: useRef(null),
  };

  const validateField = (name, value) => {
    let error = "";

    if (name === "title" && !value.trim()) {
      error = "Title is required";
    } else if (name === "description" && !value.trim()) {
      error = "Description is required";
    } else if (name === "organizedBy" && !value.trim()) {
      error = "Organizer name is required";
    } else if (name === "eventDate" && !value) {
      error = "Event date is required";
    } else if (name === "eventTime" && !value) {
      error = "Event time is required";
    } else if (name === "location" && !value.trim()) {
      error = "Location is required";
    } else if (name === "ticketPrice" && (isNaN(value) || Number(value) < 0)) {
      error = "Ticket price must be a positive number";
    }

    return error;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files;
    setTouched((prev) => ({ ...prev, image: true }));

    if (!file || !file[0]) {
      setErrors((prev) => ({ ...prev, image: "Image is required" }));
      return;
    }

    setFormData((prevState) => ({ ...prevState, image: file[0] }));
    setErrors((prev) => ({ ...prev, image: "" }));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Mark field as touched
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (files) {
      if (!files[0]) {
        setErrors((prev) => ({ ...prev, [name]: "File is required" }));
      } else {
        setErrors((prev) => ({ ...prev, [name]: "" }));
      }
      setFormData((prevState) => ({ ...prevState, [name]: files[0] }));
    } else {
      // Validate the field
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
      setFormData((prevState) => ({ ...prevState, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleKeyDown = (e, nextField) => {
    if (e.key === "Enter" && nextField !== "submit") {
      e.preventDefault();
      inputRefs[nextField].current.focus();
    } else if (e.key === "Enter" && nextField === "submit") {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Touch all fields
    const allFields = {
      title: true,
      description: true,
      organizedBy: true,
      eventDate: true,
      eventTime: true,
      location: true,
      ticketPrice: true,
      image: true,
    };
    setTouched(allFields);

    // Validate all fields
    const newErrors = {};
    Object.keys(allFields).forEach((field) => {
      if (field === "image") {
        if (!formData.image) {
          newErrors.image = "Image is required";
        }
      } else {
        const error = validateField(field, formData[field]);
        if (error) {
          newErrors[field] = error;
        }
      }
    });

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: darkMode ? "dark" : "light",
      });
      setIsSubmitting(false);
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
        toast.success("Event posted successfully!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: darkMode ? "dark" : "light",
        });
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
          image: "",
          likes: 0,
        });
        setTouched({});
        setErrors({});
        // Clear the file input
        if (inputRefs.image.current) {
          inputRefs.image.current.value = "";
        }
      })
      .catch((error) => {
        console.error("Error posting event:", error);
        toast.error("Error posting event. Please try again.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: darkMode ? "dark" : "light",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-0">
      <div className="flex flex-col w-full max-w-full p-4 md:p-8 bg-white dark:bg-gray-800 shadow-xl transition-all duration-300 hover:shadow-2xl border-x-0 border-t border-b border-gray-200 dark:border-gray-700">
        <ToastContainer
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme={darkMode ? "dark" : "light"}
          className="toast-container"
        />
        <h1 className="font-bold text-[36px] mb-8 text-center text-gray-800 dark:text-gray-100 relative">
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Post An Event
          </span>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto mt-2"></div>
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-7xl mx-auto px-4"
        >
          <div className="flex flex-col gap-5">
            <label className="flex flex-col text-gray-700 dark:text-gray-200 font-medium">
              Title:
              <input
                type="text"
                name="title"
                ref={inputRefs.title}
                onKeyDown={(e) => handleKeyDown(e, "description")}
                className={`input-field mt-1 border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm
                  ${
                    touched.title && errors.title
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 dark:bg-gray-700 dark:text-white"
                  }`}
                value={formData.title}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Enter event title"
                aria-label="Event Title"
              />
              {touched.title && errors.title && (
                <span className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {errors.title}
                </span>
              )}
            </label>
            <label className="flex flex-col text-gray-700 dark:text-gray-200 font-medium">
              Description:
              <textarea
                name="description"
                ref={inputRefs.description}
                onKeyDown={(e) => handleKeyDown(e, "eventDate")}
                className={`input-field mt-1 border p-3 rounded-lg h-28 focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm resize-none
                  ${
                    touched.description && errors.description
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 dark:bg-gray-700 dark:text-white"
                  }`}
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Describe your event"
                aria-label="Event Description"
              ></textarea>
              {touched.description && errors.description && (
                <span className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {errors.description}
                </span>
              )}
            </label>
            <label className="flex flex-col text-gray-700 dark:text-gray-200 font-medium">
              Event Date:
              <input
                type="date"
                name="eventDate"
                ref={inputRefs.eventDate}
                onKeyDown={(e) => handleKeyDown(e, "location")}
                className={`input-field mt-1 border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm
                  ${
                    touched.eventDate && errors.eventDate
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 dark:bg-gray-700 dark:text-white"
                  }`}
                value={formData.eventDate}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-label="Event Date"
              />
              {touched.eventDate && errors.eventDate && (
                <span className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {errors.eventDate}
                </span>
              )}
            </label>
            <label className="flex flex-col text-gray-700 dark:text-gray-200 font-medium">
              Location:
              <input
                type="text"
                name="location"
                ref={inputRefs.location}
                onKeyDown={(e) => handleKeyDown(e, "optional")}
                className={`input-field mt-1 border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm
                  ${
                    touched.location && errors.location
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 dark:bg-gray-700 dark:text-white"
                  }`}
                value={formData.location}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Event location"
                aria-label="Event Location"
              />
              {touched.location && errors.location && (
                <span className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {errors.location}
                </span>
              )}
            </label>
          </div>

          <div className="flex flex-col gap-5">
            <label className="flex flex-col text-gray-700 dark:text-gray-200 font-medium">
              Optional:
              <input
                type="text"
                name="optional"
                ref={inputRefs.optional}
                onKeyDown={(e) => handleKeyDown(e, "organizedBy")}
                className="input-field mt-1 border border-gray-300 dark:border-gray-600 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 transition-all duration-200 shadow-sm dark:bg-gray-700 dark:text-white"
                value={formData.optional}
                onChange={handleChange}
                placeholder="Optional information"
                aria-label="Optional Information"
              />
            </label>
            <label className="flex flex-col text-gray-700 dark:text-gray-200 font-medium">
              Organized By:
              <input
                type="text"
                name="organizedBy"
                ref={inputRefs.organizedBy}
                onKeyDown={(e) => handleKeyDown(e, "eventTime")}
                className={`input-field mt-1 border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm
                  ${
                    touched.organizedBy && errors.organizedBy
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 dark:bg-gray-700 dark:text-white"
                  }`}
                value={formData.organizedBy}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Organizer's name"
                aria-label="Organized By"
              />
              {touched.organizedBy && errors.organizedBy && (
                <span className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {errors.organizedBy}
                </span>
              )}
            </label>
            <label className="flex flex-col text-gray-700 dark:text-gray-200 font-medium">
              Event Time:
              <input
                type="time"
                name="eventTime"
                ref={inputRefs.eventTime}
                onKeyDown={(e) => handleKeyDown(e, "ticketPrice")}
                className={`input-field mt-1 border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm
                  ${
                    touched.eventTime && errors.eventTime
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 dark:bg-gray-700 dark:text-white"
                  }`}
                value={formData.eventTime}
                onChange={handleChange}
                onBlur={handleBlur}
                aria-label="Event Time"
              />
              {touched.eventTime && errors.eventTime && (
                <span className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {errors.eventTime}
                </span>
              )}
            </label>
            <label className="flex flex-col text-gray-700 dark:text-gray-200 font-medium">
              Ticket Price:
              <input
                type="number"
                name="ticketPrice"
                ref={inputRefs.ticketPrice}
                onKeyDown={(e) => handleKeyDown(e, "image")}
                className={`input-field mt-1 border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm
                  ${
                    touched.ticketPrice && errors.ticketPrice
                      ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-200 dark:focus:ring-red-800"
                      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 dark:bg-gray-700 dark:text-white"
                  }`}
                value={formData.ticketPrice}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Price in USD"
                aria-label="Ticket Price"
              />
              {touched.ticketPrice && errors.ticketPrice && (
                <span className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {errors.ticketPrice}
                </span>
              )}
            </label>
            <label className="flex flex-col text-gray-700 dark:text-gray-200 font-medium">
              Image:
              <div className="relative mt-1">
                <input
                  type="file"
                  name="image"
                  ref={inputRefs.image}
                  onKeyDown={(e) => handleKeyDown(e, "submit")}
                  className={`input-field w-full border p-3 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-900 dark:file:text-blue-300 hover:file:bg-blue-100 dark:hover:file:bg-blue-800
                    ${
                      touched.image && errors.image
                        ? "border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-200 dark:focus:ring-red-800"
                        : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-transparent hover:border-blue-400 dark:bg-gray-700 dark:text-white"
                    }`}
                  onChange={handleImageUpload}
                  aria-label="Upload Image"
                />
              </div>
              {touched.image && errors.image && (
                <span className="text-red-500 dark:text-red-400 text-sm mt-1 ml-1">
                  {errors.image}
                </span>
              )}
            </label>
          </div>

          <div className="col-span-2 flex justify-center mt-2">
            <button
              className={`relative overflow-hidden primary bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-10 rounded-lg mt-4 transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 ${
                isSubmitting ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
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
                "Submit Event"
              )}
              <div className="absolute inset-0 bg-white dark:bg-gray-300 rounded-lg opacity-0 hover:opacity-20 transition-opacity duration-300"></div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
