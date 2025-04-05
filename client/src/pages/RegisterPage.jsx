/* eslint-disable no-empty */
import { Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [redirect, setRedirect] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Add the no-scroll class to the body when component mounts
    document.body.classList.add("no-scroll");

    // Remove the class when component unmounts
    return () => {
      document.body.classList.remove("no-scroll");
    };
  }, []);

  // Add style to hide scrollbar
  const noScrollStyle = document.createElement("style");
  noScrollStyle.textContent = `
    .no-scroll {
      overflow: hidden !important;
    }
    .register-container {
      overflow: hidden !important;
      height: 100vh;
    }
  `;
  document.head.appendChild(noScrollStyle);

  async function registerUser(ev) {
    ev.preventDefault();

    // Form validation
    if (!name || !email || !password || !confirmPassword) {
      toast.error("All fields are required");
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
      setLoading(true);
      await axios.post("/register", {
        name,
        email,
        password,
      });

      toast.success("Registration Successful!");
      setTimeout(() => {
        setRedirect(true);
      }, 2000);
    } catch (e) {
      const errorMsg = e.response?.data?.message || "Registration failed";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  if (redirect) {
    return <Navigate to={"/login"} />;
  }

  return (
    <div className="flex w-full min-h-screen lg:-ml-24 px-6 py-10 justify-between place-items-center register-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <div className="hidden lg:flex flex-col right-box">
        <div className="flex flex-col gap-3">
          <div className="text-3xl font-black text-primarydark">Welcome to</div>
          <div>
            <img src="../src/assets/logo.png" alt="" className="w-48" />
          </div>
        </div>

        <div className="ml-48 w-80 mt-6">
          <img src="../src/assets/signuppic.svg" alt="" className="w-full" />
        </div>
      </div>

      <div className="bg-white w-full sm:w-full md:w-1/2 lg:w-1/3 px-7 py-8 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
        <form
          className="flex flex-col w-auto items-center"
          onSubmit={registerUser}
        >
          <h1 className="px-3 font-extrabold mb-6 text-primarydark text-2xl">
            Sign Up
          </h1>

          <div className="input mb-4 transition-all duration-300 hover:ring-1 hover:ring-primary focus-within:ring-2 focus-within:ring-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-primary"
            >
              <path
                fillRule="evenodd"
                d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="text"
              placeholder="Name"
              className="input-et"
              value={name}
              onChange={(ev) => setName(ev.target.value)}
            />
          </div>

          <div className="input mb-4 transition-all duration-300 hover:ring-1 hover:ring-primary focus-within:ring-2 focus-within:ring-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-primary"
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
            />
          </div>

          <div className="input mb-4 transition-all duration-300 hover:ring-1 hover:ring-primary focus-within:ring-2 focus-within:ring-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-primary"
            >
              <path
                fillRule="evenodd"
                d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1015.75 1.5zm0 3a.75.75 0 000 1.5A2.25 2.25 0 0118 8.25a.75.75 0 001.5 0 3.75 3.75 0 00-3.75-3.75z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="password"
              placeholder="Password"
              className="input-et"
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
            />
          </div>

          <div className="input mb-5 transition-all duration-300 hover:ring-1 hover:ring-primary focus-within:ring-2 focus-within:ring-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 text-primary"
            >
              <path
                fillRule="evenodd"
                d="M15.75 1.5a6.75 6.75 0 00-6.651 7.906c.067.39-.032.717-.221.906l-6.5 6.499a3 3 0 00-.878 2.121v2.818c0 .414.336.75.75.75H6a.75.75 0 00.75-.75v-1.5h1.5A.75.75 0 009 19.5V18h1.5a.75.75 0 00.53-.22l2.658-2.658c.19-.189.517-.288.906-.22A6.75 6.75 0 1015.75 1.5zm0 3a.75.75 0 000 1.5A2.25 2.25 0 0118 8.25a.75.75 0 001.5 0 3.75 3.75 0 00-3.75-3.75z"
                clipRule="evenodd"
              />
            </svg>
            <input
              type="password"
              placeholder="Confirm password"
              className="input-et"
              value={confirmPassword}
              onChange={(ev) => setConfirmPassword(ev.target.value)}
            />
          </div>

          <div className="w-full py-3">
            <button
              type="submit"
              className="primary w-full flex justify-center items-center"
              disabled={loading}
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
              ) : null}
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </div>

          <div className="container2 bg-gray-100 p-1 rounded-lg shadow-sm my-5">
            <div className="w-full h-full p-1">
              <Link to={"/login"}>
                <button
                  type="button"
                  className="text-black cursor-pointer rounded w-full h-full font-bold transition-colors hover:text-primarydark"
                >
                  {" "}
                  Sign In
                </button>
              </Link>
            </div>
            <div className="w-full h-full p-1">
              <Link to={"/register"}>
                <button
                  type="button"
                  className="text-white cursor-pointer rounded w-full h-full bg-primary font-bold transition-transform hover:scale-105"
                >
                  {" "}
                  Sign Up
                </button>
              </Link>
            </div>
          </div>

          <Link to={"/"} className="mt-3">
            <button className="secondary transition-transform hover:scale-105">
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
              Back
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}
