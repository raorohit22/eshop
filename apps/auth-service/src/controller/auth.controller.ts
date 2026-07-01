/* eslint-disable no-empty */

import { Response, Request, NextFunction } from "express";
import {
  checkOTPRestrictions,
  handleForgotPassword,
  sendOTP,
  trackOTPrequests,
  validateRegistrationData,
  verifyForgotPasswordOtp,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { AppError, AuthError, ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { setCookie } from "../utils/cookies/setCookie";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia",
});

//Register a new user
export const userRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  /*  #swagger.parameters['body'] = {
        in: 'body',
        schema: {
          $ref: '#/definitions/RegisterDto'
        }
      }
  */
  try {
    validateRegistrationData(req.body, "user");
    const { name, email } = req.body;

    const existinguser = await prisma.users.findUnique({ where: { email } });
    if (existinguser) {
      return next(new ValidationError("User already exists with this email"));
    }

    await checkOTPRestrictions(email, next);
    await trackOTPrequests(email, next);
    await sendOTP(name, email, "user-activation-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};

// verify user with otp
export const verifyUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name } = req.body;

    if (!email || !otp || !password || !name) {
      return next(new ValidationError("All fields are required!"));
    }

    const existingUser = await prisma.users.findUnique({ where: { email } });
    if (existingUser) {
      return next(new ValidationError("User already exists with this email"));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      } as any,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

//login user
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new ValidationError("User doesn't exist with this email"));
    }

    //verify password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      return next(new AuthError("Invalid credentials"));
    }

    //generate access and refresh tokens
    const accessToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { id: user.id, role: "user" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" },
    );

    // store the refresh and access tokens in an httponly secure cookie
    setCookie(res, "refreshToken", refreshToken);
    setCookie(res, "accessToken", accessToken);

    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//refresh token
export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const refreshToken = req.cookies.refresh_token || req.cookies.refreshToken;
    if (!refreshToken) {
      return next(
        new ValidationError("Unauthenticated! No refresh token provided."),
      );
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET as string,
    ) as { id: string; role: string };
    if (!decoded || !decoded.id || !decoded.role) {
      return next(new AuthError("Forbidden! Invalid refresh token."));
    }

    // let account;
    // if(decoded.role === "user"){
    const user = await prisma.users.findUnique({ where: { id: decoded.id } });
    // }

    if (!user) {
      return next(new AuthError("Forbidden! User/Seller not found."));
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );
    setCookie(res, "accessToken", newAccessToken);

    res.status(201).json({
      success: true,
    });
  } catch (error) {
    return next(error);
  }
};

//get logged in user
export const getUser = async (req: any, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// user forgot password
export const userForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await handleForgotPassword(req, res, next, "user");
};

//verify forgot password otp
export const verifyUserForgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await verifyForgotPasswordOtp(req, res, next);
};

// reset user password
export const resetUserPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) {
      return next(new ValidationError("Email and new password are required!"));
    }

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user) {
      return next(new ValidationError("User not found with this email!"));
    }

    //compare new password with old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password!);
    if (isSamePassword) {
      return next(
        new ValidationError(
          "New password must be different from the old password!",
        ),
      );
    }

    //hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    //update password in db
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword } as any,
    });

    res.status(200).json({
      success: true,
      message: "Password reset successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

// register a new seller
export const registerSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    validateRegistrationData(req.body, "seller");
    const { name, email } = req.body;

    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(new ValidationError("Seller already exists with this email"));
    }

    await checkOTPRestrictions(email, next);
    await trackOTPrequests(email, next);
    await sendOTP(name, email, "seller-activation-mail");

    res.status(200).json({
      message: "OTP sent to email. Please verify your account.",
    });
  } catch (error) {
    return next(error);
  }
};

//verify seller with otp
export const verifySeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, otp, password, name, country, phone_number } = req.body;
    if (!email || !otp || !password || !name || !country || !phone_number) {
      return next(new ValidationError("All fields are required!"));
    }
    const existingSeller = await prisma.sellers.findUnique({
      where: { email },
    });
    if (existingSeller) {
      return next(new ValidationError("Seller already exists with this email"));
    }

    await verifyOtp(email, otp, next);
    const hashedPassword = await bcrypt.hash(password, 10);
    const seller = await prisma.sellers.create({
      data: {
        name,
        email,
        password: hashedPassword,
        country,
        phone_number,
      },
    });

    res.status(201).json({
      success: true,
      seller,
      message: "Seller registered successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

//create new shop
export const createShop = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, bio, address, opening_hours, website, category, sellerId } =
      req.body;

    if (!name || !bio || !address || !opening_hours || !category || !sellerId) {
      return next(new ValidationError("All fields are required!"));
    }

    const shopData: any = {
      name,
      bio,
      address,
      opening_hours,
      category,
      sellerId,
    };

    if (website && website.trim() !== "") {
      shopData.website = website;
    }

    const shop = await prisma.shops.create({
      data: shopData,
    });

    res.status(201).json({
      success: true,
      shop,
      message: "Shop created successfully!",
    });
  } catch (error) {
    return next(error);
  }
};

// create stripe connect account link
export const createStripeConnectLink = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { sellerId } = req.body;

    if (!sellerId) {
      return next(new ValidationError("Seller ID is required!"));
    }

    let seller;
    try {
      seller = await prisma.sellers.findUnique({ where: { id: sellerId } });
    } catch (dbError) {
      // Prisma throws on invalid ObjectId format
      return next(new ValidationError("Invalid Seller ID format!"));
    }

    if (!seller) {
      return next(new ValidationError("Seller not found!"));
    }

    // Reuse existing Stripe account if seller already has one,
    // otherwise create a new Connect account
    let stripeAccountId = seller.stripeId;

    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: seller.email,
        country: "GB",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      stripeAccountId = account.id;

      await prisma.sellers.update({
        where: { id: sellerId },
        data: { stripeId: account.id },
      });
    }

    const clientBaseUrl =
      process.env.CLIENT_URL || "http://localhost:3000";

    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${clientBaseUrl}/signup?stripe_refresh=true`,
      return_url: `${clientBaseUrl}/success`,
      type: "account_onboarding",
    });

    res.json({
      url: accountLink.url,
    });
  } catch (error: any) {
    // Surface Stripe API errors with their actual message
    if (error?.type?.startsWith("Stripe")) {
      return next(new AppError(error.message, error.statusCode || 500));
    }
    return next(error);
  }
};

// login seller
export const loginSeller = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new ValidationError("Email and password are required"));
    }

    const seller = await prisma.sellers.findUnique({ where: { email } });
    if (!seller) {
      return next(new ValidationError("Seller doesn't exist with this email"));
    }

    //verify password
    const isMatch = await bcrypt.compare(password, seller.password!);
    if (!isMatch) {
      return next(new AuthError("Invalid credentials"));
    }

    //generate access and refresh tokens
    const accessToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "15m" },
    );
    const refreshToken = jwt.sign(
      { id: seller.id, role: "seller" },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: "7d" },
    );

    // store the refresh and access tokens in an httponly secure cookie
    setCookie(res, "seller-refresh-token", refreshToken);
    setCookie(res, "seller-access-token", accessToken);

    res.status(200).json({
      success: true,
      message: "Logged in successfully!",
      seller: {
        id: seller.id,
        name: seller.name,
        email: seller.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

//get seller
export const getSeller = async (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  try {
    const seller = req.seller;
    res.status(201).json({
      success: true,
      seller,
    });
  } catch (error) {
    next(error);
  }
};
