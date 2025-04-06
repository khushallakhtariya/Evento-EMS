/* eslint-disable no-unused-vars */
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { IoMdArrowBack } from "react-icons/io";
import { UserContext } from "../UserContext";
import Qrcode from "qrcode"; //TODO:
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function PaymentSummary() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const { user } = useContext(UserContext);
  const [details, setDetails] = useState({
    name: "",
    email: "",
    contactNo: "",
  });
  //!Adding a default state for ticket-----------------------------
  const defaultTicketState = {
    userid: user ? user._id : "",
    eventid: "",
    ticketDetails: {
      name: user ? user.name : "",
      email: user ? user.email : "",
      eventname: "",
      eventdate: "",
      eventtime: "",
      ticketprice: "",
      qr: "",
    },
  };
  //! add default state to the ticket details state
  const [ticketDetails, setTicketDetails] = useState(defaultTicketState);

  const [payment, setPayment] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    paymentMethod: "credit", // Default payment method
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    upiId: "",
  });
  const [redirect, setRedirect] = useState("");
  const [showQrConfirmation, setShowQrConfirmation] = useState(false);
  const [qrCode, setQrCode] = useState("");
  // Add validation state for form fields
  const [errors, setErrors] = useState({
    name: false,
    email: false,
    contactNo: false,
    nameOnCard: false,
    cardNumber: false,
    expiryDate: false,
    cvv: false,
  });

  useEffect(() => {
    if (!id) {
      return;
    }
    axios
      .get(`/event/${id}/ordersummary/paymentsummary`)
      .then((response) => {
        setEvent(response.data);

        setTicketDetails((prevTicketDetails) => ({
          ...prevTicketDetails,
          eventid: response.data._id,
          //!capturing event details from backend for ticket----------------------
          ticketDetails: {
            ...prevTicketDetails.ticketDetails,
            eventname: response.data.title,
            eventdate: response.data.eventDate.split("T")[0],
            eventtime: response.data.eventTime,
            ticketprice: response.data.ticketPrice,
          },
        }));
      })
      .catch((error) => {
        console.error("Error fetching events:", error);
      });
  }, [id]);
  //! Getting user details using useeffect and setting to new ticket details with previous details
  useEffect(() => {
    setTicketDetails((prevTicketDetails) => ({
      ...prevTicketDetails,
      userid: user ? user._id : "",
      ticketDetails: {
        ...prevTicketDetails.ticketDetails,
        name: user ? user.name : "",
        email: user ? user.email : "",
      },
    }));
  }, [user]);

  if (!event) return "";

  const handleChangeDetails = (e) => {
    const { name, value } = e.target;
    setDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));

    // Clear error state when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: false,
      });
    }
  };

  const handleChangePayment = (e) => {
    const { name, value } = e.target;
    setPayment((prevPayment) => ({
      ...prevPayment,
      [name]: value,
    }));

    // Clear error state when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: false,
      });
    }
  };
  //! Helper function to generate QR code ------------------------------
  async function generateQRCode(name, eventName) {
    try {
      const qrCodeData = await Qrcode.toDataURL(
        `Event Name: ${name} \n Name: ${eventName}`
      );
      return qrCodeData;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  }

  // New function to handle showing QR code before payment
  const handleShowQrCode = async (e) => {
    e.preventDefault();

    // Reset all error states
    const newErrors = {
      name: !details.name,
      email: !details.email,
      contactNo: !details.contactNo,
    };

    setErrors(newErrors);

    // Check if all details fields are filled
    if (!details.name || !details.email || !details.contactNo) {
      toast.error("Please fill in all required details", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Check if contact number is exactly 10 digits
    if (details.contactNo.length !== 10) {
      setErrors((prev) => ({ ...prev, contactNo: true }));
      toast.error("Contact number must be 10 digits", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const generatedQrCode = await generateQRCode(
        ticketDetails.ticketDetails.eventname,
        ticketDetails.ticketDetails.name
      );
      setQrCode(generatedQrCode);
      setShowQrConfirmation(true);
    } catch (error) {
      console.error("Error generating QR code:", error);
      toast.error("Could not generate QR code. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Modified function to create ticket
  const createTicket = async (e) => {
    e.preventDefault();

    // Reset payment error states
    const newErrors = {
      nameOnCard: !payment.nameOnCard,
      cardNumber: !payment.cardNumber,
      expiryDate: !payment.expiryDate,
      cvv: !payment.cvv,
    };

    setErrors(newErrors);

    // Check if all fields are filled
    if (
      !payment.nameOnCard ||
      !payment.cardNumber ||
      !payment.expiryDate ||
      !payment.cvv
    ) {
      toast.error("Please fill in all required payment fields", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      const updatedTicketDetails = {
        ...ticketDetails,
        ticketDetails: {
          ...ticketDetails.ticketDetails,
          qr: qrCode,
        },
      };
      const response = await axios.post(`/tickets`, updatedTicketDetails);

      // Show success toast
      toast.success("Payment successful! Redirecting to your wallet...", {
        position: "top-right",
        autoClose: 2500,
      });

      // Add a delay before redirecting
      setTimeout(() => {
        setRedirect(true);
      }, 3000); // 3000 milliseconds = 3 seconds

      console.log("Success creating ticket", updatedTicketDetails);
    } catch (error) {
      console.error("Error creating ticket:", error);
      toast.error("Payment failed. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Function to go back to payment form
  const handleBackToPayment = () => {
    setShowQrConfirmation(false);
  };

  // Modified function to handle UPI payment
  const handleUpiPayment = () => {
    // Check if UPI ID is filled
    if (!payment.upiId) {
      toast.error("Please enter your UPI ID", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    // Use toast instead of alert for confirmation
    toast.info(
      `Processing payment of MRP ${event.ticketPrice} via UPI ID: ${payment.upiId}`,
      {
        position: "top-right",
        autoClose: 2000,
      }
    );

    // Process payment and create ticket after a short delay
    setTimeout(() => {
      toast.success("UPI Payment successful! Redirecting to your wallet...", {
        position: "top-right",
        autoClose: 2000,
      });

      // Directly set redirect instead of calling createTicket
      setTimeout(() => {
        // Get QR code first
        generateQRCode(
          ticketDetails.ticketDetails.eventname,
          ticketDetails.ticketDetails.name
        ).then((qrCodeData) => {
          // Create ticket directly without showing additional toast
          const updatedTicketDetails = {
            ...ticketDetails,
            ticketDetails: {
              ...ticketDetails.ticketDetails,
              qr: qrCodeData,
            },
          };

          axios
            .post(`/tickets`, updatedTicketDetails)
            .then(() => {
              setRedirect(true);
            })
            .catch((error) => {
              console.error("Error creating ticket:", error);
              toast.error("Something went wrong. Please try again.", {
                position: "top-right",
                autoClose: 3000,
              });
            });
        });
      }, 2000);
    }, 2500);
  };

  // Function to handle enter key press and move to next field
  const handleKeyDown = (e, nextFieldName) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Find the next input field and focus it
      const nextField = document.querySelector(
        `input[name="${nextFieldName}"]`
      );
      if (nextField) {
        nextField.focus();
      }
    }
  };

  if (redirect) {
    return <Navigate to={"/wallet"} />;
  }

  // Helper function to get input style based on error state
  const getInputStyle = (fieldName) => {
    return errors[fieldName]
      ? "w-full h-12 bg-gray-50 dark:bg-gray-800 border border-red-500 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
      : "w-full h-12 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 dark:text-gray-200";
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 min-h-screen pb-12">
      <ToastContainer />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link to={"/event/" + event._id + "/ordersummary"}>
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 shadow rounded-lg text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <IoMdArrowBack className="w-5 h-5" />
            Back
          </button>
        </Link>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main payment form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-8 border border-gray-100 dark:border-gray-700">
              {showQrConfirmation ? (
                // QR Code Confirmation View
                <div className="flex flex-col items-center">
                  <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-3 w-full text-center">
                    Your Event QR Code
                  </h2>
                  <div className="mb-6 p-2 bg-white dark:bg-gray-700 rounded-xl shadow-md border border-gray-200 dark:border-gray-600">
                    {qrCode && (
                      <img
                        src={qrCode}
                        alt="Event QR Code"
                        className="w-64 h-64 mx-auto mb-4 rounded-lg"
                      />
                    )}
                  </div>
                  <div className="mb-8 text-center">
                    <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-100">
                      {event.title}
                    </h3>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg shadow-sm border border-blue-100 dark:border-blue-800 mb-4">
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Name:</span>{" "}
                        {details.name}
                        <br />
                        <span className="font-medium">Email:</span>{" "}
                        {details.email}
                        <br />
                        <span className="font-medium">Contact:</span>{" "}
                        {details.contactNo}
                      </p>
                    </div>
                    <p className="mt-4 text-gray-700 dark:text-gray-300 bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg border border-yellow-100 dark:border-yellow-800">
                      This QR code will be stored in your wallet after
                      successful payment. Please present this at the event for
                      entry.
                    </p>
                  </div>
                  <div className="flex gap-4 mt-4">
                    <button
                      type="button"
                      onClick={handleBackToPayment}
                      className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:focus:ring-gray-800 transition-colors duration-200 shadow-sm"
                    >
                      Back to Details
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-sm"
                      onClick={() =>
                        document
                          .getElementById("payment-section")
                          .scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Proceed to Payment
                    </button>
                  </div>

                  <div id="payment-section" className="mt-12 w-full">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-3">
                      Payment Option
                    </h2>
                    <div className="mb-6">
                      <select
                        name="paymentMethod"
                        value={payment.paymentMethod}
                        onChange={handleChangePayment}
                        className="w-full md:w-60 h-12 px-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-transparent shadow-sm cursor-pointer"
                      >
                        <option value="credit">Credit Card</option>
                        <option value="debit">Debit Card</option>
                        <option value="bank">Bank Account</option>
                        <option value="upi">UPI</option>
                      </select>
                    </div>

                    {/* Payment methods */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm">
                      {(payment.paymentMethod === "credit" ||
                        payment.paymentMethod === "debit") && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Name on Card
                              </label>
                              <input
                                type="text"
                                name="nameOnCard"
                                value={payment.nameOnCard}
                                onChange={handleChangePayment}
                                onKeyDown={(e) =>
                                  handleKeyDown(e, "cardNumber")
                                }
                                placeholder="Name on Card *"
                                className={getInputStyle("nameOnCard")}
                              />
                              {errors.nameOnCard && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                  Name on card is required
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Card Number
                              </label>
                              <input
                                type="text"
                                name="cardNumber"
                                value={payment.cardNumber}
                                onChange={handleChangePayment}
                                onKeyDown={(e) =>
                                  handleKeyDown(e, "expiryDate")
                                }
                                placeholder="Card Number *"
                                className={getInputStyle("cardNumber")}
                                pattern="\d{13}"
                                maxLength="13"
                              />
                              {errors.cardNumber && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                  Card number is required
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-5">
                            <div className="col-span-2">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Expiry Date
                              </label>
                              <input
                                type="text"
                                name="expiryDate"
                                value={payment.expiryDate}
                                onChange={handleChangePayment}
                                onKeyDown={(e) => handleKeyDown(e, "cvv")}
                                placeholder="Expiry Date (MM/YY) *"
                                className={getInputStyle("expiryDate")}
                                pattern="\d{2}/\d{2}"
                                maxLength="5"
                              />
                              {errors.expiryDate && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                  Expiry date is required
                                </p>
                              )}
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                CVV
                              </label>
                              <input
                                type="text"
                                name="cvv"
                                value={payment.cvv}
                                onChange={handleChangePayment}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    e.preventDefault();
                                    createTicket(e);
                                  }
                                }}
                                placeholder="CVV *"
                                className={getInputStyle("cvv")}
                                pattern="\d{3}"
                                maxLength="3"
                              />
                              {errors.cvv && (
                                <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                                  CVV is required
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {payment.paymentMethod === "bank" && (
                        <div className="space-y-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Bank Name
                              </label>
                              <input
                                type="text"
                                name="bankName"
                                value={payment.bankName}
                                onChange={handleChangePayment}
                                onKeyDown={(e) =>
                                  handleKeyDown(e, "accountNumber")
                                }
                                placeholder="Bank Name"
                                className="w-full h-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-transparent shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Account Number
                              </label>
                              <input
                                type="text"
                                name="accountNumber"
                                value={payment.accountNumber}
                                onChange={handleChangePayment}
                                onKeyDown={(e) => handleKeyDown(e, "ifscCode")}
                                placeholder="Account Number"
                                className="w-full h-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-transparent shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              IFSC Code
                            </label>
                            <input
                              type="text"
                              name="ifscCode"
                              value={payment.ifscCode}
                              onChange={handleChangePayment}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  createTicket(e);
                                }
                              }}
                              placeholder="IFSC Code"
                              className="w-full h-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-transparent shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                            />
                          </div>
                        </div>
                      )}

                      {payment.paymentMethod === "upi" && (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              UPI ID
                            </label>
                            <input
                              type="text"
                              name="upiId"
                              value={payment.upiId}
                              onChange={handleChangePayment}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  handleUpiPayment();
                                }
                              }}
                              placeholder="Enter UPI ID (example@bank)"
                              className="w-full h-12 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-800 focus:border-transparent shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200"
                            />
                          </div>
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={handleUpiPayment}
                              className="w-full py-3 bg-green-600 dark:bg-green-700 text-white font-medium rounded-lg hover:bg-green-700 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-sm"
                            >
                              Pay with UPI (MRP {event.ticketPrice})
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-8 text-right">
                      <div className="inline-flex flex-col items-end">
                        <p className="text-base font-semibold mb-3 text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
                          Total :{" "}
                          <span className="text-blue-700 dark:text-blue-400">
                            MRP {event.ticketPrice}
                          </span>
                        </p>
                        {payment.paymentMethod !== "upi" && (
                          <button
                            type="button"
                            onClick={createTicket}
                            className="inline-flex justify-center items-center px-8 py-4 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-md"
                          >
                            Make Payment
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Original details form
                <>
                  {/* Your Details */}
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-3">
                      Your Details
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={details.name}
                          onChange={handleChangeDetails}
                          onKeyDown={(e) => handleKeyDown(e, "email")}
                          placeholder="Name *"
                          className={getInputStyle("name")}
                        />
                        {errors.name && (
                          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                            Name is required
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={details.email}
                          onChange={handleChangeDetails}
                          onKeyDown={(e) => handleKeyDown(e, "contactNo")}
                          placeholder="Email *"
                          className={getInputStyle("email")}
                        />
                        {errors.email && (
                          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                            Email is required
                          </p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Contact Number
                        </label>
                        <input
                          type="tel"
                          name="contactNo"
                          value={details.contactNo}
                          onChange={handleChangeDetails}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleShowQrCode(e);
                            }
                          }}
                          placeholder="Contact No *"
                          className={getInputStyle("contactNo")}
                          pattern="[0-9]{10}"
                          maxLength="10"
                        />
                        {errors.contactNo && (
                          <p className="mt-1 text-sm text-red-500 dark:text-red-400">
                            {details.contactNo
                              ? "Contact number must be 10 digits"
                              : "Contact number is required"}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-8 text-right">
                      <button
                        type="button"
                        onClick={handleShowQrCode}
                        className="inline-flex justify-center items-center px-8 py-4 bg-blue-600 dark:bg-blue-700 text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800 transition-colors duration-200 shadow-md"
                      >
                        Continue to QR Preview
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700 sticky top-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100 border-b dark:border-gray-700 pb-3">
                Order Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 font-medium">
                    Quantity
                  </span>
                  <span className="font-medium bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-blue-800 dark:text-blue-200">
                    1 Ticket
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-2">
                  {event.title}
                </h3>
                <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                  <p className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 bg-blue-500 rounded-full"></span>
                    {event.eventDate.split("T")[0]}
                  </p>
                  <p className="flex items-center gap-2 mt-1">
                    <span className="inline-block w-4 h-4 bg-green-500 rounded-full"></span>
                    {event.eventTime}
                  </p>
                </div>
                <hr className="my-4 border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between items-center text-gray-800 dark:text-gray-200 py-2">
                  <span className="font-medium">Sub total:</span>
                  <span className="font-bold">MRP {event.ticketPrice}</span>
                </div>
                <div className="flex justify-between items-center text-gray-800 dark:text-gray-200 font-bold bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                  <span>Total:</span>
                  <span className="text-blue-700 dark:text-blue-400">
                    MRP {event.ticketPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
