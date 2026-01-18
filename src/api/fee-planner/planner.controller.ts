import { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { paginationSchema } from "../../validation/pagination.validation";
import { CreateFeePlannerSchema } from "./planner.validation";
import { deletePDF } from "../../utils/deletepdf";

export const createFeePlanner = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = CreateFeePlannerSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const { feeYearId, semester, course } = parsed.data;
    if (!req.file) throw new ApiError(400, "No file provided");
    const filename = req.file.filename;
    const file = `/public/planner/${filename}`;
    const courseCheck = await prismaClient.feeYear.findUnique({
      where: { id: Number(feeYearId) },
    });
    if (!courseCheck) {
      throw new ApiError(404, "Fee Year not found");
    }
    const semesterCheck = await prismaClient.feePlanner.findFirst({
      where: { semester: semester, course: course },
    });

    if (semesterCheck) {
      throw new ApiError(
        404,
        "Acdemic Planner for this semester already exists not found",
      );
    }
    const acaId = Number(feeYearId);

    const FeeYear = await prismaClient.feePlanner.create({
      data: { course, semester, feeYearId: acaId, file: file },
    });

    res
      .status(201)
      .json(new ApiResponse(201, FeeYear, "Fee Semester created successfully"));
  },
);
export const getFeePlannersPagination = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = paginationSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid pagination parameters",
        errors: parsed.error.issues,
      });
    }

    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

    // Fetch paginated data
    const planners = await prismaClient.feePlanner.findMany({
      skip,
      take: limit,
      include: {
        feeYear: true,
      },
      orderBy: [{ feeYear: { year: "desc" } }, { semester: "asc" }],
    });

    // Total count
    const total = await prismaClient.feePlanner.count();
    const totalPages = Math.ceil(total / limit);

    res.json(
      new ApiResponse(200, planners, "Fee planners fetched successfully", {
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
export const getPlanners = asyncHandler(async (req: Request, res: Response) => {
  const planners = await prismaClient.feePlanner.findMany({
    include: {
      feeYear: true,
    },
    orderBy: [{ feeYear: { year: "desc" } }, { semester: "asc" }],
  });

  res.json(new ApiResponse(200, planners, "Fee planners fetched successfully"));
});
export const updateFeePlanner = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const parsed = CreateFeePlannerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const { feeYearId, course, semester } = parsed.data;
    const acaId = Number(feeYearId);

    const planner = await prismaClient.feePlanner.findUnique({
      where: { id },
    });

    if (!planner) {
      throw new ApiError(404, "Fee planner not found");
    }

    const semesterCheck = await prismaClient.feePlanner.findFirst({
      where: {
        semester,
        course,
        feeYearId: acaId,
        NOT: { id },
      },
    });

    if (semesterCheck) {
      throw new ApiError(409, "Fee planner for this semester already exists");
    }

    let filePath = planner.file;

    if (req.file) {
      if (planner.file) {
        deletePDF(planner.file);
      }
      filePath = `/public/planner/${req.file.filename}`;
    }

    const updatedPlanner = await prismaClient.feePlanner.update({
      where: { id },
      data: {
        semester,
        course,
        feeYearId: acaId,
        file: filePath,
      },
    });

    res.json(
      new ApiResponse(200, updatedPlanner, "Fee planner updated successfully"),
    );
  },
);

export const deleteFeePlanner = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const planner = await prismaClient.feePlanner.findUnique({
      where: { id },
    });

    if (!planner) {
      throw new ApiError(404, "Fee planner not found");
    }

    if (planner.file) {
      deletePDF(planner.file);
    }

    await prismaClient.feePlanner.delete({
      where: { id },
    });

    res.json(new ApiResponse(200, null, "Fee planner deleted successfully"));
  },
);
