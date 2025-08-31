import mongoose, { Schema } from "mongoose";
import validator from "validator";
import type { UserDocument } from "../types/user.interface.js";
import bcrypt from "bcryptjs";
const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      validate: [validator.isEmail, "Invalid email"],
      createIndexes: {
        unique: true,
      },
    },

    avatar: {
      type: String,
      default:
        "https://pbs.twimg.com/profile_images/1950642262905696256/h8thifV2_400x400.jpg",
    },
    username: {
      type: String,
      required: [true, "Username is required"],
    },

    password: {
      type: String,
      required: [true, "password is required"],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.validatePassword = async function (password: string) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model<UserDocument>("User", userSchema);
