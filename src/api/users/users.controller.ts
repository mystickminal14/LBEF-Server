import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { asyncHandler } from "../../utils/asyncHandler";
import { UsersSchema } from "./users.validation";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { paginationSchema } from "../../validation/pagination.validation";
import { EPermission } from "./permisssion";
import { EUserRole } from "@prisma/client";

const addUser = asyncHandler(async (req: Request, res: Response) => {
  const parsed = UsersSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const {
    fullname,
    email,
    username,
    password,
    role,
    permissions = [],
  } = parsed.data;

  const existingUser = await prismaClient.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const permissionRecords = await prismaClient.permission.findMany({
    where: { name: { in: permissions } },
  });

  if (permissionRecords.length !== permissions.length) {
    throw new ApiError(400, "Invalid permission detected");
  }

  const user = await prismaClient.user.create({
    data: {
      fullname,
      email,
      username,
      password: hashedPassword,
      role,
      permissions: {
        create: permissionRecords.map((p) => ({
          permissionId: p.id,
        })),
      },
    },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });

  const { password: _, ...userWithoutPassword } = user;

  res
    .status(201)
    .json(
      new ApiResponse(201, userWithoutPassword, "User created successfully")
    );
});

const editUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { fullname, email, username, permissions } = req.body as {
    fullname?: string;
    email?: string;
    username?: string;
    permissions?: EPermission[];
  };

  const user = await prismaClient.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new ApiError(404, "User not found");
  if (user.role === EUserRole.SUPERADMIN) {
    throw new ApiError(403, "Cannot modify SUPERADMIN");
  }

  let permissionRecords: any = [];

  if (permissions) {
    permissionRecords = await prismaClient.permission.findMany({
      where: { name: { in: permissions } },
    });

    if (permissionRecords.length !== permissions.length) {
      throw new ApiError(400, "Invalid permission detected");
    }
  }

  await prismaClient.$transaction([
    prismaClient.user.update({
      where: { id: userId },
      data: { fullname, email, username },
    }),
    ...(permissions
      ? [
          prismaClient.userPermission.deleteMany({
            where: { userId },
          }),
          prismaClient.userPermission.createMany({
            data: permissionRecords.map((p: { id: number }) => ({
              userId,
              permissionId: p.id,
            })),
          }),
        ]
      : []),
  ]);

  res.status(200).json(new ApiResponse(200, null, "User updated successfully"));
});

const getUser = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;
  const search = req.query.search?.toString().toLowerCase().trim() || "";

  const where = search
    ? {
        OR: [
          { fullname: { contains: search } },
          { username: { contains: search } },
        ],
      }
    : {};

  const users = await prismaClient.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });

  const total = await prismaClient.user.count({ where });
  const totalPages = Math.ceil(total / limit);

  res.status(200).json(
    new ApiResponse(200, users, "Users fetched successfully", {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    })
  );
});

const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { password } = req.body;

  if (!password) throw new ApiError(400, "Password is required");

  const user = await prismaClient.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new ApiError(404, "User not found");
  if (user.role === EUserRole.SUPERADMIN) {
    throw new ApiError(403, "Cannot modify SUPERADMIN");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prismaClient.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, "Password reset successfully"));
});

const updateUserRole = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);
  const { role } = req.body as { role: EUserRole };

  const user = await prismaClient.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new ApiError(404, "User not found");
  if (user.role === EUserRole.SUPERADMIN) {
    throw new ApiError(403, "Cannot modify SUPERADMIN");
  }

  const updated = await prismaClient.user.update({
    where: { id: userId },
    data: { role },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updated, "User role updated successfully"));
});

const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const userId = parseInt(req.params.id);

  const user = await prismaClient.user.findUnique({
    where: { id: userId },
  });

  if (!user) throw new ApiError(404, "User not found");
  if (user.role === EUserRole.SUPERADMIN) {
    throw new ApiError(403, "Cannot delete SUPERADMIN");
  }

  await prismaClient.user.delete({ where: { id: userId } });

  res.status(200).json(new ApiResponse(200, null, "User deleted successfully"));
});

export const assignUserPermissions = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = parseInt(req.params.id);
    const { permissions } = req.body as { permissions: EPermission[] };

    if (!Array.isArray(permissions)) {
      throw new ApiError(400, "Permissions array is required");
    }

    const user = await prismaClient.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new ApiError(404, "User not found");
    if (user.role === EUserRole.SUPERADMIN) {
      throw new ApiError(403, "Cannot modify SUPERADMIN permissions");
    }

    const validPermissions = Object.values(EPermission);
    const invalid = permissions.filter((p) => !validPermissions.includes(p));

    if (invalid.length > 0) {
      throw new ApiError(400, `Invalid permissions: ${invalid.join(", ")}`);
    }

    const permissionRecords = await prismaClient.permission.findMany({
      where: { name: { in: permissions } },
    });

    await prismaClient.$transaction([
      prismaClient.userPermission.deleteMany({
        where: { userId },
      }),
      prismaClient.userPermission.createMany({
        data: permissionRecords.map((p) => ({
          userId,
          permissionId: p.id,
        })),
      }),
    ]);

    res
      .status(200)
      .json(
        new ApiResponse(200, permissions, "Permissions updated successfully")
      );
  }
);
export {
  addUser,
  editUser,
  resetPassword,
  updateUserRole,
  getUser,
  deleteUser,
};
