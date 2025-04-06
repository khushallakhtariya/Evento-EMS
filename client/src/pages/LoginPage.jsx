import { useContext, useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../UserContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [redirect, setRedirect] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { setUser } = useContext(UserContext);

  //! Fetch users from the server --------------------------------------------------------------
  useEffect(() => {
    const storedEmail = localStorage.getItem("rememberedEmail");
    const storedPass = localStorage.getItem("rememberedpass");
    if (storedEmail) {
      setEmail(storedEmail);
      setPassword(storedPass);
      setRememberMe(true);
    }
  }, []);

  async function loginUser(ev) {
    ev.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data } = await axios.post("/login", { email, password });
      setUser(data);
      toast.success("Login successful! Redirecting...", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
      });
      localStorage.setItem("user", JSON.stringify(data));
      if (rememberMe) {
        // If the user checked, store their email in localStorage.
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedpass", password);
      } else {
        // If the user didnt checked, remove their email from localStorage.
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedpass");
      }

      // Introduce a delay before redirecting
      setTimeout(() => {
        setRedirect(true);
      }, 2000); // 2000 milliseconds = 2 seconds delay
    } catch (e) {
      toast.error(
        e.response?.data?.message ||
          "Login failed. Please check your credentials.",
        {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        }
      );
    } finally {
      setIsLoading(false);
    }
  }

  if (redirect) {
    return <Navigate to={"/"} />;
  }

  return (
    <>
      <ToastContainer />
      <div className="flex w-full h-screen lg:ml-24 px-10 py-10 justify-between place-items-center dark:bg-gray-900">
        <div className="bg-white w-full sm:w-full md:w-1/2 lg:w-1/3 px-8 py-8 rounded-xl shadow-lg dark:bg-gray-800 dark:text-white">
          <form
            className="flex flex-col w-auto items-center"
            onSubmit={loginUser}
          >
            <h1 className="px-3 font-extrabold mb-6 text-primarydark text-3xl dark:text-white">
              Sign In
            </h1>

            <div className="input mb-4">
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

            <div className="input mb-4">
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
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="input-et"
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                required
              />
              <button
                type="button"
                className="text-primary hover:text-primarydark transition-colors"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                    <path
                      fillRule="evenodd"
                      d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path d="M3.53 2.47a.75.75 0 00-1.06 1.06l18 18a.75.75 0 101.06-1.06l-18-18zM22.676 12.553a11.249 11.249 0 01-2.631 4.31l-3.099-3.099a5.25 5.25 0 00-6.71-6.71L7.759 4.577a11.217 11.217 0 014.242-.827c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113z" />
                    <path d="M15.75 12c0 .18-.013.357-.037.53l-4.244-4.243A3.75 3.75 0 0115.75 12zM12.53 15.713l-4.243-4.244a3.75 3.75 0 004.243 4.243z" />
                    <path d="M6.75 12c0-.619.107-1.213.304-1.764l-3.1-3.1a11.25 11.25 0 00-2.63 4.31c-.12.362-.12.752 0 1.114 1.489 4.467 5.704 7.69 10.675 7.69 1.5 0 2.933-.294 4.242-.827l-2.477-2.477A5.25 5.25 0 016.75 12z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex w-full h-full mt-2 mb-6 justify-between px-1">
              <div className="flex gap-2 items-center text-gray-700 hover:text-primary transition-colors dark:text-gray-300">
                <input
                  type="checkbox"
                  id="rememberMe"
                  className="w-4 h-4 accent-primary cursor-pointer"
                  checked={rememberMe}
                  onChange={() => setRememberMe((prev) => !prev)}
                />
                <label htmlFor="rememberMe" className="cursor-pointer">
                  Remember Me
                </label>
              </div>
              <div>
                <Link
                  to={"/forgotpassword"}
                  className="text-primary hover:text-primarydark hover:underline transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              className="primary w-full py-3 flex justify-center items-center"
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
                  Signing in...
                </div>
              ) : (
                "Sign in"
              )}
            </button>

            <div className="container2 mt-6 mb-6 overflow-hidden flex rounded-lg border border-gray-200 shadow-sm dark:border-gray-700 dark:bg-gray-800">
              <div className="w-full h-full p-1">
                <Link to={"/login"}>
                  <button
                    type="button"
                    className="transition-all w-full h-full py-2 rounded bg-primary text-white font-bold shadow-md hover:shadow-lg hover:bg-primarydark dark:bg-primary dark:text-white dark:hover:opacity-90"
                  >
                    Sign In
                  </button>
                </Link>
              </div>
              <div className="w-full h-full p-1">
                <Link to={"/register"}>
                  <button
                    type="button"
                    className="transition-all w-full h-full py-2 rounded font-bold bg-gray-100 hover:bg-gray-200 text-gray-800 hover:text-primary shadow-md hover:shadow-lg dark:bg-gray-700 dark:text-gray-200 dark:hover:text-primary dark:hover:bg-gray-600"
                  >
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>

            <Link to={"/"} className="mt-2">
              <button
                type="button"
                className="secondary dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
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
                Back
              </button>
            </Link>
          </form>
        </div>

        <div className="hidden lg:flex flex-col right-box">
          <div className="flex flex-col -ml-96 gap-3">
            <div className="text-3xl font-black text-primarydark">
              Welcome to
            </div>
            <div>
              <img src="../src/assets/logo.png" alt="" className="w-48" />
            </div>
          </div>

          <div className="-ml-48 w-80 mt-12">
            <img src="../src/assets/signinpic.svg" alt="" className="w-full" />
          </div>
        </div>
      </div>
    </>
  );
}
