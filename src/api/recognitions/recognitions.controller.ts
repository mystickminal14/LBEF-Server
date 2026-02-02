import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { ApiError } from "../../utils/apiError";
import { ApiResponse } from "../../utils/apiResponse";
import { prismaClient } from "../../server";
import { deleteCourseImage } from "../../utils/deleteImage";
import { RecognitionSchema } from "./recognitons.validations";
import { paginationSchema } from "../../validation/pagination.validation";
import { ETYPE } from "@prisma/client";

const add = asyncHandler(async (req: Request, res: Response) => {
  const parsed = RecognitionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }
  const recognition = await prismaClient.recognition.create({
    data: parsed.data,
  });
  res
    .status(201)
    .json(new ApiResponse(201, recognition, "Recognition added successfully"));
});

const edit = asyncHandler(async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);

  const parsed = RecognitionSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const existing = await prismaClient.recognition.findUnique({
    where: { id },
  });

  if (!existing) throw new ApiError(404, "Recognition not found");

  const updated = await prismaClient.recognition.update({
    where: { id },
    data: parsed.data,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updated, "Recognition updated successfully"));
});
const getAllRecognition = asyncHandler(async (req: Request, res: Response) => {
  const { type } = req.query;

  const recognition = await prismaClient.recognition.findMany({
    where: type
      ? {
          type: type as ETYPE, 
        }
      : undefined,
    orderBy: { createdAt: "desc" },
  });

  return res
    .status(200)
    .json(new ApiResponse(200, recognition, "Recognition fetched successfully"));
});

const getRecognition = asyncHandler(async (req: Request, res: Response) => {
  const parsed = paginationSchema.safeParse(req.query);

  if (!parsed.success) {
    throw new ApiError(400, "Validation Failed", parsed.error.issues);
  }

  const { page, limit } = parsed.data;
  const { type } = req.query;

  const skip = (page - 1) * limit;

  const whereClause = type
    ? {
        type: type as ETYPE,
      }
    : undefined;

  const recognition = await prismaClient.recognition.findMany({
    skip,
    take: limit,
    where: whereClause,
    orderBy: { createdAt: "desc" },
  });

  const total = await prismaClient.recognition.count({
    where: whereClause,
  });

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
    new ApiResponse(
      200,
      recognition,
      "Recognition fetched successfully",
      pagination
    )
  );
});

const uploadRecognition = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;

  if (!req.file) throw new ApiError(400, "No image file provided");

  const filename = req.file.filename;
  const imageUrl = `/public/recogntions/${filename}`;

  const recognition = await prismaClient.recognition.findUnique({
    where: { id: parseInt(id) },
  });

  if (recognition?.image) {
    throw new ApiError(400, "Image already exists");
  }

  if (!recognition) throw new ApiError(404, "Recognition not found");

  const updatedRecognition = await prismaClient.recognition.update({
    where: { id: parseInt(id) },
    data: { image: imageUrl },
  });

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedRecognition, "Image uploaded successfully")
    );
});

const updateRecognitionImage = asyncHandler(
  async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);

    if (!req.file) throw new ApiError(400, "No image file provided");

    const recognition = await prismaClient.recognition.findUnique({
      where: { id },
    });
    if (!recognition) throw new ApiError(404, "recognition not found");

    const filename = req.file.filename;
    const imageUrl = `/public/recognitions/${filename}`;

    if (recognition.image) {
      deleteCourseImage(recognition.image);
    }

    const updatedCourse = await prismaClient.recognition.update({
      where: { id },
      data: { image: imageUrl },
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedCourse,
          "Recognition image updated successfully"
        )
      );
  }
);
const deleteRecognition = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id;
  const recognition = await prismaClient.recognition.findUnique({
    where: { id: parseInt(id) },
  });
  if (!recognition) throw new ApiError(404, "Recognition not found");
    if (recognition.image) {
    deleteCourseImage(recognition.image);
  }
  await prismaClient.recognition.delete({ where: { id: parseInt(id) } });
  res
    .status(200)
    .json(new ApiResponse(200, null, "Recognition deleted successfully"));
});

export {
  add,
  uploadRecognition,
  edit,
  deleteRecognition,
  updateRecognitionImage,
  getRecognition,getAllRecognition
};
