import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: [true, "Username already taken"],
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: [true, "Email is required"],
      lowercase: true,
      trim: true,
      required: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    
    refreshToken: {
      type: String,
      default: null,
    },
  },
  { timestamps: true },
);

// Pre-save hook - hash the password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method - compare password on login
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("Users", userSchema);

export default User;
