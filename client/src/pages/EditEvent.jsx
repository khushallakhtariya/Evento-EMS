import { useContext, useState, useRef, useEffect } from "react";
import axios from "axios";
import { UserContext } from "../UserContext";
import { ThemeContext } from "../ThemeContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useParams, useNavigate } from "react-router-dom";

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { darkMode } = useContext(ThemeContext);
  const [formData, setFormData] = useState({
    owner: "",
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
    Participants: 100,
    Count: 0,
  });
  const [currentImage, setCurrentImage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const inputRefs = {
    title: useRef(null),
    description: useRef(null),
    organizedBy: useRef(null),
    eventDate: useRef(null),
    location: useRef(null),
    optional: useRef(null),
    eventTime: useRef(null),
    ticketPrice: useRef(null),
    Participants: useRef(null),
    image: useRef(null),
  };

  // Fetch event data when component mounts
  useEffect(() => {
    const checkAdminStatus = () => {
      const userDataString = localStorage.getItem("user");
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          if (userData?.role !== "admin") {
            toast.error("Admin access required", {
              position: "top-center",
              autoClose: 3000,
            });
            navigate("/");
          }
        } catch (error) {
          console.error("Error parsing user data:", error);
          navigate("/");
        }
      } else {
        navigate("/");
      }
    };

    checkAdminStatus();

    axios
      .get(`/event/${id}`)
      .then((response) => {
        const eventData = response.data;

        // Format date for the input field (YYYY-MM-DD)
        const date = new Date(eventData.eventDate);
        const formattedDate = date.toISOString().split("T")[0];

        setFormData({
          owner: eventData.owner || "",
          title: eventData.title || "",
          optional: eventData.optional || "",
          description: eventData.description || "",
          organizedBy: eventData.organizedBy || "",
          eventDate: formattedDate,
          eventTime: eventData.eventTime || "",
          location: eventData.location || "",
          ticketPrice: eventData.ticketPrice || 0,
          likes: eventData.likes || 0,
          Participants: eventData.Participants || 100,
          Count: eventData.Count || 0,
        });

        if (eventData.image) {
          setCurrentImage(eventData.image);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching event data:", error);
        toast.error("Failed to load event data", {
          position: "top-center",
          autoClose: 3000,
        });
        navigate("/");
      });
  }, [id, navigate]);

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
    } else if (
      name === "Participants" &&
      (isNaN(value) || Number(value) <= 0)
    ) {
      error = "Capacity must be a positive number greater than zero";
    }

    return error;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files;
    setTouched((prev) => ({ ...prev, image: true }));

    if (!file || !file[0]) {
      // No error for image on edit if we already have an image
      if (!currentImage) {
        setErrors((prev) => ({ ...prev, image: "Image is required" }));
      }
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
      if (!files[0] && !currentImage) {
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
      Participants: true,
    };
    setTouched(allFields);

    // Validate all fields
    const newErrors = {};
    Object.keys(allFields).forEach((field) => {
      // Skip image validation if we already have an image and no new one was selected
      if (field === "image" && !formData.image && currentImage) {
        // No error, we'll keep the existing image
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

    // Only append image if a new one was selected
    if (formData.image && typeof formData.image !== "string") {
      newFormData.append("image", formData.image);
    }

    newFormData.append("title", formData.title);
    newFormData.append("optional", formData.optional);
    newFormData.append("description", formData.description);
    newFormData.append("organizedBy", formData.organizedBy);
    newFormData.append("eventDate", formData.eventDate);
    newFormData.append("eventTime", formData.eventTime);
    newFormData.append("location", formData.location);
    newFormData.append("ticketPrice", formData.ticketPrice);
    newFormData.append("Participants", formData.Participants);
    newFormData.append("Count", formData.Count);
    newFormData.append("likes", formData.likes);

    axios
      .put(`/createEvent/${id}`, newFormData)
      .then((response) => {
        console.log("Event updated successfully:", response.data);
        toast.success("Event updated successfully!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: darkMode ? "dark" : "light",
        });

        // Redirect back to event page after successful update
        setTimeout(() => {
          navigate(`/event/${id}`);
        }, 2000);
      })
      .catch((error) => {
        console.error("Error updating event:", error);
        toast.error("Error updating event. Please try again.", {
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-[90%] mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden transition-all duration-300">
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
        />
        <div className="p-6 sm:p-10">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 mr-3 text-indigo-600 dark:text-indigo-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Edit Event
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title field */}
              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  ref={inputRefs.title}
                  value={formData.title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, "description")}
                  className={`block w-full rounded-md shadow-sm px-4 py-3 border ${
                    touched.title && errors.title
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                  } dark:bg-gray-700 dark:text-white transition-colors`}
                  placeholder="Enter event title"
                />
                {touched.title && errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Optional field */}
              <div>
                <label
                  htmlFor="optional"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Subtitle (Optional)
                </label>
                <input
                  id="optional"
                  name="optional"
                  type="text"
                  ref={inputRefs.optional}
                  value={formData.optional}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, "organizedBy")}
                  className="block w-full rounded-md shadow-sm px-4 py-3 border border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Enter optional subtitle"
                />
              </div>

              {/* Description field */}
              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  ref={inputRefs.description}
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`block w-full rounded-md shadow-sm px-4 py-3 border ${
                    touched.description && errors.description
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                  } dark:bg-gray-700 dark:text-white transition-colors`}
                  rows={4}
                  placeholder="Describe your event..."
                />
                {touched.description && errors.description && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Organized by field */}
              <div>
                <label
                  htmlFor="organizedBy"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Organized By <span className="text-red-500">*</span>
                </label>
                <input
                  id="organizedBy"
                  name="organizedBy"
                  type="text"
                  ref={inputRefs.organizedBy}
                  value={formData.organizedBy}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, "eventDate")}
                  className={`block w-full rounded-md shadow-sm px-4 py-3 border ${
                    touched.organizedBy && errors.organizedBy
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                  } dark:bg-gray-700 dark:text-white transition-colors`}
                  placeholder="Who is organizing this event?"
                />
                {touched.organizedBy && errors.organizedBy && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.organizedBy}
                  </p>
                )}
              </div>

              {/* Date field */}
              <div>
                <label
                  htmlFor="eventDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Event Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="eventDate"
                  name="eventDate"
                  type="date"
                  ref={inputRefs.eventDate}
                  value={formData.eventDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, "eventTime")}
                  className={`block w-full rounded-md shadow-sm px-4 py-3 border ${
                    touched.eventDate && errors.eventDate
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                  } dark:bg-gray-700 dark:text-white transition-colors`}
                />
                {touched.eventDate && errors.eventDate && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.eventDate}
                  </p>
                )}
              </div>

              {/* Time field */}
              <div>
                <label
                  htmlFor="eventTime"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Event Time <span className="text-red-500">*</span>
                </label>
                <input
                  id="eventTime"
                  name="eventTime"
                  type="text"
                  ref={inputRefs.eventTime}
                  value={formData.eventTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, "location")}
                  className={`block w-full rounded-md shadow-sm px-4 py-3 border ${
                    touched.eventTime && errors.eventTime
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                  } dark:bg-gray-700 dark:text-white transition-colors`}
                  placeholder="e.g. 7:00 PM"
                />
                {touched.eventTime && errors.eventTime && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.eventTime}
                  </p>
                )}
              </div>

              {/* Location field */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  ref={inputRefs.location}
                  value={formData.location}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, "ticketPrice")}
                  className={`block w-full rounded-md shadow-sm px-4 py-3 border ${
                    touched.location && errors.location
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                  } dark:bg-gray-700 dark:text-white transition-colors`}
                  placeholder="Where is the event taking place?"
                />
                {touched.location && errors.location && (
                  <p className="mt-1 text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              {/* Ticket price field */}
              <div>
                <label
                  htmlFor="ticketPrice"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Ticket Price (0 for free){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  id="ticketPrice"
                  name="ticketPrice"
                  type="number"
                  ref={inputRefs.ticketPrice}
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, "Participants")}
                  className={`block w-full rounded-md shadow-sm px-4 py-3 border ${
                    touched.ticketPrice && errors.ticketPrice
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                  } dark:bg-gray-700 dark:text-white transition-colors`}
                  placeholder="Event ticket price"
                />
                {touched.ticketPrice && errors.ticketPrice && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.ticketPrice}
                  </p>
                )}
              </div>

              {/* Capacity field */}
              <div>
                <label
                  htmlFor="Participants"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Event Capacity <span className="text-red-500">*</span>
                </label>
                <input
                  id="Participants"
                  name="Participants"
                  type="number"
                  ref={inputRefs.Participants}
                  value={formData.Participants}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  onKeyDown={(e) => handleKeyDown(e, "image")}
                  className={`block w-full rounded-md shadow-sm px-4 py-3 border ${
                    touched.Participants && errors.Participants
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                  } dark:bg-gray-700 dark:text-white transition-colors`}
                  placeholder="Maximum number of participants"
                />
                {touched.Participants && errors.Participants && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.Participants}
                  </p>
                )}
              </div>

              {/* Image upload field */}
              <div className="md:col-span-2">
                <label
                  htmlFor="image"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Event Image
                  {!currentImage && <span className="text-red-500">*</span>}
                </label>

                {/* Show current image if available */}
                {currentImage && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Current image:
                    </p>
                    <img
                      src={`http://localhost:4000/${currentImage}`}
                      alt="Current event"
                      className="w-40 h-auto rounded-md shadow-sm"
                    />
                  </div>
                )}

                <input
                  id="image"
                  name="image"
                  type="file"
                  ref={inputRefs.image}
                  onChange={handleImageUpload}
                  onKeyDown={(e) => handleKeyDown(e, "submit")}
                  className={`block w-full rounded-md shadow-sm px-4 py-3 border ${
                    touched.image && errors.image && !currentImage
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:border-indigo-500 focus:ring-indigo-500"
                  } dark:bg-gray-700 dark:text-white transition-colors`}
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Upload a new image only if you want to change the current one
                </p>
                {touched.image && errors.image && !currentImage && (
                  <p className="mt-1 text-sm text-red-500">{errors.image}</p>
                )}
              </div>
            </div>

            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => navigate(`/event/${id}`)}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  isSubmitting
                    ? "bg-indigo-400 dark:bg-indigo-700 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800 transition-colors`}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Updating Event...
                  </div>
                ) : (
                  "Update Event"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
