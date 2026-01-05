import { asyncHandler } from "../../utils/asyncHandler";
import { Request, Response } from "express";
import { ApiError } from "../../utils/apiError";
import { prismaClient } from "../../server";
import { ApiResponse } from "../../utils/apiResponse";
import { deletePDF } from "../../utils/deletepdf";
import { uploadSchema } from "./connect.validation";
import { deleteCourseImage } from "../../utils/deleteImage";
import { paginationSchema } from "../../validation/pagination.validation";

const createFile = asyncHandler(async (req: Request, res: Response) => {
  const body = uploadSchema.safeParse(req.body);
  if (!body.success)
    throw new ApiError(400, "Validation Failed", body.error.issues);

  if (!req.file) throw new ApiError(400, "No file provided");

  const { duration, issue, volume } = body.data;
  const filename = req.file.filename;
  const filePath = `/public/connect/${filename}`;

  const createdFile = await prismaClient.lbefConnect.create({
    data: { file: filePath, duration, issue, volume },
  });

  res
    .status(201)
    .json(new ApiResponse(201, createdFile, "File uploaded successfully"));
});
const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!req.file) throw new ApiError(400, "No image file provided");

  const filename = req.file.filename;
  const imageUrl = `/public/connect/${filename}`;
  const connect = await prismaClient.lbefConnect.findUnique({
    where: { id: parseInt(id) },
  });

  if (connect?.image) {
    throw new ApiError(400, "Image already exists");
  }
  if (!connect) throw new ApiError(404, "connect not found");

  const updatedconnect = await prismaClient.lbefConnect.update({
    where: { id: parseInt(id) },
    data: { image: imageUrl },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedconnect, "Image uploaded successfully"));
});

const getFiles = asyncHandler(async (req: Request, res: Response) => {
const parsed = paginationSchema.safeParse(req.query);
  
    if (!parsed.success) {
      throw new ApiError(400, "Validation Failed", parsed.error.issues);
    }
    const { page, limit } = parsed.data;
    const skip = (page - 1) * limit;

  const users = await prismaClient.lbefConnect.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.lbefConnect.count();

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
      new ApiResponse(200, users, "Conect fetched successfully", pagination)
    );
});
const deleteFile = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const fileRecord = await prismaClient.lbefConnect.findUnique({
    where: { id },
  });
  if (!fileRecord) throw new ApiError(404, "File not found");

  if (fileRecord.file) {
    deletePDF(fileRecord.file);
  }
  if (fileRecord.image) {
    deleteCourseImage(fileRecord.image);
  }
  await prismaClient.lbefConnect.delete({ where: { id } });

  res.status(200).json(new ApiResponse(200, null, "File deleted successfully"));
});
const updateconnectImage = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  if (!req.file) throw new ApiError(400, "No image file provided");

  const connect = await prismaClient.lbefConnect.findUnique({ where: { id } });
  if (!connect) throw new ApiError(404, "connect not found");

  const filename = req.file.filename;
  const imageUrl = `/public/connect/${filename}`;

  if (connect.image) {
    deleteCourseImage(connect.image);
  }

  const updatedCourse = await prismaClient.lbefConnect.update({
    where: { id },
    data: { image: imageUrl },
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, updatedCourse, "connect image updated successfully")
    );
});
export { createFile, getFiles, deleteFile, uploadImage,updateconnectImage };
