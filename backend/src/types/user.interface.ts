import { Document } from "mongoose";

export interface User {
  email: string;
  username: string;
  password: string;
  createdAt: Date;
}

export interface UserDocument extends Document {
  email: string;
  username: string;
  password: string;
  validatePassword(param1: string): boolean;
}
