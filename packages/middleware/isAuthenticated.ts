import prisma from "@packages/libs/prisma";
import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

const isAuthenticated = async (req: any, res: Response, next: NextFunction) => {
  try {
    const tokens: string[] = [];
    
    console.log("[Auth] Cookies received:", req.cookies);

    const userToken = req.cookies["access_token"] || req.cookies["accessToken"];
    if (userToken) tokens.push(userToken);
    
    const sellerToken = req.cookies["seller-access-token"] || req.cookies["seller-accessToken"];
    if (sellerToken && !tokens.includes(sellerToken)) tokens.push(sellerToken);

    const authHeader = req.headers.authorization?.split(" ")[1];
    if (authHeader && !tokens.includes(authHeader)) tokens.push(authHeader);

    console.log("[Auth] Tokens extracted:", tokens.length);

    if (tokens.length === 0) {
      console.log("[Auth] No tokens provided.");
      return res
        .status(401)
        .json({ message: "Unauthorized! No token provided." });
    }

    let foundValid = false;

    for (const token of tokens) {
      try {
        console.log("[Auth] Verifying token:", token.substring(0, 15) + "...");
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
          id: string;
          role: "user" | "seller";
        };

        console.log("[Auth] Decoded:", decoded);

        if (decoded?.role === "user" && !req.user) {
          const account = await prisma.users.findUnique({
            where: { id: decoded.id },
          });
          if (account) {
            req.user = account;
            req.role = "user";
            foundValid = true;
            console.log("[Auth] User found and authenticated.");
          } else {
            console.log("[Auth] User account not found in DB.");
          }
        } else if (decoded?.role === "seller" && !req.seller) {
          const account = await prisma.sellers.findUnique({
            where: { id: decoded.id },
            include: {
              shop: true,
            },
          });
          if (account) {
            req.seller = account;
            req.role = "seller";
            foundValid = true;
            console.log("[Auth] Seller found and authenticated. Shop included:", !!account.shop);
          } else {
            console.log("[Auth] Seller account not found in DB.");
          }
        }
      } catch (err) {
        console.log("[Auth] Token verification failed:", err);
      }
    }

    if (!foundValid) {
      console.log("[Auth] No valid accounts found for the provided tokens.");
      return res.status(401).json({ message: "Forbidden! Invalid token." });
    }

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized! Invalid token." });
  }
};

export default isAuthenticated;
