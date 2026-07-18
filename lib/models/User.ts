import mongoose, { Document, Model, Schema } from "mongoose";
import { hashPassword } from "../password";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  avatarPublicId: string;
  createdAt: Date;
  updatedAt: Date;
  followerCount: number;
  followingCount: number;
}

const userSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: [true, "Username must be unique"],
      trim: true,
      lowercase: true,
      minLength: [3, "Username must be at least 3 char long"],
      maxLength: [20, "Username must not exceed 20 char length"],
      match: [
        /^[a-z0-9_]+$/,
        "Username can only contain lowercase letters, numbers, and underscores",
      ],
    },
    email: {
      type: String,
      required: [true, "Email is requried"],
      trim: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      requried: [true, "Password is requried"],
      minLength: [8, "Password must be at least 8 char long"],
      select: false,
    },
    displayName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxLength: [50, "Name cannot be more that 50 char long"],
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [160, "Bio cannot exceed 160 characters"],
      default: "",
    },
    avatarUrl: {
      type: String,
      default: "",
    },
    avatarPublicId: {
      type: String,
      default: "",
    },
    followerCount: {
      type: Number,
      default: 0,
      min: 0
    },
    followingCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true },
);

userSchema.pre("save", async function() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await hashPassword(this.password);
});

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema)
