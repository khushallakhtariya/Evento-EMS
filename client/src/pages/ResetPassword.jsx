// import React from 'react'
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Extract token from URL query params
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get("token");

    if (!tokenFromUrl) {
      setTokenError(true);
      toast.error("Invalid or missing reset token");
    } else {
      setToken(tokenFromUrl);
    }
  }, [location]);

  async function handleResetPassword(ev) {
    ev.preventDefault();

    // Form validation
    if (!password || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.warning("Password should be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      await axios.post("/reset-password", {
        token,
        newPassword: password,
      });

      setResetSuccess(true);
      toast.success("Password reset successful");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Failed to reset password";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }

  if (tokenError) {
    return (
      <div className="flex w-full h-full px-10 py-10 justify-center place-items-center mt-20">
        <ToastContainer />
        <div className="bg-white w-full sm:w-full md:w-1/2 lg:w-1/3 px-7 py-7 rounded-xl shadow-lg">
          <div className="flex flex-col items-center">
            <h1 className="px-3 font-extrabold mb-5 text-primarydark text-2xl">
              Invalid Request
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              The password reset link is invalid or has expired.
            </p>
            <Link
              to={"/forgotpassword"}
              className="primary w-1/2 py-2 text-center"
            >
              Request New Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full h-full px-10 py-10 justify-center place-items-center mt-20">
      <ToastContainer />
      <div className="bg-white w-full sm:w-full md:w-1/2 lg:w-1/3 px-7 py-7 rounded-xl shadow-lg">
        {!resetSuccess ? (
          <form
            className="flex flex-col w-auto items-center"
            onSubmit={handleResetPassword}
          >
            <h1 className="px-3 font-extrabold mb-5 text-primarydark text-2xl">
              Reset Password
            </h1>
            <p className="text-gray-600 mb-4 text-center">
              Enter your new password below.
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
                  d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1015.75 1.5zm0 3a.75.75 0 000 1.5A2.25 2.25 0 0118 8.25a.75.75 0 001.5 0 3.75 3.75 0 00-3.75-3.75z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="password"
                placeholder="New Password"
                className="input-et"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
              />
            </div>

            <div className="input w-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-6 h-6 text-primary"
              >
                <path
                  fillRule="evenodd"
                  d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1015.75 1.5zm0 3a.75.75 0 000 1.5A2.25 2.25 0 0118 8.25a.75.75 0 001.5 0 3.75 3.75 0 00-3.75-3.75z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                type="password"
                placeholder="Confirm Password"
                className="input-et"
                value={confirmPassword}
                onChange={(ev) => setConfirmPassword(ev.target.value)}
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
                    Resetting...
                  </div>
                ) : (
                  "Reset Password"
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
              <button type="button">Back to Login</button>
            </Link>
          </form>
        ) : (
          <div className="flex flex-col items-center">
            <h1 className="px-3 font-extrabold mb-5 text-primarydark text-2xl">
              Success!
            </h1>
            <div className="text-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-16 h-16 text-green-500 mx-auto mb-4"
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                  clipRule="evenodd"
                />
              </svg>
              <p className="text-gray-600 mb-4">
                Your password has been reset successfully!
              </p>
              <p className="text-gray-600">
                You will be redirected to the login page shortly...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
