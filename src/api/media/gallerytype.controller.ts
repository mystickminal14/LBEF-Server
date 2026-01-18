import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { z } from "zod";

import { paginationSchema } from "../../validation/pagination.validation";
export const statusSchema = z.enum(["ENABLED", "DISABLED", ]).optional();

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, "-");

export const createType = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) throw new ApiError(400, "Type name required");

  const slug = slugify(name);

  const type = await prismaClient.galleryType.create({
    data: { name, slug },
  });

  res.status(201).json(new ApiResponse(201, type, "Gallery type created"));
});

export const getTypes = asyncHandler(async (_req, res) => {
  const types = await prismaClient.galleryType.findMany({
    where: { status: "ENABLED" },
    orderBy: { createdAt: "desc" },
  });

  res.status(200).json(new ApiResponse(200, types));
});
export const getTypesPagination = asyncHandler(async (req, res) => {
  const parsedPagination = paginationSchema.safeParse(req.query);
  if (!parsedPagination.success) {
    throw new ApiError(400, "Validation Failed", parsedPagination.error.issues);
  }
  const { page, limit } = parsedPagination.data;
  const skip = (page - 1) * limit;
  const parsedDept = statusSchema.safeParse(
    req.query.status?.toString().toUpperCase()
  );
  if (!parsedDept.success) {
    throw new ApiError(400, "Invalid status", parsedDept.error.issues);
  }
  const status = parsedDept.data;

  const search = req.query.search?.toString().toLowerCase().trim();
  const searchFilter = search
    ? {
        OR: [{ name: { contains: search } }],
      }
    : {};

  const statusFilter = status ? { status } : {};

  const whereFilter = { AND: [searchFilter, statusFilter] };
  const types = await prismaClient.galleryType.findMany({
    where: whereFilter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  const total = await prismaClient.galleryType.count({ where: whereFilter });
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
      new ApiResponse(
        200,
        types,
        "Gallery Type fetched successfully",
        pagination
      )
    );
});
export const toggleGallery = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    const contact = await prismaClient.galleryType.findUnique({
      where: { id },
    });

    if (!contact) {
      throw new ApiError(404, "Gallery Type not found");
    }

    const updated = await prismaClient.galleryType.update({
      where: { id },
      data: {
        status:
          contact.status === "ENABLED" ? "DISABLED" : "ENABLED",
      },
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        updated,
        `Contact ${
          updated.status === "ENABLED" ? "enabled" : "disabled"
        } successfully`
      )
    );
  }
);

export const updateType = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name } = req.body;

  const type = await prismaClient.galleryType.findUnique({ where: { id } });
  if (!type) throw new ApiError(404, "Type not found");

  const newSlug = slugify(name);

  await prismaClient.galleryType.update({
    where: { id },
    data: { name, slug: newSlug },
  });

  res.status(200).json(new ApiResponse(200, null, "Type updated"));
});

export const deleteType = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  await prismaClient.galleryType.delete({ where: { id } });

  res.status(200).json(new ApiResponse(200, null, "Type deleted"));
});
