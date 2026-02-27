import { Request, Response } from "express";

import { EStatus } from "@prisma/client"; // adjust if enum path differs
import { asyncHandler } from "../../../utils/asyncHandler";
import { ApiError } from "../../../utils/apiError";
import { prismaClient } from "../../../server";
import { ApiResponse } from "../../../utils/apiResponse";
import { paginationSchema } from "../../../validation/pagination.validation";


const addCategory = asyncHandler(async (req: Request, res: Response) => {
  const { name, } = req.body;

  if (!name) throw new ApiError(400, "Category name required");

  const existing = await prismaClient.courseCategory.findUnique({
    where: { name },
  });

  if (existing) throw new ApiError(400, "Category already exists");

  const last = await prismaClient.courseCategory.findFirst({
    orderBy: { order: "desc" },
    select: { order: true },
  });

  const nextOrder = (last?.order ?? 0) + 1;

  const category = await prismaClient.courseCategory.create({
    data: {
      name,
      status: EStatus.ENABLED || "ENABLED",
      order: nextOrder,
    },
  });

  res
    .status(201)
    .json(new ApiResponse(201, category, "Category added successfully"));
});

export const getCategoriesWithCourses = asyncHandler(
  async (req: Request, res: Response) => {
    const categories = await prismaClient.courseCategory.findMany({
      where: {
        status: EStatus.ENABLED,
      },
      orderBy: [
        { order: "asc" },
        { createdAt: "desc" },
      ],
      include: {
        courses: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            prefix:true,
            degree:true,
            details:true,
            fullForm:true,
            intake:true,
            shift:true,
            title: true,
            slug: true,
            duration: true,
            semester:true,
            credit: true,
            image: true,
            },
        },
      },
    });

    res.status(200).json(
      new ApiResponse(
        200,
        categories,
        "All categories with courses fetched successfully"
      )
    );
  }
);

const editCategory = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  const category = await prismaClient.courseCategory.findUnique({
    where: { id },
  });

  if (!category) throw new ApiError(404, "Category not found");

  const updated = await prismaClient.courseCategory.update({
    where: { id },
    data: { name },
  });

  res
    .status(200)
    .json(new ApiResponse(200, updated, "Category updated successfully"));
});



const toggleCategoryStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Number(req.params.id);

    const category = await prismaClient.courseCategory.findUnique({
      where: { id },
    });

    if (!category) throw new ApiError(404, "Category not found");

    const newStatus =
      category.status === EStatus.ENABLED ? EStatus.DISABLED : EStatus.ENABLED;

    const updated = await prismaClient.courseCategory.update({
      where: { id },
      data: { status: newStatus },
    });

    res.status(200).json(
      new ApiResponse(
        200,
        updated,
        `Category ${newStatus.toLowerCase()}d successfully`
      )
    );
  }
);



const changeCategoryOrder = asyncHandler(
  async (req: Request, res: Response) => {
    const categoryId = Number(req.params.id);
    const { newOrder } = req.body;

    if (typeof newOrder !== "number" || newOrder < 1) {
      throw new ApiError(400, "Invalid order value");
    }

    const category = await prismaClient.courseCategory.findUnique({
      where: { id: categoryId },
    });

    if (!category) throw new ApiError(404, "Category not found");

    const oldOrder = category.order ?? 0;

    await prismaClient.$transaction(async (tx) => {
      if (newOrder > oldOrder) {
        await tx.courseCategory.updateMany({
          where: {
            order: { gt: oldOrder, lte: newOrder },
          },
          data: { order: { decrement: 1 } },
        });
      }

      if (newOrder < oldOrder) {
        await tx.courseCategory.updateMany({
          where: {
            order: { gte: newOrder, lt: oldOrder },
          },
          data: { order: { increment: 1 } },
        });
      }

      await tx.courseCategory.update({
        where: { id: categoryId },
        data: { order: newOrder },
      });
    });

    res
      .status(200)
      .json(new ApiResponse(200, null, "Category order updated"));
  }
);



const getCategory = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const status = req.query.status?.toString() as EStatus | undefined;
  const search = req.query.search?.toString().trim() || "";

  const where = {
    ...(status && { status }),
    ...(search && {
      name: {
        contains: search,
        mode: "insensitive", // case-insensitive search
      },
    }),
  };

  const categories = await prismaClient.courseCategory.findMany({
    where,
    skip,
    take: limit,
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const total = await prismaClient.courseCategory.count({ where });
  const totalPages = Math.ceil(total / limit);

  res.status(200).json(
    new ApiResponse(200, categories, "Categories fetched", {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    })
  );
});


const getAllCategory = asyncHandler(async (_req: Request, res: Response) => {
  const categories = await prismaClient.courseCategory.findMany({
    where: { status: "ENABLED" }, 
    orderBy: [
      { order: "asc" },
      { createdAt: "desc" }
    ],
  });

  res
    .status(200)
    .json(new ApiResponse(200, categories, "Enabled categories fetched"));
});
export {
  addCategory,
  editCategory,
  toggleCategoryStatus,
  changeCategoryOrder,
  getCategory,
  getAllCategory,
};