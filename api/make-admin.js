const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");

// Function to update a user to admin role
async function makeAdmin(email) {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      console.error(`User with email ${email} not found`);
      process.exit(1);
    }

    // Update the user's role to admin
    user.role = "admin";
    await user.save();

    console.log(
      `User ${user.name} (${email}) has been set as admin successfully`
    );
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

// Check if email is provided as a command line argument
const email = process.argv[2];

if (!email) {
  console.error("Please provide an email as a command line argument");
  console.log("Usage: node make-admin.js <email>");
  process.exit(1);
}

// Call the function with the provided email
makeAdmin(email);
