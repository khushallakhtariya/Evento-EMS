// import React from 'react'
import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  async function handleForgotPassword(ev) {
    ev.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    try {
      setIsLoading(true);
      // Note: This API endpoint needs to be implemented on the backend
      await axios.post("/forgot-password", { email });
      setEmailSent(true);
      toast.success(
        "If this email exists in our system, you will receive reset instructions shortly"
      );
    } catch (error) {
      // For security reasons, don't reveal if the email exists or not
      toast.info(
        "If this email exists in our system, you will receive reset instructions shortly"
      );
      setEmailSent(true);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex w-full h-full px-10 py-10 justify-center place-items-center mt-20">
      <ToastContainer />
      <div className="bg-white w-full sm:w-full md:w-1/2 lg:w-1/3 px-7 py-7 rounded-xl shadow-lg">
        {!emailSent ? (
          <form
            className="flex flex-col w-auto items-center"
            onSubmit={handleForgotPassword}
          >
            <h1 className="px-3 font-extrabold mb-5 text-primarydark text-2xl">
              Forgot Password
            </h1>
            <p className="text-gray-600 mb-4 text-center">
              Enter your email address and we'll send you instructions to reset
              your password.
            </p>

            <div className="input w-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M17.834 6.166a8.25 8.25 0 100 11.668.75.75 0 011.06 1.06c-3.807 3.808-9.98 3.808-13.788 0-3.808-3.807-3.808-9.98 0-13.788 3.807-3.808 9.98-3.808 13.788 0A9.722 9.722 0 0121.75 12c0 .975-.296 1.887-.809 2.571-.514.685-1.28 1.179-2.191 1.179-.904 0-1.666-.487-2.18-1.164a5.25 5.25 0 11-.82-6.26V8.25a.75.75 0 011.5 0V12c0 .682.208 1.27.509 1.671.3.401.659.579.991.579.332 0 .69-.178.991-.579.3-.4.509-.99.509-1.671a8.222 8.222 0 00-2.416-5.834zM15.75 12a3.75 3.75 0 10-7.5 0 3.75 3.75 0 007.5 0z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="email"
                placeholder="Email"
                className="input-et"
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                required
              />
            </div>
            <div className="w-full py-4">
              <button
                type="submit"
                className="primary w-full flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                    Sending...
                  </div>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
            <Link
              to={"/login"}
              className="flex gap-2 items-center text-primary py-2 px-4 bg-primarylight cursor-pointer ring-1 ring-primarylight rounded  hover:bg-primarydark hover:shadow-lg duration-75 hover:ring-primarydark hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z"
                  clipRule="evenodd"
                />
              </svg>
              <button type="button"> Back </button>
            </Link>
          </form>
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="px-3 font-extrabold mb-5 text-primarydark text-2xl">
              Check Your Email
            </h1>
            <div className="text-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-16 h-16 text-primary mx-auto mb-4"
              >
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
              <p className="text-gray-600 mb-4">
                We've sent instructions to reset your password to:
              </p>
              <p className="font-semibold text-primarydark mb-4">{email}</p>
              <p className="text-gray-600">
                Please check your inbox and follow the instructions to reset
                your password.
              </p>
            </div>
            <Link
              to={"/login"}
              className="flex gap-2 items-center text-primary py-2 px-4 bg-primarylight cursor-pointer ring-1 ring-primarylight rounded hover:bg-primarydark hover:shadow-lg duration-75 hover:ring-primarydark hover:text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path
                  fillRule="evenodd"
                  d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z"
                  clipRule="evenodd"
                />
              </svg>
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
