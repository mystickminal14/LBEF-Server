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
  const { department, ...rest } = parsed.data;
  const last = await prismaClient.ourTeam.findFirst({
    where: { department },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  const nextOrder = (last?.order ?? 0) + 1;
  const team = await prismaClient.ourTeam.create({
    data: {
      ...rest,
      department,
      order: nextOrder,
    },
  });
  res.status(201).json(new ApiResponse(201, team, "Team added successfully"));
});
export const changeTeamOrder = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { newOrder } = req.body as { newOrder: number };

  if (!Number.isInteger(newOrder) || newOrder < 1) {
    throw new ApiError(400, "newOrder must be a positive integer");
  }

  const team = await prismaClient.ourTeam.findUnique({
    where: { id },
  });

  if (!team) {
    throw new ApiError(404, "Team member not found");
  }

  const department = team.department;
  const oldOrder = team.order; // 👈 keep it as-is (can be null)

  // ✅ Only skip if order already exists AND is same
  if (oldOrder !== null && newOrder === oldOrder) {
    return res.status(200).json(
      new ApiResponse(200, team, "Order unchanged")
    );
  }

  // Get max order in department
  const maxOrderResult = await prismaClient.ourTeam.findFirst({
    where: { department },
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const maxOrder = maxOrderResult?.order ?? 0;

  if (newOrder > maxOrder + 1) {
    throw new ApiError(
      400,
      `Order cannot be greater than ${maxOrder + 1}`
    );
  }

  await prismaClient.$transaction(async (tx) => {
    // 🆕 CASE 1: order was NULL (new entry into ordering)
    if (oldOrder === null) {
      await tx.ourTeam.updateMany({
        where: {
          department,
          order: {
            gte: newOrder,
          },
        },
        data: {
          order: { increment: 1 },
        },
      });
    }

    // 🔁 CASE 2: moving down
    else if (newOrder > oldOrder) {
      await tx.ourTeam.updateMany({
        where: {
          department,
          order: {
            gt: oldOrder,
            lte: newOrder,
          },
        },
        data: {
          order: { decrement: 1 },
        },
      });
    }

    // 🔼 CASE 3: moving up
    else {
      await tx.ourTeam.updateMany({
        where: {
          department,
          order: {
            gte: newOrder,
            lt: oldOrder,
          },
        },
        data: {
          order: { increment: 1 },
        },
      });
    }

    // Finally update the target row
    await tx.ourTeam.update({
      where: { id },
      data: { order: newOrder },
    });
  });

  return res.status(200).json(
    new ApiResponse(200, null, "Team order updated successfully")
  );
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

  let updateData = { ...parsed.data };

  // If department changes, set order to last in new department
  if (parsed.data.department && parsed.data.department !== existing.department) {
    const maxOrder = await prismaClient.ourTeam.findFirst({
      where: { department: parsed.data.department },
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

const getTeam = asyncHandler(async (req: Request, res: Response) => {
  const parsedPagination = paginationSchema.safeParse(req.query);
  if (!parsedPagination.success) {
    throw new ApiError(400, "Validation Failed", parsedPagination.error.issues);
  }
  const { page, limit } = parsedPagination.data;
  const skip = (page - 1) * limit;

  const parsedDept = departmentSchema.safeParse(
    req.query.department?.toString().toUpperCase(),
  );
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
    orderBy: { order: "asc" },
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

  return res
    .status(200)
    .json(
      new ApiResponse(200, users, "Our Team fetched successfully", pagination),
    );
});

const getTeamsByDepartment = asyncHandler(
  async (req: Request, res: Response) => {
    const teams = await prismaClient.ourTeam.findMany({
      orderBy: { order: "asc" },
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

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          grouped,
          "Teams grouped by department fetched successfully",
        ),
      );
  },
);

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

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedTeam, "Team images uploaded successfully"),
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

export {
  add,
  uploadTeamImages,
  edit,
  deleteTeam,
  updateteamImage,
  getTeam,
  getTeamsByDepartment,
};
