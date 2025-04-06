import axios from "axios";
import { useEffect, useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { Link, useParams } from "react-router-dom";

export default function OrderSummary() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isCheckboxChecked, setIsCheckboxChecked] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    axios
      .get(`/event/${id}/ordersummary`)
      .then((response) => {
        setEvent(response.data);
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, [id]);

  //! Handle checkbox change
  const handleCheckboxChange = (e) => {
    setIsCheckboxChecked(e.target.checked);
  };

  if (!event) return "";
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 dark:bg-gray-900">
      <Link to={"/event/" + event._id}>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-blue-700 font-medium rounded-md transition-colors shadow-sm dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-blue-400">
          <IoMdArrowBack className="w-5 h-5" />
          Back
        </button>
      </Link>

      <div className="mt-8 flex flex-col md:flex-row gap-6">
        {/* Terms & Conditions Panel */}
        <div className="flex-grow bg-white rounded-lg shadow-md p-6 overflow-auto max-h-[600px] dark:bg-gray-800">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Terms & Conditions
          </h2>

          <ul className="space-y-3 text-gray-700 list-disc pl-5 dark:text-gray-300">
            <li>
              Refunds will be provided for ticket cancellations made up to 14
              days before the event date. After this period, no refunds will be
              issued. To request a refund, please contact our customer support
              team.
            </li>
            <li>
              Tickets will be delivered to your registered email address as
              e-tickets. You can print the e-ticket or show it on your mobile
              device for entry to the event.
            </li>
            <li>
              Each individual is allowed to purchase a maximum of 1 tickets for
              this event to ensure fair distribution.
            </li>
            <li>
              In the rare event of cancellation or postponement, attendees will
              be notified via email. Refunds will be automatically processed for
              canceled events.
            </li>
            <li>
              Tickets for postponed events will not be refunded and the ticket
              will be considered a valid ticket on the date of postponement.
            </li>
            <li>
              Your privacy is important to us. Our privacy policy outlines how
              we collect, use, and protect your personal information. By using
              our app, you agree to our privacy policy.
            </li>
            <li>
              Before proceeding with your ticket purchase, please review and
              accept our terms and conditions, which govern the use of our app
              and ticketing services.
            </li>
          </ul>
        </div>

        {/* Booking Summary Panel */}
        <div className="md:w-96 bg-blue-50 rounded-lg shadow-md p-6 sticky top-0 self-start dark:bg-blue-900">
          <h2 className="text-xl font-bold mb-4 dark:text-white">
            Booking Summary
          </h2>

          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-800 dark:text-gray-200">
              {event.title}
            </span>
            <span className="font-medium dark:text-white">
              ₹{event.ticketPrice}
            </span>
          </div>

          <hr className="border-gray-300 my-4 dark:border-gray-600" />

          <div className="flex justify-between items-center mb-6">
            <span className="text-gray-800 font-bold dark:text-gray-200">
              SUB TOTAL
            </span>
            <span className="font-bold dark:text-white">
              ₹{event.ticketPrice}
            </span>
          </div>

          <div className="flex items-start gap-3 mb-6">
            <input
              type="checkbox"
              id="termsCheckbox"
              onChange={handleCheckboxChange}
              className="mt-1.5 h-4 w-4 rounded border-gray-300 text-blue-700 focus:ring-blue-600 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-blue-500"
            />
            <label
              htmlFor="termsCheckbox"
              className="text-sm text-gray-700 dark:text-gray-300"
            >
              I have verified for the Event.
            </label>
          </div>

          <Link
            to={"/event/" + event._id + "/ordersummary" + "/paymentsummary"}
          >
            <button
              className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                isCheckboxChecked
                  ? "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                  : "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
              }`}
              disabled={!isCheckboxChecked}
            >
              Proceed to Payment
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
