import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { deleteCourseImage } from "../../utils/deleteImage";
import { deletePDF } from "../../utils/deletepdf";
import { paginationSchema } from "../../validation/pagination.validation";

const getDwnload = asyncHandler(async (req: Request, res: Response) => {
  
const parsed = paginationSchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const { page, limit } = parsed.data;
  const skip = (page - 1) * limit;

  let search = req.query.search?.toString().toLowerCase().trim() || "";
  const searchFilter = search
    ? {
        OR: [
          { name: {  contains: search, } },
        ],
      }
    : {};

  const downloads = await prismaClient.downloads.findMany({
   where: searchFilter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.downloads.count();

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
      new ApiResponse(200, downloads, "Download fetched successfully", pagination)
    );
});
const uploadFile = asyncHandler(async (req: Request, res: Response) => {
  const { name } = req.body;
  if (!name) throw new ApiError(400, "Name is required");
  if (!req.file) throw new ApiError(400, "No file provided");
  const filename = req.file.filename;
  const file = `/public/downloads/${filename}`;
  const updatedholiday = await prismaClient.downloads.create({
    data: { file: file, name: name },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedholiday, "File uploaded successfully"));
});
const deleteImage = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  const holiday = await prismaClient.downloads.findUnique({ where: { id } });
  if (!holiday) throw new ApiError(404, "Download not found");
 if (holiday.file) {
    deletePDF(holiday.file);
  }
  await prismaClient.downloads.delete({
    where: { id },
  });

  res
    .status(200)
    .json(new ApiResponse(200, null, " image deleted successfully"));
});
export { getDwnload, uploadFile, deleteImage };
