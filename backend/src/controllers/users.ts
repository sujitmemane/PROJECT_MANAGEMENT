import { type User, type UserDocument } from "../types/user.interface";
import type { NextFunction } from "express";
import UserModel from "../models/user.model";
import type { Request, Response } from "express";
import { Error } from "mongoose";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import type { ExpressRequestInterface } from "../types/express-request.interface";

const normalizedUser = (user: UserDocument) => {
  const token = jwt.sign(
    {
      id: user?._id,
      email: user?.email,
    },
    JWT_SECRET
  );
  return {
    email: user?.email,
    username: user?.username,
    token,
  };
};

const avatars = [
  "https://api.dicebear.com/7.x/pixel-art/svg?seed=sujeeth",
  "https://api.dicebear.com/7.x/pixel-art-neutral/svg?seed=sujeeth",
  "https://api.dicebear.com/7.x/identicon/svg?seed=sujeeth",
  "https://api.dicebear.com/7.x/bottts/svg?seed=sujeeth",
  "https://api.dicebear.com/7.x/adventurer/svg?seed=sujeeth",
  "https://api.dicebear.com/7.x/adventurer-neutral/svg?seed=sujeeth",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=sujeeth",
  "https://api.dicebear.com/7.x/croodles/svg?seed=sujeeth",
  "https://api.dicebear.com/7.x/croodles-neutral/svg?seed=sujeeth",
  "https://api.dicebear.com/7.x/thumbs/svg?seed=sujeeth",
];

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const random = Math.round(Math.random() * 10);
    const newUser = new UserModel({
      email: req.body.email,
      password: req.body.password,
      username: req.body.username,
      avatar: avatars[random],
    });
    const savedUser = await newUser.save();
    res.send(normalizedUser(savedUser));
  } catch (error) {
    if (error as Error.ValidationError) {
      const messages = Object.values(error?.errors).map((err) => err.message);
      return res.status(422).json(messages);
    }
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const user = await UserModel.findOne({
      email: req.body.email,
    }).select("+password");

    console.log(user);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Incorrect email or password",
      });
    }

    const isPasswordMatch = await user.validatePassword(req.body.password);
    if (!isPasswordMatch) {
      return res.status(404).json({
        success: false,
        message: "Wrong password",
      });
    }

    res.send(normalizedUser(user));
  } catch (error) {
    console.log(error);
    if (error as Error.ValidationError) {
      const messages = Object.values(error?.errors).map((err) => err.message);
      return res.status(422).json(messages);
    }
    next(error);
  }
};

export const currentUser = async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    return res.status(200).json(normalizedUser(user));
  } catch (error) {
    console.log(error);
    next(error);
  }
};
