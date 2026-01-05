import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { NoticeSchema, noticeTypeSchema } from "./notice.validation";
import { deletePDF } from "../../utils/deletepdf";
import { paginationSchema } from "../../validation/pagination.validation";

const add = asyncHandler(async (req: Request, res: Response) => {
  const parsed = NoticeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const notice = await prismaClient.notice.create({
    data: parsed.data,
  });
  res
    .status(201)
    .json(new ApiResponse(201, notice, "Notices added successfully"));
});
const getAll = asyncHandler(async (req: Request, res: Response) => {
  const notices = await prismaClient.notice.findMany({
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, notices, "Notice fetched successfully", )
    );
});
const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!req.file) throw new ApiError(400, "No image file provided");

  const filename = req.file.filename;
  const imageUrl = `/public/notice/${filename}`;

  const notice = await prismaClient.notice.findUnique({
    where: { id: parseInt(id) },
  });

  if (notice?.file) {
    throw new ApiError(400, "Image already exists");
  }

  if (!notice) throw new ApiError(404, "Notice not found");

  const updatedNotice = await prismaClient.notice.update({
    where: { id: parseInt(id) },
    data: { file: imageUrl },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedNotice, "Image uploaded successfully"));
});
const edit = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const parsed = NoticeSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const existing = await prismaClient.notice.findUnique({
    where: { id },
  });

  if (!existing) throw new ApiError(404, "Notices not found");

  const updated = await prismaClient.notice.update({
    where: { id },
    data: parsed.data,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Notice updated successfully"));
});

const getNotices = asyncHandler(async (req: Request, res: Response) => {
  const parsedPagination = paginationSchema.safeParse(req.query);
  if (!parsedPagination.success) {
    throw new ApiError(400, "Validation Failed", parsedPagination.error.issues);
  }
  const { page, limit } = parsedPagination.data;
  const skip = (page - 1) * limit;

  const parsedType = noticeTypeSchema.safeParse(req.query.type?.toString().toUpperCase());
  if (!parsedType.success) {
    throw new ApiError(400, "Invalid notice type", parsedType.error.issues);
  }
  const type = parsedType.data;

  // Build filter
  const filter = type ? { type } : {};

  // Fetch notices
  const notices = await prismaClient.notice.findMany({
    where: filter,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  // Count total
  const total = await prismaClient.notice.count({ where: filter });
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
    new ApiResponse(200, notices, "Notices fetched successfully", pagination)
  );
});


const deleteNotice = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const notice = await prismaClient.notice.findUnique({
    where: { id: parseInt(id) },
  });
  if (!notice) throw new ApiError(404, "Notice not found");
    // remove leading slash
  if (notice.file) {
    deletePDF(notice.file);
  }
  await prismaClient.notice.delete({ where: { id: parseInt(id) } });
  res
    .status(200)
    .json(new ApiResponse(200, null, "Notice deleted successfully"));
});

export {getAll, add, uploadImage, edit, getNotices, deleteNotice };
