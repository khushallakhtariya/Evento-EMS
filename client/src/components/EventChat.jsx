import React, { useState, useRef, useEffect, useContext } from "react";
import {
  IoSend,
  IoAttach,
  IoCalendar,
  IoPeople,
  IoLocation,
  IoTime,
  IoDocumentText,
  IoCash,
  IoRestaurant,
  IoWifi,
} from "react-icons/io5";
import { BsRobot, BsCheck2All, BsTicket, BsSpeaker } from "react-icons/bs";
import { FaUser, FaRegCalendarCheck, FaRegFileAlt } from "react-icons/fa";
import { format } from "date-fns";
import { ThemeContext } from "../ThemeContext";

const EventChat = () => {
  const { darkMode } = useContext(ThemeContext);
  const [messages, setMessages] = useState([
    {
      text: "Welcome to the Event Management Assistant! I can help you with event planning, scheduling, and management. How can I assist you today?",
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // const scrollToBottom = () => {
  //   messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  // };

  // useEffect(() => {
  //   // Scroll to top on initial load
  //   window.scrollTo(0, 0);
  //   // Scroll to bottom for new messages
  //   scrollToBottom();
  // }, [messages]);

  const analyzeImage = async (imageUrl) => {
    // Simulate image analysis (in a real app, you would use an AI service like Google Cloud Vision)
    setIsTyping(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Sample responses based on image content
    const possibleResponses = [
      "I can see your image. Could you please provide more details about what you'd like to know?",
      "I've received your image. What specific information would you like about it?",
      "I can see the image you've shared. How can I help you with it?",
      "I've analyzed your image. What would you like to know about it?",
      "I can see the image you've sent. What would you like me to help you with?",
    ];

    const randomResponse =
      possibleResponses[Math.floor(Math.random() * possibleResponses.length)];

    return {
      text: randomResponse,
      sender: "bot",
      timestamp: new Date(),
      type: "text",
    };
  };

  const generateBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    const currentEvent = messages[1]?.event;

    // Greetings and Casual Conversation
    if (
      lowerMessage.includes("hi") ||
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hey") ||
      lowerMessage.includes("hyy")
    ) {
      return "Hello there! 👋 How are you doing today?";
    } else if (lowerMessage.includes("good morning")) {
      return "Good morning! 🌅 Hope you're having a great start to your day!";
    } else if (lowerMessage.includes("good afternoon")) {
      return "Good afternoon! ☀️ How's your day going?";
    } else if (lowerMessage.includes("good evening")) {
      return "Good evening! 🌙 Hope you had a wonderful day!";
    } else if (lowerMessage.includes("good night")) {
      return "Good night! 🌙 Sweet dreams!";
    } else if (lowerMessage.includes("how are you")) {
      return "I'm doing great, thanks for asking! 😊 How can I help you today?";
    } else if (
      lowerMessage.includes("what's up") ||
      lowerMessage.includes("whats up")
    ) {
      return "Not much! Just here to help you with anything you need. What's on your mind? 😊";
    } else if (
      lowerMessage.includes("fine") ||
      lowerMessage.includes("good") ||
      lowerMessage.includes("great")
    ) {
      return "That's wonderful to hear! 😊 What can I do for you today?";
    } else if (
      lowerMessage.includes("not good") ||
      lowerMessage.includes("bad")
    ) {
      return "I'm sorry to hear that. 😔 Is there anything I can do to help make your day better?";
    }

    // Event Details
    else if (lowerMessage.includes("date") || lowerMessage.includes("when")) {
      return `The event is scheduled for ${format(
        new Date(currentEvent?.date || "2024-06-15"),
        "MMMM d, yyyy"
      )} from ${currentEvent?.startTime || "09:00 AM"} to ${
        currentEvent?.endTime || "05:00 PM"
      }. Would you like to know more about the schedule?`;
    } else if (
      lowerMessage.includes("location") ||
      lowerMessage.includes("where")
    ) {
      return `The event will be held at ${
        currentEvent?.location || "Grand Convention Center"
      }. Would you like directions, parking information, or venue details?`;
    } else if (
      lowerMessage.includes("attendee") ||
      lowerMessage.includes("people") ||
      lowerMessage.includes("capacity")
    ) {
      return `We're expecting ${
        currentEvent?.attendees || 150
      } attendees. The venue can accommodate up to 200 people. Would you like to manage attendee registrations?`;
    }

    // Event Management
    else if (
      lowerMessage.includes("schedule") ||
      lowerMessage.includes("agenda")
    ) {
      return `Here's the detailed event schedule:
      - 08:30 AM: Registration Opens
      - 09:00 AM: Welcome Address
      - 10:00 AM: Keynote by ${currentEvent?.speakers?.[0] || "John Doe"}
      - 11:00 AM: Breakout Session 1
      - 12:00 PM: Lunch Break (Catering provided)
      - 01:30 PM: Panel Discussion
      - 03:00 PM: Breakout Session 2
      - 04:30 PM: Closing Remarks
      - 05:00 PM: Networking Session`;
    } else if (
      lowerMessage.includes("speaker") ||
      lowerMessage.includes("presenter")
    ) {
      return `Our confirmed speakers are:
      - ${currentEvent?.speakers?.[0] || "John Doe"} (Keynote)
      - ${currentEvent?.speakers?.[1] || "Jane Smith"} (Panel Discussion)
      - ${currentEvent?.speakers?.[2] || "Mike Johnson"} (Breakout Session)
      Would you like to see their bios or presentation topics?`;
    } else if (
      lowerMessage.includes("budget") ||
      lowerMessage.includes("cost")
    ) {
      return `The total event budget is ${
        currentEvent?.budget || "$50,000"
      }. This includes:
      - Venue rental
      - Catering services
      - Audio-visual equipment
      - Marketing materials
      - Staffing
      Would you like a detailed budget breakdown?`;
    }

    // Event Services
    else if (
      lowerMessage.includes("food") ||
      lowerMessage.includes("catering")
    ) {
      return `${
        currentEvent?.catering || "Lunch and snacks provided"
      }. The menu includes:
      - Morning coffee and pastries
      - Buffet lunch with vegetarian options
      - Afternoon snacks
      - Beverage station
      Would you like to see the full menu or discuss dietary restrictions?`;
    } else if (
      lowerMessage.includes("wifi") ||
      lowerMessage.includes("internet")
    ) {
      return `${
        currentEvent?.wifi || "Available throughout venue"
      }. The network details are:
      - Network: Event_Conference
      - Password: Event2024
      - Speed: 100Mbps
      Would you like technical support information?`;
    }

    // Event Operations
    else if (
      lowerMessage.includes("register") ||
      lowerMessage.includes("sign up")
    ) {
      return `You can register through:
      1. Online portal: www.events.com/conference2024
      2. Email: registration@events.com
      3. Phone: (555) 123-4567
      Early bird registration ends in 2 weeks!`;
    } else if (
      lowerMessage.includes("ticket") ||
      lowerMessage.includes("price")
    ) {
      return `Ticket prices:
      - Early Bird: $299 (until May 15)
      - Regular: $399
      - Group (5+): $349 each
      - Student: $199 (with valid ID)
      Would you like to purchase tickets or see payment options?`;
    } else if (
      lowerMessage.includes("help") ||
      lowerMessage.includes("support")
    ) {
      return `I can help you with:
      - Event registration and ticketing
      - Venue and logistics
      - Speaker information
      - Schedule and agenda
      - Catering and services
      - Technical support
      - Budget and payments
      What specific assistance do you need?`;
    } else if (
      lowerMessage.includes("thank") ||
      lowerMessage.includes("thanks")
    ) {
      return `You're welcome! Is there anything else I can help you with? 😊`;
    } else if (
      lowerMessage.includes("bye") ||
      lowerMessage.includes("goodbye")
    ) {
      return "Goodbye! Have a great day! 👋 Come back if you need any help!";
    } else {
      return `I understand you're asking about "${userMessage}". As your Event Management Assistant, I can help you with:
      - Event registration and ticketing
      - Venue and logistics
      - Speaker information
      - Schedule and agenda
      - Catering and services
      - Technical support
      - Budget and payments
      What specific aspect of the event would you like to know more about?`;
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      // Add user message
      const userMessage = {
        text: newMessage,
        sender: "user",
        timestamp: new Date(),
        type: "text",
        status: "sent",
      };

      setMessages((prev) => [...prev, userMessage]);
      setNewMessage("");
      setIsTyping(true);

      // Simulate bot typing
      setTimeout(() => {
        const botResponse = {
          text: generateBotResponse(newMessage),
          sender: "bot",
          timestamp: new Date(),
          type: "text",
        };
        setMessages((prev) => [...prev, botResponse]);
        setIsTyping(false);
      }, 1000);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Create a preview of the file
      const reader = new FileReader();
      reader.onloadend = async () => {
        const fileMessage = {
          text: file.name,
          sender: "user",
          timestamp: new Date(),
          type: "file",
          fileUrl: reader.result,
          fileType: file.type,
        };
        setMessages((prev) => [...prev, fileMessage]);

        // If it's an image, analyze it
        if (file.type.startsWith("image/")) {
          setIsTyping(true);
          const botResponse = await analyzeImage(reader.result);
          setMessages((prev) => [...prev, botResponse]);
          setIsTyping(false);
        }

        setSelectedFile(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current.click();
  };

  const EventInfoCard = ({ event, darkMode }) => (
    <div
      className={`${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"
      } rounded-xl shadow-lg p-6 space-y-4 border`}
    >
      <div className="flex items-center space-x-3 text-blue-600">
        <IoCalendar className="w-6 h-6" />
        <span
          className={`font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          {format(new Date(event.date), "MMMM d, yyyy")}
        </span>
      </div>
      <div className="flex items-center space-x-3 text-green-600">
        <IoLocation className="w-6 h-6" />
        <span
          className={`font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          {event.location}
        </span>
      </div>
      <div className="flex items-center space-x-3 text-purple-600">
        <IoPeople className="w-6 h-6" />
        <span
          className={`font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          {event.attendees} attendees
        </span>
      </div>
      <div className="flex items-center space-x-3 text-orange-600">
        <IoTime className="w-6 h-6" />
        <span
          className={`font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          {event.startTime} - {event.endTime}
        </span>
      </div>
      <div className="flex items-center space-x-3 text-red-600">
        <IoCash className="w-6 h-6" />
        <span
          className={`font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          Budget: {event.budget}
        </span>
      </div>
      <div className="flex items-center space-x-3 text-indigo-600">
        <BsSpeaker className="w-6 h-6" />
        <span
          className={`font-semibold ${
            darkMode ? "text-gray-100" : "text-gray-800"
          }`}
        >
          {event.speakers.length} Speakers
        </span>
      </div>
    </div>
  );

  const FileMessage = ({ message, darkMode }) => {
    const isImage = message.fileType.startsWith("image/");

    return (
      <div className={`max-w-xs ${isImage ? "w-full" : ""}`}>
        {isImage ? (
          <div className="relative group">
            <img
              src={message.fileUrl}
              alt={message.text}
              className="rounded-lg shadow-md w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 rounded-lg flex items-center justify-center">
              <button
                onClick={() => window.open(message.fileUrl, "_blank")}
                className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 bg-white/80 text-gray-800 p-2 rounded-full shadow-lg"
              >
                <IoDocumentText className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`${
              darkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            } p-3 rounded-lg shadow-md border`}
          >
            <div className="flex items-center space-x-2">
              <FaRegFileAlt
                className={`${darkMode ? "text-blue-400" : "text-blue-500"}`}
              />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-100" : "text-gray-700"
                }`}
              >
                {message.text}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col h-screen ${
        darkMode
          ? "bg-gradient-to-br from-gray-900 to-gray-800 text-white"
          : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-800"
      }`}
    >
      {/* Header */}
      <div
        className={`${
          darkMode
            ? "bg-gray-800/90 backdrop-blur-sm"
            : "bg-white/90 backdrop-blur-sm"
        } shadow-lg sticky top-0 z-10`}
      >
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center space-x-4">
            <div
              className={`w-12 h-12 rounded-full ${
                darkMode
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                  : "bg-gradient-to-br from-blue-500 to-indigo-500"
              } flex items-center justify-center shadow-lg transform hover:scale-105 transition-all duration-300`}
            >
              <BsRobot className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  darkMode
                    ? "text-white"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                }`}
              >
                Event Management Assistant
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                Your AI-powered event planning helper
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 scroll-smooth">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              } items-start space-x-3 min-h-[3.5rem] animate-fade-in`}
            >
              {message.sender === "bot" && (
                <div
                  className={`w-10 h-10 rounded-full ${
                    darkMode
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                      : "bg-gradient-to-br from-blue-500 to-indigo-500"
                  } flex items-center justify-center shadow-lg flex-shrink-0 transform hover:scale-105 transition-all duration-300`}
                >
                  <BsRobot className="w-6 h-6 text-white" />
                </div>
              )}
              <div
                className={`flex flex-col ${
                  message.sender === "user" ? "items-end" : "items-start"
                } max-w-[70%]`}
              >
                {message.type === "event-info" ? (
                  <EventInfoCard event={message.event} darkMode={darkMode} />
                ) : message.type === "file" ? (
                  <FileMessage message={message} darkMode={darkMode} />
                ) : (
                  <div
                    className={`px-5 py-3 rounded-2xl break-words whitespace-pre-wrap shadow-lg transform transition-all duration-300 hover:shadow-xl ${
                      message.sender === "user"
                        ? `${
                            darkMode
                              ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                              : "bg-gradient-to-br from-blue-600 to-indigo-600"
                          } text-white rounded-tr-none`
                        : `${darkMode ? "bg-gray-800" : "bg-white"} ${
                            darkMode ? "text-gray-100" : "text-gray-800"
                          } rounded-tl-none border ${
                            darkMode ? "border-gray-700" : "border-gray-100"
                          }`
                    }`}
                  >
                    {message.text}
                  </div>
                )}
                <span
                  className={`text-xs ${
                    darkMode ? "text-gray-300" : "text-gray-500"
                  } mt-1 px-2 ${
                    message.sender === "user" ? "text-right" : "text-left"
                  }`}
                >
                  {format(message.timestamp, "h:mm a")}
                  {message.status === "sent" && (
                    <BsCheck2All
                      className={`inline-block ml-1 ${
                        darkMode ? "text-blue-400" : "text-blue-500"
                      }`}
                    />
                  )}
                </span>
              </div>
              {message.sender === "user" && (
                <div
                  className={`w-10 h-10 rounded-full ${
                    darkMode
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                      : "bg-gradient-to-br from-blue-500 to-indigo-500"
                  } flex items-center justify-center shadow-lg flex-shrink-0 transform hover:scale-105 transition-all duration-300`}
                >
                  <FaUser className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div className="flex items-start space-x-3 min-h-[3.5rem] animate-fade-in">
              <div
                className={`w-10 h-10 rounded-full ${
                  darkMode
                    ? "bg-gradient-to-br from-blue-600 to-indigo-600"
                    : "bg-gradient-to-br from-blue-500 to-indigo-500"
                } flex items-center justify-center shadow-lg flex-shrink-0`}
              >
                <BsRobot className="w-6 h-6 text-white" />
              </div>
              <div
                className={`${darkMode ? "bg-gray-800" : "bg-white"} ${
                  darkMode ? "text-gray-100" : "text-gray-800"
                } rounded-2xl rounded-tl-none shadow-lg border ${
                  darkMode ? "border-gray-700" : "border-gray-100"
                } px-5 py-3`}
              >
                <div className="flex space-x-2">
                  <div
                    className={`w-2 h-2 ${
                      darkMode ? "bg-blue-400" : "bg-blue-500"
                    } rounded-full animate-bounce`}
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className={`w-2 h-2 ${
                      darkMode ? "bg-blue-400" : "bg-blue-500"
                    } rounded-full animate-bounce`}
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className={`w-2 h-2 ${
                      darkMode ? "bg-blue-400" : "bg-blue-500"
                    } rounded-full animate-bounce`}
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div
        className={`${
          darkMode
            ? "bg-gray-800/90 backdrop-blur-sm"
            : "bg-white/90 backdrop-blur-sm"
        } border-t p-4 sticky bottom-0 z-10`}
      >
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div
            className={`flex items-center space-x-3 ${
              darkMode
                ? "bg-gray-700/50 border-gray-600"
                : "bg-white/50 border-gray-200"
            } rounded-full px-4 py-2 shadow-lg border backdrop-blur-sm hover:shadow-xl transition-all duration-300`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,.pdf,.doc,.docx"
            />
            <button
              type="button"
              onClick={handleAttachmentClick}
              className={`${
                darkMode
                  ? "text-gray-300 hover:text-blue-400 hover:bg-gray-600/50"
                  : "text-gray-500 hover:text-blue-600 hover:bg-blue-50"
              } transition-all duration-300 p-2 rounded-full flex-shrink-0 transform hover:scale-110`}
            >
              <IoAttach className="w-6 h-6" />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ask me anything about the event..."
              className={`flex-1 bg-transparent border-none focus:outline-none focus:ring-0 ${
                darkMode
                  ? "text-white placeholder-gray-400"
                  : "text-gray-700 placeholder-gray-400"
              } text-base min-w-0`}
            />
            <button
              type="submit"
              className={`${
                darkMode
                  ? "bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  : "bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              } text-white p-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105`}
            >
              <IoSend className="w-6 h-6" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventChat;
