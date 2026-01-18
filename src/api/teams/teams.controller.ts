import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { deleteCourseImage } from "../../utils/deleteImage";
import { departmentSchema, TeamsValidation } from "./teams.validatioin";
import { paginationSchema } from "../../validation/pagination.validation";
import { EDepartment } from "@prisma/client";

const add = asyncHandler(async (req: Request, res: Response) => {
  const parsed = TeamsValidation.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const team = await prismaClient.ourTeam.create({
    data: parsed.data,
  });
  res.status(201).json(new ApiResponse(201, team, "Team added successfully"));
});

const edit = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const parsed = TeamsValidation.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const existing = await prismaClient.ourTeam.findUnique({
    where: { id },
  });

  if (!existing) throw new ApiError(404, "Team not found");

  const updated = await prismaClient.ourTeam.update({
    where: { id },
    data: parsed.data,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Team updated successfully"));
});

const getTeam = asyncHandler(async (req: Request, res: Response) => {
  const parsedPagination = paginationSchema.safeParse(req.query);
  if (!parsedPagination.success) {
    throw new ApiError(400, "Validation Failed", parsedPagination.error.issues);
  }
  const { page, limit } = parsedPagination.data;
  const skip = (page - 1) * limit;

  const parsedDept = departmentSchema.safeParse(req.query.department?.toString().toUpperCase());
  if (!parsedDept.success) {
    throw new ApiError(400, "Invalid department", parsedDept.error.issues);
  }
  const department = parsedDept.data;

  const search = req.query.search?.toString().toLowerCase().trim();
  const searchFilter = search
    ? {
        OR: [
          { name: { contains: search } },
          { position: { contains: search } },
        ],
      }
    : {};

  const departmentFilter = department ? { department } : {};

  const whereFilter = { AND: [searchFilter, departmentFilter] };

  const users = await prismaClient.ourTeam.findMany({
    where: whereFilter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.ourTeam.count({ where: whereFilter });
  const totalPages = Math.ceil(total / limit);

  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  return res.status(200).json(
    new ApiResponse(200, users, "Our Team fetched successfully", pagination)
  );
});

const getTeamsByDepartment = asyncHandler(async (req: Request, res: Response) => {
  const teams = await prismaClient.ourTeam.findMany({
    orderBy: { createdAt: "desc" },
  });

  const grouped: Record<string, typeof teams> = {
    MANAGEMENT: [],
    ADMINISTRATION: [],
    COMPUTING: [],
  };

  teams.forEach((team) => {
    const dept = team.department.toUpperCase();
    if (grouped[dept]) {
      grouped[dept].push(team);
    }
  });

  res.status(200).json(
    new ApiResponse(200, grouped, "Teams grouped by department fetched successfully")
  );
});

const uploadTeamImages = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.files || typeof req.files !== "object") {
    throw new ApiError(400, "No files uploaded");
  }

  const files = req.files as {
    image?: Express.Multer.File[];
    portrait?: Express.Multer.File[];
  };

  const imageFile = files.image?.[0];
  const portraitFile = files.portrait?.[0];

  if (!imageFile && !portraitFile) {
    throw new ApiError(400, "Image or portrait is required");
  }

  const team = await prismaClient.ourTeam.findUnique({
    where: { id },
  });

  if (!team) throw new ApiError(404, "Team not found");

  const updateData: any = {};

  if (imageFile) {
    if (team.image) deleteCourseImage(team.image);
    updateData.image = `/public/teams/${imageFile.filename}`;
  }

  if (portraitFile) {
    if (team.portrait) deleteCourseImage(team.portrait);
    updateData.portrait = `/public/teams/${portraitFile.filename}`;
  }

  const updatedTeam = await prismaClient.ourTeam.update({
    where: { id },
    data: updateData,
  });

  return res.status(200).json(
    new ApiResponse(200, updatedTeam, "Team images uploaded successfully")
  );
});


const updateteamImage = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.file) throw new ApiError(400, "No image file provided");

  const team = await prismaClient.ourTeam.findUnique({
    where: { id },
  });
  if (!team) throw new ApiError(404, "team not found");

  const filename = req.file.filename;
  const imageUrl = `/public/teams/${filename}`;

  if (team.image) {
    deleteCourseImage(team.image);
  }

  const updatedCourse = await prismaClient.ourTeam.update({
    where: { id },
    data: { image: imageUrl },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updatedCourse, "Avatar updated successfully"));
});
const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const team = await prismaClient.ourTeam.findUnique({
    where: { id },
  });

  if (!team) throw new ApiError(404, "Team not found");

  if (team.image) deleteCourseImage(team.image);
  if (team.portrait) deleteCourseImage(team.portrait);

  await prismaClient.ourTeam.delete({ where: { id } });

  res.status(200).json(new ApiResponse(200, null, "Team deleted successfully"));
});


export { add, uploadTeamImages, edit, deleteTeam, updateteamImage, getTeam ,getTeamsByDepartment};
