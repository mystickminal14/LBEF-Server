import { NextFunction, Response } from "express";
import { prismaClient } from "../server";
import jwt from "jsonwebtoken";
import { JWTSECRET } from "../secrets";
import SessionRequest from "../types/UserRequest";
import { ApiError } from "../utils/apiError";
import { asyncHandler } from "../utils/asyncHandler";

const verifyJwt = asyncHandler(async (req: SessionRequest, res: Response, next: NextFunction) => {
  const token =
    req.cookies?.token ;
  if (!token) {
    throw new ApiError(401, "Unauthorized access");
  }

  const decodedToken = jwt.verify(token, JWTSECRET) as { id: number; username: string };

  const user = await prismaClient.user.findUnique({ where: { id: decodedToken.id } });
  if (!user) throw new ApiError(401, "Invalid access token");

  req.user = user;
  next();
});

export default verifyJwt;
