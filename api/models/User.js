const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: {
    type: String,
    default: "user",
  },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
  