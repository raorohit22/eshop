import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const getAuthToken = (cookies: Record<string, string | undefined>, authorization?: string) => {
  return (
    cookies["access_token"] ||
    cookies["accessToken"] ||
    cookies["seller-access-token"] ||
    cookies["seller-accessToken"] ||
    authorization?.split(" ")[1]
  );
};

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token = getAuthToken(req.cookies, req.headers.authorization);
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized! No token provided." });
    }

    //verify token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      id: string;
      role: "user" | "seller";
    };

    if (!decoded) {
      return res.status(401).json({ message: "Forbidden! Invalid token." });
    }

    let account;

    if (decoded.role === "user") {
      account = await prisma.users.findUnique({
        where: { id: decoded.id },
      });
    } else if (decoded.role === "seller") {
      account = await prisma.sellers.findUnique({
        where: { id: decoded.id },
        include: {
          shop: true,
        },
      });
      req.seller = account;
    }

    if (!account) {
      return res.status(401).json({ message: "Account not found." });
    }

    req.role = decoded.role;

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized! Invalid token." });
  }
};

export default isAuthenticated;
