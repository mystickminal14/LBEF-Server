import { NextFunction, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import SessionRequest from "../types/UserRequest";
import { ApiError } from "../utils/apiError";

const adminMiddleware = asyncHandler(
  async (req: SessionRequest, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user?.role === "ADMIN" || user?.role === "SUPERADMIN") {
      return next();
    }

    throw new ApiError(401, "You are not authorized to access this resource");
  }
);

export default adminMiddleware;
