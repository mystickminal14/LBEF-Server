import { Request, Response } from "express";
import { CreateFeeYearSchema } from "./planner.validation";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { paginationSchema } from "../../validation/pagination.validation";

export const createFeeYear = asyncHandler(
  async (req: Request, res: Response) => {
    const parsed = CreateFeeYearSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const { year, session } = parsed.data;

    const FeeYear = await prismaClient.feeYear.create({
      data: { year, session },
    });

    res
      .status(201)
      .json(
        new ApiResponse(
          201,
          FeeYear,
          "Fee year created successfully",
        ),
      );
  },
);
export const getFeeYears = asyncHandler(async (_req, res) => {
  console.log("feeyears")
  const data = await prismaClient.feeYear.findMany({
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(new ApiResponse(200, data));
});
export const getFeeYearsPagination = asyncHandler(
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

    const data = await prismaClient.feeYear.findMany({
  skip,
  take: limit,
  orderBy: [
    { year: "desc" },
    { createdAt: "desc" },
  ],
});

    const total = await prismaClient.feeYear.count();
    const totalPages = Math.ceil(total / limit);

    res.status(200).json(
      new ApiResponse(200, data, "Fee years fetched", {
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
export const updateFeeYear = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const parsed = CreateFeeYearSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ApiError(400, "Validation failed", parsed.error.issues);
    }

    const existing = await prismaClient.feeYear.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new ApiError(404, "Fee year not found");
    }

    await prismaClient.feeYear.update({
      where: { id },
      data: parsed.data,
    });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Fee year updated successfully"));
  },
);
export const deleteFeeYear = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await prismaClient.feePlanner.deleteMany({
      where: { feeYearId: id },
    });
    await prismaClient.feeYear.delete({
      where: { id },
    });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Fee year deleted successfully"));
  },
);
