import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { prismaClient } from "../../server";
import bcrypt from "bcryptjs";
import { ApiError } from "../../utils/apiError";
import { JWTSECRET, NODE_ENV } from "../../secrets";
import jwt from "jsonwebtoken";
import { ApiResponse } from "../../utils/apiResponse";
import SessionRequest from "../../types/UserRequest";

// LOGIN
const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) throw new ApiError(400, "Username and password are required");

const user = await prismaClient.user.findUnique({
    where: { username },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });
  console.log(user);
  if (!user) throw new ApiError(400, "User not found");

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new ApiError(400, "Invalid password");

  const token = jwt.sign({ id: user.id, username: user.username }, JWTSECRET, { expiresIn: "1d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: NODE_ENV === "production",
    sameSite: "strict",
  });

  const { password: _, ...userWithoutPassword } = user;
  res.status(200).json(new ApiResponse(200, { ...userWithoutPassword, token }, "User logged in successfully"));
});

const me = asyncHandler(async (req: SessionRequest, res: Response) => {
  if (!req.user) throw new ApiError(401, "Unauthorized");

  res.status(200).json(new ApiResponse(200, req.user, "User fetched successfully"));
});

// LOGOUT
const logout = asyncHandler(async (req: Request, res: Response) => {
  console.log('logout')
  res.clearCookie("token", { httpOnly: true, sameSite: "strict" });
  res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

export { login, me, logout };
