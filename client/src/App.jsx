/* eslint-disable no-unused-vars */
import { Route, Routes } from "react-router-dom";
import "./App.css";
import IndexPage from "./pages/IndexPage";
import RegisterPage from "./pages/RegisterPage";
import Layout from "./Layout";
import LoginPage from "./pages/LoginPage";
import axios from "axios";
import { UserContextProvider } from "./UserContext";
import { ThemeContextProvider } from "./ThemeContext";
import UserAccountPage from "./pages/UserAccountPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AddEvent from "./pages/AddEvent";
import EditEvent from "./pages/EditEvent";
import EventPage from "./pages/EventPage";
import CalendarView from "./pages/CalendarView";
import OrderSummary from "./pages/OrderSummary";
import PaymentSummary from "./pages/PaymentSummary";
import TicketPage from "./pages/TicketPage";
import Feedback from "./pages/Feedback";
import Help from "./pages/Help";
import PrivacyPolicy from "./pages/PrivacyPolicy";

// import CreatEvent from './pages/CreateEvent'

axios.defaults.baseURL = "http://localhost:4000/";
axios.defaults.withCredentials = true;

function App() {
  return (
    <ThemeContextProvider>
      <UserContextProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<IndexPage />} />
            <Route path="/useraccount" element={<UserAccountPage />} />
            <Route path="/createEvent" element={<AddEvent />} />
            <Route path="/edit-event/:id" element={<EditEvent />} />
            <Route path="/event/:id" element={<EventPage />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/wallet" element={<TicketPage />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/help" element={<Help />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />

            <Route path="/event/:id/ordersummary" element={<OrderSummary />} />
          </Route>

          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route
            path="/event/:id/ordersummary/paymentsummary"
            element={<PaymentSummary />}
          />
        </Routes>
      </UserContextProvider>
    </ThemeContextProvider>
  );
}

export default App;
