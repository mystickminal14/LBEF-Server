import { NextFunction, Response } from "express";
import SessionRequest from "../types/UserRequest";
import { ApiError } from "../utils/apiError";
import { hasPermission } from "../utils/hasPermission";

export const requirePermission = (permission: string) =>
  (req: SessionRequest, res: Response, next: NextFunction) => {
    if (!hasPermission(req.user, permission)) {
      console.log(req.user)
      
      throw new ApiError(403, `You dont have permission to access this resource ` );
    }
    next();
  };
