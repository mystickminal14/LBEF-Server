import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { deleteCourseImage } from "../../utils/deleteImage";
import { TeamsValidation } from "./teams.validatioin";
import { paginationSchema } from "../../validation/pagination.validation";


const add = asyncHandler(async (req: Request, res: Response) => {
  const parsed = TeamsValidation.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const {  departmentId, ...rest } = parsed.data;

  // Check if department exists
  const department = await prismaClient.teamDept.findUnique({
    where: { id: Number(departmentId) },
  });
  if (!department) {
    throw new ApiError(404, "Department not found");
  }

  // Get last order in department
  const last = await prismaClient.ourTeam.findFirst({
    where: { departmentId: Number(departmentId) },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? 0) + 1;

  const team = await prismaClient.ourTeam.create({
    data: {
      ...rest,
      departmentId: Number(departmentId),
      order: nextOrder,
    },
  });

  res.status(201).json(new ApiResponse(201, team, "Team added successfully"));
});

// -----------------------------
// Edit a team member
// -----------------------------
// -----------------------------
// Edit a team member
// -----------------------------
const edit = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  // Validate request body
  const parsed = TeamsValidation.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const existing = await prismaClient.ourTeam.findUnique({ where: { id } });
  if (!existing) throw new ApiError(404, "Team not found");

  // Copy data and ensure departmentId is number
  let updateData: any = { ...parsed.data };
  if (updateData.departmentId !== undefined && updateData.departmentId !== null) {
    updateData.departmentId = Number(updateData.departmentId);
    if (isNaN(updateData.departmentId)) {
      throw new ApiError(400, "Invalid departmentId");
    }
  }

  // If department changes, set order to last in new department
  if (
    updateData.departmentId &&
    updateData.departmentId !== existing.departmentId
  ) {
    const newDept = await prismaClient.teamDept.findUnique({
      where: { id: updateData.departmentId },
    });
    if (!newDept) throw new ApiError(404, "New Department not found");

    const maxOrder = await prismaClient.ourTeam.findFirst({
      where: { departmentId: updateData.departmentId },
      orderBy: { order: "desc" },
      select: { order: true },
    });

    updateData.order = (maxOrder?.order ?? 0) + 1;
  }

  const updated = await prismaClient.ourTeam.update({
    where: { id },
    data: updateData,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Team updated successfully"));
});


const changeTeamOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { newOrder } = req.body as { newOrder: number };

  if (!Number.isInteger(newOrder) || newOrder < 1) {
    throw new ApiError(400, "newOrder must be a positive integer");
  }

  const team = await prismaClient.ourTeam.findUnique({ where: { id } });
  if (!team) throw new ApiError(404, "Team member not found");

  const departmentId = team.departmentId;
  if (!departmentId) throw new ApiError(400, "Team member has no department");

  const oldOrder = team.order ?? 0;

  if (oldOrder === newOrder) {
    return res.status(200).json(
      new ApiResponse(200, team, "Order unchanged")
    );
  }

  // Get max order in this department
  const maxOrderResult = await prismaClient.ourTeam.findFirst({
    where: { departmentId },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const maxOrder = maxOrderResult?.order ?? 0;

  if (newOrder > maxOrder + 1) {
    throw new ApiError(400, `Order cannot be greater than ${maxOrder + 1}`);
  }

  await prismaClient.$transaction(async (tx) => {
    if (oldOrder === 0) {
      await tx.ourTeam.updateMany({
        where: { departmentId, order: { gte: newOrder } },
        data: { order: { increment: 1 } },
      });
    } else if (newOrder > oldOrder) {
      await tx.ourTeam.updateMany({
        where: { departmentId, order: { gt: oldOrder, lte: newOrder } },
        data: { order: { decrement: 1 } },
      });
    } else {
      await tx.ourTeam.updateMany({
        where: { departmentId, order: { gte: newOrder, lt: oldOrder } },
        data: { order: { increment: 1 } },
      });
    }

    await tx.ourTeam.update({
      where: { id },
      data: { order: newOrder },
    });
  });

  return res.status(200).json(
    new ApiResponse(200, null, "Team order updated successfully")
  );
});


// -----------------------------
// Get paginated teams with optional department filter
// -----------------------------
const getTeam = asyncHandler(async (req: Request, res: Response) => {
  // Validate pagination query
  const parsedPagination = paginationSchema.safeParse(req.query);
  if (!parsedPagination.success) {
    throw new ApiError(400, "Validation Failed", parsedPagination.error.issues);
  }
  const { page, limit } = parsedPagination.data;
  const skip = (page - 1) * limit;

  // Department filter
  let departmentFilter: any = {};
  if (req.query.department) {
    const departmentId = Number(req.query.department);
    if (isNaN(departmentId)) throw new ApiError(400, "Invalid department ID");

    const departmentExists = await prismaClient.teamDept.findUnique({
      where: { id: departmentId },
    });
    if (!departmentExists) throw new ApiError(404, "Department not found");

    // Use departmentId instead of department relation
    departmentFilter = { departmentId };
  }

  // Search filter
  const search = req.query.search?.toString().toLowerCase().trim();
  const searchFilter = search
    ? {
        OR: [
          { name: { contains: search, } },
          { position: { contains: search, } },
        ],
      }
    : {};

  const whereFilter = { AND: [departmentFilter, searchFilter] };

  // Fetch teams
  const teams = await prismaClient.ourTeam.findMany({
    where: whereFilter,
    skip,
    take: limit,
    orderBy: { order: "asc" },
    include: { department: true }, // include department details
  });

  // Total count and pagination info
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
    new ApiResponse(200, teams, "Our Team fetched successfully", pagination)
  );
});


const getTeamsByDepartment = asyncHandler(async (_req: Request, res: Response) => {
  const teams = await prismaClient.ourTeam.findMany({
    orderBy: { order: "asc" },
    include: { department: true }, // include department relation
  });

  const grouped: Record<string, typeof teams> = {};

  teams.forEach(team => {
    const deptName = team.department?.name || "UNKNOWN";
    if (!grouped[deptName]) grouped[deptName] = [];
    grouped[deptName].push(team);
  });

  res.status(200).json(new ApiResponse(200, grouped, "Teams grouped by department fetched successfully"));
});

// -----------------------------
// Upload images / portrait
// -----------------------------
const uploadTeamImages = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (!req.files || typeof req.files !== "object") throw new ApiError(400, "No files uploaded");

  const files = req.files as { image?: Express.Multer.File[], portrait?: Express.Multer.File[] };
  const imageFile = files.image?.[0];
  const portraitFile = files.portrait?.[0];

  const team = await prismaClient.ourTeam.findUnique({ where: { id } });
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

  const updatedTeam = await prismaClient.ourTeam.update({ where: { id }, data: updateData });
  res.status(200).json(new ApiResponse(200, updatedTeam, "Team images uploaded successfully"));
});

// -----------------------------
// Update only team avatar
// -----------------------------
const updateteamImage = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (!req.file) throw new ApiError(400, "No image file provided");

  const team = await prismaClient.ourTeam.findUnique({ where: { id } });
  if (!team) throw new ApiError(404, "Team not found");

  if (team.image) deleteCourseImage(team.image);
  const updatedTeam = await prismaClient.ourTeam.update({
    where: { id },
    data: { image: `/public/teams/${req.file.filename}` },
  });

  res.status(200).json(new ApiResponse(200, updatedTeam, "Avatar updated successfully"));
});

// -----------------------------
// Delete a team member
// -----------------------------
const deleteTeam = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const team = await prismaClient.ourTeam.findUnique({ where: { id } });
  if (!team) throw new ApiError(404, "Team not found");

  if (team.image) deleteCourseImage(team.image);
  if (team.portrait) deleteCourseImage(team.portrait);

  await prismaClient.ourTeam.delete({ where: { id } });
  res.status(200).json(new ApiResponse(200, null, "Team deleted successfully"));
});

export {
  add,
  edit,
  deleteTeam,
  changeTeamOrder,
  getTeam,
  getTeamsByDepartment,
  uploadTeamImages,
  updateteamImage,
};
