const express = require("express");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const UserModel = require("./models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const Ticket = require("./models/Ticket");
const Feedback = require("./models/Feedback");

const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = "bsbsfbrnsftentwnnwnwn";

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

mongoose.connect(process.env.MONGO_URL);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get("/test", (req, res) => {
  res.json("test ok");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userDoc = await UserModel.create({
      name,
      email,
      password: bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const userDoc = await UserModel.findOne({ email });

  if (!userDoc) {
    return res.status(404).json({ error: "User not found" });
  }

  const passOk = bcrypt.compareSync(password, userDoc.password);
  if (!passOk) {
    return res.status(401).json({ error: "Invalid password" });
  }

  jwt.sign(
    {
      email: userDoc.email,
      id: userDoc._id,
    },
    jwtSecret,
    {},
    (err, token) => {
      if (err) {
        return res.status(500).json({ error: "Failed to generate token" });
      }
      res.cookie("token", token).json(userDoc);
    }
  );
});

// Forgot password endpoint
app.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Check if user exists
    const userDoc = await UserModel.findOne({ email });
    if (!userDoc) {
      // For security reasons, don't reveal if the email exists or not
      return res.status(200).json({
        message: "If this email exists, you will receive reset instructions",
      });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // Update user with reset token
    userDoc.resetToken = resetToken;
    userDoc.resetTokenExpiry = resetTokenExpiry;
    await userDoc.save();

    // Construct reset URL
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/resetpassword?token=${resetToken}`;

    // Send email with the reset URL - this is commented out as it requires email setup
    /* 
    // This requires nodemailer or similar package to be installed and configured
    const emailContent = `
      <h1>Password Reset</h1>
      <p>You requested a password reset for your EventoEMS account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetUrl}" target="_blank">Reset Password</a>
      <p>This link is valid for 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    // Code to send email would go here
    */

    // Log the reset URL for development purposes only
    console.log("Password reset link:", resetUrl);

    // Send a success response
    return res
      .status(200)
      .json({ message: "Password reset instructions sent to your email" });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res
      .status(500)
      .json({ error: "Failed to process password reset request" });
  }
});

// Reset password endpoint
app.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Find user with the given reset token that hasn't expired
    const userDoc = await UserModel.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!userDoc) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    // Update the user's password
    userDoc.password = bcrypt.hashSync(newPassword, bcryptSalt);

    // Clear the reset token fields
    userDoc.resetToken = undefined;
    userDoc.resetTokenExpiry = undefined;

    await userDoc.save();

    return res
      .status(200)
      .json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ error: "Failed to reset password" });
  }
});

app.get("/profile", (req, res) => {
  const { token } = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const { name, email, _id } = await UserModel.findById(userData.id);
      res.json({ name, email, _id });
    });
  } else {
    res.json(null);
  }
});

app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

const eventSchema = new mongoose.Schema({
  owner: String,
  title: String,
  description: String,
  organizedBy: String,
  eventDate: Date,
  eventTime: String,
  location: String,
  Participants: Number,
  Count: Number,
  Income: Number,
  ticketPrice: Number,
  Quantity: Number,
  image: String,
  likes: Number,
  Comment: [String],
});

const Event = mongoose.model("Event", eventSchema);

app.post("/createEvent", upload.single("image"), async (req, res) => {
  try {
    const eventData = req.body;

    // Check if this is a restore operation with an existing image path
    if (req.body.existingImage) {
      eventData.image = req.body.existingImage;
    } else {
      // Normal case: use the uploaded file path
      eventData.image = req.file ? req.file.path : "";
    }

    const newEvent = new Event(eventData);
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ error: "Failed to save the event to MongoDB" });
  }
});

app.get("/createEvent", async (req, res) => {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch events from MongoDB" });
  }
});

// PUT endpoint for updating events by admin
app.put("/createEvent/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;

    // Get the token from cookies to verify admin status
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Verify the token and check if user is admin
    try {
      const userData = jwt.verify(token, jwtSecret);
      const user = await UserModel.findById(userData.id);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Get the event data from the request body
    const eventData = req.body;

    // If a new image is uploaded, update the image path
    if (req.file) {
      eventData.image = req.file.path;
    }

    // Update the event in the database
    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      eventData,
      { new: true } // Return the updated document
    );

    if (!updatedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update the event" });
  }
});

// DELETE endpoint for removing events by admin
app.delete("/createEvent/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Get the token from cookies to verify admin status
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Verify the token and check if user is admin
    try {
      const userData = jwt.verify(token, jwtSecret);
      const user = await UserModel.findById(userData.id);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    // Delete the event from the database
    const deletedEvent = await Event.findByIdAndDelete(id);

    if (!deletedEvent) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete the event" });
  }
});

app.get("/event/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

app.post("/event/:eventId", (req, res) => {
  const eventId = req.params.eventId;

  Event.findById(eventId)
    .then((event) => {
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      event.likes = (event.likes || 0) + 1;
      return event.save();
    })
    .then((updatedEvent) => {
      res.json(updatedEvent);
    })
    .catch((error) => {
      console.error("Error liking the event:", error);
      res.status(500).json({ message: "Server error" });
    });
});

app.get("/events", (req, res) => {
  Event.find()
    .then((events) => {
      res.json(events);
    })
    .catch((error) => {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Server error" });
    });
});

app.get("/event/:id/ordersummary", async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

app.get("/event/:id/ordersummary/paymentsummary", async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch event from MongoDB" });
  }
});

app.post("/tickets", async (req, res) => {
  try {
    const ticketDetails = req.body;
    const newTicket = new Ticket(ticketDetails);
    await newTicket.save();

    // Update event Count
    if (ticketDetails.eventid) {
      const event = await Event.findById(ticketDetails.eventid);
      if (event) {
        // Increment Count by 1
        event.Count = (event.Count || 0) + 1;
        await event.save();
        console.log(`Updated event ${event.title} Count to ${event.Count}`);
      }
    }

    return res.status(201).json({ ticket: newTicket });
  } catch (error) {
    console.error("Error creating ticket:", error);
    return res.status(500).json({ error: "Failed to create ticket" });
  }
});

app.get("/tickets/:id", async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.json(tickets);
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

app.get("/tickets/user/:userId", (req, res) => {
  const userId = req.params.userId;

  Ticket.find({ userid: userId })
    .then((tickets) => {
      res.json(tickets);
    })
    .catch((error) => {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ error: "Failed to fetch user tickets" });
    });
});

app.delete("/tickets/:id", async (req, res) => {
  try {
    const ticketId = req.params.id;
    await Ticket.findByIdAndDelete(ticketId);
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting ticket:", error);
    res.status(500).json({ error: "Failed to delete ticket" });
  }
});

// Event invitation endpoint
app.post("/event/:id/invite", async (req, res) => {
  try {
    const { id } = req.params;
    const { email, message } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // Find the event
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // In a production environment, you would send an email here
    // For now, we'll just log the invitation details
    console.log(`Invitation for event ${event.title} sent to ${email}`);
    console.log(`Message: ${message || "No custom message provided"}`);
    console.log(
      `Event date: ${event.eventDate.toLocaleDateString()}, Time: ${
        event.eventTime
      }`
    );
    console.log(`Event link: ${req.get("origin")}/event/${id}`);

    // Return success
    res.status(200).json({
      message: "Invitation sent successfully",
      // Include details for frontend confirmation
      details: {
        eventName: event.title,
        sentTo: email,
        eventDate: event.eventDate,
        eventTime: event.eventTime,
      },
    });
  } catch (error) {
    console.error("Error sending invitation:", error);
    res.status(500).json({ error: "Failed to send invitation" });
  }
});

// Feedback endpoints
app.post("/feedback", async (req, res) => {
  try {
    const feedbackData = req.body;
    const newFeedback = new Feedback(feedbackData);
    await newFeedback.save();
    res.status(201).json(newFeedback);
  } catch (error) {
    console.error("Error saving feedback:", error);
    res.status(500).json({ error: "Failed to save feedback" });
  }
});

app.get("/feedback", async (req, res) => {
  try {
    const feedbackList = await Feedback.find().sort({ date: -1 });
    res.status(200).json(feedbackList);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Failed to fetch feedback" });
  }
});

app.delete("/feedback/:id", async (req, res) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).json({ error: "Not authorized" });
    }

    // Verify if user is admin
    try {
      const userData = jwt.verify(token, jwtSecret);
      const user = await UserModel.findById(userData.id);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ error: "Admin access required" });
      }
    } catch (err) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { id } = req.params;
    await Feedback.findByIdAndDelete(id);
    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ error: "Failed to delete feedback" });
  }
});

// Endpoint to get events for feedback page
app.get("/events/for-feedback", async (req, res) => {
  try {
    // Get all events and extract only needed fields
    const events = await Event.find({}, "title eventDate");

    // Format events with status (past or present)
    const currentDate = new Date();
    const formattedEvents = events.map((event) => ({
      id: event._id,
      name: event.title,
      status: new Date(event.eventDate) < currentDate ? "past" : "present",
    }));

    res.status(200).json(formattedEvents);
  } catch (error) {
    console.error("Error fetching events for feedback:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
