import {  Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { AchievementSchema } from "./achievement.validation";
import { paginationSchema } from "../../validation/pagination.validation";

const create = asyncHandler(async (req: Request, res: Response) => {
  const parsed = AchievementSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const { achivement } = parsed.data;
  const achievementModel = await prismaClient.achievement.create({
    data: { achivement },
  });
  return res
    .status(201)
    .json(
      new ApiResponse(201, achievementModel, "Achievement Created Successfully")
    );
});

const edit = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const { achivement } = req.body;
  const checkachievement = await prismaClient.achievement.findUnique({
    where: { id: parseInt(id) },
  });
  if (!checkachievement) throw new ApiError(404, "Achievement not found");

  const updated = await prismaClient.achievement.update({
    where: { id: parseInt(id) },
    data: { achivement },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Achievement updated successfully"));
});

const getachievement = asyncHandler(async (req: Request, res: Response) => {
 const parsed = paginationSchema.safeParse(req.query);
   
     if (!parsed.success) {
       throw new ApiError(400, "Validation Failed", parsed.error.issues);
     }
     const { page, limit } = parsed.data;
     const skip = (page - 1) * limit;

  const achievements = await prismaClient.achievement.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.achievement.count({
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
      new ApiResponse(200, achievements, "Achievement fetched successfully", pagination)
    );
});
const getAll = asyncHandler(async (req: Request, res: Response) => {
  const achievements = await prismaClient.achievement.findMany({
    orderBy: { createdAt: "asc" },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, achievements, "Achievement fetched successfully", )
    );
});
const deleteachievement = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const achievement = await prismaClient.achievement.findUnique({
    where: { id: parseInt(id) },
  });
  if (!achievement) throw new ApiError(404, "Achievement not found");

  await prismaClient.achievement.delete({ where: { id: parseInt(id) } });
  res.status(200).json(new ApiResponse(200, null, "achievement deleted successfully"));
});

export {
  getAll,
  create,
  edit,
  getachievement,
  deleteachievement,
};
