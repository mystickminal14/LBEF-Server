import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { deletePDF } from "../../utils/deletepdf";
import { paginationSchema } from "../../validation/pagination.validation";


const getDwnload = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  const search = req.query.search?.toString().trim() || "";

  const where = search
    ? {
        name: {
          contains: search,
          mode: "insensitive",
        },
      }
    : {};

  const downloads = await prismaClient.downloads.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.downloads.count({ where });
  const totalPages = Math.ceil(total / limit);

  return res.status(200).json(
    new ApiResponse(200, downloads, "Download fetched successfully", {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    })
  );
});


const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const { name, link } = req.body;
  const file = req.file;

  if (!name) {
    throw new ApiError(400, "Name is required");
  }

  if (!file && !link) {
    throw new ApiError(400, "Either file or link is required");
  }

  if (file && link) {
    throw new ApiError(400, "Provide either file or link, not both");
  }

  const data: {
    name: string;
    file?: string | null;
    link?: string | null;
  } = {
    name,
    file: null,
    link: null,
  };

  if (file) {
    data.file = `/public/downloads/${file.filename}`;
  }

  if (link) {
    data.link = link;
  }

  const download = await prismaClient.downloads.create({
    data,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, download, "Download created successfully"));
});


const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const download = await prismaClient.downloads.findUnique({
    where: { id },
  });

  if (!download) {
    throw new ApiError(404, "Download not found");
  }

  // Delete local file only if exists
  if (download.file) {
    deletePDF(download.file);
  }

  await prismaClient.downloads.delete({
    where: { id },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Download deleted successfully"));
});

export { getDwnload, uploadFile, deleteImage };
