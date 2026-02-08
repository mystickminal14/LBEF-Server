import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { paginationSchema } from "../../validation/pagination.validation";
import { TeamDepartment } from "./teams.validatioin";

const addteam = asyncHandler(async (req: Request, res: Response) => {
  const parsed = TeamDepartment.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { name } = parsed.data;

  // Check if department already exists
  const existingteam = await prismaClient.teamDept.findUnique({ where: { name } });
  if (existingteam) {
    throw new ApiError(400, "Team Department already exists");
  }

  // Get the last order
  const lastteam = await prismaClient.teamDept.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (lastteam?.order ?? 0) + 1;

  // Create department with ENABLED by default
  const team = await prismaClient.teamDept.create({
    data: {
      name,
      order: nextOrder,
      status: "ENABLED", // default
    },
  });

  res.status(201).json(new ApiResponse(201, team, "Team Department Added Successfully"));
});


const editteam = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const parsed = TeamDepartment.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { name } = parsed.data;

  const existingteam = await prismaClient.teamDept.findUnique({ where: { id } });
  if (!existingteam) {
    throw new ApiError(404, "Team Department does not exist");
  }

  const updatedteam = await prismaClient.teamDept.update({
    where: { id },
    data: { name },
  });

  res.status(200).json(new ApiResponse(200, updatedteam, "Department Updated Successfully"));
});


const toggleTeamStatus = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const existingteam = await prismaClient.teamDept.findUnique({ where: { id } });
  if (!existingteam) {
    throw new ApiError(404, "Team Department not found");
  }

  const newStatus = existingteam.status === "ENABLED" ? "DISABLED" : "ENABLED";

  const updatedteam = await prismaClient.teamDept.update({
    where: { id },
    data: { status: newStatus },
  });

  res.status(200).json(new ApiResponse(200, updatedteam, `Team Department ${newStatus}`));
});

// ---------------------------------------------
// Get all department names
// ---------------------------------------------
const getteamName = asyncHandler(async (_req: Request, res: Response) => {
  const team = await prismaClient.teamDept.findMany({
    where:{status:"ENABLED"},
    select: { name: true, id: true, status: true },
    orderBy: { order: "asc" },
  });

  res.status(200).json(new ApiResponse(200, team, "Team Departments fetched successfully"));
});

// ---------------------------------------------
// Get paginated departments with search
// ---------------------------------------------
const getteam = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  let search = req.query.search?.toString().toLowerCase().trim() || "";
  const searchWords = search.split(" ").filter(Boolean);

  const searchFilter = searchWords.length
    ? {
        AND: searchWords.map((word) => ({
          OR: [{ name: { contains: word } }],
        })),
      }
    : {};

  const teams = await prismaClient.teamDept.findMany({
    where: searchFilter,
    skip,
    take: limit,
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" },
    ],
  });

  const total = await prismaClient.teamDept.count({ where: searchFilter });
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
    new ApiResponse(200, teams, "Departments fetched successfully", pagination)
  );
});

// ---------------------------------------------
// Change department order
// ---------------------------------------------
const changeteamOrder = asyncHandler(async (req: Request, res: Response) => {
  const teamId = Number(req.params.id);
  const { newOrder } = req.body;

  if (typeof newOrder !== "number" || newOrder < 1) {
    throw new ApiError(400, "Invalid new order value");
  }

  const team = await prismaClient.teamDept.findUnique({ where: { id: teamId } });
  if (!team) {
    throw new ApiError(404, "Team Department not found");
  }

  const oldOrder = team.order;

  if (oldOrder === newOrder) {
    return res.status(200).json(new ApiResponse(200, team, "Order unchanged"));
  }

  await prismaClient.$transaction(async (tx) => {
    if (newOrder > oldOrder!) {
      // Moving DOWN
      await tx.teamDept.updateMany({
        where: { order: { gt: oldOrder!, lte: newOrder } },
        data: { order: { decrement: 1 } },
      });
    } else {
      // Moving UP
      await tx.teamDept.updateMany({
        where: { order: { gte: newOrder, lt: oldOrder! } },
        data: { order: { increment: 1 } },
      });
    }

    await tx.teamDept.update({
      where: { id: teamId },
      data: { order: newOrder },
    });
  });

  res.status(200).json(new ApiResponse(200, null, "Team Department order updated successfully"));
});

export {
  addteam,
  editteam,
  getteam,
  getteamName,
  changeteamOrder,
  toggleTeamStatus,
};
