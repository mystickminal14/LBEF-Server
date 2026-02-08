import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/apiError";
import logger from "../utils/logger";

export const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("Unhandled Error", {
    message: err.message,
    stack: err.stack,
    path: req.originalUrl,
    method: req.method,
  });

  if (err.code && err.code.startsWith("P")) {
    return res.status(400).json({
      success: false,
      message: "Database error",
      errors: [err.message],
      data: null,
    });
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
      data: null,
    });
  }

  if (err instanceof SyntaxError) {
    return res.status(422).json({
      success: false,
      message: "Invalid JSON data",
      data: null,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    data: null,
  });
};
