import { Document } from "mongoose";

export interface User {
  avatar?: string;
  email: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserDocument extends Document {
  avatar?: string;
  email: string;
  username: string;
  password: string;
  validatePassword(param1: string): boolean;
}
