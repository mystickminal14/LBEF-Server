import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { z } from "zod";

import { paginationSchema } from "../../validation/pagination.validation";
export const statusSchema = z.enum(["ENABLED", "DISABLED"]).optional();

const slugify = (text: string) =>
  text.toLowerCase().trim().replace(/\s+/g, "-");

export const createType = asyncHandler(async (req: Request, res: Response) => {
  const { name, year, month, day } = req.body;
  if (!name) throw new ApiError(400, "Type name required");
  if (!month) throw new ApiError(400, "Type month required");
  if (!year) throw new ApiError(400, "Type year required");

  const slug = slugify(name);

  const type = await prismaClient.galleryType.create({
    data: { name, slug, year, month, day },
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
  // 1️⃣ Validate pagination
  const parsedPagination = paginationSchema.safeParse(req.query);
  if (!parsedPagination.success) {
    throw new ApiError(400, "Validation Failed", parsedPagination.error.issues);
  }
  const { page, limit } = parsedPagination.data;
  const skip = (page - 1) * limit;

  // 2️⃣ Validate status
  const parsedStatus = statusSchema.safeParse(
    req.query.status?.toString().toUpperCase(),
  );
  if (!parsedStatus.success) {
    throw new ApiError(400, "Invalid status", parsedStatus.error.issues);
  }
  const status = parsedStatus.data;

  // 3️⃣ Search filter
  const search = req.query.search?.toString().toLowerCase().trim();
  const searchFilter = search ? { OR: [{ name: { contains: search } }] } : {};

  // 4️⃣ Status filter
  const statusFilter = status ? { status } : {};

  // 5️⃣ Combine filters
  const whereFilter = { AND: [searchFilter, statusFilter] };

  // 6️⃣ Month order mapping
  const monthOrder: Record<string, number> = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  };

  // 7️⃣ Fetch all matching items (sorting will be done in-memory)
  let types = await prismaClient.galleryType.findMany({
    where: whereFilter,
  });

  types.sort((a, b) => {
    // year: already number? if not, parse
    const yearA = Number(a.year);
    const yearB = Number(b.year);
    if (yearA !== yearB) return yearB - yearA;

    // month: use monthOrder (number)
    if (monthOrder[a.month] !== monthOrder[b.month])
      return monthOrder[b.month] - monthOrder[a.month];

    // day: convert string or null to number
    const dayA = a.day ? Number(a.day) : 0;
    const dayB = b.day ? Number(b.day) : 0;
    return dayB - dayA;
  });
  // 9️⃣ Paginate manually
  const total = types.length;
  const totalPages = Math.ceil(total / limit);
  const paginatedTypes = types.slice(skip, skip + limit);

  //  🔟 Pagination metadata
  const pagination = {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };

  // 1️⃣1️⃣ Return response
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        paginatedTypes,
        "Gallery Type fetched successfully",
        pagination,
      ),
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
        status: contact.status === "ENABLED" ? "DISABLED" : "ENABLED",
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updated,
          `Contact ${
            updated.status === "ENABLED" ? "enabled" : "disabled"
          } successfully`,
        ),
      );
  },
);

export const updateType = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { name, year, month, day } = req.body;
  if (!name) throw new ApiError(400, "Type name required");
  if (!month) throw new ApiError(400, "Type month required");
  if (!year) throw new ApiError(400, "Type year required");

  const type = await prismaClient.galleryType.findUnique({ where: { id } });
  if (!type) throw new ApiError(404, "Type not found");

  const newSlug = slugify(name);

  await prismaClient.galleryType.update({
    where: { id },
    data: { name, slug: newSlug, year, month, day },
  });

  res.status(200).json(new ApiResponse(200, null, "Type updated"));
});

export const deleteType = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  await prismaClient.galleryType.delete({ where: { id } });

  res.status(200).json(new ApiResponse(200, null, "Type deleted"));
});
