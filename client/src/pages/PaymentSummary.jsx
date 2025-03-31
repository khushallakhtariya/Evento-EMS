/* eslint-disable no-unused-vars */
import axios from 'axios';
import  { useContext, useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom';
import {IoMdArrowBack} from 'react-icons/io'
import { UserContext } from '../UserContext';
import Qrcode from 'qrcode' //TODO:
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function PaymentSummary() {
    const {id} = useParams();
    const [event, setEvent] = useState(null);
    const {user} = useContext(UserContext);
    const [details, setDetails] = useState({
      name: '',
      email: '',
      contactNo: '',
    });
//!Adding a default state for ticket-----------------------------
    const defaultTicketState = {
      userid: user ? user._id : '',
      eventid: '',
      ticketDetails: {
        name: user ? user.name : '',
        email: user ? user.email : '',
        eventname: '',
        eventdate: '',
        eventtime: '',
        ticketprice: '',
        qr: '',
      }
    };
//! add default state to the ticket details state
    const [ticketDetails, setTicketDetails] = useState(defaultTicketState);

    const [payment, setPayment] = useState({
      nameOnCard: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    });
    const [redirect, setRedirect] = useState('');
  
    useEffect(()=>{
      if(!id){
        return;
      }
      axios.get(`/event/${id}/ordersummary/paymentsummary`).then(response => {
        setEvent(response.data)

        setTicketDetails(prevTicketDetails => ({
          ...prevTicketDetails,
          eventid: response.data._id,
       //!capturing event details from backend for ticket----------------------
          ticketDetails: {
            ...prevTicketDetails.ticketDetails,
            eventname: response.data.title,
            eventdate: response.data.eventDate.split("T")[0],
            eventtime: response.data.eventTime,
            ticketprice: response.data.ticketPrice,
          }
        }));
      }).catch((error) => {
        console.error("Error fetching events:", error);
      });
    }, [id]);
//! Getting user details using useeffect and setting to new ticket details with previous details
    useEffect(() => {
      setTicketDetails(prevTicketDetails => ({
        ...prevTicketDetails,
        userid: user ? user._id : '',
        ticketDetails: {
          ...prevTicketDetails.ticketDetails,
          name: user ? user.name : '',
          email: user ? user.email : '',
        }
      }));
    }, [user]);
    
    
    if (!event) return '';

    const handleChangeDetails = (e) => {
      const { name, value } = e.target;
      setDetails((prevDetails) => ({
        ...prevDetails,
        [name]: value,
      }));
    };
  
    const handleChangePayment = (e) => {
      const { name, value } = e.target;
      setPayment((prevPayment) => ({
        ...prevPayment,
        [name]: value,
      }));
    };
//! creating a ticket ------------------------------
    const createTicket = async (e) => {
        e.preventDefault();

        // Check if all fields are filled
        if (!details.name || !details.email || !details.contactNo || 
            !payment.nameOnCard || !payment.cardNumber || !payment.expiryDate || !payment.cvv) {
            if (!details.name) {
                toast.error("Please provide your name.");
            } else if (!details.email) {
                toast.error("Please provide your email.");
            } else if (!details.contactNo) {
                toast.error("Please provide your contact number.");
            } else if (!payment.nameOnCard) {
                toast.error("Please provide the name on the card.");
            } else if (!payment.cardNumber) {
                toast.error("Please provide a card number.");
            } else if (!payment.expiryDate) {
                toast.error("Please provide an expiry date.");
            } else if (!payment.cvv) {
                toast.error("Please provide a CVV.");
            }
            return;
        }

        // Check if contact number is exactly 10 digits
        if (details.contactNo.length !== 10) {
            toast.error("Contact number must be exactly 10 digits.");
            return;
        }

        try {
            const qrCode = await generateQRCode(
                ticketDetails.ticketDetails.eventname,
                ticketDetails.ticketDetails.name
            );
            const updatedTicketDetails = {
                ...ticketDetails,
                ticketDetails: {
                    ...ticketDetails.ticketDetails,
                    qr: qrCode,
                }
            };
            const response = await axios.post(`/tickets`, updatedTicketDetails);
            toast.success("Ticket Created");

            // Add a delay before redirecting
            setTimeout(() => {
                setRedirect(true);
            }, 3000); // 2000 milliseconds = 2 seconds

            console.log('Success creating ticket', updatedTicketDetails);
        } catch (error) {
            console.error('Error creating ticket:', error);
            toast.error("Please login as a user.");
        }
    }
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
if (redirect){
  return <Navigate to={'/wallet'} />
}
    return (
      <>
      <ToastContainer />
      <div>
      <Link to={'/event/'+event._id+ '/ordersummary'}>
                
       <button 
              // onClick={handleBackClick}
              className='
              inline-flex 
              mt-12
              gap-2
              p-3 
              ml-12
              bg-gray-100
              justify-center 
              items-center 
              text-blue-700
              font-bold
              rounded-sm'
              >
                
          <IoMdArrowBack 
            className='
            font-bold
            w-6
            h-6
            gap-2'/> 
            Back
          </button>
          </Link>
          </div>
      <div className="ml-12 bg-gray-100 shadow-lg mt-8 p-16 w-3/5 float-left">
          {/* Your Details */}
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-bold mb-4">Your Details</h2>
            <input
              type="text"
              name="name"
              value={details.name}
              onChange={handleChangeDetails}
              placeholder="Name"
              className="input-field ml-10 w-80 h-10 bg-gray-50 border border-gray-30  rounded-md p-2.5"
            />
            <input
              type="email"
              name="email"
              value={details.email}
              onChange={handleChangeDetails}
              placeholder="Email"
              className="input-field w-80 ml-3 h-10 bg-gray-50 border border-gray-30  rounded-sm p-2.5"
            />
            <div className="flex space-x-4">
            <input
              type="tel"
              name="contactNo"
              value={details.contactNo}
              onChange={handleChangeDetails}
              placeholder="Contact No"
              className="input-field ml-10 w-80 h-10 bg-gray-50 border border-gray-30 rounded-sm p-2.5"
              pattern="[0-9]{10}"
              maxLength="10"
            />
            </div>
          </div>
  
          {/* Payment Option */}
     
          <div className="mt-10 space-y-4">
            <h2 className="text-xl font-bold mb-4">Payment Option</h2>
            <div className="ml-10">
            <button type="button" className="px-8 py-3 text-black bg-blue-100  focus:outline border rounded-sm border-gray-300" disabled>Credit / Debit Card</button>
            </div>
          
            <input
              type="text"
              name="nameOnCard"
              value={payment.nameOnCard}                       
              onChange={handleChangePayment}
              placeholder="Name on Card"
              className="input-field w-80 ml-10 h-10 bg-gray-50 border border-gray-30  rounded-sm p-2.5"
            />
            <input
              type="text"
              name="cardNumber"
              value={payment.cardNumber}
              onChange={handleChangePayment}
              placeholder="Card Number"
              className="input-field w-80 ml-3 h-10 bg-gray-50 border border-gray-30 rounded-sm p-2.5"
              pattern="\d{13}"
              maxLength="13"
            />
            <div className="flex space-x-4">
              <div className="relative">
              <input
                type="text"
                name="expiryDate"
                value={payment.expiryDate}
                onChange={handleChangePayment}
                placeholder="Expiry Date (MM/YY)"
                className="input-field w-60 ml-10 h-10 bg-gray-50 border border-gray-30 rounded-sm p-2.5"
                pattern="\d{2}/\d{2}"
                maxLength="5"
              />
              
              </div>
             
              <input
                type="text"
                name="cvv"
                value={payment.cvv}
                onChange={handleChangePayment}
                placeholder="CVV"
                className="input-field w-16 h-10 bg-gray-50 border border-gray-30  rounded-sm p-3"
                pattern="\d{3}"
                maxLength="3"
              />
            </div>
            <div className="float-right">
            <p className="text-sm font-semibold pb-2 pt-8">Total : MRP. {event.ticketPrice}</p>
            <Link to={'/'}>
              <button type="button" 
                onClick = {createTicket}
                className="primary">
                Make Payment</button>
              </Link>
            </div>
            
          </div>
      </div>
      <div className="float-right bg-blue-100 w-1/4 p-5 mt-8 mr-12">
          <h2 className="text-xl font-bold mb-8">Order Summary</h2>
          <div className="space-y-1">
            
            <div>
               <p className="float-right">1 Ticket</p>
            </div>
            <p className="text-lg font-semibold">{event.title}</p>
            <p className="text-xs">{event.eventDate.split("T")[0]},</p>
            <p className="text-xs pb-2"> {event.eventTime}</p>
            <hr className=" my-2 border-t pt-2 border-gray-400" />
            <p className="float-right font-bold">MRP. {event.ticketPrice}</p>
            <p className="font-bold">Sub total: MRP. {event.ticketPrice}</p>
          </div>
          
        </div>
      </>
    );
}
