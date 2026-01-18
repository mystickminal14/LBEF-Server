import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { z } from "zod";
import { paginationSchema } from "../../validation/pagination.validation";
import { CreateAcademicYearSchema } from "./planner.validation";
export const statusSchema = z.enum(["ENABLED", "DISABLED"]).optional();

export const createAcademicYear = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = CreateAcademicYearSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const { year, session } = parsed.data;

    const academicYear = await prismaClient.academicYear.create({
      data: { year, session },
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          academicYear,
          "Academic year created successfully",
        ),
      );
  },
);
export const getAcademicYears = asyncHandler(async (_req, res) => {
  const data = await prismaClient.academicYear.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(new ApiResponse(200, data));
});
export const getAcademicYearsPagination = asyncHandler(
  async (req: Request, res: Response) => {
    const parsedPagination = paginationSchema.safeParse(req.query);

    if (!parsedPagination.success) {
      throw new ApiError(
        400,
        "Invalid pagination",
        parsedPagination.error.issues,
      );
    }

    const { page, limit } = parsedPagination.data;
    const skip = (page - 1) * limit;

    const data = await prismaClient.academicYear.findMany({
  skip,
  take: limit,
  orderBy: [
    { year: "desc" },
    { createdAt: "desc" },
  ],
});

    const total = await prismaClient.academicYear.count();
    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
      new ApiResponse(200, data, "Academic years fetched", {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      }),
    );
  },
);
export const updateAcademicYear = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const parsed = CreateAcademicYearSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const existing = await prismaClient.academicYear.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "Academic year not found");
    }

    await prismaClient.academicYear.update({
      where: { id },
      data: parsed.data,
    });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Academic year updated successfully"));
  },
);
export const deleteAcademicYear = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await prismaClient.academicPlanner.deleteMany({
      where: { academicYearId: id },
    });
    await prismaClient.academicYear.delete({
      where: { id },
    });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Academic year deleted successfully"));
  },
);
