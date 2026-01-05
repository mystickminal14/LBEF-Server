import { NextFunction, Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { UsersSchema } from "./users.validation";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import bcrypt from "bcryptjs";
import { paginationSchema } from "../../validation/pagination.validation";

const addUser = asyncHandler(async (req: Request, res: Response) => {
  const parsed = UsersSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { fullname, email, username, password, role } = parsed.data;

  const existingUser = await prismaClient.user.findUnique({
    where: { username },
  });
  if (existingUser) throw new ApiError(400, "User already exists!!");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prismaClient.user.create({
    data: { fullname, email, username, password: hashedPassword, role },
  });

  const { password: _, ...userWithoutPassword } = user;

  return res
    .status(201)
    .json(
      new ApiResponse(201, userWithoutPassword, "User registered successfully")
    );
});

const editUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { fullname, email, username } = req.body;
  const checkUser = await prismaClient.user.findUnique({
    where: { id: parseInt(id) },
  });
  if (!checkUser) throw new ApiError(404, "User not found");
  if (checkUser.role === "SUPERADMIN") {
    throw new ApiError(403, "You dont have permission to update this user!");
  }
  const updated = await prismaClient.user.update({
    where: { id: parseInt(id) },
    data: { fullname, email, username },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "User updated successfully"));
});

const getUser = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  let search = req.query.search?.toString().toLowerCase().trim() || "";
  const searchFilter = search
    ? {
        OR: [
          {
            fullname: {
              contains: search,
            },
          },
          {
            username: {
              contains: search,
            },
          },
        ],
      }
    : {};

  const users = await prismaClient.user.findMany({
    where: searchFilter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.user.count({
    where: searchFilter,
  });

  const totalPages = Math.ceil(total / limit);

  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return res
    .status(200)
    .json(
      new ApiResponse(200, users, "Users fetched successfully", pagination)
    );
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { password } = req.body;

  if (!password) throw new ApiError(400, "New password is required");

  const user = await prismaClient.user.findUnique({
    where: { id: parseInt(id) },
  });
  if (!user) throw new ApiError(404, "User not found");
  if (user.role === "SUPERADMIN") {
    throw new ApiError(403, "You dont have permission to update this user!");
  }
  const hashedPassword = await bcrypt.hash(password, 10);

  await prismaClient.user.update({
    where: { id: parseInt(id) },
    data: { password: hashedPassword },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successfully"));
});

const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { role } = req.body;

  if (!role) throw new ApiError(400, "Role is required");

  const checkUser = await prismaClient.user.findUnique({
    where: { id: parseInt(id) },
  });

  if (!checkUser) throw new ApiError(404, "User not found");
  if (checkUser.role === "SUPERADMIN") {
    throw new ApiError(403, "You dont have permission to update this user!");
  }
  const user = await prismaClient.user.update({
    where: { id: parseInt(id) },
    data: { role },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User role updated successfully"));
});
const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const user = await prismaClient.user.findUnique({
    where: { id: parseInt(id) },
  });
  if (!user) throw new ApiError(404, "user not found");
  if (user.role === "SUPERADMIN") {
    throw new ApiError(403, "You dont have permission to update this user!");
  }
  await prismaClient.user.delete({ where: { id: parseInt(id) } });
  res.status(200).json(new ApiResponse(200, null, "user deleted successfully"));
});

export {
  addUser,
  editUser,
  resetPassword,
  updateUserRole,
  getUser,
  deleteUser,
};
