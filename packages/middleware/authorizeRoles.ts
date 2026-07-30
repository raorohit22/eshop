import { AuthError } from "@packages/error-handler";
import { Response, NextFunction } from "express";

export const isSeller = (req: any, res: Response, next: NextFunction) => {
  if (!req.seller) {
    return next(new AuthError("Forbidden! Access denied: Seller only"));
  }
  next();
};

export const isUser = (req: any, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AuthError("Forbidden! Access denied: User only"));
  }
  next();
};
