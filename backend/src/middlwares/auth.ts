import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";
import UserModel from "../models/user.model";
import type { ExpressRequestInterface } from "../types/express-request.interface";

export default async (
  req: ExpressRequestInterface,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeder = req.headers.authorization;
    if (!authHeder) {
      return res.status(401);
    }
    const token = authHeder.split(" ")[1];
    const data = (await jwt.verify(token, JWT_SECRET)) as {
      id: string;
      email: string;
    };
    if (!data) {
      return res.status(401);
    }

    const user = await UserModel.findById(data?.id);
    if (!user) {
      return res.status(401);
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401);
  }
};
